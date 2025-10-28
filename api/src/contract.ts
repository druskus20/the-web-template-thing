import { oc } from "@orpc/contract";
import { z } from "zod";

export const helloContract = oc
  .route({ method: "POST", path: "/hello" })
  .input(
    z.object({
      name: z.string(),
    }),
  )
  .output(
    z.object({
      message: z.string(),
    }),
  )
  .errors({
    INVALID_NAME: {
      message: 'Only "pedro" is allowed as a name',
      data: z.object({
        providedName: z.string(),
      }),
    },
    BAD_REQUEST: {
      message: "Bad request",
    },
  });

export const byeContract = oc
  .route({ method: "POST", path: "/bye" })
  .input(z.void())
  .output(
    z.object({
      message: z.string(),
    }),
  );

export const healthContract = oc
  .route({ method: "GET", path: "/health" })
  .input(z.void())
  .output(
    z.object({
      status: z.string(),
      timestamp: z.string(),
    }),
  );

export const contract = oc.router({
  hello: helloContract,
  bye: byeContract,
  health: healthContract,
});
