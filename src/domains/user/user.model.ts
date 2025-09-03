import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class User extends Model {
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public middleName?: string;
  public email!: string;
  public password!: string;
  public isVerified!: boolean;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] }, // default = without password
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
      withoutPassword: {
        attributes: { exclude: ["password"] },
      },
    },
  }
);

export default User;
