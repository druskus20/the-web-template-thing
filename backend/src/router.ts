import { implement } from "@orpc/server";
import { contract } from "@dashboard/api";

const os = implement(contract);

export const hello = os.hello.handler(({ input, errors }) => {
  if (input.name == "woo") {
    throw errors.BAD_REQUEST({
      message: "This is a bad request error thrown for demonstration purposes.",
    });
  }

  if (input.name !== "yoo") {
    throw errors.INVALID_NAME({
      message: `Name '${input.name}' is not allowed. Only 'yoo' is accepted.`,
      data: { providedName: input.name },
    });
  }

  return {
    message: `Hello, ${input.name}!`,
  };
});

export const bye = os.bye.handler(() => {
  // Simulate authenticated user context (in real app, this would come from auth middleware)
  const mockUser = {
    id: "user_123",
    name: "Demo User",
    email: "demo@example.com",
    role: "user" as const,
    createdAt: "2023-01-15T10:30:00.000Z",
    isActive: true,
  };

  return {
    message: "Goodbye! Thanks for using our API.",
    user: mockUser,
    timestamp: new Date().toISOString(),
    sessionDuration: Math.floor(Math.random() * 3600) + 300, // Random session 5-65 minutes
  };
});

export const health = os.health.handler(() => {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
});

export const router = os.router({
  hello,
  bye,
  health,
});
