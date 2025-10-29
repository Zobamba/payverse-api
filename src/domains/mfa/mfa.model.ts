import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import User from "../user/user.model";
import { MFAType, MFATypes } from "./mfa.interface";

class MFA extends Model {
  public id!: string;
  public userId!: string;
  public mfaType!: MFAType;
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
      type: DataTypes.ENUM(...MFATypes),
      allowNull: false,
    },
    secretKey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize, modelName: "MFAs", timestamps: true }
);

MFA.belongsTo(User, { foreignKey: "userId" });
User.hasMany(MFA, { foreignKey: "userId" });

export default MFA;
