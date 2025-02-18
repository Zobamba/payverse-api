import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";
import User from "./user";

class Notification extends Model {
  public id!: string;
  public userId!: string;
  public type!: "SMS" | "Email";
  public message!: string;
  public isRead!: boolean;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: { type: DataTypes.UUID, allowNull: false },
    type: {
      type: DataTypes.ENUM("SMS", "Email"),
      allowNull: false,
      defaultValue: "Email",
    },
    message: { type: DataTypes.STRING, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: "notification", timestamps: true }
);

Notification.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Notification, { foreignKey: "userId" });

export default Notification;
