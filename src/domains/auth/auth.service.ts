import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { getCode } from "../../utils/code";
import { verifyMFA } from "./auth.interface";
import User from "../user/user.model";
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
import MFA from "../mfa/mfa.model";
import TokenService from "../token/token.service";
import PasswordService from "../password/password.service";
import sequelize from "../../config/database";

class AuthService {
  constructor(
    private readonly passwordService: typeof PasswordService,
    private readonly tokenService: typeof TokenService
  ) {}

  public async register({ password, ...payload }: RegisterUser): Promise<User> {
    const dbTransaction = await sequelize.transaction();

    try {
      const existingUser = await User.findOne({
        where: { email: payload.email },
      });

      if (existingUser) {
        throwError(400, "User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userInstance = await User.create({
        ...payload,
        password: hashedPassword,
      });

      const user = userInstance.toJSON();
      delete user.password;

      await this.passwordService.createPassword(
        user.id,
        hashedPassword,
        dbTransaction
      );

      const token = signJsonWebToken({ id: user.id });

      await dbTransaction.commit();
      await sendVerificationEmail(user, token);

      return user;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  public async verifyEmail(req: any): Promise<void> {
    const user = await User.findByPk(req.user.id);
    if (!user) throwError(400, "Invalid token");

    if (user.isVerified) return;

    user.set({ isVerified: true });
    await user.save();
  }

  public async login(payload: Login): Promise<{
    mfaToken: string;
    mfaOptions: string[];
  }> {
    const userInstance = await User.findOne({
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

    const user = userInstance.toJSON();

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

    const userInstance = await User.findByPk(decoded.data.id);
    if (!userInstance) {
      throwError(404, "User not found");
    }

    const user = userInstance.toJSON();
    delete user.password;

    const mfaInstance = await MFA.findOne({
      where: {
        userId: user.id,
        mfaType: payload.mfaType,
      },
    });

    if (!mfaInstance) throwError(400, "MFA method not found");

    const mfaMethod = mfaInstance.toJSON();
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

    await this.tokenService.createToken({
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

    const user = userInstance.toJSON();

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

    await this.passwordService.updatePassword(userId, hashedPassword);
  }

  public async changePassword(payload: ChangePassword): Promise<void> {
    const userId = payload.userId;
    const userInstance = await User.findByPk(userId);
    const getUserActivePassword =
      await this.passwordService.getActivePassword(userId);

    if (!getUserActivePassword) {
      throwError(404, "User active password not found");
    }

    if (!userInstance) throwError(404, "User not found");

    const currentPassword = getUserActivePassword.password;

    // const user = userInstance.get({ plain: true });

    const isMatch = await bcrypt.compare(
      payload.currentPassword,
      currentPassword
    );

    if (!isMatch) throwError(401, "Current password is incorrect");

    const isSameAsCurrent = await bcrypt.compare(
      payload.newPassword,
      currentPassword
    );

    if (isSameAsCurrent) {
      throwError(400, "You cannot reuse your current password");
    }

    const passwordHistory = await this.passwordService.getPasswords(userId);

    const isReusedPassword = passwordHistory.some(async (record) => {
      return await bcrypt.compare(payload.newPassword, record.password);
    });

    if (isReusedPassword) {
      throwError(400, "You cannot reuse a recent password");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
    await this.passwordService.updatePassword(userId, hashedPassword);
  }

  public async refreshAccessToken(refreshToken: string) {
    if (!refreshToken) {
      throwError(400, "Refresh token is required");
    }

    // Find the refresh token in the database
    const existingToken = await this.tokenService.findByToken(refreshToken);

    if (!existingToken) {
      throwError(401, "Invalid refresh token");
    }

    const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET!);

    const user = await User.findByPk(decoded.data.id);
    if (!user) {
      throwError(404, "User not found");
    }

    const plainUser = user.toJSON();

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

export default new AuthService(PasswordService, TokenService);
