export interface enableMFA {
  userId: string;
  mfaType: string;
  value?: string;
}

export interface MFAResponse {
  qrCode?: string;
  mfaToken?: string;
  secretKey?: string;
}

export const MFATypes = ["totp", "sms", "email"] as const;
