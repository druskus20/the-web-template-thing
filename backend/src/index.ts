import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { router } from "./router.js";
import { config } from "dotenv";
import { logger } from "./logger.js";

config();

// Log environment variables
const nodeEnv = process.env["NODE_ENV"] || "development";
const debug = process.env["DEBUG"] || "false";

logger.info({ NODE_ENV: nodeEnv, DEBUG: debug }, "Environment configuration");

if (nodeEnv === "development") {
  const envVars = Object.keys(process.env)
    .filter(
      (key) =>
        !key.includes("PASSWORD") &&
        !key.includes("SECRET") &&
        !key.includes("TOKEN"),
    )
    .reduce(
      (obj, key) => {
        obj[key] = process.env[key];
        return obj;
      },
      {} as Record<string, string | undefined>,
    );

  logger.info({ variables: envVars }, "Development environment variables");
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
  plugins: [
    new CORSPlugin({
      origin: process.env["CORS_ORIGIN"] || "*",
      allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
      allowHeaders: ["Content-Type", "Authorization"],
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

const port = parseInt(process.env["BACKEND_PORT"] || "3001", 10);
const host = process.env["BACKEND_HOST"] || "0.0.0.0";

logger.info(
  { host: host === "0.0.0.0" ? "localhost" : host, port },
  "Backend API server starting",
);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
