import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { chunkPageText, retrieveTopChunks } from "../lib/rag.js";

describe("RAG Document Processing & Lexical Retrieval", () => {
  test("chunkPageText creates 900-char sliding windows with 150-char overlap", () => {
    // 1600 characters of text
    const text = "Word ".repeat(320); // 1600 chars
    const chunks = chunkPageText(text);

    assert.ok(chunks.length >= 2, "Expected multiple chunks for 1600 character text");
    assert.ok(chunks[0].length <= 900, "First chunk should not exceed 900 characters");
    
    // Check overlap: end of chunk 1 should match start of chunk 2
    const chunk1End = chunks[0].slice(-100);
    const chunk2Start = chunks[1].slice(0, 150);
    assert.ok(chunk2Start.includes(chunk1End.slice(0, 50)), "Chunks should share overlapping context");
  });

  test("chunkPageText handles empty or whitespace text cleanly", () => {
    assert.deepEqual(chunkPageText(""), []);
    assert.deepEqual(chunkPageText("   \n\t  "), []);
  });

  test("retrieveTopChunks returns empty array when query is empty or stopwords only", () => {
    const chunks = [
      { id: "c1", text: "Health insurance policy deductible is 500 dollars.", pageNumber: 1, documentTitle: "Policy" }
    ];
    assert.deepEqual(retrieveTopChunks("", chunks), []);
    assert.deepEqual(retrieveTopChunks("what is the", chunks), []);
  });

  test("retrieveTopChunks ranks the most relevant chunk first", () => {
    const chunks = [
      {
        id: "c1",
        userId: "user-1",
        documentId: "doc-1",
        documentTitle: "Vehicle Registration",
        pageNumber: 1,
        text: "Vehicle registration plate number DL01AB1234 expires in December 2026."
      },
      {
        id: "c2",
        userId: "user-1",
        documentId: "doc-2",
        documentTitle: "Health Insurance",
        pageNumber: 4,
        text: "Health insurance co-pay is twenty dollars for specialist visits and zero for general consultation."
      },
      {
        id: "c3",
        userId: "user-1",
        documentId: "doc-3",
        documentTitle: "Employment Agreement",
        pageNumber: 2,
        text: "Annual performance bonus and base salary compensation terms."
      }
    ];

    const results = retrieveTopChunks("What is the health insurance co-pay for specialist?", chunks, 2);
    assert.equal(results.length, 1);
    assert.equal(results[0].id, "c2");
    assert.equal(results[0].documentTitle, "Health Insurance");
  });

  test("retrieveTopChunks respects topK limit", () => {
    const chunks = Array.from({ length: 10 }, (_, i) => ({
      id: `c-${i}`,
      userId: "u1",
      documentTitle: `Document ${i}`,
      pageNumber: i + 1,
      text: `Important policy clause regarding term insurance coverage number ${i}.`
    }));

    const top3 = retrieveTopChunks("insurance policy coverage", chunks, 3);
    assert.equal(top3.length, 3);
  });
});
