import { body } from "express-validator";
import validate from "../middlewares/form-validate";

export const updateProfile = [
  body("firstName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("First name cannot be empty when provided"),
  body("lastName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Last name cannot be empty when provided"),
  body("middleName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Middle name cannot be empty when provided"),
  validate,
];
