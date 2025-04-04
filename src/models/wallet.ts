import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

class Wallet extends Model {
  public id!: string;
  public userId!: string;
  public currency!: string;
  public balance!: number;
  public walletStatus!: "Active" | "Frozen" | "Closed";
  public transactionLimit?: number;
}

Wallet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.0,
    },
    walletStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Active",
    },
    transactionLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
  },
  { sequelize, modelName: "Wallet", timestamps: true }
);

Wallet.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Wallet, { foreignKey: "userId" });

export default Wallet;
