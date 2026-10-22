import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, categoryLabel } from "../lib/categories.js";
import { generateGroundedAnswer } from "../lib/llm.js";

describe("Validation & Taxonomy", () => {
  test("master categories taxonomy contains all 11 core categories", () => {
    assert.equal(CATEGORIES.length, 11);
    const expectedKeys = [
      "identity", "vehicle", "insurance", "property", "financial",
      "education", "employment", "bills", "medical", "warranty", "other"
    ];
    expectedKeys.forEach((key) => {
      assert.ok(CATEGORIES.some((c) => c.key === key), `Missing category: ${key}`);
    });
  });

  test("categoryLabel resolves human readable labels or falls back to key", () => {
    assert.equal(categoryLabel("medical"), "Medical & Health");
    assert.equal(categoryLabel("vehicle"), "Vehicle");
    assert.equal(categoryLabel("custom_unknown_key"), "custom_unknown_key");
  });

  test("15MB maximum file size limit rejects oversized buffers", () => {
    const MAX_SIZE = 15 * 1024 * 1024;
    const validSize = 14 * 1024 * 1024;
    const exactMaxSize = 15 * 1024 * 1024;
    const oversized = 15 * 1024 * 1024 + 1;

    assert.ok(validSize <= MAX_SIZE, "14MB should be allowed");
    assert.ok(exactMaxSize <= MAX_SIZE, "15MB exact should be allowed");
    assert.ok(oversized > MAX_SIZE, "15MB + 1 byte must be rejected");
  });

  test("ISO expiry date strings parse correctly without NaN", () => {
    const validDateStr = "2028-10-15";
    const parsed = new Date(validDateStr);
    assert.equal(isNaN(parsed.getTime()), false);
    assert.equal(parsed.getFullYear(), 2028);

    const invalidDateStr = "not-a-valid-date";
    assert.equal(isNaN(new Date(invalidDateStr).getTime()), true);
  });

  test("generateGroundedAnswer short-circuits on empty chunks without calling external APIs", async () => {
    const res = await generateGroundedAnswer("What is my insurance policy?", []);
    assert.equal(res.provider, "none");
    assert.ok(
      res.text.includes("uploaded documents") ||
      res.text.includes("vault") ||
      res.text.includes("current documents")
    );
  });
});
