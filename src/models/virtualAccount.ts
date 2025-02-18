import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";
import User from "./user";

class VirtualAccount extends Model {
  public id!: string;
  public userId!: string;
  public currency!: string;
  public balance!: number;
  public accountStatus!: "Active" | "Suspended" | "Closed";
}

VirtualAccount.init(
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
      defaultValue: 0,
    },
    accountStatus: {
      type: DataTypes.ENUM("Active", "Suspended", "Closed"),
      defaultValue: "Active",
    },
  },
  { sequelize, modelName: "virtualAccount", timestamps: true }
);

VirtualAccount.belongsTo(User, { foreignKey: "userId" });
User.hasMany(VirtualAccount, { foreignKey: "userId" });

export default VirtualAccount;
