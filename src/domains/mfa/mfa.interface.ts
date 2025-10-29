export const MFATypes = ["totp"] as const;
export type MFAType = (typeof MFATypes)[number];

export interface enableMFA {
  userId: string;
  mfaType: MFAType;
}

export interface MFAResponse {
  qrCode?: string;
  mfaToken?: string;
  secretKey?: string;
}
