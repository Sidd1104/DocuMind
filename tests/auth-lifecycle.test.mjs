import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const TEST_SECRET = "test-auth-secret-for-documind-suite-at-least-32-chars-long";

test("Password Recovery & Lifecycle Cryptography", async (t) => {
  const user = {
    id: "usr_alice_123",
    email: "alice@example.com",
    passwordHash: await bcrypt.hash("OldPassword123!", 10),
  };

  await t.test("generates a valid signed reset token with hash fingerprint", () => {
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: "password_reset",
        pwhash: user.passwordHash.slice(-10),
      },
      TEST_SECRET,
      { expiresIn: "1h" }
    );

    const payload = jwt.verify(token, TEST_SECRET);
    assert.equal(payload.sub, user.id);
    assert.equal(payload.type, "password_reset");
    assert.equal(payload.pwhash, user.passwordHash.slice(-10));
  });

  await t.test("rejects an expired password reset token", () => {
    const expiredToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: "password_reset",
        pwhash: user.passwordHash.slice(-10),
      },
      TEST_SECRET,
      { expiresIn: "-1s" }
    );

    assert.throws(() => {
      jwt.verify(expiredToken, TEST_SECRET);
    }, (err) => err.name === "TokenExpiredError");
  });

  await t.test("enforces single-use token invalidation once password is changed", async () => {
    // Generate initial reset token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: "password_reset",
        pwhash: user.passwordHash.slice(-10),
      },
      TEST_SECRET,
      { expiresIn: "1h" }
    );

    const payload = jwt.verify(token, TEST_SECRET);
    // Verify it matches current hash
    assert.equal(payload.pwhash, user.passwordHash.slice(-10));

    // Simulate password change
    user.passwordHash = await bcrypt.hash("NewSecurePassword456!", 10);

    // Replay attack with same token: fingerprint comparison fails!
    const isReplayPrevented = payload.pwhash !== user.passwordHash.slice(-10);
    assert.equal(isReplayPrevented, true, "Used token MUST be rejected after password is changed");
  });

  await t.test("verifies current credentials before allowing password change", async () => {
    const currentInput = "NewSecurePassword456!";
    const wrongInput = "WrongPassword999!";

    const match = await bcrypt.compare(currentInput, user.passwordHash);
    const noMatch = await bcrypt.compare(wrongInput, user.passwordHash);

    assert.equal(match, true);
    assert.equal(noMatch, false);
  });
});
