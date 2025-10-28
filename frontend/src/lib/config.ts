import { dev } from "$app/environment";

export const config = {
  nodeEnv: dev ? "development" : "production",
  debug: import.meta.env.VITE_DEBUG || "false",
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:3001",
  },
} as const;

export const isDevelopment = config.nodeEnv === "development";
export const isProduction = config.nodeEnv === "production";