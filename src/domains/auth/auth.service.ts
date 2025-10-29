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
      include: [
        {
          association: "passwords",
          where: { status: "Active" },
          required: false,
        },
      ],
      raw: false,
      nest: true,
    });

    if (!userInstance) {
      throwError(400, "Invalid email or password");
    }

    // Get the raw data to access passwords association
    const userData = userInstance.get({ plain: true });

    if (!userData.passwords || userData.passwords.length === 0) {
      throwError(400, "Invalid email or password");
    }

    const activePassword = userData.passwords[0].password;

    if (!activePassword) {
      throwError(400, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(payload.password, activePassword);

    if (!isMatch) {
      throwError(400, "Invalid email or password");
    }

    if (!userData.isVerified) {
      throwError(400, "Please verify your email before logging in");
    }

    let userMFAs = await MFA.findAll({
      where: { userId: userData.id, isActive: true },
      attributes: ["mfaType"],
      raw: true,
    });

    if (userMFAs.length === 0) {
      await handleEmailMFA(userData);
    }

    const mfaToken = signJsonWebToken(
      { id: userData.id, type: "mfa", isEmail: userMFAs.length == 0 },
      process.env.JWT_ACCESS_TOKEN_EXPIRY
    );

    const mfaOptions = userMFAs.map((mfa) => mfa.mfaType);

    return {
      mfaToken,
      mfaOptions,
    };
  }

  private async verifyEmailMFA(userId: string, code: string) {
    const expectedCode = await getCode(userId, "email");

    if (!expectedCode || code !== expectedCode) {
      throwError(400, "Invalid verification code");
    }
  }

  private async verifyTotpMFA(userId: string, code: string, mfaType: string) {
    const mfaMethod = await MFA.findOne({
      where: {
        userId,
        mfaType,
      },
    });

    if (!mfaMethod) throwError(400, "MFA method not found");

    const secretKey = mfaMethod.secretKey;

    const verified = speakeasy.totp.verify({
      secret: secretKey!,
      encoding: "base32",
      token: code,
      window: 1,
    });

    if (!verified) throwError(400, "Invalid TOTP code");

    if (!mfaMethod.isActive) {
      await mfaMethod.update({ isActive: true });
    }
  }

  public async verifyMFA(payload: verifyMFA) {
    const decoded: any = jwt.verify(payload.mfaToken, process.env.JWT_SECRET!);

    const userInstance = await User.findByPk(decoded.data.id);
    if (!userInstance) {
      throwError(404, "User not found");
    }

    const user = userInstance.toJSON();
    delete user.password;

    if (decoded.data.isEmail) {
      await this.verifyEmailMFA(user.id, payload.code);
    } else if (payload.mfaType === "totp") {
      await this.verifyTotpMFA(user.id, payload.code, payload.mfaType);
    } else {
      throwError(400, "Invalid MFA type");
    }

    const { accessToken, refreshToken } =
      await this.tokenService.generateTokens(user.id);

    return {
      accessToken,
      refreshToken,
      user,
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

    if (!userInstance) throwError(404, "User not found");

    const getUserActivePassword =
      await this.passwordService.getActivePassword(userId);

    if (!getUserActivePassword) {
      throwError(404, "User active password not found");
    }

    const currentPassword = getUserActivePassword.password;

    // Add safety check for currentPassword
    if (!currentPassword) {
      throwError(404, "Current password not found");
    }

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

    // Add safety checks for password history
    const validPasswordHistory = passwordHistory.filter(
      (record) =>
        record && record.password && typeof record.password === "string"
    );

    if (validPasswordHistory.length > 0) {
      const passwordChecks = await Promise.all(
        validPasswordHistory.map(async (record) => {
          return await bcrypt.compare(payload.newPassword, record.password);
        })
      );

      const isReusedPassword = passwordChecks.some(Boolean);

      if (isReusedPassword) {
        throwError(400, "You cannot reuse a recent password");
      }
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

    // Generate new tokens using TokenService
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.tokenService.generateTokens(plainUser.id);

    // Update the existing token record
    await existingToken.update({
      token: newRefreshToken,
      expiresAt: new Date(
        Date.now() + parseExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRY!)
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
