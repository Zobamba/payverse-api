import User from "../../models/user";
import { throwError } from "../../helpers/throw-error";

class UserService {
  public async getProfile(userId: string): Promise<User> {
    const user = await User.scope("withoutPassword").findByPk(userId);
    if (!user) throwError(404, "User not found");
    return user;
  }
  

  public async getUserById(userId: string): Promise<User> {
    const user = await User.scope("withoutPassword").findByPk(userId);
    if (!user) throwError(404, "User not found");
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    const users = await User.scope("withoutPassword").findAll();
    if (!users || users.length === 0) throwError(404, "No users found");
    return users;
  }

  public async updateProfile(
    userId: string,
    payload: Partial<User>
  ): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) throwError(404, "User not found");

    await user.update(payload);
    return user;
  }

  public async deleteAccount(userId: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) throwError(404, "User not found");

    await user.destroy();
  }

  // tierOneVerification
  // check if user tier is zero, that means they can do kyc
  // if they are on their tier one, they have already done kyc
  // check bvn_list, if (identity_type, identity_value, count), if count is greater than three

  // compare and contrast, we will now 
}

export default new UserService();
