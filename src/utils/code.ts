import crypto from "crypto";
import redisClient from "../config/redis";

export function generateVerificationCode(): string {
  const code = crypto.randomInt(0, 1000000);
  return code.toString().padStart(6, "0");
}

export async function storeCode(
  userId: string,
  mfaType: string,
  code: string,
  expiryMinutes: number
): Promise<void> {
  const key = `mfa:${userId}:${mfaType}`;
  const expirySeconds = expiryMinutes * 60;

  await redisClient.set(key, code, {
    EX: expirySeconds,
  });
}

export async function getCode(
  userId: string,
  mfaType: string
): Promise<string | null> {
  const key = `mfa:${userId}:${mfaType}`;
  const token = await redisClient.get(key);
  return token;
}
