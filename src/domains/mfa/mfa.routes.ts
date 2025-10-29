import express from "express";
import mfaController from "./mfa.controller";
import { setupTotp, verifyTotp } from "./mfa.validation";
import { auth } from "../../middlewares/auth-validate";

const router = express.Router();

/**
 * @post /api/mfa/setup-totp
 * @description Setup TOTP MFA
 * @returns mfaToken
 */
router.post("/setup-totp", auth, setupTotp, mfaController.setupTotp);

/**
 * @post /api/mfa/complete-totp-setup
 * @description Complete TOTP MFA setup
 * @returns success message
 */
router.post("/complete-totp-setup", auth, mfaController.completeTotpSetup);

/**
 * @post /api/mfa/verify-totp
 * @description Verify TOTP MFA
 * @returns isVerified
 */
router.post("/verify-totp", auth, verifyTotp, mfaController.verifyTotp);

export default router;
