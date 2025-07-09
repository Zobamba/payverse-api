import express from "express";
import premblyWebhookController from "./prembly.webhook.controller";

const router = express.Router();

/**
 *@post /api/prembly/webhook
 *@description Process Prembly webhook events
 *@returns success message
 */

router.post(
  "/webhook",
  express.json(),
  premblyWebhookController.processWebhook
);

export default router;
