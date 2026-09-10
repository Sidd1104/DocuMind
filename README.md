<div align="center">

# 🛡️ DocuMind

### **Your Documents. Organized. Understood.**

*An intelligent, privacy-first personal document vault featuring grounded AI retrieval, automatic dual-LLM failover, multimodal OCR for scanned files, and verified page-level source citations.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Anthropic Claude](https://img.shields.io/badge/Claude-Sonnet_5-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![SQLite / Postgres](https://img.shields.io/badge/Database-SQLite%20%7C%20Postgres-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg?style=for-the-badge)](LICENSE)

<br/>

[🌟 Key Highlights](#-key-highlights) •
[📖 Product Overview](#-product-overview) •
[✨ Deep-Dive Features](#-deep-dive-features) •
[🏗️ Architecture & Dataflow](#-system-architecture--dataflow) •
[🗂️ Document Taxonomy](#-document-taxonomy) •
[🚀 Quick Start](#-quick-start) •
[🔑 Configuration (.env)](#-environment-configuration) •
[🗄️ Database Schema](#-database-schema) •
[🔌 API Reference](#-api-reference) •
[🔒 Security & Isolation](#-security--zero-trust-isolation) •
[🗺️ Roadmap](#-roadmap)

<br/>

</div>

---

## 🌟 Key Highlights

<table>
  <tr>
    <td width="50%">
      <h3>🎯 100% Grounded Answers</h3>
      <p>Strict prompt guardrails eliminate AI hallucinations. DocuMind only responds with facts directly contained inside your uploaded documents. If the information isn't in your vault, it transparently tells you so.</p>
    </td>
    <td width="50%">
      <h3>📑 Page-Level Source Citations</h3>
      <p>Every response comes accompanied by interactive, de-duplicated citation badges identifying the exact document name and specific page number used to formulate the answer.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔄 Resilient Dual-LLM Failover</h3>
      <p>Built with enterprise high availability in mind: uses <strong>Anthropic Claude Sonnet</strong> as the primary reasoning engine and automatically failovers to <strong>Google Gemini Flash</strong> in real time if rate limits (429), timeouts, or quotas occur.</p>
    </td>
    <td width="50%">
      <h3>👁️ Multimodal OCR for Scanned PDFs</h3>
      <p>Never lose data from physical scans or smartphone photos. If a document lacks selectable text layers, DocuMind seamlessly engages Gemini Vision OCR to extract and index page contents automatically.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🗂️ Version Control & Audit Trail</h3>
      <p>Maintain document lifecycle history (v1, v2, v3...) while retaining original file timestamps and page counts. The search engine automatically pins queries to the latest active version so you never cite outdated terms.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Multi-Tenant User Isolation</h3>
      <p>Zero cross-contamination. Ingestion, chunk storage, lexical scoring, and document streaming are strictly partition-scoped to the authenticated user ID at both the application and database query levels.</p>
    </td>
  </tr>
</table>

---

## 📖 Product Overview

Critical documents—insurance policies, lease agreements, vehicle registrations, identity proofs, medical diagnoses, and tax filings—are often scattered across local folders, cloud drives, and physical drawers. When critical life questions arise:

> *"What is my health insurance co-pay for specialist visits?"*  
> *"When exactly does my car's pollution certificate expire?"*  
> *"What clause in my rental agreement covers security deposit deductions?"*

Locating the right file, finding the specific page, and interpreting dense legal jargon wastes time and creates anxiety. 

**DocuMind** solves this with an all-in-one personal document operating system:
1. **Curate & Centralize:** Store your documents into 11 structured life categories with tags and expiration alerts.
2. **Version & Protect:** Track renewals and policy updates over time without losing past copies.
3. **Converse with Confidence:** Ask plain-English questions and get instant, grounded answers backed by pinpoint page citations.

---

## ✨ Deep-Dive Features

### 🧠 Grounded Document Intelligence (RAG)
- **Zero Hallucination Protocol:** Custom system instructions forbid speculative reasoning, outside knowledge assumptions, or hallucinated facts.
- **Explainable Retrieval Scoring:** Utilizes length-normalized lexical term overlap with logarithmic frequency boosting. This delivers instantaneous, deterministic search with zero embedding API latency or cold starts.
- **De-duplicated Source Badges:** Citations are grouped and displayed on each assistant bubble (e.g., `📄 Health_Policy_2025.pdf · p.14`), enabling users to verify facts in seconds.

### 🔄 Dual-Engine LLM Fallback Pipeline
DocuMind guarantees continuous uptime during demos, peak loads, and quota exhaustion:
1. **Primary Provider — Anthropic Claude:** Evaluates contextual excerpts using Claude 3.5 Sonnet for natural prose, nuance, and concise synthesis.
2. **Autonomous Fallback — Google Gemini:** If Claude encounters HTTP 429 (Rate Limit), HTTP 503 (Overloaded), network timeout, or an unconfigured key, the query is dispatched to Google Gemini 3.5 Flash with exponential retry backoff.
3. **Provider Transparency:** Every response records and surfaces the provider used (`claude`, `gemini`, or `none`).

### 📄 Intelligent Ingestion & Scanned PDF OCR
- **High-Fidelity PDF Parser:** Uses `pdf-parse` with custom spatial coordinate reconstruction (`x`, `y`, width tracking) to preserve paragraph flow and tabular structures.
- **Automated Scanned Fallback:** When parsed digital text falls below a viability threshold (< 30 characters across all pages), DocuMind dispatches the raw PDF buffer to Google Gemini's multimodal vision API to transcribe each page with strict `--- PAGE X ---` delimiters.
- **Sliding-Window Chunking:** Text is broken into 900-character segments with a 150-character overlap, ensuring cross-sentence context is preserved without losing granular page attribution.

### 📅 Expiry Tracking & Dashboard Intelligence
- **Renewal Radar:** Highlights documents expiring within 30, 60, or 90 days (e.g., driver's licenses, passports, vehicle insurance, leases).
- **Pinned Quick Access:** Pin frequently accessed documents directly to your home dashboard.
- **Vault Metrics:** Real-time visibility into total storage, active version counts, and processed chunks.

---

## 🏗️ System Architecture & Dataflow

### 1. Document Ingestion & Parsing Pipeline

```
  ┌────────────────────────────────────────────────────────┐
  │              User Uploads PDF via Dashboard            │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │         Page-Aware Parser (Spatial Reconstruction)     │
  └───────────────────────────┬────────────────────────────┘
                              │
               [ Total extracted text < 30 chars? ]
                    │                        │
               YES  ▼                        ▼  NO
  ┌───────────────────────────┐    ┌───────────────────────────┐
  │ Gemini Multimodal Vision  │    │ Digital Page Text Stream  │
  │ OCR Page Transcription    │    │ (Preserving Page Headers) │
  └─────────────┬─────────────┘    └─────────────┬─────────────┘
                │                                │
                └────────────────┬───────────────┘
                                 │
                                 ▼
  ┌────────────────────────────────────────────────────────┐
  │  Sliding Window Chunker (900 chars / 150 char overlap) │
  │    * Tags each chunk with: userId, docId, version, page │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │    Prisma ORM: Relational Chunk & Metadata Storage     │
  └────────────────────────────────────────────────────────┘
```

### 2. Conversational RAG & Dual-LLM Router

```
                      ┌────────────────────────────┐
                      │    User Submits Query      │
                      └─────────────┬──────────────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │             User-Scoped Retrieval Engine                 │
       │  - Filters strictly WHERE userId = authenticatedUser.id  │
       │  - Filters strictly WHERE version = currentVersionId     │
       │  - Computes BM25-style frequency score with length norm  │
       └────────────────────────────┬─────────────────────────────┘
                                    │ Top 5 Chunks
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │               Contextual Prompt Assembly                 │
       │     (System Rules + [Excerpt X - Title, Page] + Query)   │
       └────────────────────────────┬─────────────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    Dual-Engine LLM Router     │
                    └───────┬───────────────┬───────┘
                            │ (Primary)     │ (Automatic Failover)
            ┌───────────────▼──────┐ ┌──────▼──────────────┐
            │ Anthropic Claude     │ │ Google Gemini       │
            │ Sonnet               │ │ 3.5 Flash           │
            └───────────────┬──────┘ └──────┬──────────────┘
                            └───────┬───────┘
                                    │
                                    ▼
       ┌──────────────────────────────────────────────────────────┐
       │ Grounded Response + De-duplicated Page-Level Citations  │
       └──────────────────────────────────────────────────────────┘
```

---

## 🗂️ Document Taxonomy

DocuMind provides 11 pre-configured categories covering personal, household, and business documents:

| Category | Label | Subcategories & Supported Document Types |
| :--- | :--- | :--- |
| `identity` | **Identity & Government** | Aadhaar Card, PAN Card, Passport, Driver's License, Voter ID, Social Security |
| `vehicle` | **Vehicle** | Registration Certificate (RC), Vehicle Insurance, Pollution Under Control (PUC), Service Invoices |
| `insurance` | **Insurance** | Health Insurance Policies, Term Life Plans, Home & Property Insurance, Travel Coverage |
| `property` | **Property & Legal** | Title Deeds, Sale Agreements, Rental / Lease Contracts, Power of Attorney, Wills |
| `financial` | **Financial** | Bank Statements, Income Tax Returns (ITR), Investment Portfolios, Loan Agreements, Payslips |
| `education` | **Education** | University Degrees, Academic Transcripts, Marksheets, Certifications, Diplomas |
| `employment` | **Employment** | Job Offer Letters, Employment Contracts, Experience Letters, Non-Disclosure Agreements |
| `bills` | **Bills & Utilities** | Electricity Bills, Water & Gas Utility Statements, Internet/Broadband Invoices |
| `medical` | **Medical & Health** | Diagnostic Lab Reports, Physician Prescriptions, Hospital Discharge Summaries, Vaccination Records |
| `warranty` | **Warranty & Purchases** | Appliance Warranties, Retail Invoices, Electronics Proof of Purchase, Extended Guarantees |
| `other` | **Custom Vault** | Custom user-defined tags, miscellaneous contracts, estate documents |

---

## 💻 Tech Stack

| Domain | Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Full-Stack Framework** | [Next.js 14](https://nextjs.org/) | App Router, Server Components, API route handlers, and streaming |
| **UI Library** | [React 18](https://reactjs.org/) | Interactive client components, optimistic updates, and clean state |
| **Styling & Design** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Custom color palette (`navy`, `ink`, `teal`), responsive cards, micro-animations |
| **Database & ORM** | [Prisma 5.20](https://www.prisma.io/) + SQLite / Postgres | Strongly-typed models, relationship cascades, relational indexing |
| **Authentication** | Custom JWT + `bcryptjs` | Salted password hashing, `httpOnly` secure signed cookies |
| **PDF Extraction** | `pdf-parse` | Coordinate-aware, page-by-page digital text extraction |
| **OCR Fallback** | Google Gemini Multimodal | Vision transcription for non-selectable, photographic, and scanned PDFs |
| **Primary LLM** | Anthropic Claude Sonnet | Grounded reasoning, synthesis, and strict contextual adherence |
| **Fallback LLM** | Google Gemini 3.5 Flash | Zero-downtime automated fallback with exponential backoff retries |

---

## 📁 Project Structure

```bash
DocuMind/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js        # User authentication & cookie generation
│   │   │   ├── logout/route.js       # Session revocation & cookie invalidation
│   │   │   └── signup/route.js       # User registration & password hashing
│   │   ├── chat/route.js             # User-scoped RAG retrieval & dual-LLM handler
│   │   └── documents/
│   │       ├── route.js              # Document library list & new upload indexing
│   │       └── [id]/
│   │           ├── route.js          # Metadata updates, pin toggle & document deletion
│   │           ├── file/route.js     # Authenticated file preview & download stream
│   │           └── versions/route.js # Upload & re-index new document version (v2, v3...)
│   ├── assistant/page.js             # Conversational RAG assistant interface
│   ├── dashboard/                    # Overview dashboard with expirations & pinned files
│   ├── documents/                    # Document library, taxonomy filters & search
│   │   └── [id]/page.js              # Detailed document viewer, audit log & version switcher
│   ├── login/page.js                 # Authentication login screen
│   ├── signup/page.js                # Registration screen
│   ├── globals.css                   # Global styles, fonts, and Tailwind utilities
│   ├── layout.js                     # Root layout, viewport settings & theme provider
│   └── page.js                       # Product landing page & feature showcase
├── components/
│   ├── AppShell.js                   # Authenticated navigation bar & sidebar wrapper
│   ├── AuthShell.js                  # Clean centered card layout for login/signup
│   ├── ChatPanel.js                  # Real-time chat panel with citation badges & prompts
│   ├── DocuMindLogo.js               # Branded SVG iconography and typography
│   └── UploadModal.js                # Drag-and-drop upload modal with taxonomy selectors
├── lib/
│   ├── auth.js                       # JWT signing, cookie verification & session guards
│   ├── categories.js                 # 11-category master taxonomy definition & labels
│   ├── env-check.js                  # Boot-time validation of API keys and configs
│   ├── llm.js                        # Dual-engine orchestration (Claude ↔ Gemini failover)
│   ├── prisma.js                     # Global Prisma ORM client singleton
│   └── rag.js                        # PDF parsing, OCR fallback, chunking & lexical scoring
├── prisma/
│   ├── schema.prisma                 # Relational schema (User, Document, Version, Chunk, Message)
│   └── dev.db                        # Default local SQLite database file
├── public/                           # Static assets, vector icons & favicons
├── uploads/                          # Local document storage directory (auto-created)
├── tailwind.config.js                # Brand color palettes, shadows, and border radii
├── package.json                      # Scripts, dependencies, and engine requirements
└── README.md                         # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `v18.17.0` or later (`node -v`)
- **npm** (`v9+`), **pnpm**, or **yarn**
- API keys:
  - [Anthropic Console](https://console.anthropic.com/) (for Claude 3.5 Sonnet)
  - [Google AI Studio](https://aistudio.google.com/) (for Gemini 3.5 Flash & OCR)

### 1. Clone the Repository

```bash
git clone https://github.com/Sidd1104/DocuMind.git
cd DocuMind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and fill in your secrets and API keys:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-super-secret-random-jwt-key-min-32-chars"

# Primary LLM
ANTHROPIC_API_KEY="sk-ant-api03-..."
ANTHROPIC_MODEL="claude-sonnet-5"

# Fallback LLM & OCR Engine
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-3.5-flash"
```

> [!TIP]
> You can run DocuMind with **only one** API key configured if needed! The engine will gracefully use whichever provider is active. However, configuring both provides optimal intelligence and OCR fallback capabilities.

### 4. Initialize Database & Generate Prisma Client

```bash
npx prisma db push
```

### 5. Launch the Development Server

```bash
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser. Register an account, upload your first document, and start conversing!

---

## 🔑 Environment Configuration

| Variable | Required? | Default | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `"file:./dev.db"` | SQLite connection string or PostgreSQL URL (`postgresql://user:pass@host:5432/db`) |
| `AUTH_SECRET` | **Yes** | — | High-entropy random string used to sign and verify session JWT cookies |
| `ANTHROPIC_API_KEY` | *Recommended* | — | Anthropic API secret key for Claude Sonnet reasoning |
| `ANTHROPIC_MODEL` | No | `"claude-sonnet-5"` | Model identifier for Anthropic Claude calls |
| `ANTHROPIC_WORKSPACE_ID` | No | — | Optional workspace identifier for Anthropic organization routing |
| `GEMINI_API_KEY` | *Recommended* | — | Google Generative AI API key for Gemini Flash and Vision OCR |
| `GEMINI_MODEL` | No | `"gemini-3.5-flash"` | Model identifier for Google Gemini calls |

---

## 🗄️ Database Schema

DocuMind uses a clean relational structure designed for performance, auditability, and strict multi-tenant isolation.

```mermaid
erDiagram
    USER ||--o{ DOCUMENT : owns
    USER ||--o{ CHAT_MESSAGE : sends
    DOCUMENT ||--|{ DOCUMENT_VERSION : contains
    DOCUMENT_VERSION ||--o{ CHUNK : contains

    USER {
        string id PK "UUID"
        string name "User Full Name"
        string email UK "Unique Email Address"
        string passwordHash "bcrypt hashed password"
        datetime createdAt "Timestamp"
    }

    DOCUMENT {
        string id PK "UUID"
        string userId FK "Scoped User ID"
        string title "Document Title"
        string category "Master Category Key"
        string subcategory "Subcategory Tag"
        string customCategory "Optional Custom Tag"
        boolean pinned "Dashboard Pin Status"
        datetime expiryDate "Expiration / Renewal Date"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
        string currentVersionId "Pointer to latest active version"
    }

    DOCUMENT_VERSION {
        string id PK "UUID"
        string documentId FK "Parent Document ID"
        int versionNumber "Incremental (1, 2, 3...)"
        string filePath "Relative disk storage path"
        string originalName "Original uploaded filename"
        int fileSize "Size in bytes"
        int pageCount "Total extracted pages"
        datetime uploadedAt "Upload Timestamp"
    }

    CHUNK {
        string id PK "UUID"
        string userId "Denormalized for zero-leak queries"
        string documentId "Parent Document ID"
        string documentVersionId FK "Specific Version ID"
        int pageNumber "1-based Page Reference"
        int chunkIndex "Sequential chunk index"
        string text "Raw chunk content (900 chars)"
    }

    CHAT_MESSAGE {
        string id PK "UUID"
        string userId FK "Scoped User ID"
        string role "user | assistant"
        string content "Message text"
        string sourcesJson "JSON array of page-level citations"
        datetime createdAt "Timestamp"
    }
```

---

## 🔌 API Reference

All API routes under `/api/*` (except auth registration/login) require a valid `documind_token` JWT cookie set during authentication.

### Authentication Endpoints

<details>
<summary><strong><code>POST /api/auth/signup</code></strong> — Register account</summary>

- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "user": { "id": "uuid", "name": "Jane Doe", "email": "jane@example.com" }
  }
  ```
</details>

<details>
<summary><strong><code>POST /api/auth/login</code></strong> — Authenticate session</summary>

- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):** Sets `httpOnly` cookie `documind_token`.
</details>

<details>
<summary><strong><code>POST /api/auth/logout</code></strong> — Invalidate session</summary>

- **Response (200 OK):** Clears the `documind_token` cookie.
</details>

---

### Document Endpoints

<details>
<summary><strong><code>GET /api/documents</code></strong> — List documents</summary>

- **Query Parameters:** Optional category or search query filters.
- **Response (200 OK):**
  ```json
  {
    "documents": [
      {
        "id": "doc_123",
        "title": "Health Insurance Policy 2025",
        "category": "insurance",
        "subcategory": "Health Insurance",
        "pinned": true,
        "expiryDate": "2026-03-31T00:00:00.000Z",
        "currentVersion": {
          "versionNumber": 2,
          "pageCount": 18,
          "fileSize": 1420500,
          "uploadedAt": "2025-01-10T14:22:00.000Z"
        }
      }
    ]
  }
  ```
</details>

<details>
<summary><strong><code>POST /api/documents</code></strong> — Upload & index new document</summary>

- **Request Format:** `multipart/form-data`
- **Fields:**
  - `file`: PDF binary
  - `title`: String (e.g. `"Vehicle RC - Honda City"`)
  - `category`: String (e.g. `"vehicle"`)
  - `subcategory`: Optional string (e.g. `"RC"`)
  - `expiryDate`: Optional ISO string (e.g. `"2028-10-15"`)
- **Action:** Saves PDF, performs text extraction / Gemini Vision OCR fallback, breaks text into overlapping chunks, and registers chunks under version 1.
</details>

<details>
<summary><strong><code>POST /api/documents/[id]/versions</code></strong> — Upload updated document version</summary>

- **Request Format:** `multipart/form-data`
- **Fields:**
  - `file`: New PDF file
- **Action:** Increments `versionNumber`, stores new file, extracts and chunks contents, and updates `currentVersionId`. Future RAG queries automatically point to this new version.
</details>

<details>
<summary><strong><code>GET /api/documents/[id]/file</code></strong> — Stream authenticated PDF</summary>

- **Description:** Verifies user ownership before streaming the PDF binary with `Content-Type: application/pdf` for in-browser viewing.
</details>

---

### Conversational RAG Endpoints

<details open>
<summary><strong><code>POST /api/chat</code></strong> — Ask question</summary>

- **Request Body:**
  ```json
  {
    "message": "What is the deductible amount on my insurance policy?"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "answer": "The deductible on your policy is $500 per claim, as stated in Section 4.2 under Policy Limits.",
    "provider": "claude",
    "sources": [
      {
        "documentId": "c92842e4-df31-482a-a5f1-3942ef99e691",
        "documentTitle": "Health_Insurance_Policy_2025.pdf",
        "pageNumber": 7
      }
    ]
  }
  ```
</details>

---

## 🔒 Security & Zero-Trust Isolation

DocuMind is engineered from the ground up to handle sensitive, personal documents with enterprise security hygiene:

1. **Query-Level Data Partitioning:**
   Every database query filters strictly by `userId`. Chunks belonging to User A can never be retrieved, scored, or synthesized in response to User B's questions.
2. **Version Pinning Guardrail:**
   Queries only search chunks associated with each document's active `currentVersionId`. Superseded policy terms, expired clauses, or outdated agreements are never cited.
3. **Signed `httpOnly` Session Cookies:**
   Tokens are stored exclusively in secure, `SameSite=Lax`, `httpOnly` cookies. JavaScript running in the browser cannot access session credentials, safeguarding against XSS token theft.
4. **Protected File Streaming:**
   File previews and downloads do not expose raw public static URLs. The `/api/documents/[id]/file` route enforces JWT authentication and confirms document ownership before returning file streams.
5. **No Public Model Training:**
   All interactions with Anthropic and Google Gemini APIs use enterprise zero-data-retention parameters, ensuring your private documents are never ingested into public foundational AI training datasets.

---

## 🛠️ Production Deployment

DocuMind is built on Next.js 14 and can be deployed to any modern cloud infrastructure:

### Switching from SQLite to PostgreSQL
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update your production `.env` with your PostgreSQL connection URI:
   ```env
   DATABASE_URL="postgresql://postgres:password@db.example.com:5432/documind?schema=public"
   ```
3. Run `npx prisma db push` or create a migration with `npx prisma migrate deploy`.

### Persistent Document Storage (S3 / Cloud Storage)
By default, uploaded files are saved to the local `./uploads` directory. For multi-instance deployments (e.g. Kubernetes, AWS ECS, or serverless platforms), configure an S3-compatible bucket (AWS S3, Cloudflare R2, Supabase Storage) in `app/api/documents/route.js`.

---

## 🗺️ Roadmap

- [x] **Page-Aware PDF Parser** with spatial layout reconstruction.
- [x] **Multimodal OCR Fallback** via Google Gemini Vision API for scanned documents.
- [x] **Dual-Engine LLM Failover** (Anthropic Claude Sonnet ↔ Google Gemini Flash).
- [x] **Granular Page Citations** linked directly to source documents.
- [x] **Document Version Control** with automatic version-pinned RAG retrieval.
- [x] **Expiry & Renewal Radar** on dashboard.
- [ ] **Dense Vector Embeddings:** Hybrid search combining BM25 lexical scoring with pgvector embeddings.
- [ ] **Document Expiry Email Notifications:** Automated cron job dispatching renewal reminders 30 days in advance.
- [ ] **Mobile Document Scanner (PWA):** Direct smartphone camera capture with automatic auto-crop and PDF synthesis.
- [ ] **Multi-Format Ingestion:** Native support for DOCX, XLSX, TXT, and scanned image formats (PNG, JPG, HEIC).

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. **Fork the Repository**
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/GroundedFeature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "feat: implement enhanced table parser for bills"
   ```
4. **Push to the Branch:**
   ```bash
   git push origin feature/GroundedFeature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

---

<div align="center">

Made with ❤️ by **[Siddhant Mohan Jha](https://github.com/Sidd1104)**

*Questions or feedback? Open an issue or start a GitHub discussion!*

</div>
