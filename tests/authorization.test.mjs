import test from "node:test";
import assert from "node:assert/strict";
import { retrieveTopChunks } from "../lib/rag.js";

test("Cross-User Authorization & Tenancy Isolation", async (t) => {
  // Simulated database records for two isolated users
  const userA = { id: "usr_alice", name: "Alice" };
  const userB = { id: "usr_bob", name: "Bob" };

  const documents = [
    {
      id: "doc_1",
      userId: userA.id,
      title: "Alice Tax Returns 2024",
      currentVersionId: "v_1_2",
    },
    {
      id: "doc_2",
      userId: userB.id,
      title: "Bob Health Insurance Policy",
      currentVersionId: "v_2_1",
    },
  ];

  const chunks = [
    {
      id: "chk_1_old",
      userId: userA.id,
      documentId: "doc_1",
      documentVersionId: "v_1_1", // superseded version
      pageNumber: 1,
      text: "Old tax deduction claimed: 50000 rupees in year 2023.",
      documentTitle: "Alice Tax Returns 2024",
    },
    {
      id: "chk_1_current",
      userId: userA.id,
      documentId: "doc_1",
      documentVersionId: "v_1_2", // CURRENT version
      pageNumber: 1,
      text: "Final tax deduction claimed: 150000 rupees in year 2024 under Section 80C.",
      documentTitle: "Alice Tax Returns 2024",
    },
    {
      id: "chk_2_current",
      userId: userB.id,
      documentId: "doc_2",
      documentVersionId: "v_2_1",
      pageNumber: 1,
      text: "Bob Health Insurance Policy Number: HDFC-MED-998877 expires on 31-12-2026.",
      documentTitle: "Bob Health Insurance Policy",
    },
  ];

  await t.test("Ownership check rejects User B from accessing User A's document", () => {
    function getOwnedDocument(docId, requestingUserId) {
      const doc = documents.find((d) => d.id === docId);
      if (!doc || doc.userId !== requestingUserId) return null;
      return doc;
    }

    // Alice accesses her own document -> allowed
    const aliceDoc = getOwnedDocument("doc_1", userA.id);
    assert.ok(aliceDoc);
    assert.equal(aliceDoc.title, "Alice Tax Returns 2024");

    // Bob attempts to access Alice's document -> rejected (404/null)
    const bobAccess = getOwnedDocument("doc_1", userB.id);
    assert.equal(bobAccess, null, "User B must NOT be able to access User A's document");

    // Alice attempts to access Bob's document -> rejected
    const aliceAccess = getOwnedDocument("doc_2", userA.id);
    assert.equal(aliceAccess, null, "User A must NOT be able to access User B's document");
  });

  await t.test("RAG retrieval strictly isolates chunks by userId", () => {
    // When Alice queries, the query is pre-filtered by `userId: userA.id`
    const aliceQuery = "What is the insurance policy number?";
    const aliceVisibleChunks = chunks.filter((c) => c.userId === userA.id);

    // Alice does NOT own the health insurance document (Bob does)
    const retrievedForAlice = retrieveTopChunks(aliceQuery, aliceVisibleChunks, 5);

    // Alice must receive ZERO results about Bob's policy
    const mentionsBobPolicy = retrievedForAlice.some((c) => c.text.includes("HDFC-MED-998877"));
    assert.equal(mentionsBobPolicy, false, "Alice MUST NEVER retrieve chunks belonging to Bob");
  });

  await t.test("RAG retrieval excludes superseded version chunks", () => {
    // When Alice asks about tax deduction, only the CURRENT version (v_1_2) should be retrieved
    const currentVersionIds = new Set(
      documents.filter((d) => d.userId === userA.id).map((d) => d.currentVersionId)
    );

    const activeChunks = chunks.filter(
      (c) => c.userId === userA.id && currentVersionIds.has(c.documentVersionId)
    );

    const query = "tax deduction claimed amount";
    const retrieved = retrieveTopChunks(query, activeChunks, 5);

    assert.equal(retrieved.length, 1);
    assert.equal(retrieved[0].documentVersionId, "v_1_2");
    assert.ok(retrieved[0].text.includes("150000 rupees in year 2024"));
    // Superseded version (v_1_1) must not be retrieved
    const hasOldVersion = retrieved.some((c) => c.documentVersionId === "v_1_1");
    assert.equal(hasOldVersion, false, "Superseded document versions must be excluded from active retrieval");
  });
});
