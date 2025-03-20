import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: Sequelize) {
    await queryInterface.createTable("VirtualCards", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "VirtualAccounts",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      cardNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      spendingLimit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      cardStatus: {
        type: DataTypes.STRING,
        defaultValue: "Active",
        allowNull: false,
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
    await queryInterface.dropTable("VirtualCards");
  },
};
