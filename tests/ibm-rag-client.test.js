import assert from "node:assert/strict";
import test from "node:test";

import { IbmRagClient } from "../build/src/integrations/ibm-rag-client.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

test("IbmRagClient authenticates, sends prompts, and reuses a valid token", async () => {
  const requests = [];
  const fetchMock = async (input, init) => {
    const url = input.toString();
    requests.push({ url, init });

    if (url.endsWith("/token")) {
      return jsonResponse({
        access_token: "cached-token",
        expiration: Math.floor(Date.now() / 1000) + 3600,
      });
    }
    return jsonResponse({
      choices: [{ message: { content: "policy answer" } }],
    });
  };

  const client = new IbmRagClient(
    {
      apiKey: "ibm-api-key",
      endpoint: "https://example.test/rag",
      iamTokenEndpoint: "https://example.test/token",
    },
    fetchMock,
  );

  assert.equal(
    await client.getOverallRisk(685, "closed"),
    "policy answer",
  );
  assert.equal(await client.getInterestRate("high"), "policy answer");

  assert.equal(
    requests.filter((request) => request.url.endsWith("/token")).length,
    1,
  );
  assert.equal(
    requests.filter((request) => request.url.endsWith("/rag")).length,
    2,
  );
  assert.equal(
    requests[1].init?.headers.Authorization,
    "Bearer cached-token",
  );
  assert.match(
    String(requests[1].init?.body),
    /credit score 685 and account status closed/,
  );
});

test("IbmRagClient rejects malformed decision responses", async () => {
  const fetchMock = async (input) =>
    input.toString().endsWith("/token")
      ? jsonResponse({
          access_token: "token",
          expiration: Math.floor(Date.now() / 1000) + 3600,
        })
      : jsonResponse({ choices: [] });

  const client = new IbmRagClient(
    {
      apiKey: "ibm-api-key",
      endpoint: "https://example.test/rag",
      iamTokenEndpoint: "https://example.test/token",
    },
    fetchMock,
  );

  await assert.rejects(
    () => client.getInterestRate("medium"),
    /did not contain message text/,
  );
});
