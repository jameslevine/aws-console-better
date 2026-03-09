/**
 * AWS-related types shared across the extension
 */

export interface AwsAccount {
  accountId: string;
  accountName: string;
  awsAccountId: string;
  defaultRegion: string;
  isDefault: boolean;
  createdAt: string;
  lastUsedAt: string;
}

export interface AwsRegion {
  regionName: string;
  displayName: string;
  enabled: boolean;
}

/**
 * Page context detected from the AWS Console URL and DOM
 */
export interface AwsPageContext {
  service: string | null;
  region: string | null;
  resourceType: string | null;
  resourceId: string | null;
  accountId: string | null;
  url: string;
}

/**
 * Supported AWS services for context detection
 */
export const AWS_SERVICES = {
  EC2: "ec2",
  S3: "s3",
  LAMBDA: "lambda",
  DYNAMODB: "dynamodb",
  IAM: "iam",
  CLOUDFORMATION: "cloudformation",
  API_GATEWAY: "apigateway",
  CLOUDFRONT: "cloudfront",
  RDS: "rds",
  ECS: "ecs",
  EKS: "eks",
  ROUTE53: "route53",
  CLOUDWATCH: "cloudwatch",
  SQS: "sqs",
  SNS: "sns",
  SECRETS_MANAGER: "secretsmanager",
  COGNITO: "cognito",
  ACM: "acm",
  SSM: "ssm",
} as const;

export type AwsService = (typeof AWS_SERVICES)[keyof typeof AWS_SERVICES];

/**
 * AWS regions list
 */
export const AWS_REGIONS = [
  { regionName: "us-east-1", displayName: "US East (N. Virginia)" },
  { regionName: "us-east-2", displayName: "US East (Ohio)" },
  { regionName: "us-west-1", displayName: "US West (N. California)" },
  { regionName: "us-west-2", displayName: "US West (Oregon)" },
  { regionName: "af-south-1", displayName: "Africa (Cape Town)" },
  { regionName: "ap-east-1", displayName: "Asia Pacific (Hong Kong)" },
  { regionName: "ap-south-1", displayName: "Asia Pacific (Mumbai)" },
  { regionName: "ap-south-2", displayName: "Asia Pacific (Hyderabad)" },
  { regionName: "ap-southeast-1", displayName: "Asia Pacific (Singapore)" },
  { regionName: "ap-southeast-2", displayName: "Asia Pacific (Sydney)" },
  { regionName: "ap-southeast-3", displayName: "Asia Pacific (Jakarta)" },
  { regionName: "ap-northeast-1", displayName: "Asia Pacific (Tokyo)" },
  { regionName: "ap-northeast-2", displayName: "Asia Pacific (Seoul)" },
  { regionName: "ap-northeast-3", displayName: "Asia Pacific (Osaka)" },
  { regionName: "ca-central-1", displayName: "Canada (Central)" },
  { regionName: "eu-central-1", displayName: "Europe (Frankfurt)" },
  { regionName: "eu-central-2", displayName: "Europe (Zurich)" },
  { regionName: "eu-west-1", displayName: "Europe (Ireland)" },
  { regionName: "eu-west-2", displayName: "Europe (London)" },
  { regionName: "eu-west-3", displayName: "Europe (Paris)" },
  { regionName: "eu-south-1", displayName: "Europe (Milan)" },
  { regionName: "eu-south-2", displayName: "Europe (Spain)" },
  { regionName: "eu-north-1", displayName: "Europe (Stockholm)" },
  { regionName: "me-south-1", displayName: "Middle East (Bahrain)" },
  { regionName: "me-central-1", displayName: "Middle East (UAE)" },
  { regionName: "sa-east-1", displayName: "South America (São Paulo)" },
] as const;
