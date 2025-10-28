import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { readFileSync } from "fs";

const sslEnabled = process.env.SSL_ENABLED === "true";
const keyPath = process.env.SSL_KEY_PATH || "localhost-privkey.pem";
const certPath = process.env.SSL_CERT_PATH || "localhost-cert.pem";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    https: sslEnabled ? {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    } : undefined,
    proxy: {
      "/api": sslEnabled ? "https://localhost:3001" : "http://localhost:3001",
    },
  },
});
