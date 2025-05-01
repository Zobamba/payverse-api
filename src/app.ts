import express from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

export default app;
