import { Request, Response, Router } from "express";

export const router = Router();

// GET /v1/accounts — List all AWS accounts for the current user
router.get("/", async (_req: Request, res: Response) => {
  // TODO: Implement list accounts
  res.json({ accounts: [] });
});

// POST /v1/accounts — Add a new AWS account
router.post("/", async (_req: Request, res: Response) => {
  // TODO: Implement add account with KMS encryption
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/accounts/:accountId — Get a specific AWS account
router.get("/:accountId", async (_req: Request, res: Response) => {
  // TODO: Implement get account
  res.status(501).json({ message: "Not implemented yet" });
});

// PATCH /v1/accounts/:accountId — Update an AWS account
router.patch("/:accountId", async (_req: Request, res: Response) => {
  // TODO: Implement update account
  res.status(501).json({ message: "Not implemented yet" });
});

// DELETE /v1/accounts/:accountId — Delete an AWS account
router.delete("/:accountId", async (_req: Request, res: Response) => {
  // TODO: Implement delete account
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/accounts/:accountId/verify — Verify credentials
router.post("/:accountId/verify", async (_req: Request, res: Response) => {
  // TODO: Implement credential verification via STS
  res.status(501).json({ message: "Not implemented yet" });
});
