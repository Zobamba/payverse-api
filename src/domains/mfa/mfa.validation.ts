import { body } from "express-validator";
import validate from "../middlewares/form-validate";
import { MFATypes } from "./mfa.interface";

export const enableMFA = [
  body("mfaType")
    .exists()
    .withMessage("MFA type is required")
    .isIn(MFATypes)
    .withMessage(`MFA type must be one of ${MFATypes.join(", ")}`),
  body("value").optional().isString().withMessage("Value must be a string"),
  validate,
];

export const verifyMFA = [
  body("mfaToken")
    .exists()
    .withMessage("MFA token is required")
    .isString()
    .withMessage("MFA token must be a string"),
  body("mfaType")
    .exists()
    .withMessage("MFA type is required")
    .isIn(MFATypes)
    .withMessage(`MFA type must be one of ${MFATypes.join(", ")}`),
  body("code")
    .exists()
    .withMessage("Code is required")
    .isString()
    .withMessage("Code must be a string"),
  validate,
];
