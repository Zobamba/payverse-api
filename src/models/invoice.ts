import { Model, DataTypes } from "sequelize";
import sequelize from "../src/config/db-config/database";
import User from "./user";

class Invoice extends Model {
  public id!: string;
  public userId!: string;
  public recipient!: string;
  public amount!: number;
  public currency!: string;
  public dueDate!: Date;
  public status!: "Paid" | "Pending" | "Overdue";
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    recipient: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Paid", "Pending", "Overdue"),
      defaultValue: "Pending",
    },
  },
  { sequelize, modelName: "invoice", timestamps: true }
);

Invoice.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Invoice, { foreignKey: "userId" });

export default Invoice;
