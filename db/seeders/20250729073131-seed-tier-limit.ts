import { QueryInterface, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: QueryInterface) {
    const tiers = await queryInterface.sequelize.query(
      `SELECT id, name FROM "TierLevels";`,
      { type: QueryTypes.SELECT }
    );

    const tierMap = (tiers as any[]).reduce(
      (acc, tier) => {
        acc[tier.name] = tier.id;
        return acc;
      },
      {} as Record<string, string>
    );

    const now = new Date();

    const limits = {
      NGN: {
        Silver: { transaction: 20000, daily: 100000, monthly: 500000 },
        Gold: { transaction: 50000, daily: 250000, monthly: 1000000 },
        Platinum: { transaction: 100000, daily: 500000, monthly: 5000000 },
      },
      USD: {
        Silver: { transaction: 5000, daily: 25000, monthly: 100000 },
        Gold: { transaction: 10000, daily: 20000, monthly: 1000000 },
        Platinum: { transaction: 100000, daily: 500000, monthly: 5000000 },
      },
      EUR: {
        Silver: { transaction: 4500, daily: 22500, monthly: 90000 },
        Gold: { transaction: 9000, daily: 18000, monthly: 900000 },
        Platinum: { transaction: 90000, daily: 450000, monthly: 4500000 },
      },
      GBP: {
        Silver: { transaction: 4000, daily: 20000, monthly: 80000 },
        Gold: { transaction: 8000, daily: 16000, monthly: 800000 },
        Platinum: { transaction: 80000, daily: 400000, monthly: 4000000 },
      },
    };

    const records = Object.entries(limits).flatMap(([currency, tiers]) =>
      Object.entries(tiers).map(([tierName, limit]) => ({
        id: uuidv4(),
        tierId: tierMap[tierName],
        currency,
        transactionLimit: limit.transaction,
        dailyLimit: limit.daily,
        monthlyLimit: limit.monthly,
        createdAt: now,
        updatedAt: now,
      }))
    );

    await queryInterface.bulkInsert("TierLimits", records);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("TierLimits", {
      currency: ["NGN", "USD", "EUR", "GBP"],
    });
  },
};
