import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

const dynamodb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" }),
);

const TABLE_NAME = process.env.ACCOUNTS_TABLE!;

export interface AwsAccountRecord {
  pk: string; // USER#<userId>
  sk: string; // ACCOUNT#<accountId>
  accountId: string;
  accountName: string;
  awsAccountId: string;
  defaultRegion: string;
  isDefault: boolean;
  encryptedCredentials: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
}

const createPK = (userId: string) => `USER#${userId}`;
const createSK = (accountId: string) => `ACCOUNT#${accountId}`;

/**
 * Create a new AWS account record
 */
export const createDbAccount = async (
  userId: string,
  data: {
    accountName: string;
    awsAccountId: string;
    defaultRegion: string;
    isDefault: boolean;
    encryptedCredentials: string;
  },
): Promise<AwsAccountRecord> => {
  const accountId = `acc_${uuidv4().replace(/-/g, "").substring(0, 12)}`;
  const now = dayjs().toISOString();

  const record: AwsAccountRecord = {
    pk: createPK(userId),
    sk: createSK(accountId),
    accountId,
    accountName: data.accountName,
    awsAccountId: data.awsAccountId,
    defaultRegion: data.defaultRegion,
    isDefault: data.isDefault,
    encryptedCredentials: data.encryptedCredentials,
    createdAt: now,
    updatedAt: now,
    lastUsedAt: now,
  };

  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: record,
    }),
  );

  return record;
};

/**
 * Get all AWS accounts for a user
 */
export const getDbAccountsByUserId = async (userId: string): Promise<AwsAccountRecord[]> => {
  const response = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": createPK(userId),
        ":skPrefix": "ACCOUNT#",
      },
    }),
  );

  return (response.Items || []) as AwsAccountRecord[];
};

/**
 * Get a specific AWS account
 */
export const getDbAccountById = async (
  userId: string,
  accountId: string,
): Promise<AwsAccountRecord | null> => {
  const response = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: createPK(userId),
        sk: createSK(accountId),
      },
    }),
  );

  return (response.Item as AwsAccountRecord) || null;
};

/**
 * Update an AWS account
 */
export const updateDbAccount = async (
  userId: string,
  accountId: string,
  updates: Partial<
    Pick<
      AwsAccountRecord,
      "accountName" | "defaultRegion" | "isDefault" | "encryptedCredentials" | "awsAccountId"
    >
  >,
): Promise<void> => {
  const expressionParts: string[] = [];
  const expressionValues: Record<string, unknown> = {};
  const expressionNames: Record<string, string> = {};

  if (updates.accountName !== undefined) {
    expressionParts.push("#accountName = :accountName");
    expressionValues[":accountName"] = updates.accountName;
    expressionNames["#accountName"] = "accountName";
  }

  if (updates.defaultRegion !== undefined) {
    expressionParts.push("#defaultRegion = :defaultRegion");
    expressionValues[":defaultRegion"] = updates.defaultRegion;
    expressionNames["#defaultRegion"] = "defaultRegion";
  }

  if (updates.isDefault !== undefined) {
    expressionParts.push("#isDefault = :isDefault");
    expressionValues[":isDefault"] = updates.isDefault;
    expressionNames["#isDefault"] = "isDefault";
  }

  if (updates.encryptedCredentials !== undefined) {
    expressionParts.push("#encryptedCredentials = :encryptedCredentials");
    expressionValues[":encryptedCredentials"] = updates.encryptedCredentials;
    expressionNames["#encryptedCredentials"] = "encryptedCredentials";
  }

  if (updates.awsAccountId !== undefined) {
    expressionParts.push("#awsAccountId = :awsAccountId");
    expressionValues[":awsAccountId"] = updates.awsAccountId;
    expressionNames["#awsAccountId"] = "awsAccountId";
  }

  expressionParts.push("#updatedAt = :updatedAt");
  expressionValues[":updatedAt"] = dayjs().toISOString();
  expressionNames["#updatedAt"] = "updatedAt";

  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: createPK(userId),
        sk: createSK(accountId),
      },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionNames,
    }),
  );
};

/**
 * Delete an AWS account
 */
export const deleteDbAccount = async (userId: string, accountId: string): Promise<void> => {
  await dynamodb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: createPK(userId),
        sk: createSK(accountId),
      },
    }),
  );
};

/**
 * Update last used timestamp
 */
export const updateDbAccountLastUsed = async (userId: string, accountId: string): Promise<void> => {
  await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: createPK(userId),
        sk: createSK(accountId),
      },
      UpdateExpression: "SET #lastUsedAt = :lastUsedAt",
      ExpressionAttributeValues: {
        ":lastUsedAt": dayjs().toISOString(),
      },
      ExpressionAttributeNames: {
        "#lastUsedAt": "lastUsedAt",
      },
    }),
  );
};
