import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { getCode } from "../../utils/code";
import { verifyMFA } from "./auth.interface";
import User from "../../models/user";
import {
  ChangePassword,
  RegisterUser,
  Login,
  ResetPassword,
} from "./auth.interface";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from "../../utils/email";
import { handleEmailMFA } from "../../helpers/handle-email-mfa";
import { signJsonWebToken, parseExpiry } from "../../utils/auth";
import { throwError } from "../../helpers/throw-error";
import MFA from "../../models/mfa";
import Token from "../../models/token";
import PasswordService from "../password/password.service";
import TierLevel from "../../models/tier-level";
import UserTier from "../../models/user-tier";

class AuthService {
  constructor(private readonly passwordService: typeof PasswordService) {}

  public async register(payload: RegisterUser): Promise<User> {
    const existingUser = await User.findOne({
      where: { email: payload.email },
    });
    if (existingUser) throwError(400, "User already exists");

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const userInstance = await User.create({
      ...payload,
      password: hashedPassword,
    });

    const user = userInstance.get({ plain: true });

    await this.passwordService.createPasswordHistory(user.id, hashedPassword);

    const token = signJsonWebToken({ id: user.id });
    await sendVerificationEmail(user, token);

    return user;
  }

  public async verifyEmail(req: any): Promise<void> {
    const user = await User.findByPk(req.user.id);
    if (!user) throwError(400, "Invalid token");

    if (user.isVerified) return;

    user.set({ isVerified: true });
    await user.save();

    // Assign default tier now that the user is verified
    const tierInstance = await TierLevel.findOne({ where: { level: 0 } });
    const starterTier = tierInstance?.get({ plain: true });
    const plainUser = user.get({ plain: true });

    if (!starterTier) {
      throwError(500, "Default tier (Tier 0) not found");
    }

    await UserTier.create({
      userId: plainUser.id,
      tierId: starterTier.id,
      assignedAt: new Date(),
      reasonForChange: "Email verified",
    });
  }

  public async login(payload: Login): Promise<{
    mfaToken: string;
    mfaOptions: string[];
  }> {
    const userInstance = await User.scope("withPassword").findOne({
      where: { email: payload.email },
    });

    if (!userInstance) {
      throwError(400, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      payload.password,
      userInstance.get("password")
    );

    if (!isMatch) {
      throwError(400, "Invalid email or password");
    }

    const user = userInstance.get({ plain: true });

    if (!user.isVerified) {
      throwError(400, "Please verify your email before logging in");
    }

    let userMFAs = await MFA.findAll({
      where: { userId: user.id, isActive: true },
      attributes: ["mfaType"],
    });

    let sentEmailCode = false;

    if (userMFAs.length === 0) {
      const defaultMfaType = "email";

      await handleEmailMFA(user); // ✅ await is required

      await MFA.create({
        userId: user.id,
        mfaType: defaultMfaType,
        isActive: true,
      });

      sentEmailCode = true;

      userMFAs = await MFA.findAll({
        where: { userId: user.id, isActive: true },
        attributes: ["mfaType"],
      });
    }

    const mfaToken = signJsonWebToken(
      { id: user.id },
      process.env.JWT_ACCESS_TOKEN_EXPIRY
    );

    const mfaOptions = userMFAs.map((mfa) => mfa.get("mfaType"));

    if (!sentEmailCode && mfaOptions.includes("email")) {
      await handleEmailMFA(user); // ✅ await again
    }

    return {
      mfaToken,
      mfaOptions,
    };
  }

  public async verifyMFA(payload: verifyMFA) {
    const decoded: any = jwt.verify(payload.mfaToken, process.env.JWT_SECRET!);

    const userInstance = await User.scope("withoutPassword").findByPk(
      decoded.data.id
    );
    if (!userInstance) {
      throwError(404, "User not found");
    }
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

      console.log("code", secretKey);
      console.log("Verified TOTP:", verified);

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

    const accessToken = signJsonWebToken(
      { id: user.id },
      process.env.JWT_ACCESS_TOKEN_EXPIRY
    );
    const refreshToken = signJsonWebToken(
      { id: user.id },
      process.env.JWT_REFRESH_TOKEN_EXPIRY
    );

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

  public async forgotPassword(email: string): Promise<void> {
    const userInstance = await User.findOne({ where: { email } });
    if (!userInstance) throwError(404, "User not found");

    const user = userInstance.get({ plain: true });

    const token = signJsonWebToken({ id: user.id });
    await sendResetPasswordEmail(user, token);
  }

  public async resetPassword(payload: ResetPassword): Promise<void> {
    const decoded: any = jwt.verify(payload.token, process.env.JWT_SECRET);
    const userId = decoded.data.id;

    const userInstance = await User.findByPk(userId);
    if (!userInstance) throwError(400, "Invalid token");

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    userInstance.set({ password: hashedPassword });
    await userInstance.save();

    await this.passwordService.updatePasswordHistory(userId, hashedPassword);
  }

  public async changePassword(payload: ChangePassword): Promise<void> {
    const userId = payload.userId;
    const userInstance = await User.scope("withPassword").findByPk(userId);
    if (!userInstance) throwError(404, "User not found");

    // const user = userInstance.get({ plain: true });

    const isMatch = await bcrypt.compare(
      payload.currentPassword,
      userInstance.get("password")
    );
    if (!isMatch) throwError(401, "Current password is incorrect");

    const isSameAsCurrent = await bcrypt.compare(
      payload.newPassword,
      userInstance.get("password")
    );

    if (isSameAsCurrent)
      throwError(400, "You cannot reuse your current password");

    const history = await this.passwordService.getPasswordHistory(userId);

    for (const record of history) {
      const reused = await bcrypt.compare(payload.newPassword, record.password);
      if (reused) throwError(400, "You cannot reuse a recent password");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    userInstance.set({ password: hashedPassword });
    await userInstance.save();

    await this.passwordService.updatePasswordHistory(userId, hashedPassword);
  }

  public async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throwError(400, "Refresh token is required");
    }

    // Find the refresh token in the database
    const existingToken = await Token.findOne({
      where: { token: refreshToken },
    });

    if (!existingToken) {
      throwError(401, "Invalid refresh token");
    }

    const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    const user = await User.scope("withoutPassword").findByPk(decoded.data.id);
    if (!user) {
      throwError(404, "User not found");
    }

    const plainUser = user.get({ plain: true });

    // Issue new tokens
    const newAccessToken = signJsonWebToken(
      { id: plainUser.id, type: "access" },
      process.env.JWT_ACCESS_TOKEN_EXPIRY
    );
    const newRefreshToken = signJsonWebToken(
      { id: plainUser.id, type: "refresh" },
      process.env.JWT_REFRESH_TOKEN_EXPIRY
    );

    await existingToken.update({
      token: newRefreshToken,
      expiresAt: new Date(
        Date.now() + parseExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRY)
      ),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: plainUser,
    };
  }
}

export default new AuthService(PasswordService);
