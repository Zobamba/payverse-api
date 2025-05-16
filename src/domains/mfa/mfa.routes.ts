import express from "express";
import mfaController from "./mfa.controller";
import { enableMFA } from "./mfa.validation";
import { validateToken, verifyAuthToken } from "../middlewares/auth-validate";

const router = express.Router();

/**
 * @post /api/mfa/enable
 * @description Enable MFA
 * @returns mfaToken
 */
router.post(
  "/enable",
  verifyAuthToken,
  validateToken,
  enableMFA,
  mfaController.enableMFA
);

export default router;
