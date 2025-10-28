import type { ContractRouterClient } from "@orpc/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { contract } from "@dashboard/api";
import { browser } from "$app/environment";

// Get API URL from environment variables or default to localhost:3001 (backend port)
const getApiUrl = () => {
  // In browser, check for runtime config first, then build-time config
  if (browser) {
    return (
      (window as any).__API_URL__ ||
      import.meta.env.VITE_API_URL ||
      "http://localhost:3001"
    );
  }
  // Server-side: use build-time config
  return import.meta.env.VITE_API_URL || "http://localhost:3001";
};

const link = new RPCLink({
  url: `${getApiUrl()}/rpc`,
});

export const orpc: ContractRouterClient<typeof contract> =
  createORPCClient(link);
