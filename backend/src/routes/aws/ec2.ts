import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/ec2/instances
router.get("/instances", async (_req: Request, res: Response) => {
  // TODO: List EC2 instances using stored credentials
  res.json({ instances: [], regions: [] });
});

// GET /v1/aws/:accountId/ec2/instances/:instanceId
router.get("/instances/:instanceId", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/ec2/instances/:instanceId/start
router.post("/instances/:instanceId/start", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/ec2/instances/:instanceId/stop
router.post("/instances/:instanceId/stop", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/ec2/instances/:instanceId/reboot
router.post("/instances/:instanceId/reboot", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/ec2/instances/:instanceId/copy-to-region
router.post("/instances/:instanceId/copy-to-region", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/aws/:accountId/ec2/instances/:instanceId/ssh-command
router.get("/instances/:instanceId/ssh-command", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/aws/:accountId/ec2/security-groups
router.get("/security-groups", async (_req: Request, res: Response) => {
  res.json({ securityGroups: [] });
});

// POST /v1/aws/:accountId/ec2/security-groups/:groupId/copy-to-region
router.post("/security-groups/:groupId/copy-to-region", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});
