import { getDbAccountById, updateDbAccountLastUsed } from "../adapters/accounts";

import { Request } from "express";
import { decryptCredentials } from "./credential-manager";

/**
 * Helper to get decrypted AWS credentials for a user's account.
 * Used by all AWS service controllers.
 */
export const getUserCredentials = async (
  req: Request,
  accountId: string,
): Promise<{
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
  defaultRegion: string;
} | null> => {
  if (!req.user) return null;

  const account = await getDbAccountById(req.user.sub, accountId);
  if (!account) return null;

  const credentials = await decryptCredentials(account.encryptedCredentials);

  // Update last used timestamp (fire and forget)
  updateDbAccountLastUsed(req.user.sub, accountId).catch(() => {});

  return {
    ...credentials,
    defaultRegion: account.defaultRegion,
  };
};
