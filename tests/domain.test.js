import assert from "node:assert/strict";
import test from "node:test";

import {
  determineInterestRate,
  determineOverallRisk,
  getAccountStatus,
  getCreditScore,
} from "../build/src/domain/loan-risk.js";

test("known customers resolve by name, email, numeric id, and case", () => {
  assert.equal(getCreditScore("Loren"), 455);
  assert.equal(getCreditScore("matt@ibm.com"), 685);
  assert.equal(getCreditScore("2222"), 685);
  assert.equal(getAccountStatus("HILDA"), "delinquent");
  assert.equal(getAccountStatus("1111"), "good-standing");
});

test("unknown customer fallbacks can be made deterministic", () => {
  assert.equal(getCreditScore("unknown", () => 701), 701);
  assert.equal(getAccountStatus("unknown", () => 2), "closed");
});

test("default demo risk matrix covers score bands and account statuses", () => {
  const cases = [
    [800, "good-standing", "low"],
    [800, "closed", "medium"],
    [800, "delinquent", "medium"],
    [650, "good-standing", "medium"],
    [650, "closed", "high"],
    [650, "delinquent", "high"],
    [500, "good-standing", "high"],
    [500, "closed", "high"],
    [500, "delinquent", "high"],
  ];

  for (const [score, status, expectedRisk] of cases) {
    assert.equal(determineOverallRisk(score, status), expectedRisk);
  }
});

test("risk boundaries and unknown status behavior are explicit", () => {
  assert.equal(determineOverallRisk(750, "good-standing"), "low");
  assert.equal(determineOverallRisk(749, "good-standing"), "medium");
  assert.equal(determineOverallRisk(550, "closed"), "high");
  assert.equal(determineOverallRisk(549, "unknown"), "high");
  assert.equal(determineOverallRisk(700, "unknown"), "unable to determine");
});

test("default demo interest-rate mapping includes the conservative fallback", () => {
  assert.equal(determineInterestRate("low"), 3);
  assert.equal(determineInterestRate("Medium"), 5);
  assert.equal(determineInterestRate(" high "), 8);
  assert.equal(determineInterestRate("unable to determine"), 12);
});
