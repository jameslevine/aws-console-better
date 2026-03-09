import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/iam/roles
router.get("/roles", async (_req: Request, res: Response) => {
  res.json({ roles: [] });
});

// GET /v1/aws/:accountId/iam/roles/:roleName
router.get("/roles/:roleName", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/aws/:accountId/iam/policies
router.get("/policies", async (_req: Request, res: Response) => {
  res.json({ policies: [] });
});

// GET /v1/aws/:accountId/iam/policies/:policyArn
router.get("/policies/:policyArn", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});
