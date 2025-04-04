import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sequelize from "sequelize";
import User from "../models/user";
import PasswordHistory from "../models/passwordHistory";
import {
  ChangePassword,
  CreateUser,
  Login,
  ResetPassword,
} from "./user.interface";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email";
import { signJsonWebToken } from "../utils/auth";
import { throwError } from "../helpers/throw-error";

const { Op } = sequelize;
const PASSWORD_HISTORY_LIMIT = 3;

class UserService {
  public async createUser(payload: CreateUser): Promise<User> {
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
  ): Promise<{ user: Record<string, any>; token: string }> {
    const userInstance = await User.findOne({
      where: { email: payload.email },
    });

    if (!userInstance) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(
      payload.password,
      userInstance.get("password")
    );
    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const user = userInstance.get({ plain: true });
    if (!user.isVerified) {
      throwError(400, "Please verify your email before logging in");
    }

    const token = signJsonWebToken(user);

    delete user.password;
    return { user, token };
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

  public async changePassword(
    req: any,
    payload: ChangePassword
  ): Promise<void> {
    const userId = req.user.id;
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
}

export default new UserService();
