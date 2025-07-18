import winston from "winston";
import { env } from "../config/env.config";

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ""
  }`;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(colorize(), timestamp(), logFormat),
  }),
];

if (env.ENVIRONMENT === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
    })
  );
}

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports,
});

export default logger;
