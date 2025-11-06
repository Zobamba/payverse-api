import Password from "./password.model";
import { Transaction } from "sequelize";
import bcrypt from "bcryptjs";

const PASSWORD_HISTORY_LIMIT = 3;

class PasswordService {
  public async createPassword(
    userId: string,
    hashedPassword: string,
    transaction?: Transaction
  ) {
    return await Password.create(
      {
        userId,
        password: hashedPassword,
      },
      { transaction }
    );
  }

  public async getPasswords(userId: string) {
    const history = await Password.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: PASSWORD_HISTORY_LIMIT,
      raw: true,
    });

    return history;
  }

  public async updatePassword(userId: string, hashedPassword: string) {
    await Password.update(
      { status: "Inactive" },
      {
        where: {
          userId,
          status: "Active",
        },
      }
    );

    await this.createPassword(userId, hashedPassword);
  }

  public async getActivePassword(userId: string) {
    const password = await Password.findOne({
      where: { userId, status: "Active" },
    });
    return password.toJSON();
  }

  public async isPasswordReused(
    userId: string,
    newPassword: string
  ): Promise<boolean> {
    const passwordHistory = await this.getPasswords(userId);

    const validPasswordHistory = passwordHistory.filter(
      (record) =>
        record && record.password && typeof record.password === "string"
    );

    if (validPasswordHistory.length === 0) {
      return false;
    }

    const passwordChecks = await Promise.all(
      validPasswordHistory.map(async (record) => {
        return await bcrypt.compare(newPassword, record.password);
      })
    );

    return passwordChecks.some(Boolean);
  }
}

export default new PasswordService();
