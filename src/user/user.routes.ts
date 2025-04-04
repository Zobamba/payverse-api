import express from "express";
import userController from "./user.controller";
import {
  createUser,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} from "./user.validation";
import { validateToken, verifyAuthToken } from "../middlewares/auth-validate";

const router = express.Router();

/**
 * @post /api/users
 * @description Create user
 * @returns user
 */
router.post("/create-user", createUser, userController.createUser);

/**
 * @get /api/users/verify-email
 * @description Verify email
 * @returns success message
 */
router.get(
  "/verify-email",
  verifyAuthToken,
  validateToken,
  userController.verifyEmail
);

/**
 * @post /api/users/login
 * @description Login user
 * @returns user
 */
router.post("/login", loginValidation, userController.login);

/**
 * @post /api/users/forgot-password
 * @description Forgot password
 * @returns success message
 */
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  userController.forgotPassword
);

/**
 * @post /api/users/reset-password
 * @description Reset password
 * @returns success message
 */
router.post(
  "/reset-password",
  resetPasswordValidation,
  userController.resetPassword
);

/**
 * @post /api/users/change-password
 * @description Change password
 * @returns success message
 */
router.post(
  "/change-password",
  verifyAuthToken,
  validateToken,
  changePasswordValidation,
  userController.changePassword
);

export default router;
