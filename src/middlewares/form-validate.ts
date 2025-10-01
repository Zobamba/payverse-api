import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { validationResult } from "express-validator";
import { throwError } from "../helpers/throw-error";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateWithZod =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
        headers: req.headers,
      });
      return next();
    } catch (error) {
      return formatZodErrors(error);
    }
  };

const formatZodErrors = (error: unknown) => {
  if (error instanceof ZodError) {
    const formattedErrors = error.issues.map((validationError) => ({
      msg: validationError.message,
      field: validationError.path.join("."),
    }));
    return throwError(422, {
      message: "Validation error",
      errors: formattedErrors,
    });
  } else {
    throwError(500, {
      message: "Internal server error",
    });
  }
};
