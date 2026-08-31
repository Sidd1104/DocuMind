import pdfParse from "pdf-parse/lib/pdf-parse.js";

const CHUNK_SIZE = 900; // characters
const CHUNK_OVERLAP = 150;

// Extracts text page-by-page from a PDF buffer.
// Handles both digital text PDFs and scanned/image PDFs (via OCR fallback).
// We keep page numbers because "which page is this on" is core to the product's
// trust story (every answer should be able to point at a page).
export async function extractPages(buffer) {
  const pages = [];
  try {
    await pdfParse(buffer, {
      pagerender: async (pageData) => {
        const textContent = await pageData.getTextContent({ normalizeWhitespace: true });
        let lastY = null;
        let lastX = null;
        let lastWidth = 0;
        let text = "";

        for (const item of textContent.items) {
          const x = item.transform[4];
          const y = item.transform[5];
          const str = item.str;

          if (lastY === null) {
            text += str;
          } else if (Math.abs(y - lastY) > 4) {
            text += "\n" + str;
          } else {
            const expectedX = lastX + lastWidth;
            const gap = x - expectedX;
            if (gap > 1.5 && !text.endsWith(" ") && !str.startsWith(" ")) {
              text += " " + str;
            } else {
              text += str;
            }
          }
          lastY = y;
          lastX = x;
          lastWidth = item.width || 0;
        }
        pages.push(text.trim());
        return text;
      },
    });
  } catch (err) {
    console.error("[PDF Parse Error]", err.message);
  }

  const totalTextLen = pages.reduce((acc, p) => acc + (p ? p.length : 0), 0);
  if (totalTextLen >= 30) {
    return pages;
  }

  // Fallback: Scanned or image-based PDF -> Use Gemini OCR to transcribe pages
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const base64Pdf = buffer.toString("base64");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: base64Pdf,
                    },
                  },
                  {
                    text: "Transcribe the text of each page in this document accurately. Delimit each page clearly with header: '--- PAGE X ---' where X is the 1-based page number.",
                  },
                ],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const fullTranscription = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (fullTranscription) {
          const pageSections = fullTranscription
            .split(/---\s*PAGE\s*\d+\s*---/i)
            .map((s) => s.trim())
            .filter(Boolean);
          if (pageSections.length > 0) {
            return pageSections;
          }
          return [fullTranscription];
        }
      }
    } catch (ocrErr) {
      console.error("[Gemini OCR Fallback Error]", ocrErr.message);
    }
  }

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
