"use client";

import { useEffect, useRef, useState } from "react";
import { DocuMindSymbol } from "@/components/DocuMindLogo";

const SUGGESTIONS = [
  "When does my insurance policy expire?",
  "What is my vehicle registration number?",
  "What was the total amount in my agreement?",
];

export default function ChatPanel({ documentTitles }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data.messages || []);
        setLoadingHistory(false);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content, sources: [] }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: content }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.error || "Something went wrong.", sources: [] },
      ]);
      return;
    }
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.answer, sources: data.sources || [], provider: data.provider },
    ]);
  }

  async function clearChat() {
    if (!messages.length) return;
    if (!confirm("Clear your conversation history with DocuMind AI?")) return;
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  }

  return (
    <div className="h-screen flex bg-ink-50">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6">
        <div className="py-6 border-b border-ink-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DocuMindSymbol className="w-5 h-5" id="chat-header-symbol" />
              <h1 className="text-lg font-semibold text-navy-950">DocuMind AI</h1>
            </div>
            <p className="text-sm text-ink-500 mt-0.5">
              Grounded exclusively in your uploaded documents with cited sources.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-ink-500 hover:text-red-600 transition-colors px-2.5 py-1 rounded-md hover:bg-ink-100 cursor-pointer"
                title="Clear conversation history"
              >
                Clear chat
              </button>
            )}
            <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
              Private & Isolated
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {loadingHistory ? (
            <p className="text-sm text-ink-400">Loading conversation history…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-white shadow-soft border border-ink-100 flex items-center justify-center mb-4">
                <DocuMindSymbol className="w-8 h-8" id="chat-empty-symbol" />
              </div>
              <h2 className="font-semibold text-navy-950 text-base">Ask DocuMind anything</h2>
              <p className="text-ink-400 text-sm mt-1 mb-6 max-w-sm mx-auto">
                Ask questions about terms, dates, amounts, policy numbers, or clauses in your vault.
              </p>
              <div className="flex flex-col items-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-sm text-teal-800 bg-teal-50/80 hover:bg-teal-100 border border-teal-100 rounded-full px-4 py-2 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => <MessageBubble key={i} message={m} />)
          )}
          {loading && (
            <div className="flex items-center gap-2 text-ink-400 text-sm py-2">
              <DocuMindSymbol className="w-4 h-4 animate-pulse" id="chat-loading-symbol" />
              <span className="text-xs text-ink-400">DocuMind is reading your documents…</span>
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="py-5 border-t border-ink-100 flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DocuMind about your documents…"
            className="flex-1 text-sm bg-white border border-ink-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-500 shadow-xs"
          />
          <button
            disabled={loading || !input.trim()}
            className="rounded-lg bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-medium px-5 transition-all shadow-soft"
          >
            Ask
          </button>
        </form>
      </div>

      <aside className="w-64 shrink-0 border-l border-ink-100 bg-white px-5 py-6 hidden lg:block">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Vault Documents
          </h2>
          <span className="text-xs text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-medium">
            {documentTitles.length}
          </span>
        </div>
        {documentTitles.length === 0 ? (
          <p className="text-sm text-ink-400">No documents in vault yet.</p>
        ) : (
          <ul className="space-y-2">
            {documentTitles.map((t) => (
              <li key={t} className="text-sm text-ink-700 truncate flex items-center gap-2">
                <span className="text-teal-600 text-xs">📄</span>
                <span className="truncate">{t}</span>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

function formatInline(text) {
  if (typeof text !== "string") return text;
  const parts = [];
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-semibold text-navy-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="bg-ink-100 text-teal-800 text-xs px-1.5 py-0.5 rounded font-mono">
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }
  return parts.length > 0 ? parts : text;
}

function MarkdownRenderer({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  const elements = [];
  let currentList = null;

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      if (currentList) {
        elements.push(currentList);
        currentList = null;
      }
      return;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const itemText = line.slice(2);
      if (!currentList || currentList.type !== "ul") {
        if (currentList) elements.push(currentList);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(
        <li key={`li-${idx}`} className="ml-4 list-disc pl-1 text-sm">
          {formatInline(itemText)}
        </li>
      );
      return;
    }

    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (!currentList || currentList.type !== "ol") {
        if (currentList) elements.push(currentList);
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(
        <li key={`li-${idx}`} className="ml-4 list-decimal pl-1 text-sm">
          {formatInline(itemText)}
        </li>
      );
      return;
    }

    if (currentList) {
      elements.push(currentList);
      currentList = null;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h4 key={`h4-${idx}`} className="font-semibold text-navy-950 text-sm mt-2 mb-1">
          {formatInline(line.slice(4))}
        </h4>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h3 key={`h3-${idx}`} className="font-semibold text-navy-950 text-base mt-3 mb-1">
          {formatInline(line.slice(3))}
        </h3>
      );
      return;
    }

    elements.push(
      <p key={`p-${idx}`} className="mb-2 last:mb-0 leading-relaxed text-sm">
        {formatInline(line)}
      </p>
    );
  });

  if (currentList) {
    elements.push(currentList);
  }

  return (
    <div className="space-y-1">
      {elements.map((el, i) => {
        if (el?.type === "ul") {
          return <ul key={`list-${i}`} className="my-1.5 space-y-1">{el.items}</ul>;
        }
        if (el?.type === "ol") {
          return <ol key={`list-${i}`} className="my-1.5 space-y-1">{el.items}</ol>;
        }
        return el;
      })}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[85%]">
        <div
          className={`rounded-xl2 px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-navy-900 text-white shadow-soft"
              : "bg-white border border-ink-100 text-navy-950 shadow-soft"
          }`}
        >
          {isUser ? message.content : <MarkdownRenderer content={message.content} />}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((s, idx) => (
              <a
                key={idx}
                href={`/api/documents/${s.documentId}/file#page=${s.pageNumber}`}
                target="_blank"
                rel="noreferrer"
                title={`Open ${s.documentTitle} at page ${s.pageNumber}`}
                className="text-xs text-ink-600 bg-white hover:bg-teal-50 border border-teal-200/80 hover:border-teal-400 rounded-full px-3 py-1 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span className="text-teal-600">📄</span>
                <span className="font-medium text-navy-900 group-hover:text-teal-900 truncate max-w-[200px]">
                  {s.documentTitle}
                </span>
                <span className="text-ink-400 group-hover:text-teal-700">· p.{s.pageNumber} ↗</span>
              </a>
            ))}
          </div>
        )}
        {!isUser && message.provider && (
          <p className="mt-1.5 text-[11px] text-ink-400 px-1 select-none">
            {message.provider === "claude"
              ? "via Claude"
              : message.provider === "gemini"
              ? "via Gemini fallback"
              : message.provider === "grounded-guardrail"
              ? "grounded guardrail"
              : `via ${message.provider}`}
          </p>
        )}
      </div>
    </div>
  );
}
