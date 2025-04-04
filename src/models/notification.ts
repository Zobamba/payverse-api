import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

class Notification extends Model {
  public id!: string;
  public userId!: string;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: "Notification", timestamps: true }
);

Notification.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Notification, { foreignKey: "userId" });

export default Notification;
