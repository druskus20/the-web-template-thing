import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createSecureServer } from "node:http2";
import { readFileSync } from "node:fs";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodSmartCoercionPlugin, ZodToJsonSchemaConverter } from "@orpc/zod";
import { router } from "./router.js";
import { UserModel, FarewellResponseModel } from "@dashboard/api";
import { config, isDevelopment } from "./config.js";
import { logger } from "./logger.js";

// Log configuration
logger.info(
  { NODE_ENV: config.nodeEnv, DEBUG: config.debug },
  "Environment configuration",
);

if (isDevelopment) {
  const configVars = {
    NODE_ENV: config.nodeEnv,
    DEBUG: config.debug,
    BACKEND_PORT: config.server.port.toString(),
    BACKEND_HOST: config.server.host,
    CORS_ORIGIN: config.cors.origin,
  };

  logger.info({ variables: configVars }, "Development configuration variables");
}

const app = new Hono();

// Request logging middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const url = c.req.url;

  logger.info({ method, url }, "Request started");

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  logger.info({ method, url, status, duration }, "Request completed");
});

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin(config.cors)],
});

const openAPIHandler = new OpenAPIHandler(router, {
  plugins: [
    new CORSPlugin(config.cors),
    new ZodSmartCoercionPlugin(),
    new OpenAPIReferencePlugin({
      docsProvider: "scalar",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Dashboard API",
          version: "1.0.0",
          description:
            "A comprehensive API for the dashboard application providing endpoints for data management, user operations, and system configuration. This API follows REST principles and provides both RPC and OpenAPI interfaces for maximum compatibility.",
        },
        servers: [{ url: "/api" }],
        commonSchemas: {
          User: {
            schema: UserModel,
          },
          FarewellResponse: {
            schema: FarewellResponseModel,
          },
        },
      },
    }),
  ],
});

// Handle RPC endpoints
app.use("/rpc/*", async (c, next) => {
  const { matched, response } = await handler.handle(c.req.raw, {
    prefix: "/rpc",
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  return await next();
});

// Handle OpenAPI endpoints (includes Scalar docs and spec.json)
app.use("/*", async (c, next) => {
  const { matched, response } = await openAPIHandler.handle(c.req.raw, {
    prefix: "/",
    context: {},
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  return await next();
});

logger.info(
  {
    host: config.server.host === "0.0.0.0" ? "localhost" : config.server.host,
    port: config.server.port,
    ssl: config.ssl.enabled,
  },
  "Backend API server starting",
);

if (config.ssl.enabled) {
  serve({
    fetch: app.fetch,
    port: config.server.port,
    hostname: config.server.host,
    createServer: createSecureServer,
    serverOptions: {
      key: readFileSync(config.ssl.keyPath),
      cert: readFileSync(config.ssl.certPath),
    },
  });
} else {
  serve({
    fetch: app.fetch,
    port: config.server.port,
    hostname: config.server.host,
  });
}
