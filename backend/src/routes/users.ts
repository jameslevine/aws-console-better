import { Request, Response, Router } from "express";

export const router = Router();

// GET /v1/users/me — Get current user profile
router.get("/me", async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // TODO: Fetch user profile from DynamoDB
  res.json({
    userId: req.user.sub,
    email: req.user.email,
    preferences: {
      defaultRegion: "us-east-1",
      theme: "system",
      keyboardShortcutsEnabled: true,
    },
  });
});

// PATCH /v1/users/me — Update user profile
router.patch("/me", async (_req: Request, res: Response) => {
  // TODO: Implement update user profile
  res.status(501).json({ message: "Not implemented yet" });
});
