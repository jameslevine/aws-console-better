import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unhandled error:", err);

  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    details: process.env.NODE_ENV !== "production" ? err.message : undefined,
  });
};
