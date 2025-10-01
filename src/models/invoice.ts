import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "../domains/user/user.model";

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
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
  },
  { sequelize, modelName: "Invoice", timestamps: true }
);

Invoice.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Invoice, { foreignKey: "userId" });

export default Invoice;
