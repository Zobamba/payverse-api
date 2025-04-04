import jwt from "jsonwebtoken";

export function signJsonWebToken(payload: object) {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return jwt.sign({ data: payload }, jwtSecret, { expiresIn: "6h" });
}
