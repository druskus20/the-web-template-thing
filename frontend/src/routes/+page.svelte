<script lang="ts">
  import { orpc } from "$lib/api";
  import { safe, isDefinedError } from "@orpc/client";
  import { logger } from "$lib/logger";
  import { onMount, onDestroy } from "svelte";
  import type { FarewellResponseModel } from "@dashboard/api";

  let name = "";
  let helloResult = "";
  let byeResult: FarewellResponseModel | null = null;
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
      byeResult = result;
    } catch (error) {
      if (handleConnectionError(error)) {
        byeResult = null;
        return;
      }
      logger.error({ error }, "Bye request failed");
      errorMessage = "Failed to get bye message";
      byeResult = null;
    }
  }
</script>

<main>
  <h1>Dashboard</h1>

  <div>
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
      <div>
        <p><strong>Message:</strong> {byeResult.message}</p>
        <p><strong>Timestamp:</strong> {new Date(byeResult.timestamp).toLocaleString()}</p>
        {#if byeResult.sessionDuration}
          <p><strong>Session Duration:</strong> {Math.floor(byeResult.sessionDuration / 60)}m {byeResult.sessionDuration % 60}s</p>
        {/if}
        {#if byeResult.user}
          <div>
            <p><strong>User Info:</strong></p>
            <p>• ID: {byeResult.user.id}</p>
            <p>• Name: {byeResult.user.name}</p>
            <p>• Email: {byeResult.user.email}</p>
            <p>• Role: {byeResult.user.role}</p>
            <p>• Created: {new Date(byeResult.user.createdAt).toLocaleString()}</p>
            <p>• Active: {byeResult.user.isActive ? 'Yes' : 'No'}</p>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if errorMessage}
    <p>Error: {errorMessage}</p>
  {/if}
</main>
