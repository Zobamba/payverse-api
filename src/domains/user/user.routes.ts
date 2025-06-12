import express from "express";
import userController from "./user.controller";
import { verifyAuthToken, validateToken } from "../middlewares/auth-validate";
import { updateProfile } from "./user.validation";

const router = express.Router();

/**
 * @get /api/users
 * @description Get all users
 * @returns users
 */
router.get("/", verifyAuthToken, validateToken, userController.getAllUsers);

/**
 * @get /api/users/profile
 * @description Get user profile
 * @returns user
 */
router.get(
  "/profile",
  verifyAuthToken,
  validateToken,
  userController.getProfile
);

/**
 * @get /api/users/:id
 * @description Get user by id
 * @returns user
 */
router.get("/:id", verifyAuthToken, validateToken, userController.getUserById);

/**
 * @put /api/users/profile
 * @description Update user profile
 * @returns user
 */
router.put(
  "/profile",
  verifyAuthToken,
  validateToken,
  updateProfile,
  userController.updateProfile
);

/**
 * @delete /api/users/profile
 * @description Delete user account
 * @returns success message
 */
router.delete(
  "/profile",
  verifyAuthToken,
  validateToken,
  userController.deleteAccount
);

export default router;
