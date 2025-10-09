import User from "./user.model";
import { throwError } from "../../helpers/throw-error";

class UserService {
  public async getProfile(userId: string): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throwError(404, "User not found");
    }
    return user;
  }

  public async getUserById(userId: string): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throwError(404, "User not found");
    }
    return user.toJSON() as User;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await User.findAll();

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
