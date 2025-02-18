import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";

class Tiering extends Model {
  public id!: string;
  public tierName!: "Silver" | "Gold" | "Platinum";
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
    tierName: {
      type: DataTypes.ENUM("Silver", "Gold", "Platinum"),
      allowNull: false,
      unique: true,
      defaultValue: "Silver",
    },
    transactionLimit: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    withdrawalLimit: { type: DataTypes.DECIMAL(15, 2), allowNull: true },
    perks: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "tiering", timestamps: true }
);

export default Tiering;
