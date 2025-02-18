import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";
import User from "./user";
import Tiering from "./tiering";

class UserTier extends Model {
  public id!: string;
  public userId!: string;
  public tierId!: string;
  public assignedAt!: Date;
  public reasonForChange?: string;
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
  { sequelize, modelName: "userTier", timestamps: true }
);

UserTier.belongsTo(User, { foreignKey: "userId" });
UserTier.belongsTo(Tiering, { foreignKey: "tierId" });

User.hasMany(UserTier, { foreignKey: "userId" });
Tiering.hasMany(UserTier, { foreignKey: "tierId" });

export default UserTier;
