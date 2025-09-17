import { CreateUserTierData } from "./user-tier.interface";
import TierLevel from "../../tier-level/tier-level.model";
import UserTier from "./user-tier.model";

class UserTierService {
  public async createUserTier(data: CreateUserTierData, transaction?: any) {
    return UserTier.create({ ...data }, transaction);
  }
  public async mostRecentTier(userId: string): Promise<UserTier | null> {
    return UserTier.findOne({
      where: { userId },
      include: [{ model: TierLevel, as: "tier" }],
      order: [["assignedAt", "DESC"]],
    });
  }
}

export default new UserTierService();
