# DocuMind

**Your Documents. Organized. Understood.**

An intelligent personal document platform that securely organizes, understands, and retrieves information from your important documents.

Upload your documents, choose categories on your terms, and ask plain-language questions about them — answered only from your own documents, with verified source page citations every time.

---

## Stack & Architecture

| Layer        | Choice                         | Rationale |
|--------------|---------------------------------|-----|
| Frontend/API | Next.js 14 (App Router)         | Unified fullstack codebase, server components, isolated server-side secrets |
| Database     | SQLite via Prisma                | Zero configuration for development; easily swappable to PostgreSQL via `DATABASE_URL` |
| Auth         | Custom (bcrypt + signed JWT)    | Secure httpOnly cookies, password hashing, no vendor lock-in |
| Document Engine | pdf-parse                    | Per-page text extraction and chunking for granular citations |
| Retrieval    | Lexical term-overlap scoring    | Scoped strictly per-user and per current document version |
| Intelligence | Claude (primary) → Gemini (fallback) | Grounded AI answer generation with automatic failover |

---

## Getting Started

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY or GEMINI_API_KEY
npx prisma db push     # initializes dev.db SQLite database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to create your vault.

---

## Security & Privacy by Design

- **User-isolated queries:** Every database and chunk lookup is strictly filtered by `userId`.
- **Version pinning:** Answers only cite the latest active version of each document.
- **Secure serving:** Protected routes re-verify session ownership before serving PDF streams.
- **Payload validation:** File type restricted to PDF with size limits.
