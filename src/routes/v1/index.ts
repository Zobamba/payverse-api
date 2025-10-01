import { Express } from "express";
import authRoutes from "../../domains/auth/auth.routes";
import userRoutes from "../../domains/user/user.routes";
import mfaRoutes from "../../domains/mfa/mfa.routes";
import kycRoutes from "../../domains/kyc/kyc.routes";
import premblyWebhookRoutes from "../../domains/webhooks/prembly/prembly.webhook.routes";

export const registerRoutes = (app: Express) => {
  const apiV1 = "/api/v1";

  app.use(`${apiV1}/auth`, authRoutes);
  app.use(`${apiV1}/mfa`, mfaRoutes);
  app.use(`${apiV1}/users`, userRoutes);
  app.use(`${apiV1}/kyc`, kycRoutes);
  app.use(`${apiV1}/prembly`, premblyWebhookRoutes);

  app.get("/", (req, res) => {
    res.send("PayVerse API is running...");
  });
};
