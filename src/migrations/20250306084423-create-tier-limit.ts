import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("TierLimits", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      tierId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Tierings",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dailyLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      monthlyLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'This only tracks withdrawal and has nothing to do with deposit',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("TierLimits");
  },
};
