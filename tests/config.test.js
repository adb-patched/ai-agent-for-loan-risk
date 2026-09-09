import assert from "node:assert/strict";
import test from "node:test";

import { loadConfig } from "../build/src/config.js";

const baseEnvironment = () => ({
  AWS_BEARER_TOKEN_BEDROCK: "bedrock-test-token",
});

test("loadConfig applies safe local defaults", () => {
  const config = loadConfig(baseEnvironment());

  assert.equal(config.application.host, "127.0.0.1");
  assert.equal(config.application.port, 8080);
  assert.equal(config.bedrock.model, "us.openai.gpt-5.6-luna");
  assert.equal(
    config.bedrock.baseUrl,
    "https://bedrock-runtime.us-east-1.amazonaws.com/openai/v1",
  );
  assert.equal(config.rag.enabled, false);
  assert.equal(config.watsonxAssistant.enabled, false);
});

test("loadConfig requires the Bedrock API key", () => {
  assert.throws(() => loadConfig({}), /AWS_BEARER_TOKEN_BEDROCK is required/);
});

test("loadConfig validates the application port", () => {
  assert.throws(
    () =>
      loadConfig({
        ...baseEnvironment(),
        APPLICATION_PORT: "70000",
      }),
    /APPLICATION_PORT must be an integer between 1 and 65535/,
  );
});

test("loadConfig requires IBM RAG settings only when RAG is enabled", () => {
  assert.throws(
    () =>
      loadConfig({
        ...baseEnvironment(),
        ENABLE_RAG_LLM: "true",
      }),
    /WATSONX_AI_APIKEY is required/,
  );

  const config = loadConfig({
    ...baseEnvironment(),
    ENABLE_RAG_LLM: "TRUE",
    WATSONX_AI_APIKEY: "ibm-key",
    WATSONX_RISK_RAG_LLM_ENDPOINT: "https://example.test/rag",
  });
  assert.equal(config.rag.enabled, true);
  assert.equal(config.rag.apiKey, "ibm-key");
});

test("loadConfig validates watsonx Assistant settings when enabled", () => {
  assert.throws(
    () =>
      loadConfig({
        ...baseEnvironment(),
        ENABLE_WXASST: "true",
      }),
    /WXASST_INTEGRATION_ID is required/,
  );
});
