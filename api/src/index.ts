export { contract, UserModel, FarewellResponseModel } from "./contract.js";
export type {
  InferContractRouterInputs,
  InferContractRouterOutputs,
} from "@orpc/contract";

// Export inferred types for easier consumption
import type { z } from "zod";
import { FarewellResponseModel } from "./contract.js";
export type FarewellResponse = z.infer<typeof FarewellResponseModel>;
