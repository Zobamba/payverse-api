import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: QueryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("Tierings", [
      {
        id: uuidv4(),
        tierLevel: 0,
        tierName: "Starter",
        perks: "Basic access. Complete KYC to unlock more features.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        tierLevel: 1,
        tierName: "Silver",
        perks: "Send and receive funds. Limited withdrawal and transaction limits.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        tierLevel: 2,
        tierName: "Gold",
        perks: "Higher limits. Priority support. Verified address required.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        tierLevel: 3,
        tierName: "Platinum",
        perks: "Full access. Highest limits. Designed for power users and businesses.",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Tierings", {
      tierName: ["Starter", "Silver", "Gold", "Platinum"],
    });
  },
};
