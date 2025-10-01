import express, { Response } from "express";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/v1";
import errorHandler from "./helpers/error-handler";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

registerRoutes(app);

app.use((_req, res: Response) => {
  res.status(404).json({
    message: "Route not found",
    success: false,
    errors: null,
  });
});

app.use(errorHandler);

export default app;
