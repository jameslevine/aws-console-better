import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/cloudformation/stacks
router.get("/stacks", async (_req: Request, res: Response) => {
  res.json({ stacks: [] });
});

// GET /v1/aws/:accountId/cloudformation/stacks/:stackName
router.get("/stacks/:stackName", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/aws/:accountId/cloudformation/stacks/:stackName/template
router.get("/stacks/:stackName/template", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/cloudformation/stacks/:stackName/copy-to-region
router.post("/stacks/:stackName/copy-to-region", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/cloudformation/stacks/:stackName/rollback
router.post("/stacks/:stackName/rollback", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});
