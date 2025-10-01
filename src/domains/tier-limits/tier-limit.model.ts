import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import TierLevel from "../tier-level/tier-level.model";

class TierLimit extends Model {
  public id!: string;
  public tierId!: string;
  public currency!: "NGN" | "USD" | "EUR" | "GBP";
  public transactionLimit!: number;
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
        model: "TierLevels",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    currency: {
      type: DataTypes.ENUM("NGN", "USD", "EUR", "GBP"),
      allowNull: false,
    },
    transactionLimit: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.0,
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
      comment: "Monthly withdrawal limit (not applicable to deposits)",
    },
  },
  { sequelize, modelName: "TierLimit", timestamps: true }
);

TierLimit.belongsTo(TierLevel, { foreignKey: "tierId" });
TierLevel.hasMany(TierLimit, { foreignKey: "tierId" });

export default TierLimit;
