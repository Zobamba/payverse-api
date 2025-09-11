import express from "express";
import kycController from "./kyc.controller";
import { validateBVNWithFace } from "./kyc.validation";
import {
  validateToken,
  verifyAuthToken,
} from "../../middlewares/auth-validate";

const router = express.Router();

/**
 * @post /api/kyc/verify-bvn-with-face
 * @description Verify BVN with face image
 * @returns verification result
 */
router.post(
  "/bvn-with-face",
  verifyAuthToken,
  validateToken,
  validateBVNWithFace,
  kycController.verifyBVNWithFace
);

export default router;
