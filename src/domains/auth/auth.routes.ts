import express from "express";
import authController from "./auth.controller";
import {
  registerValidation,
  loginValidation,
  verifyMFAValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "./auth.validation";
import { auth } from "../../middlewares/auth-validate";

const router = express.Router();

/**
 * @post /api/auth
 * @description Create user
 * @returns user
 */
router.post("/register", registerValidation, authController.register);

/**
 * @get /api/auth/verify-email
 * @description Verify email
 * @returns success message
 */
router.get("/verify-email", auth, authController.verifyEmail);

/**
 * @post /api/auth/login
 * @description Login user
 * @returns user
 */
router.post("/login", loginValidation, authController.login);

/**
 * @post /api/auth/verify
 * @description Verify MFA
 * @returns access & refresh tokens, user
 */
router.post("/verify", verifyMFAValidation, authController.verifyMFA);

/**
 * @post /api/auth/forgot-password
 * @description Forgot password
 * @returns success message
 */
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  authController.forgotPassword
);

/**
 * @post /api/auth/reset-password
 * @description Reset password
 * @returns success message
 */
router.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword
);

/**
 * @post /api/auth/change-password
 * @description Change password
 * @returns success message
 */
router.post(
  "/change-password",
  auth,
  changePasswordValidation,
  authController.changePassword
);

/**
 * @post /api/auth/refresh-token
 * @description Refresh token
 * @returns new access & refresh tokens
 */
router.post("/refresh-token", authController.refreshToken);

export default router;
