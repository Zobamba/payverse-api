export interface enableMFA {
  userId: string;
  mfaType: string;
  value?: string;
}

export interface verifyMFA {
  mfaToken: string;
  mfaType: string;
  code: string;
}

export interface MFAResponse {
  qrCode?: string;
  mfaToken?: string;
  secretKey?: string;
}

export const MFATypes = ["totp", "sms", "email"] as const;
