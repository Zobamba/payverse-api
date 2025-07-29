import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";
import TierLevel from "./tier-level";

class UserTier extends Model {
  public id!: string;
  public userId!: string;
  public tierId!: string;
  public assignedAt!: Date;
  public reasonForChange?: string;
  public tier!: TierLevel;
}

UserTier.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    tierId: { type: DataTypes.UUID, allowNull: false },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    reasonForChange: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "UserTier", timestamps: true }
);

UserTier.belongsTo(User, { foreignKey: "userId" });
UserTier.belongsTo(TierLevel, { foreignKey: "tierId", as: "tier" });

User.hasMany(UserTier, { foreignKey: "userId" });
TierLevel.hasMany(UserTier, { foreignKey: "tierId", as: "userTiers" });

export default UserTier;
