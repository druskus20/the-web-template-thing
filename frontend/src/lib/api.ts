import type { ContractRouterClient } from "@orpc/contract";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { contract } from "@dashboard/api";
import { browser } from "$app/environment";
import { config } from "./config";

// Get API URL from config
const getApiUrl = () => {
  // In browser, check for runtime config first, then build-time config
  if (browser) {
    return (
      (window as any).__API_URL__ ||
      config.api.url
    );
  }
  // Server-side: use config
  return config.api.url;
};

const link = new RPCLink({
  url: `${getApiUrl()}/rpc`,
});

export const orpc: ContractRouterClient<typeof contract> =
  createORPCClient(link);
