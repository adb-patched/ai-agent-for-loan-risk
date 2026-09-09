import assert from "node:assert/strict";
import test from "node:test";

import {
  hasRepeatedToolCalls,
  toolCallSignature,
} from "../build/src/agent/graph.js";

test("toolCallSignature includes both name and arguments", () => {
  assert.equal(
    toolCallSignature({ name: "get_credit_score", args: { customer_id: "Matt" } }),
    'get_credit_score:{"customer_id":"Matt"}',
  );
});

test("hasRepeatedToolCalls detects a repeated call with identical arguments", () => {
  assert.equal(
    hasRepeatedToolCalls([
      {
        tool_calls: [
          { name: "get_credit_score", args: { customer_id: "Matt" } },
        ],
      },
      {
        tool_calls: [
          { name: "get_credit_score", args: { customer_id: "Matt" } },
        ],
      },
    ]),
    true,
  );
});

test("hasRepeatedToolCalls permits new arguments and empty tool-call messages", () => {
  assert.equal(
    hasRepeatedToolCalls([
      {
        tool_calls: [
          { name: "get_credit_score", args: { customer_id: "Matt" } },
        ],
      },
      {
        tool_calls: [
          { name: "get_credit_score", args: { customer_id: "Hilda" } },
        ],
      },
    ]),
    false,
  );
  assert.equal(hasRepeatedToolCalls([{}]), false);
});
