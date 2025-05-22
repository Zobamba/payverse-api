import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

const kycIdentifier = ['bvn'] as const;
export type KYCIdentifier = typeof kycIdentifier[number];

const providers = ['dojah', 'prembly'] as const;
export type KYCProvider = typeof providers[number];

interface SubmittedData {
  identifierType: KYCIdentifier;
  identifierValue: string;
  frontImage?: string;
  backImage?: string;
  image: string;
}

class KYC extends Model {
  public id!: string;
  public userId!: string;
  public provider!: KYCProvider;
  public submittedData!: SubmittedData;
  public providerResponse!: object | null;
  public kycIdentifier!: KYCIdentifier;
}

//todo: setup composite  index on the identifierType and identifierValue
// todo: setup index on userId

KYC.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    provider: { type: DataTypes.ENUM(...providers), allowNull: false },
    submittedData: { type: DataTypes.JSONB, allowNull: false },
    providerResponse: { type: DataTypes.JSONB, allowNull: true },
    kycIdentifier: { type: DataTypes.ENUM(...kycIdentifier), allowNull: false },
  },
  { sequelize, modelName: "KYCs", timestamps: true }
);

KYC.belongsTo(User, { foreignKey: "userId" });
User.hasOne(KYC, { foreignKey: "userId" });

export default KYC;
