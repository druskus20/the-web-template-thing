import { dev } from "$app/environment";
import { logger } from "$lib/logger";

// Log environment variables on client startup
const nodeEnv = dev ? "development" : "production";
const debug = import.meta.env.VITE_DEBUG || "false";

logger.info({ NODE_ENV: nodeEnv, DEBUG: debug }, "Environment configuration");

if (dev) {
  const envVars = Object.keys(import.meta.env)
    .filter(
      (key) =>
        !key.includes("PASSWORD") &&
        !key.includes("SECRET") &&
        !key.includes("TOKEN"),
    )
    .reduce(
      (obj, key) => {
        obj[key] = import.meta.env[key];
        return obj;
      },
      {} as Record<string, string | undefined>,
    );

  logger.info({ variables: envVars }, "Development environment variables");
}
