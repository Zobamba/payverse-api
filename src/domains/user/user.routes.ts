import express from "express";
import userController from "./user.controller";
import { auth } from "../../middlewares/auth-validate";
import { updateProfile } from "./user.validation";

const router = express.Router();

/**
 * @get /api/users
 * @description Get all users
 * @returns users
 */
router.get("/", auth, userController.getAllUsers);

/**
 * @get /api/users/profile
 * @description Get user profile
 * @returns user
 */
router.get("/profile", auth, userController.getProfile);

/**
 * @get /api/users/:id
 * @description Get user by id
 * @returns user
 */
router.get("/:id", auth, userController.getUserById);

/**
 * @put /api/users/profile
 * @description Update user profile
 * @returns user
 */
router.put("/profile", auth, updateProfile, userController.updateProfile);

/**
 * @delete /api/users/profile
 * @description Delete user account
 * @returns success message
 */
router.delete("/profile", auth, userController.deleteAccount);

export default router;
