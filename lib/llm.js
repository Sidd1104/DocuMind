import "@/lib/env-check";

const SYSTEM_INSTRUCTIONS = `You are the DocuMind assistant. You answer questions ONLY using the
document excerpts provided in the context below, which belong to one specific user.

Rules:
- Only use facts present in the provided excerpts. Never guess or use outside knowledge.
- If the excerpts do not contain enough information to answer, say plainly that you
  could not find that information in the user's documents. Do not speculate.
- Be concise and direct — a sentence or two is usually enough.
- Do not mention "excerpts", "context", or "chunks" — answer naturally, as if you
  simply know the person's documents.
- Never give legal, medical, or financial advice — only report what the documents say.`;

function buildPrompt(query, chunks) {
  if (chunks.length === 0) {
    return `${SYSTEM_INSTRUCTIONS}\n\nThe user asked: "${query}"\n\nNo relevant document excerpts were found for this user. Tell them you couldn't find this in their uploaded documents.`;
  }
  const context = chunks
    .map(
      (c, i) =>
        `[Excerpt ${i + 1} — from "${c.documentTitle}", page ${c.pageNumber}]\n${c.text}`
    )
    .join("\n\n");
  return `${SYSTEM_INSTRUCTIONS}\n\nDocument excerpts:\n${context}\n\nUser question: "${query}"\n\nAnswer using only the excerpts above.`;
}

async function callClaude(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No ANTHROPIC_API_KEY configured");
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
  const headers = {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
  if (process.env.ANTHROPIC_WORKSPACE_ID) {
    headers["anthropic-workspace-id"] = process.env.ANTHROPIC_WORKSPACE_ID;
  }
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`[Claude API Error] HTTP ${res.status}: ${text}`);
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const text = data.content?.map((b) => b.text || "").join("\n").trim();
  if (!text) throw new Error("Empty response from Claude");
  return { text, provider: "claude" };
}

async function callGemini(prompt, retries = 2) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No GEMINI_API_KEY configured");
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        if ((res.status === 503 || res.status === 429) && attempt < retries) {
          console.warn(`[Gemini API] HTTP ${res.status} on attempt ${attempt + 1}. Retrying in 1s...`);
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        console.error(`[Gemini API Error] HTTP ${res.status}: ${text}`);
        throw new Error(`Gemini API error ${res.status}: ${text}`);
      }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n").trim();
      if (!text) throw new Error("Empty response from Gemini");
      return { text, provider: "gemini" };
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

// Tries Claude first (primary). If it fails for any reason — missing key,
// rate limit, network error — it automatically retries with Gemini so a demo
// never dies mid-question. The provider actually used is returned so the UI
// can be transparent about it.
export async function generateGroundedAnswer(query, chunks) {
  const prompt = buildPrompt(query, chunks);
  try {
    return await callClaude(prompt);
  } catch (claudeErr) {
    console.error("[Claude Call Failed]", claudeErr.message);
    try {
      return await callGemini(prompt);
    } catch (geminiErr) {
      console.error("[Gemini Call Failed]", geminiErr.message);
      return {
        text:
          "I couldn't reach either AI provider right now. Please check that an API key is configured in .env and try again.",
        provider: "none",
        error: `${claudeErr.message} | ${geminiErr.message}`,
      };
    }
  }
}
