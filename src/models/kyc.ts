import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db-config/database";
import User from "./user";

class KYC extends Model {
  public id!: string;
  public userId!: string;
  public provider!: string;
  public submittedData!: object;
  public providerResponse!: object | null;
}

KYC.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    provider: { type: DataTypes.STRING, allowNull: false },
    submittedData: { type: DataTypes.JSONB, allowNull: false },
    providerResponse: { type: DataTypes.JSONB, allowNull: true },
  },
  { sequelize, modelName: "kyc", timestamps: true }
);

KYC.belongsTo(User, { foreignKey: "userId" });
User.hasOne(KYC, { foreignKey: "userId" });

export default KYC;
