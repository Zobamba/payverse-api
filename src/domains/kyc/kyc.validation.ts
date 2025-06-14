import { body } from "express-validator";
import validate from "../middlewares/form-validate";

export const validateBVNWithFace = [
  body("bvn")
    .notEmpty()
    .withMessage("BVN is required")
    .isLength({ min: 11, max: 11 })
    .withMessage("BVN must be exactly 11 digits"),

  body("image")
    .notEmpty()
    .withMessage("Image is required")
    .isString()
    .withMessage("Image must be a base64-encoded string or URL"),
  validate,
];
