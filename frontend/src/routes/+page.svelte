<script lang="ts">
  import { orpc } from "$lib/api";
  import { safe, isDefinedError } from "@orpc/client";
  import { logger } from "$lib/logger";
  import { onMount, onDestroy } from "svelte";

  let name = "";
  let helloResult = "";
  let byeResult = "";
  let errorMessage = "";
  let isBackendConnected = false;
  let healthCheckInterval: ReturnType<typeof setInterval>;

  function isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes("fetch");
  }

  function handleConnectionError(error: any) {
    if (isNetworkError(error)) {
      isBackendConnected = false;
      logger.error(
        "Backend connection failed - is the backend server running?",
      );
      errorMessage =
        "Cannot connect to backend server. Please make sure the backend is running on http://localhost:3001";
      return true;
    }
    return false;
  }

  async function checkBackendHealth() {
    try {
      await orpc.health();
      if (!isBackendConnected) {
        logger.info("Backend connection restored");
      }
      isBackendConnected = true;
    } catch (error) {
      if (isBackendConnected) {
        logger.error("Backend connection lost");
      }
      isBackendConnected = false;
    }
  }

  onMount(async () => {
    await checkBackendHealth();
    healthCheckInterval = setInterval(checkBackendHealth, 5000);
  });

  onDestroy(() => {
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
    }
  });

  async function handleHello() {
    logger.info({ name }, "Hello request started");
    const [error, data] = await safe(orpc.hello({ name }));

    if (isDefinedError(error)) {
      logger.error(
        { error: error.code, message: error.message },
        "Hello request failed with typed error",
      );
      if (error.code === "INVALID_NAME") {
        errorMessage = `${error.message} (provided: ${error.data.providedName})`;
      } else {
        errorMessage = error.message;
      }
      helloResult = "";
    } else if (error) {
      if (handleConnectionError(error)) {
        helloResult = "";
        return;
      }
      logger.error({ error }, "Hello request failed with unexpected error");
      errorMessage = "An unexpected error occurred";
      helloResult = "";
    } else {
      logger.info(
        { message: data.message },
        "Hello request completed successfully",
      );
      errorMessage = "";
      helloResult = data.message;
    }
  }

  async function handleBye() {
    try {
      logger.info("Bye request started");
      errorMessage = "";
      const result = await orpc.bye();
      logger.info(
        { message: result.message },
        "Bye request completed successfully",
      );
      byeResult = result.message;
    } catch (error) {
      if (handleConnectionError(error)) {
        byeResult = "";
        return;
      }
      logger.error({ error }, "Bye request failed");
      errorMessage = "Failed to get bye message";
      byeResult = "";
    }
  }
</script>

<main>
  <h1>Dashboard</h1>

  <div
    style="margin-bottom: 20px; padding: 8px 12px; border-radius: 4px; font-size: 14px; {isBackendConnected
      ? 'background-color: #d4edda; color: #155724;'
      : 'background-color: #f8d7da; color: #721c24;'}"
  >
    {isBackendConnected ? "✅ Backend Connected" : "❌ Backend Disconnected"}
  </div>

  <div>
    <h2>Hello Endpoint</h2>
    <input type="text" bind:value={name} placeholder="Enter your name" />
    <button on:click={handleHello}>Say Hello</button>

    {#if helloResult}
      <p>Success: {helloResult}</p>
    {/if}
  </div>

  <div>
    <h2>Bye Endpoint</h2>
    <button on:click={handleBye}>Say Bye</button>

    {#if byeResult}
      <p>Result: {byeResult}</p>
    {/if}
  </div>

  {#if errorMessage}
    <p style="color: red;">Error: {errorMessage}</p>
  {/if}
</main>
