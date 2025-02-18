import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

class MFA extends Model {
  public id!: string;
  public userId!: string;
  public mfaType!: "Email" | "SMS" | "Authenticator";
  public secretKey!: string;
  public isActive!: boolean;
}

MFA.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    mfaType: {
      type: DataTypes.ENUM("Email", "SMS", "Authenticator"),
      allowNull: false,
    },
    secretKey: { type: DataTypes.TEXT, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "mfa", timestamps: true }
);

MFA.belongsTo(User, { foreignKey: "userId" });
User.hasMany(MFA, { foreignKey: "userId" });

export default MFA;
