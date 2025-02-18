import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/database";

dotenv.config();
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("PayVerse API is running...");
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully!");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

startServer();
