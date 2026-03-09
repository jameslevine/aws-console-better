import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/s3/buckets
router.get("/buckets", async (_req: Request, res: Response) => {
  res.json({ buckets: [] });
});

// GET /v1/aws/:accountId/s3/buckets/:bucketName
router.get("/buckets/:bucketName", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/s3/buckets/:bucketName/copy-to-region
router.post(
  "/buckets/:bucketName/copy-to-region",
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented yet" });
  },
);

// GET /v1/aws/:accountId/s3/buckets/:bucketName/policy
router.get(
  "/buckets/:bucketName/policy",
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented yet" });
  },
);

// GET /v1/aws/:accountId/s3/buckets/:bucketName/sync-command
router.get(
  "/buckets/:bucketName/sync-command",
  async (_req: Request, res: Response) => {
    res.status(501).json({ message: "Not implemented yet" });
  },
);
