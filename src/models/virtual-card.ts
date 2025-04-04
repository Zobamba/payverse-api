import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import VirtualAccount from "./virtual-account";

class VirtualCard extends Model {
  public id!: string;
  public accountId!: string;
  public cardNumber!: string;
  public expirationDate!: Date;
  public spendingLimit!: number;
  public cardStatus!: "Active" | "Suspended" | "Closed";
}

VirtualCard.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    cardNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    spendingLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    cardStatus: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
  },
  { sequelize, modelName: "VirtualCard", timestamps: true }
);

VirtualCard.belongsTo(VirtualAccount, { foreignKey: "accountId" });
VirtualAccount.hasMany(VirtualCard, { foreignKey: "accountId" });

export default VirtualCard;
