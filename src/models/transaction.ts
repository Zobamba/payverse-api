import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";
import User from "./user";
import VirtualAccount from "./virtualAccount";

class Transaction extends Model {
  public id!: string;
  public userId!: string;
  public accountId!: string;
  public amount!: number;
  public currency!: string;
  public type!:
    | "Deposit"
    | "Withdrawal"
    | "Transfer"
    | "Payment"
    | "Refund"
    | "Currency Conversion";
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
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "Deposit",
        "Withdrawal",
        "Transfer",
        "Payment",
        "Refund",
        "Currency Conversion"
      ),
      allowNull: false,
    },
  },
  { sequelize, modelName: "transaction", timestamps: true }
);

Transaction.belongsTo(User, { foreignKey: "userId" });
Transaction.belongsTo(VirtualAccount, { foreignKey: "accountId" });
User.hasMany(Transaction, { foreignKey: "userId" });
VirtualAccount.hasMany(Transaction, { foreignKey: "accountId" });

export default Transaction;
