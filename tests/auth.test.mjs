import { test, describe } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("Authentication & Token Cryptography", () => {
  const TEST_SECRET = "super-secret-test-jwt-key-minimum-32-chars-long";

  test("bcrypt hashes password and verifies valid matches", async () => {
    const rawPassword = "StrongPassword123!";
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.ok(hash.startsWith("$2"), "Hash should follow bcrypt format");
    const valid = await bcrypt.compare(rawPassword, hash);
    assert.equal(valid, true, "Valid password should verify successfully");

    const invalid = await bcrypt.compare("WrongPassword", hash);
    assert.equal(invalid, false, "Wrong password must be rejected");
  });

  test("jsonwebtoken signs and verifies session payload", () => {
    const userId = "test-user-uuid-1234";
    const token = jwt.sign({ sub: userId }, TEST_SECRET, { expiresIn: "1h" });

    const decoded = jwt.verify(token, TEST_SECRET);
    assert.equal(decoded.sub, userId);
  });

  test("expired or tampered tokens are rejected", () => {
    const token = jwt.sign({ sub: "user-1" }, TEST_SECRET, { expiresIn: "-1s" });
    assert.throws(() => {
      jwt.verify(token, TEST_SECRET);
    }, /jwt expired/);

    const tampered = token.slice(0, -5) + "abcde";
    assert.throws(() => {
      jwt.verify(tampered, TEST_SECRET);
    });
  });
});
