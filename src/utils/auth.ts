import { sign } from "jsonwebtoken";

export function signJsonWebToken(
  payload: Record<string, any>,
  expiresIn?: string
): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  const tokenExpiry = expiresIn || process.env.JWT_ACCESS_TOKEN_EXPIRY;

  return sign({ data: payload }, jwtSecret, { expiresIn: tokenExpiry });
}


export function parseExpiry(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 0;
  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case "s": return num * 1000;
    case "m": return num * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "d": return num * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}
