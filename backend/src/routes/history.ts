import { Request, Response, Router } from "express";

export const router = Router();

// GET /v1/history — Get action history
router.get("/", async (_req: Request, res: Response) => {
  // TODO: Implement action history from DynamoDB
  res.json({ history: [], total: 0, limit: 50, offset: 0 });
});
