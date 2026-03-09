import {
  forgotPassword,
  login,
  refresh,
  register,
  resetPassword,
  verify,
} from "../controllers/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifySchema,
} from "../models/auth";

import { Router } from "express";
import { validateBody } from "../middleware/validation";

export const router = Router();

// POST /v1/auth/register
router.post("/register", validateBody(registerSchema), register);

// POST /v1/auth/verify
router.post("/verify", validateBody(verifySchema), verify);

// POST /v1/auth/login
router.post("/login", validateBody(loginSchema), login);

// POST /v1/auth/refresh
router.post("/refresh", validateBody(refreshSchema), refresh);

// POST /v1/auth/forgot-password
router.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword);

// POST /v1/auth/reset-password
router.post("/reset-password", validateBody(resetPasswordSchema), resetPassword);
