import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";

class TierLevel extends Model {
  public id!: string;
  public level!: number;
  public name!: string;
  public perks!: string | null;
}

TierLevel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    perks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  { sequelize, modelName: "TierLevel", timestamps: true }
);

export default TierLevel;
