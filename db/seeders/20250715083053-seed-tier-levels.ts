import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export default {
  async up(queryInterface: QueryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("TierLevels", [
      {
        id: uuidv4(),
        level: 1,
        name: "Silver",
        perks:
          "Send and receive funds. Limited withdrawal and transaction limits.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        level: 2,
        name: "Gold",
        perks: "Higher limits. Priority support. Verified address required.",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: uuidv4(),
        level: 3,
        name: "Platinum",
        perks:
          "Full access. Highest limits. Designed for power users and businesses.",
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("TierLevels", {
      name: ["Silver", "Gold", "Platinum"],
    });
  },
};
