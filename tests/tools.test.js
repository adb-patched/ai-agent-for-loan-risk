import assert from "node:assert/strict";
import test from "node:test";

import { createLoanRiskTools } from "../build/src/agent/tools.js";

const byName = (tools, name) => {
  const selected = tools.find((candidate) => candidate.name === name);
  assert.ok(selected, `Expected tool ${name}`);
  return selected;
};

test("base tools expose stable names and execute deterministic domain logic", async () => {
  const tools = createLoanRiskTools();
  assert.deepEqual(
    tools.map((candidate) => candidate.name),
    [
      "get_credit_score",
      "get_account_status",
      "get_overall_risk",
      "get_interest_rate",
    ],
  );

  assert.equal(
    await byName(tools, "get_credit_score").invoke({ customer_id: "Matt" }),
    685,
  );
  assert.equal(
    await byName(tools, "get_overall_risk").invoke({
      credit_score: 685,
      account_status: "closed",
    }),
    "high",
  );
});

test("RAG mode replaces decision tools but retains customer lookup tools", async () => {
  const calls = [];
  const tools = createLoanRiskTools({
    enableRag: true,
    ragClient: {
      async getOverallRisk(creditScore, accountStatus) {
        calls.push({ creditScore, accountStatus });
        return "RAG risk";
      },
      async getInterestRate(overallRisk) {
        calls.push({ overallRisk });
        return "RAG rate";
      },
    },
  });

  assert.deepEqual(
    tools.map((candidate) => candidate.name),
    [
      "get_credit_score",
      "get_account_status",
      "get_overall_risk_from_rag_llm",
      "get_interest_rate_from_rag_llm",
    ],
  );
  assert.equal(
    await byName(tools, "get_overall_risk_from_rag_llm").invoke({
      credit_score: 750,
      account_status: "closed",
    }),
    "RAG risk",
  );
  assert.deepEqual(calls, [{ creditScore: 750, accountStatus: "closed" }]);
});

test("RAG mode fails clearly without a RAG client", () => {
  assert.throws(
    () => createLoanRiskTools({ enableRag: true }),
    /RAG decision client is required/,
  );
});
