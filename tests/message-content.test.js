import assert from "node:assert/strict";
import test from "node:test";

import { messageContentToText } from "../build/src/agent/message-content.js";

test("messageContentToText preserves plain string content", () => {
  assert.equal(messageContentToText("plain answer"), "plain answer");
});

test("messageContentToText extracts Responses API text blocks", () => {
  assert.equal(
    messageContentToText([
      { type: "text", text: "Matt's credit score is 685." },
      { type: "other", value: "ignored" },
      { type: "text", text: "Second paragraph." },
    ]),
    "Matt's credit score is 685.\nSecond paragraph.",
  );
});

test("messageContentToText returns an empty string for tool-call-only content", () => {
  assert.equal(messageContentToText([]), "");
  assert.equal(messageContentToText({ type: "tool_call" }), "");
  assert.equal(messageContentToText(null), "");
});
