export const TOKEN_TYPES = ["refresh", "mfa"] as const;
export type TokenType = (typeof TOKEN_TYPES)[number];

export interface CreateTokenData {
  userId: string;
  token: string;
  type: TokenType;
  expiresAt: Date;
}
