import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/lambda/functions
router.get("/functions", async (_req: Request, res: Response) => {
  res.json({ functions: [] });
});

// GET /v1/aws/:accountId/lambda/functions/:functionName
router.get("/functions/:functionName", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/lambda/functions/:functionName/invoke
router.post("/functions/:functionName/invoke", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/lambda/functions/:functionName/copy-to-region
router.post("/functions/:functionName/copy-to-region", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// GET /v1/aws/:accountId/lambda/functions/:functionName/logs
router.get("/functions/:functionName/logs", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});
