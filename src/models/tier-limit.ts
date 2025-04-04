import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import Tiering from "./tiering";

class TierLimit extends Model {
  public id!: string;
  public tierId!: string;
  public currency!: "NGN" | "USD" | "EUR" | "GBP";
  public dailyLimit!: number;
  public monthlyLimit!: number;
}

TierLimit.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
      defaultValue: 0.00,
    },
    monthlyLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
  },
  { sequelize, modelName: "TierLimit", timestamps: true }
);

TierLimit.belongsTo(Tiering, { foreignKey: "tierId" });
Tiering.hasMany(TierLimit, { foreignKey: "tierId" });

export default TierLimit;
