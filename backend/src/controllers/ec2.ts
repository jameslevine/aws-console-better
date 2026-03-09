import {
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
  RebootInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
} from "@aws-sdk/client-ec2";
import { Request, Response } from "express";

import { createEc2Client } from "../lib/aws-client";
import { getUserCredentials } from "../lib/get-user-credentials";

const AWS_REGIONS = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1",
];

/**
 * GET /v1/aws/:accountId/ec2/instances
 * List EC2 instances (single region or all regions)
 */
export const listInstances = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const allRegions = req.query.allRegions === "true";
    const region = (req.query.region as string) || creds.defaultRegion;
    const regions = allRegions ? AWS_REGIONS : [region];

    const allInstances: Record<string, unknown>[] = [];
    const activeRegions: string[] = [];

    await Promise.all(
      regions.map(async (r) => {
        try {
          const ec2 = createEc2Client(creds, r);
          const response = await ec2.send(new DescribeInstancesCommand({}));

          const instances = (response.Reservations || []).flatMap((reservation) =>
            (reservation.Instances || []).map((instance) => ({
              instanceId: instance.InstanceId,
              instanceType: instance.InstanceType,
              state: instance.State?.Name,
              publicIp: instance.PublicIpAddress || null,
              privateIp: instance.PrivateIpAddress || null,
              publicDns: instance.PublicDnsName || null,
              name: instance.Tags?.find((t) => t.Key === "Name")?.Value || null,
              region: r,
              launchTime: instance.LaunchTime?.toISOString(),
              tags: Object.fromEntries((instance.Tags || []).map((t) => [t.Key, t.Value])),
              arn: `arn:aws:ec2:${r}:${reservation.OwnerId}:instance/${instance.InstanceId}`,
              vpcId: instance.VpcId,
              subnetId: instance.SubnetId,
              keyName: instance.KeyName,
              securityGroups: (instance.SecurityGroups || []).map((sg) => ({
                groupId: sg.GroupId,
                groupName: sg.GroupName,
              })),
            })),
          );

          if (instances.length > 0) {
            allInstances.push(...instances);
            activeRegions.push(r);
          }
        } catch (error) {
          // Skip regions that fail (e.g., not enabled)
          console.error(`EC2 list failed for region ${r}:`, error);
        }
      }),
    );

    res.json({ instances: allInstances, regions: activeRegions });
  } catch (error) {
    console.error("Error listing EC2 instances:", error);
    res.status(500).json({ message: "Error listing instances", code: "INTERNAL_ERROR" });
  }
};

/**
 * GET /v1/aws/:accountId/ec2/instances/:instanceId
 * Get detailed instance information
 */
export const describeInstance = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const instanceId = req.params.instanceId as string;
    const region = req.query.region as string;

    if (!region) {
      return res
        .status(400)
        .json({ message: "region query parameter required", code: "VALIDATION_ERROR" });
    }

    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const ec2 = createEc2Client(creds, region);
    const response = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));

    const instance = response.Reservations?.[0]?.Instances?.[0];
    if (!instance) {
      return res.status(404).json({ message: "Instance not found", code: "NOT_FOUND" });
    }

    res.json({
      instanceId: instance.InstanceId,
      instanceType: instance.InstanceType,
      state: instance.State?.Name,
      publicIp: instance.PublicIpAddress || null,
      privateIp: instance.PrivateIpAddress || null,
      publicDns: instance.PublicDnsName || null,
      name: instance.Tags?.find((t) => t.Key === "Name")?.Value || null,
      region,
      vpcId: instance.VpcId,
      subnetId: instance.SubnetId,
      securityGroups: (instance.SecurityGroups || []).map((sg) => ({
        groupId: sg.GroupId,
        groupName: sg.GroupName,
      })),
      keyName: instance.KeyName,
      iamInstanceProfile: instance.IamInstanceProfile?.Arn,
      launchTime: instance.LaunchTime?.toISOString(),
      tags: Object.fromEntries((instance.Tags || []).map((t) => [t.Key, t.Value])),
      arn: `arn:aws:ec2:${region}:${response.Reservations?.[0]?.OwnerId}:instance/${instance.InstanceId}`,
      cli: `aws ec2 describe-instances --instance-ids ${instanceId} --region ${region}`,
    });
  } catch (error) {
    console.error("Error describing EC2 instance:", error);
    res.status(500).json({ message: "Error describing instance", code: "INTERNAL_ERROR" });
  }
};

/**
 * POST /v1/aws/:accountId/ec2/instances/:instanceId/start
 */
export const startInstance = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const instanceId = req.params.instanceId as string;
    const { region } = req.body;

    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const ec2 = createEc2Client(creds, region || creds.defaultRegion);
    const response = await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));

    const stateChange = response.StartingInstances?.[0];
    res.json({
      message: "Instance start initiated",
      previousState: stateChange?.PreviousState?.Name,
      currentState: stateChange?.CurrentState?.Name,
    });
  } catch (error) {
    console.error("Error starting EC2 instance:", error);
    res.status(500).json({ message: "Error starting instance", code: "INTERNAL_ERROR" });
  }
};

/**
 * POST /v1/aws/:accountId/ec2/instances/:instanceId/stop
 */
export const stopInstance = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const instanceId = req.params.instanceId as string;
    const { region } = req.body;

    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const ec2 = createEc2Client(creds, region || creds.defaultRegion);
    const response = await ec2.send(new StopInstancesCommand({ InstanceIds: [instanceId] }));

    const stateChange = response.StoppingInstances?.[0];
    res.json({
      message: "Instance stop initiated",
      previousState: stateChange?.PreviousState?.Name,
      currentState: stateChange?.CurrentState?.Name,
    });
  } catch (error) {
    console.error("Error stopping EC2 instance:", error);
    res.status(500).json({ message: "Error stopping instance", code: "INTERNAL_ERROR" });
  }
};

/**
 * POST /v1/aws/:accountId/ec2/instances/:instanceId/reboot
 */
export const rebootInstance = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const instanceId = req.params.instanceId as string;
    const { region } = req.body;

    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const ec2 = createEc2Client(creds, region || creds.defaultRegion);
    await ec2.send(new RebootInstancesCommand({ InstanceIds: [instanceId] }));

    res.json({ message: "Instance reboot initiated" });
  } catch (error) {
    console.error("Error rebooting EC2 instance:", error);
    res.status(500).json({ message: "Error rebooting instance", code: "INTERNAL_ERROR" });
  }
};

/**
 * GET /v1/aws/:accountId/ec2/instances/:instanceId/ssh-command
 */
export const getSshCommand = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const instanceId = req.params.instanceId as string;
    const region = req.query.region as string;

    if (!region) {
      return res
        .status(400)
        .json({ message: "region query parameter required", code: "VALIDATION_ERROR" });
    }

    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const ec2 = createEc2Client(creds, region);
    const response = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));

    const instance = response.Reservations?.[0]?.Instances?.[0];
    if (!instance) {
      return res.status(404).json({ message: "Instance not found", code: "NOT_FOUND" });
    }

    const ip = instance.PublicIpAddress || instance.PrivateIpAddress;
    const keyName = instance.KeyName || "your-key";

    // Determine default user based on AMI (simplified)
    const defaultUser = "ec2-user";

    res.json({
      command: `ssh -i ~/.ssh/${keyName}.pem ${defaultUser}@${ip}`,
      publicIp: instance.PublicIpAddress || null,
      privateIp: instance.PrivateIpAddress || null,
      keyName: instance.KeyName,
      defaultUser,
    });
  } catch (error) {
    console.error("Error generating SSH command:", error);
    res.status(500).json({ message: "Error generating SSH command", code: "INTERNAL_ERROR" });
  }
};

/**
 * GET /v1/aws/:accountId/ec2/security-groups
 */
export const listSecurityGroups = async (req: Request, res: Response) => {
  try {
    const accountId = req.params.accountId as string;
    const creds = await getUserCredentials(req, accountId);
    if (!creds) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const region = (req.query.region as string) || creds.defaultRegion;
    const ec2 = createEc2Client(creds, region);
    const response = await ec2.send(new DescribeSecurityGroupsCommand({}));

    const securityGroups = (response.SecurityGroups || []).map((sg) => ({
      groupId: sg.GroupId,
      groupName: sg.GroupName,
      description: sg.Description,
      vpcId: sg.VpcId,
      region,
      inboundRules: (sg.IpPermissions || []).map((rule) => ({
        protocol: rule.IpProtocol,
        fromPort: rule.FromPort,
        toPort: rule.ToPort,
        sources: [
          ...(rule.IpRanges || []).map((r) => r.CidrIp),
          ...(rule.Ipv6Ranges || []).map((r) => r.CidrIpv6),
          ...(rule.UserIdGroupPairs || []).map((g) => g.GroupId),
        ],
      })),
      outboundRules: (sg.IpPermissionsEgress || []).map((rule) => ({
        protocol: rule.IpProtocol,
        fromPort: rule.FromPort,
        toPort: rule.ToPort,
        sources: [
          ...(rule.IpRanges || []).map((r) => r.CidrIp),
          ...(rule.Ipv6Ranges || []).map((r) => r.CidrIpv6),
          ...(rule.UserIdGroupPairs || []).map((g) => g.GroupId),
        ],
      })),
    }));

    res.json({ securityGroups });
  } catch (error) {
    console.error("Error listing security groups:", error);
    res.status(500).json({ message: "Error listing security groups", code: "INTERNAL_ERROR" });
  }
};
