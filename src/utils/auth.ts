import { sign } from "jsonwebtoken";

export function signJsonWebToken(
  payload: Record<string, any>,
  expiresIn: string = "15m"
): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return sign({ data: payload }, jwtSecret, { expiresIn });
}
