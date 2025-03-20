import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

class VirtualAccount extends Model {
  public id!: string;
  public userId!: string;
  public accountNumber: string;
  public currency!: string;
  public provider?: string;
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
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountStatus: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
  },
  { sequelize, modelName: "virtualAccount", timestamps: true }
);

VirtualAccount.belongsTo(User, { foreignKey: "userId" });
User.hasMany(VirtualAccount, { foreignKey: "userId" });

export default VirtualAccount;
