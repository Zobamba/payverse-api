import jwt from "jsonwebtoken";
import MFA from "../../models/mfa";
import Token from "../../models/token";
import { throwError } from "../../helpers/throw-error";
import { signJsonWebToken } from "../../utils/auth";
import speakeasy from "speakeasy";
import { sendVerificationCode } from "../../utils/email";
import { generateVerificationCode, getCode } from "../../utils/code";
import qrcode from "qrcode";
import UserService from "../user/user.service";
import { enableMFA, MFAResponse, verifyMFA } from "./mfa.interface";

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

      // Generate a TOTP token for the user
      // const token = speakeasy.totp({
      //   secret: secretKey,
      //   encoding: "base32",
      // });
      // console.log(token);

      await MFA.create({
        userId: payload.userId,
        mfaType: payload.mfaType,
        secretKey,
        isActive: false,
      });

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

      const verificationCode = generateVerificationCode();

      await MFA.create({
        userId: payload.userId,
        mfaType: payload.mfaType,
        secretKey: verificationCode,
        contact: payload.value,
        isActive: false,
      });

      if (payload.mfaType === "email") {
        const userInstance = await this.userService.getUserById(payload.userId);
        const user = userInstance.get({ plain: true });
        await sendVerificationCode(user, verificationCode);
      }
      return { mfaToken };
    }

    throwError(500, "MFA type not handled properly");
  }

  public async verifyMFA(payload: verifyMFA) {
    const decoded: any = jwt.verify(payload.mfaToken, process.env.JWT_SECRET!);

    const userInstance = await this.userService.getUserById(decoded.data.id);
    if (!userInstance) throwError(404, "User not found");
    const user = userInstance.get({ plain: true });

    const mfaInstance = await MFA.findOne({
      where: {
        userId: user.id,
        mfaType: payload.mfaType,
      },
    });

    if (!mfaInstance) throwError(400, "MFA method not found");

    const mfaMethod = mfaInstance.get({ plain: true });
    const secretKey = mfaMethod.secretKey;

    if (payload.mfaType === "totp") {
      const verified = speakeasy.totp.verify({
        secret: secretKey!,
        encoding: "base32",
        token: payload.code,
        window: 1,
      });

      if (!verified) throwError(400, "Invalid TOTP code");

      if (!mfaMethod.isActive) {
        await mfaInstance.update({ isActive: true });
      }
    } else if (payload.mfaType === "email" || payload.mfaType === "sms") {
      let expectedCode: string | null;

      if (mfaMethod.isActive) {
        // During login, retrieve code from Redis
        expectedCode = await getCode(user.id, payload.mfaType);
      } else {
        // During MFA enabling, use secretKey from the database
        expectedCode = secretKey;
      }

      if (!expectedCode || payload.code !== expectedCode) {
        throwError(400, "Invalid verification code");
      }

      if (!mfaMethod.isActive) {
        await mfaInstance.update({ isActive: true });
      }
    } else {
      throwError(400, "Invalid MFA type");
    }

    delete user.password;

    const accessToken = signJsonWebToken(user, "15m");
    const refreshToken = signJsonWebToken(user, "7d");

    await Token.create({
      userId: user.id,
      token: refreshToken,
      type: "refresh",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      accessToken,
      refreshToken,
      user: user,
    };
  }
}

export default new MFAService(UserService);
