import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { once } from "node:events";

import { createWebApp } from "../build/src/http/app.js";

const withServer = async (app, callback) => {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
};

const silentLogger = {
  info() {},
  error() {},
};

test("GET / serves the application page", async () => {
  const app = createWebApp({
    publicDirectory: path.resolve("public"),
    runAgent: async () => [],
    logger: silentLogger,
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Loan Risk - AI Agent/);
  });
});

test("POST /callagent rejects an empty query", async () => {
  const app = createWebApp({
    publicDirectory: path.resolve("public"),
    runAgent: async () => [],
    logger: silentLogger,
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/callagent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: " " }),
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "A non-empty query is required.",
    });
  });
});

test("POST /callagent returns agent messages", async () => {
  const receivedQueries = [];
  const app = createWebApp({
    publicDirectory: path.resolve("public"),
    runAgent: async (query) => {
      receivedQueries.push(query);
      return [{ type: "ai", content: "685" }];
    },
    logger: silentLogger,
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/callagent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "  credit score for Matt  " }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ type: "ai", content: "685" }]);
    assert.deepEqual(receivedQueries, ["credit score for Matt"]);
  });
});

test("POST /callagent hides internal runner failures", async () => {
  const app = createWebApp({
    publicDirectory: path.resolve("public"),
    runAgent: async () => {
      throw new Error("provider secret or stack details");
    },
    logger: silentLogger,
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/callagent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "hello" }),
    });
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), {
      error: "Unable to complete agent request.",
    });
  });
});
