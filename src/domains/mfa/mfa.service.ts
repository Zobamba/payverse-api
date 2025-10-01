import MFA from "./mfa.model";
import { throwError } from "../../helpers/throw-error";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import UserService from "../user/user.service";
import { enableMFA, MFAResponse, MFATypes } from "./mfa.interface";
class MFAService {

  public async setupTotp(payload: enableMFA): Promise<MFAResponse> {
    const existingMFA = await MFA.findOne({
      where: {
        userId: payload.userId,
        mfaType: payload.mfaType,
        isActive: true,
      },
    });

    if (existingMFA) {
      return throwError(400, "MFA method already enabled");
    }

    const secret = speakeasy.generateSecret({
      name: `PayVerse (${payload.userId})`,
    });

    //TODO: remove this console log in production
    const code = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);

    await MFA.create({
      userId: payload.userId,
      mfaType: payload.mfaType,
      secretKey: secret.base32,
      isActive: false,
    });

    return {
      qrCode: qrCodeDataURL,
    }
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

    mfaRecord.isActive = true;
    await mfaRecord.save();

    // TODO: trigger email notification to user to let them knowo they have successfully enabled TOTP MFA
  }


  public async verifyTotp(code: string, userId: string, mfaType: string): Promise<boolean> {
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

    const isVerified = speakeasy.totp.verify({
      secret: mfaRecord.secretKey,
      encoding: "base32",
      token: code,
      window: 1,
    });

    return isVerified
  }
}

export default new MFAService();
