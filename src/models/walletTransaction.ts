import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";
import VirtualAccount from "./virtualAccount";

class Transaction extends Model {
  public id!: string;
  public userId!: string;
  public accountId!: string;
  public amount!: number;
  public balanceBefore!: number;
  public balanceAfter!: number;
  public currency!: string;
  public type!: "debit" | "credit";
  public description!:
    | "Deposit"
    | "Withdrawal"
    | "Transfer"
    | "Payment"
    | "Refund"
    | "Currency Conversion"
    | "Card funding";
  public meta?: object;
}

Transaction.init(
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
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  { sequelize, modelName: "walletTransaction", timestamps: true }
);

Transaction.belongsTo(User, { foreignKey: "userId" });
Transaction.belongsTo(VirtualAccount, { foreignKey: "accountId" });
User.hasMany(Transaction, { foreignKey: "userId" });
VirtualAccount.hasMany(Transaction, { foreignKey: "accountId" });

export default Transaction;
