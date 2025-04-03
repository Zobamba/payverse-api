import app from "./app";
import sequelize from "./config/database";
import { env } from "./config/env.config";

const PORT = env.PORT || 5000;

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
