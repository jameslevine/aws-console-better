import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Request, Response } from "express";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

/**
 * POST /v1/auth/register
 * Register a new user with Cognito
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "given_name", Value: firstName },
        { Name: "family_name", Value: lastName },
      ],
    });

    const response = await cognitoClient.send(command);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      userId: response.UserSub,
    });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Registration error:", err);

    if (err.name === "UsernameExistsException") {
      return res.status(409).json({
        message: "An account with this email already exists",
        code: "CONFLICT",
      });
    }

    if (err.name === "InvalidPasswordException") {
      return res.status(400).json({
        message: "Password does not meet requirements",
        code: "VALIDATION_ERROR",
        details: err.message,
      });
    }

    res.status(500).json({
      message: "Registration failed",
      code: "INTERNAL_ERROR",
    });
  }
};

/**
 * POST /v1/auth/verify
 * Verify email with confirmation code
 */
export const verify = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    await cognitoClient.send(command);

    res.json({ message: "Email verified successfully" });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Verification error:", err);

    if (err.name === "CodeMismatchException") {
      return res.status(400).json({
        message: "Invalid verification code",
        code: "VALIDATION_ERROR",
      });
    }

    if (err.name === "ExpiredCodeException") {
      return res.status(400).json({
        message: "Verification code has expired",
        code: "VALIDATION_ERROR",
      });
    }

    res.status(500).json({
      message: "Verification failed",
      code: "INTERNAL_ERROR",
    });
  }
};

/**
 * POST /v1/auth/login
 * Authenticate user and return tokens
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return res.status(401).json({
        message: "Authentication failed",
        code: "UNAUTHORIZED",
      });
    }

    res.json({
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
      idToken: response.AuthenticationResult.IdToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Login error:", err);

    if (err.name === "NotAuthorizedException") {
      return res.status(401).json({
        message: "Invalid email or password",
        code: "UNAUTHORIZED",
      });
    }

    if (err.name === "UserNotConfirmedException") {
      return res.status(403).json({
        message: "Please verify your email before logging in",
        code: "FORBIDDEN",
      });
    }

    if (err.name === "UserNotFoundException") {
      return res.status(401).json({
        message: "Invalid email or password",
        code: "UNAUTHORIZED",
      });
    }

    res.status(500).json({
      message: "Login failed",
      code: "INTERNAL_ERROR",
    });
  }
};

/**
 * POST /v1/auth/refresh
 * Refresh access token using refresh token
 */
export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: "REFRESH_TOKEN_AUTH",
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return res.status(401).json({
        message: "Token refresh failed",
        code: "UNAUTHORIZED",
      });
    }

    res.json({
      accessToken: response.AuthenticationResult.AccessToken,
      expiresIn: response.AuthenticationResult.ExpiresIn,
    });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Token refresh error:", err);

    if (err.name === "NotAuthorizedException") {
      return res.status(401).json({
        message: "Invalid or expired refresh token",
        code: "UNAUTHORIZED",
      });
    }

    res.status(500).json({
      message: "Token refresh failed",
      code: "INTERNAL_ERROR",
    });
  }
};

/**
 * POST /v1/auth/forgot-password
 * Initiate password reset flow
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
    });

    await cognitoClient.send(command);

    // Always return success to prevent email enumeration
    res.json({ message: "Password reset code sent to email" });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Forgot password error:", err);

    // Return success even on error to prevent email enumeration
    res.json({ message: "Password reset code sent to email" });
  }
};

/**
 * POST /v1/auth/reset-password
 * Reset password with confirmation code
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await cognitoClient.send(command);

    res.json({ message: "Password reset successfully" });
  } catch (error: unknown) {
    const err = error as Error & { name?: string };
    console.error("Reset password error:", err);

    if (err.name === "CodeMismatchException") {
      return res.status(400).json({
        message: "Invalid reset code",
        code: "VALIDATION_ERROR",
      });
    }

    if (err.name === "ExpiredCodeException") {
      return res.status(400).json({
        message: "Reset code has expired",
        code: "VALIDATION_ERROR",
      });
    }

    if (err.name === "InvalidPasswordException") {
      return res.status(400).json({
        message: "Password does not meet requirements",
        code: "VALIDATION_ERROR",
        details: err.message,
      });
    }

    res.status(500).json({
      message: "Password reset failed",
      code: "INTERNAL_ERROR",
    });
  }
};
