import { NextFunction, Request, Response } from "express";

import { CognitoJwtVerifier } from "aws-jwt-verify";

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        [key: string]: unknown;
      };
    }
  }
}

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: "access",
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export const cognitoAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided", code: "UNAUTHORIZED" });
    }

    const payload = await verifier.verify(token);
    req.user = {
      ...payload,
      sub: payload.sub,
      email: ((payload as Record<string, unknown>).email as string) || "",
    };
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ message: "Invalid token", code: "UNAUTHORIZED" });
  }
};
