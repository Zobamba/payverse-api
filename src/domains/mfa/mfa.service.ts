import MFA from "./mfa.model";
import { throwError } from "../../helpers/throw-error";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { enableMFA, MFAResponse, MFATypes } from "./mfa.interface";
import { signJsonWebToken } from "../../utils/auth";
import {
  sendSetupTOTPEmail,
  sendTotpSetupSuccessEmail,
} from "../../utils/email";
import UserService from "../user/user.service";

class MFAService {
  constructor(private readonly userService: typeof UserService) {}
  public async setupTotp(payload: enableMFA): Promise<MFAResponse> {
    const existingMFA = await MFA.findOne({
      where: {
        userId: payload.userId,
        mfaType: payload.mfaType,
        isActive: true,
      },
    });
    if (existingMFA) throwError(400, "MFA method already enabled");

    let secretKey: string | null = null;
    let qrCodeDataURL: string | null = null;

    const mfaToken = signJsonWebToken({ id: payload.userId }, "10m");

    if (payload.mfaType === "totp") {
      const secret = speakeasy.generateSecret({
        name: `PayVerse (${payload.userId})`,
      });
      secretKey = secret.base32;
      qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

      // Generate a TOTP token (for testing or debugging)
      const token = speakeasy.totp({
        secret: secretKey,
        encoding: "base32",
      });
      console.log(token);

      // 🧹 Clean up old unverified TOTP entries
      await MFA.destroy({
        where: {
          userId: payload.userId,
          mfaType: payload.mfaType,
          isActive: false,
        },
      });

      // 🆕 Create a fresh TOTP MFA entry
      await MFA.create({
        userId: payload.userId,
        mfaType: payload.mfaType,
        secretKey,
        isActive: false,
      });

      const user = await this.userService.getUserById(payload.userId);
      await sendSetupTOTPEmail(user.email, user.firstName);
    }

    return {
      qrCode: qrCodeDataURL,
    };
  }

  public async completeTotpSetup(userId: string): Promise<void> {
    const mfaRecord = await MFA.findOne({
      where: {
        userId,
        mfaType: "totp",
        isActive: false,
      },
    });

    if (!mfaRecord) {
      return throwError(400, "No pending TOTP setup found");
    }

    await mfaRecord.update({ isActive: true });

    // Send email notification to user after enabling TOTP MFA
    const user = await this.userService.getUserById(userId);
    await sendTotpSetupSuccessEmail(user.email, user.firstName);
  }

  public async verifyTotp(
    code: string,
    userId: string,
    mfaType: string
  ): Promise<boolean> {
    const mfaRecord = await MFA.findOne({
      where: {
        userId,
        mfaType,
        isActive: true,
      },
    });

    if (!mfaRecord) {
      return throwError(400, "MFA method not enabled");
    }

    const cleanCode = code.toString().replace(/\s/g, "");

    const isVerified = speakeasy.totp.verify({
      secret: mfaRecord.secretKey,
      encoding: "base32",
      token: cleanCode,
      window: 1,
    });

    return isVerified;
  }
}

export default new MFAService(UserService);
