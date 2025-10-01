import User from "./user.model";
import { throwError } from "../../helpers/throw-error";

class UserService {
  public async getProfile(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    delete user?.dataValues.password;

    if (!user) {
      throwError(404, "User not found");
    }
    return user;
  }

  public async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    delete user?.dataValues.password;

    if (!user) {
      throwError(404, "User not found");
    }
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await User.findAll();
    users.forEach((user) => delete user.dataValues.password);

    if (!users || users.length === 0) {
      throwError(404, "No users found");
    }
    return users;
  }

  public async updateProfile(
    userId: string,
    payload: Partial<User>
  ): Promise<User> {
    const user = await User.findByPk(userId);
    delete user?.dataValues.password;

    if (!user) {
      throwError(404, "User not found");
    }

    await user.update(payload);
    return user;
  }

  public async deleteAccount(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) throwError(404, "User not found");

    await user.destroy();
  }
}

export default new UserService();
