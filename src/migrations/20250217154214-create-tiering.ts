import { QueryInterface, DataTypes } from "sequelize";

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable("Tierings", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      tierName: {
        type: DataTypes.ENUM("Silver", "Gold", "Platinum"),
        allowNull: false,
        unique: true,
        defaultValue: "Silver",
      },
      transactionLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      withdrawalLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },
      perks: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    await queryInterface.dropTable("Tierings");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Tierings_tierName";'
    );
  },
};
