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
