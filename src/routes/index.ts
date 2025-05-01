import { Express } from "express";
import authRoutes from "../domains/auth/auth.routes";
import userRoutes from "../domains/user/user.routes";
import mfaRoutes from "../domains/mfa/mfa.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/mfa", mfaRoutes);
  app.use("/api/users", userRoutes);

  app.get("/", (req, res) => {
    res.send("PayVerse API is running...");
  });
};
