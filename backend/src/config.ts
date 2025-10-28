import { config as loadEnv } from "dotenv";

loadEnv();

export const config = {
  nodeEnv: process.env["NODE_ENV"] || "development",
  debug: process.env["DEBUG"] || "false",
  server: {
    port: parseInt(process.env["BACKEND_PORT"] || "3001", 10),
    host: process.env["BACKEND_HOST"] || "0.0.0.0",
  },
  cors: {
    origin: process.env["CORS_ORIGIN"] || "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  },
} as const;

export const isDevelopment = config.nodeEnv === "development";
export const isProduction = config.nodeEnv === "production";