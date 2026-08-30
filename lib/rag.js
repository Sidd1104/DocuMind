import pdfParse from "pdf-parse/lib/pdf-parse.js";

const CHUNK_SIZE = 900; // characters
const CHUNK_OVERLAP = 150;

// Extracts text page-by-page from a PDF buffer.
// We keep page numbers because "which page is this on" is core to the product's
// trust story (every answer should be able to point at a page).
export async function extractPages(buffer) {
  const pages = [];
  await pdfParse(buffer, {
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const text = textContent.items.map((i) => i.str).join(" ");
      pages.push(text);
      return text;
    },
  });
  return pages;
}

// Splits one page's text into overlapping chunks so retrieval can be precise
// even when a page contains several unrelated facts.
export function chunkPageText(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    const end = Math.min(start + CHUNK_SIZE, clean.length);
    chunks.push(clean.slice(start, end));
    if (end === clean.length) break;
    start = end - CHUNK_OVERLAP;
  }
  return chunks;
}

const STOPWORDS = new Set([
  "the","is","at","which","on","a","an","and","or","of","to","in","for","with",
  "my","what","when","does","do","did","was","were","are","it","this","that",
  "i","me","how","much","who","where","be","as","by","from","has","have","will",
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Lightweight lexical (term-overlap) scoring — deliberately not a vector
// embedding model for the prototype, so retrieval is transparent, fast, and
// needs zero extra API keys. Swappable for real embeddings in Phase 3
// without touching the isolation guarantees below.
function scoreChunk(queryTerms, chunkText) {
  const chunkTerms = tokenize(chunkText);
  const chunkSet = new Set(chunkTerms);
  let score = 0;
  for (const term of queryTerms) {
    if (chunkSet.has(term)) {
      const freq = chunkTerms.filter((t) => t === term).length;
      score += 1 + Math.log(1 + freq);
    }
  }
  // Mild length normalization so long chunks don't win purely on volume.
  return score / Math.sqrt(chunkText.length / 200 + 1);
}

// THE MOST IMPORTANT FUNCTION IN THE APP:
// retrieval is always scoped to a single userId at the query level.
// Callers must pass in only chunks already filtered `WHERE userId = ?`.
export function retrieveTopChunks(query, chunks, topK = 5) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) return [];
  const scored = chunks
    .map((c) => ({ chunk: c, score: scoreChunk(queryTerms, c.text) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}
