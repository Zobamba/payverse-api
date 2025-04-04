import express from "express";
import dotenv from "dotenv";
import userRoutes from "../src/user/user.routes";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("PayVerse API is running...");
});

export default app;
    