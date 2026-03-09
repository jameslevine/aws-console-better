import { router as accountsRouter } from "./routes/accounts";
import { router as authRouter } from "./routes/auth";
import { router as cloudformationRouter } from "./routes/aws/cloudformation";
import { cognitoAuthMiddleware } from "./middleware/cognito-auth";
import cors from "cors";
import { router as dynamodbRouter } from "./routes/aws/dynamodb";
import { router as ec2Router } from "./routes/aws/ec2";
import { errorHandler } from "./middleware/error-handler";
import express from "express";
import { router as historyRouter } from "./routes/history";
import { router as iamRouter } from "./routes/aws/iam";
import { router as lambdaRouter } from "./routes/aws/lambda";
import { router as s3Router } from "./routes/aws/s3";
import serverless from "serverless-http";
import { router as usersRouter } from "./routes/users";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: "*", // Will be restricted to Chrome Extension origin in production
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Amz-Date",
      "X-Api-Key",
      "X-Amz-Security-Token",
    ],
    maxAge: 300,
  }),
);

// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Health check (no auth required)
app.get("/v1/health", (_req, res) => {
  res.json({ status: "ok", version: "0.1.0" });
});

// Public routes (no auth required)
app.use("/v1/auth", authRouter);

// Protected routes (auth required)
app.use(cognitoAuthMiddleware);

app.use("/v1/users", usersRouter);
app.use("/v1/accounts", accountsRouter);
app.use("/v1/history", historyRouter);

// AWS service routes
app.use("/v1/aws/:accountId/ec2", ec2Router);
app.use("/v1/aws/:accountId/s3", s3Router);
app.use("/v1/aws/:accountId/lambda", lambdaRouter);
app.use("/v1/aws/:accountId/dynamodb", dynamodbRouter);
app.use("/v1/aws/:accountId/iam", iamRouter);
app.use("/v1/aws/:accountId/cloudformation", cloudformationRouter);

// Error handler
app.use(errorHandler);

// Local development server
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`AWS Console Better API running on http://localhost:${PORT}`);
  });
}

// Lambda handler
export const handler = serverless(app);
