import { body } from "express-validator";
import validate from "../middlewares/form-validate";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export const createUser = [
  body("firstName").isString().notEmpty().withMessage("First name is required"),
  body("lastName").isString().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .custom((value) => passwordRegex.test(value))
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
  validate,
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Invalid email format"),
  validate,
];

export const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token is required").bail(),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .custom((value) => passwordRegex.test(value))
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
  validate,
];

export const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .bail()
    .custom((value) => passwordRegex.test(value))
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
  validate,
];
