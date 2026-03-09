import { Request, Response, Router } from "express";

export const router = Router({ mergeParams: true });

// GET /v1/aws/:accountId/dynamodb/tables
router.get("/tables", async (_req: Request, res: Response) => {
  res.json({ tables: [] });
});

// GET /v1/aws/:accountId/dynamodb/tables/:tableName
router.get("/tables/:tableName", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/dynamodb/tables/:tableName/copy-to-region
router.post("/tables/:tableName/copy-to-region", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});

// POST /v1/aws/:accountId/dynamodb/tables/:tableName/query
router.post("/tables/:tableName/query", async (_req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
});
