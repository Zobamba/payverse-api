import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class BeneficiaryAccount extends Model {
  public id!: string;
  public bankName!: string;
  public bankCode!: string;
  public accountNumber!: string;
  public accountName!: string;
}

BeneficiaryAccount.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "beneficiaryAccount", timestamps: true }
);

export default BeneficiaryAccount;
