export const MFATypes = ["totp"] as const;
export type MFAType = (typeof MFATypes)[number];

export interface enableMFA {
  userId: string;
  mfaType: MFAType;
  value?: string;
}

export interface MFAResponse {
  qrCode?: string;
  mfaToken?: string;
  secretKey?: string;
}

