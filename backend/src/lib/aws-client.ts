import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";

import { CloudFormationClient } from "@aws-sdk/client-cloudformation";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { EC2Client } from "@aws-sdk/client-ec2";
import { IAMClient } from "@aws-sdk/client-iam";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { S3Client } from "@aws-sdk/client-s3";

interface AwsCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

/**
 * AWS Client Factory
 *
 * Creates AWS SDK v3 clients using user's stored credentials.
 * Each client is created on-demand with the specified region.
 */
export const createEc2Client = (credentials: AwsCredentials, region: string) =>
  new EC2Client({ credentials, region });

export const createS3Client = (credentials: AwsCredentials, region: string) =>
  new S3Client({ credentials, region });

export const createLambdaClient = (credentials: AwsCredentials, region: string) =>
  new LambdaClient({ credentials, region });

export const createDynamoDBClient = (credentials: AwsCredentials, region: string) =>
  new DynamoDBClient({ credentials, region });

export const createIamClient = (credentials: AwsCredentials, region: string) =>
  new IAMClient({ credentials, region });

export const createCloudFormationClient = (credentials: AwsCredentials, region: string) =>
  new CloudFormationClient({ credentials, region });

export const createStsClient = (credentials: AwsCredentials, region: string) =>
  new STSClient({ credentials, region });

/**
 * Verify credentials by calling STS GetCallerIdentity
 */
export const verifyCredentials = async (
  credentials: AwsCredentials,
  region: string = "us-east-1",
) => {
  const stsClient = createStsClient(credentials, region);
  const command = new GetCallerIdentityCommand({});
  const response = await stsClient.send(command);

  return {
    awsAccountId: response.Account,
    arn: response.Arn,
    userId: response.UserId,
  };
};
