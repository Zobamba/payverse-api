import MFA from "../../models/mfa";
import { throwError } from "../../helpers/throw-error";
import { signJsonWebToken } from "../../utils/auth";
import speakeasy from "speakeasy";
import { sendVerificationCode, sendEnableMfaEmail } from "../../utils/email";
import { generateVerificationCode } from "../../utils/code";
import qrcode from "qrcode";
import UserService from "../user/user.service";
import { enableMFA, MFAResponse } from "./mfa.interface";
import { handleEmailMFA } from "../../helpers/handle-email-mfa";

class MFAService {
  constructor(private readonly userService: typeof UserService) {}

  public async enableMFA(payload: enableMFA): Promise<MFAResponse> {
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

      const userInstance = await this.userService.getUserById(payload.userId);
      const user = userInstance.get({ plain: true });
      await sendEnableMfaEmail(user);

      return {
        qrCode: qrCodeDataURL,
        mfaToken,
        secretKey:
          process.env.NODE_ENV !== "production" ? secretKey : undefined,
      };
    } else if (payload.mfaType === "sms" || payload.mfaType === "email") {
      if (!payload.value) {
        throwError(400, `${payload.mfaType.toUpperCase()} value is required`);
      }

      await MFA.create({
        userId: payload.userId,
        mfaType: payload.mfaType,
        contact: payload.value,
        isActive: false,
      });

      if (payload.mfaType === "email") {
        const userInstance = await this.userService.getUserById(payload.userId);
        const user = userInstance.get({ plain: true });
        await handleEmailMFA(user);
      }
      return { mfaToken };
    }

    throwError(500, "MFA type not handled properly");
  }
}

export default new MFAService(UserService);
