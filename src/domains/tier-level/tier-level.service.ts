import TierLevel from "./tier-level.model";

class TierLevelService {
  public async getTierLevel(
    level: number,
    transaction?: any
  ): Promise<TierLevel | null> {
    return TierLevel.findOne({
      where: { level },
      transaction,
    });
  }
}

export default new TierLevelService();
