import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import TierLevel from "../tier-level/tier-level.model";
import Password from "../password/password.model";
class User extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public middleName?: string;
  public email!: string;
  public isVerified!: boolean;
  public currentTierId?: string;

  // Associations
  public passwords?: Password[];
  public currentTierLevel?: TierLevel;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    currentTierId: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);

// Associations
User.belongsTo(TierLevel, {
  foreignKey: "currentTierId",
  as: "currentTierLevel",
});
User.hasMany(Password, { foreignKey: "userId", as: "passwords" });

export default User;
