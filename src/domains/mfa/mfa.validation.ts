import { body } from "express-validator";
import { validate } from "../../middlewares/form-validate";
import { MFATypes } from "./mfa.interface";

export const setupTotp = [
  body("mfaType")
    .exists()
    .withMessage("MFA type is required")
    .isIn(MFATypes)
    .withMessage(`MFA type must be one of ${MFATypes.join(", ")}`),
  body("value").optional().isString().withMessage("Value must be a string"),
  validate,
];

export const verifyTotp = [
  body("code")
    .exists()
    .withMessage("TOTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("TOTP code must be 6 digits")
    .isNumeric()
    .withMessage("TOTP code must be numeric"),
  body("mfaType")
    .exists()
    .withMessage("MFA type is required")
    .isIn(MFATypes)
    .withMessage(`MFA type must be one of ${MFATypes.join(", ")}`),
  validate,
];
