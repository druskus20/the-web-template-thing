import { logger } from "$lib/logger";
import { config, isDevelopment } from "$lib/config";

// Log configuration on client startup
logger.info({ NODE_ENV: config.nodeEnv, DEBUG: config.debug }, "Environment configuration");

if (isDevelopment) {
  const configVars = {
    NODE_ENV: config.nodeEnv,
    DEBUG: config.debug,
    VITE_API_URL: config.api.url
  };

  logger.info({ variables: configVars }, "Development configuration variables");
}
