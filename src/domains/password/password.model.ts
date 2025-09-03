import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import User from "../user/user.model";

class PasswordHistory extends Model {
  public id!: string;
  public userId!: string;
  public status!: "Active" | "Inactive";
  public password!: string;
}

PasswordHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "PasswordHistory", tableName: "PasswordHistories", timestamps: true }
);

PasswordHistory.belongsTo(User, { foreignKey: "userId" });
User.hasMany(PasswordHistory, { foreignKey: "userId" });

export default PasswordHistory;
