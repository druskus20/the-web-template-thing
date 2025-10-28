import pino from "pino";

const isDevelopment = process.env["NODE_ENV"] === "development";

export const logger = pino({
  level: process.env["LOG_LEVEL"] || "info",
});
