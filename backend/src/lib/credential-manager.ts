import { DecryptCommand, EncryptCommand, KMSClient } from "@aws-sdk/client-kms";

const kmsClient = new KMSClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const KMS_KEY_ID = process.env.KMS_KEY_ID!;

/**
 * Encrypt AWS credentials using KMS before storing in DynamoDB
 */
export const encryptCredentials = async (credentials: {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}): Promise<string> => {
  const plaintext = JSON.stringify(credentials);

  const command = new EncryptCommand({
    KeyId: KMS_KEY_ID,
    Plaintext: Buffer.from(plaintext),
  });

  const response = await kmsClient.send(command);

  if (!response.CiphertextBlob) {
    throw new Error("Encryption failed: no ciphertext returned");
  }

  return Buffer.from(response.CiphertextBlob).toString("base64");
};

/**
 * Decrypt AWS credentials from DynamoDB using KMS
 */
export const decryptCredentials = async (
  encryptedData: string,
): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}> => {
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(encryptedData, "base64"),
  });

  const response = await kmsClient.send(command);

  if (!response.Plaintext) {
    throw new Error("Decryption failed: no plaintext returned");
  }

  const plaintext = Buffer.from(response.Plaintext).toString("utf-8");
  return JSON.parse(plaintext);
};
