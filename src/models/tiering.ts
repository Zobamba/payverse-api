import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class Tiering extends Model {
  public id!: string;
  public tierLevel!: number;
  public tierName!: string;
  public transactionLimit!: number | null;
  public withdrawalLimit!: number | null;
  public perks!: string | null;
}

Tiering.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tierLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    tierName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    perks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { sequelize, modelName: "Tiering", timestamps: true }
);

export default Tiering;
