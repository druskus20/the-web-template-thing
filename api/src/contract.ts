import { oc } from "@orpc/contract";
import { z } from "zod";

// Data Models
export const UserModel = z.object({
  id: z.string().describe("Unique user identifier"),
  name: z.string().describe("User's display name"),
  email: z.string().email().describe("User's email address"),
  role: z.enum(["admin", "user", "guest"]).describe("User's role in the system"),
  createdAt: z.string().datetime().describe("ISO 8601 timestamp when user was created"),
  isActive: z.boolean().describe("Whether the user account is active"),
}).describe("User model representing a system user");

export const FarewellResponseModel = z.object({
  message: z.string().describe("The farewell message"),
  user: UserModel.optional().describe("User information if authenticated"),
  timestamp: z.string().datetime().describe("When the farewell was generated"),
  sessionDuration: z.number().optional().describe("Duration of user session in seconds"),
}).describe("Farewell response containing goodbye message and optional user context");

export const helloContract = oc
  .route({
    method: "POST",
    path: "/hello",
    summary: "Say Hello",
    description: "Greets a user by name. This endpoint accepts a name and returns a personalized greeting message. Only the name 'yoo' is accepted - any other name will result in an INVALID_NAME error. The name 'woo' specifically triggers a BAD_REQUEST error for demonstration purposes.",
    tags: ["Greetings"]
  })
  .input(
    z.object({
      name: z.string().describe("The name to greet"),
    }).describe("Hello request with name parameter")
  )
  .output(
    z.object({
      message: z.string().describe("The greeting message"),
    }).describe("Hello response with greeting message")
  )
  .errors({
    INVALID_NAME: {
      message: 'Only "yoo" is allowed as a name',
      data: z.object({
        providedName: z.string(),
      }),
    },
    BAD_REQUEST: {
      message: "Bad request",
    },
  });

export const byeContract = oc
  .route({
    method: "POST",
    path: "/bye",
    summary: "Say Goodbye",
    description: "Returns a farewell message with optional user context. This endpoint demonstrates the use of complex data models and shows how authenticated users receive personalized farewell messages with session information.",
    tags: ["Greetings"]
  })
  .input(z.void())
  .output(FarewellResponseModel);

export const healthContract = oc
  .route({
    method: "GET",
    path: "/health",
    summary: "Health Check",
    description: "Performs a health check on the API service. This endpoint is commonly used by monitoring systems, load balancers, and orchestrators to verify that the service is running and responsive. It returns the current status and a timestamp of when the check was performed.",
    tags: ["System"]
  })
  .input(z.any())
  .output(
    z.object({
      status: z.string().describe("The health status of the service (typically 'ok')"),
      timestamp: z.string().describe("ISO 8601 timestamp of when the health check was performed"),
    }).describe("Health check response with status and timestamp")
  );

export const contract = oc.router({
  hello: helloContract,
  bye: byeContract,
  health: healthContract,
});
