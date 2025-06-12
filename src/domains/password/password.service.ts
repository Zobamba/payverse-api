import PasswordHistory from "../../models/password-history";

const PASSWORD_HISTORY_LIMIT = 3;

class PasswordService {
  public async createPasswordHistory(userId: string, hashedPassword: string) {
    return await PasswordHistory.create({
      userId,
      password: hashedPassword,
    });
  }

  public async getPasswordHistory(userId: string) {
    const history = await PasswordHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: PASSWORD_HISTORY_LIMIT,
      raw: true,
    });

    return history;
  }

  public async updatePasswordHistory(userId: string, hashedPassword: string) {
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
}

export default new PasswordService();
