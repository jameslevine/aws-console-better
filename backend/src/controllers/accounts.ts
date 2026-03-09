import { Request, Response } from "express";
import {
  createDbAccount,
  deleteDbAccount,
  getDbAccountById,
  getDbAccountsByUserId,
  updateDbAccount,
} from "../adapters/accounts";
import { decryptCredentials, encryptCredentials } from "../lib/credential-manager";

import { verifyCredentials } from "../lib/aws-client";

/**
 * GET /v1/accounts
 * List all AWS accounts for the current user
 */
export const listAccounts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accounts = await getDbAccountsByUserId(req.user.sub);

    // Strip encrypted credentials from response
    const safeAccounts = accounts.map(
      ({ encryptedCredentials: _creds, pk: _pk, sk: _sk, ...account }) => account,
    );

    res.json({ accounts: safeAccounts });
  } catch (error) {
    console.error("Error listing accounts:", error);
    res.status(500).json({ message: "Error listing accounts", code: "INTERNAL_ERROR" });
  }
};

/**
 * POST /v1/accounts
 * Add a new AWS account with encrypted credentials
 */
export const createAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountName, accessKeyId, secretAccessKey, sessionToken, defaultRegion, isDefault } =
      req.body;

    // Verify credentials first
    let awsAccountId: string;
    try {
      const identity = await verifyCredentials(
        { accessKeyId, secretAccessKey, sessionToken },
        defaultRegion,
      );
      awsAccountId = identity.awsAccountId || "unknown";
    } catch (error) {
      return res.status(400).json({
        message: "Invalid AWS credentials",
        code: "VALIDATION_ERROR",
      });
    }

    // Encrypt credentials
    const encryptedCreds = await encryptCredentials({
      accessKeyId,
      secretAccessKey,
      sessionToken,
    });

    // Store in DynamoDB
    const account = await createDbAccount(req.user.sub, {
      accountName,
      awsAccountId,
      defaultRegion,
      isDefault: isDefault || false,
      encryptedCredentials: encryptedCreds,
    });

    res.status(201).json({
      accountId: account.accountId,
      accountName: account.accountName,
      awsAccountId: account.awsAccountId,
      defaultRegion: account.defaultRegion,
      message: "AWS account added successfully",
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Error creating account", code: "INTERNAL_ERROR" });
  }
};

/**
 * GET /v1/accounts/:accountId
 * Get a specific AWS account
 */
export const getAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId } = req.params;
    const account = await getDbAccountById(req.user.sub, accountId);

    if (!account) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    // Strip encrypted credentials
    const { encryptedCredentials: _creds, pk: _pk, sk: _sk, ...safeAccount } = account;

    res.json(safeAccount);
  } catch (error) {
    console.error("Error getting account:", error);
    res.status(500).json({ message: "Error getting account", code: "INTERNAL_ERROR" });
  }
};

/**
 * PATCH /v1/accounts/:accountId
 * Update an AWS account
 */
export const updateAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId } = req.params;
    const account = await getDbAccountById(req.user.sub, accountId);

    if (!account) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    const updates: Record<string, unknown> = {};

    if (req.body.accountName) updates.accountName = req.body.accountName;
    if (req.body.defaultRegion) updates.defaultRegion = req.body.defaultRegion;
    if (req.body.isDefault !== undefined) updates.isDefault = req.body.isDefault;

    // If new credentials provided, verify and encrypt them
    if (req.body.accessKeyId && req.body.secretAccessKey) {
      try {
        const identity = await verifyCredentials(
          {
            accessKeyId: req.body.accessKeyId,
            secretAccessKey: req.body.secretAccessKey,
            sessionToken: req.body.sessionToken,
          },
          account.defaultRegion,
        );
        updates.awsAccountId = identity.awsAccountId;
      } catch (error) {
        return res.status(400).json({
          message: "Invalid AWS credentials",
          code: "VALIDATION_ERROR",
        });
      }

      updates.encryptedCredentials = await encryptCredentials({
        accessKeyId: req.body.accessKeyId,
        secretAccessKey: req.body.secretAccessKey,
        sessionToken: req.body.sessionToken,
      });
    }

    await updateDbAccount(req.user.sub, accountId, updates);

    res.json({ message: "AWS account updated successfully" });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Error updating account", code: "INTERNAL_ERROR" });
  }
};

/**
 * DELETE /v1/accounts/:accountId
 * Delete an AWS account
 */
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId } = req.params;
    const account = await getDbAccountById(req.user.sub, accountId);

    if (!account) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    await deleteDbAccount(req.user.sub, accountId);

    res.json({ message: "AWS account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Error deleting account", code: "INTERNAL_ERROR" });
  }
};

/**
 * POST /v1/accounts/:accountId/verify
 * Verify stored credentials are still valid
 */
export const verifyAccount = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { accountId } = req.params;
    const account = await getDbAccountById(req.user.sub, accountId);

    if (!account) {
      return res.status(404).json({ message: "Account not found", code: "NOT_FOUND" });
    }

    // Decrypt credentials
    const credentials = await decryptCredentials(account.encryptedCredentials);

    // Verify with STS
    const identity = await verifyCredentials(credentials, account.defaultRegion);

    res.json({
      valid: true,
      awsAccountId: identity.awsAccountId,
      arn: identity.arn,
      userId: identity.userId,
    });
  } catch (error) {
    console.error("Error verifying account:", error);
    res.json({
      valid: false,
      message: "Credentials are invalid or expired",
    });
  }
};
