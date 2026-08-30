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
          <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
            Private & Isolated
          </span>
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

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "" : ""}`}>
        <div
          className={`rounded-xl2 px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-navy-900 text-white shadow-soft"
              : "bg-white border border-ink-100 text-navy-950 shadow-soft"
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.sources.map((s, idx) => (
              <span
                key={idx}
                className="text-xs text-ink-600 bg-white border border-teal-200/80 rounded-full px-3 py-1 shadow-xs flex items-center gap-1.5"
              >
                <span className="text-teal-600">📄</span>
                <span className="font-medium text-navy-900">{s.documentTitle}</span>
                <span className="text-ink-400">· p.{s.pageNumber}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
