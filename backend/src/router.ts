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
  return {
    message: "Goodbye!",
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
