import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "sequelize";
import User from "../../models/user";
import PasswordHistory from "../../models/password-history";
import {
  ChangePassword,
  RegisterUser,
  Login,
  ResetPassword,
} from "./auth.interface";
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendVerificationCode,
} from "../../utils/email";
import { signJsonWebToken } from "../../utils/auth";
import { throwError } from "../../helpers/throw-error";
import MFA from "../../models/mfa";
import Token from "../../models/token";
import { generateVerificationCode } from "../../utils/code";
import { storeCode } from "../../utils/code";

const { Op } = sequelize;
const PASSWORD_HISTORY_LIMIT = 3;

class AuthService {
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

    await PasswordHistory.create({
      userId: user.id,
      password: hashedPassword,
    });

    const token = signJsonWebToken({ id: user.id });
    await sendVerificationEmail(user, token);

    delete user.password;
    return user;
  }

  public async verifyEmail(req: any): Promise<void> {
    const user = await User.findByPk(req.user.id);
    if (!user) throwError(400, "Invalid token");

    user.set({ isVerified: true });
    await user.save();
  }

  public async login(
    payload: Login
  ): Promise<
    | { message: string; user: Record<string, any>; token: string }
    | { message: string; mfaToken: string; mfaOptions: string[] }
  > {
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

    const user = userInstance.get({ plain: true });

    if (!user.isVerified) {
      throwError(400, "Please verify your email before logging in");
    }

    // Check if user has active MFA
    const userMFAs = await MFA.findAll({
      where: { userId: user.id, isActive: true },
      attributes: ["mfaType"],
    });

    if (userMFAs.length === 0) {
      const token = signJsonWebToken({ id: user.id, type: 'access' }, "6h"); // change to short-lived token

      delete user.password;
      return { message: "Login successful", user, token };
    }

    const mfaToken = signJsonWebToken({ id: user.id }, "10m"); // short-lived mfa token
    const mfaOptions = userMFAs.map((mfa) => mfa.get("mfaType"));

    // Handle Email MFA
    if (mfaOptions.includes("email")) {
      const verificationCode = generateVerificationCode();
      await sendVerificationCode(user, verificationCode);
      await storeCode(user.id, "email", verificationCode, 10);
    }

    return {
      message: "Please check your email to verify your MFA",
      mfaToken,
      mfaOptions,
    };
  }

  public async forgotPassword(email: string): Promise<void> {
    const userInstance = await User.findOne({ where: { email } });
    if (!userInstance) throwError(404, "User not found");

    const user = userInstance.get({ plain: true });

    const token = signJsonWebToken({ id: user.id });
    await sendResetPasswordEmail(user, token);
  }

  private async updatePasswordHistory(userId: string, hashedPassword: string) {
    await PasswordHistory.update(
      { status: "Inactive" },
      {
        where: {
          userId,
          status: "Active",
        },
      }
    );

    await PasswordHistory.create({
      userId,
      password: hashedPassword,
    });
  }

  private async deleteOldPasswords(userId: string): Promise<void> {
    const historyToDelete = await PasswordHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      offset: PASSWORD_HISTORY_LIMIT,
      limit: 100,
    });

    if (historyToDelete.length > 0) {
      const idsToDelete = historyToDelete.map((record) => record.get("id"));
      await PasswordHistory.destroy({
        where: { id: { [Op.in]: idsToDelete } },
      });
    }
  }

  public async resetPassword(payload: ResetPassword): Promise<void> {
    const decoded: any = jwt.verify(payload.token, process.env.JWT_SECRET);
    const userId = decoded.data.id;

    const userInstance = await User.findByPk(userId);
    if (!userInstance) throwError(400, "Invalid token");

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    userInstance.set({ password: hashedPassword });
    await userInstance.save();

    await this.updatePasswordHistory(userId, hashedPassword);
    await this.deleteOldPasswords(userId);
  }

  public async changePassword(payload: ChangePassword): Promise<void> {
    const userId = payload.userId;
    const userInstance = await User.findByPk(userId);
    if (!userInstance) throwError(404, "User not found");

    const isMatch = await bcrypt.compare(
      payload.currentPassword,
      userInstance.get("password")
    );
    if (!isMatch) throwError(401, "Old password is incorrect");

    const isSameAsCurrent = await bcrypt.compare(
      payload.newPassword,
      userInstance.get("password")
    );

    if (isSameAsCurrent)
      throwError(400, "You cannot reuse your current password");

    const history = await PasswordHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: PASSWORD_HISTORY_LIMIT,
      raw: true,
    });

    for (const record of history) {
      const reused = await bcrypt.compare(payload.newPassword, record.password);
      if (reused) throwError(400, "You cannot reuse a recent password");
    }

    const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

    userInstance.set({ password: hashedPassword });
    await userInstance.save();

    await this.updatePasswordHistory(userId, hashedPassword);
    await this.deleteOldPasswords(userId);
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

    const user = await User.findByPk(decoded.data.id);
    if (!user) {
      throwError(404, "User not found");
    }

    const plainUser = user.get({ plain: true });
    delete plainUser.password;

    // Issue new tokens
    const newAccessToken = signJsonWebToken(plainUser, "15m");
    const newRefreshToken = signJsonWebToken(plainUser, "7d");

    await existingToken.update({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: plainUser,
    };
  }
}

export default new AuthService();
