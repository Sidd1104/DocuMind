<div align="center">

# 🛡️ DocuMind
### **Your Documents. Organized. Understood.**

*An intelligent, privacy-first personal document vault with 100% grounded RAG retrieval, automatic dual-LLM failover, multimodal OCR for scanned files, and verified page-level source citations.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.20-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Anthropic Claude](https://img.shields.io/badge/Claude-Sonnet_3.5-D97706?style=for-the-badge&logo=anthropic&logoColor=white)](https://www.anthropic.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%7C%20Postgres-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg?style=for-the-badge)](LICENSE)

<br/>

[🌟 Highlights](#-key-highlights) •
[📖 Overview](#-product-overview) •
[⚖️ Why DocuMind?](#️-why-documind-feature-matrix) •
[✨ Deep-Dive Features](#-deep-dive-features) •
[🏗️ Architecture](#-system-architecture--dataflow) •
[🗂️ Taxonomy](#-document-taxonomy) •
[🚀 Quick Start](#-quick-start) •
[🔑 Config](#-environment-configuration) •
[🗄️ Database](#-database-schema) •
[🔌 API Reference](#-api-reference) •
[🔒 Security](#-security--zero-trust-isolation) •
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
      <p>Every response comes accompanied by interactive, de-duplicated citation badges identifying the exact document name and specific page number used to formulate the answer (e.g. <code>📄 Policy.pdf · p.14</code>).</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔄 Resilient Dual-LLM Failover</h3>
      <p>Built with enterprise high availability: uses <strong>Anthropic Claude Sonnet</strong> as primary reasoning engine and automatically failovers to <strong>Google Gemini Flash</strong> in real time if rate limits (429), timeouts, or quotas occur.</p>
    </td>
    <td width="50%">
      <h3>👁️ Multimodal OCR for Scanned PDFs</h3>
      <p>Never lose data from physical scans or smartphone photos. If a document lacks selectable text layers (less than 30 characters extracted), DocuMind seamlessly engages Gemini Vision OCR to transcribe page contents automatically.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🗂️ Version Control & Audit Trail</h3>
      <p>Maintain complete document lifecycle history (v1, v2, v3...) while retaining original file timestamps and page counts. The search engine automatically pins queries to the latest active version so you never cite outdated terms.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Multi-Tenant User Isolation</h3>
      <p>Zero cross-contamination. Ingestion, chunk storage, lexical scoring, and document streaming are strictly partition-scoped to the authenticated user ID at both the application and database query levels.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⚡ Sub-10ms Explainable Retrieval</h3>
      <p>Length-normalized lexical BM25-style frequency scoring delivers instantaneous, deterministic chunk retrieval with zero cold starts, zero embedding API fees, and completely explainable relevance matching.</p>
    </td>
    <td width="50%">
      <h3>🔔 Expiration & Renewal Radar</h3>
      <p>Real-time visual countdown radar flags policies, vehicle registrations, leases, and warranties expiring within 30, 60, or 90 days right on the central dashboard.</p>
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

## ⚖️ Why DocuMind? Feature Matrix

| Capability | Generic Cloud AI (ChatGPT / Claude web) | Traditional Folder Search (Spotlight / Windows Search) | Standard Vector RAG Apps | 🛡️ **DocuMind Vault** |
| :--- | :---: | :---: | :---: | :---: |
| **Data Privacy & Multi-Tenancy** | ❌ Model training risk | ⚠️ Local-only, unorganized | ⚠️ Shared vector namespaces | ✅ **Strict User-Scoped Partitioning** |
| **Hallucination Prevention** | ❌ May invent clauses | N/A | ⚠️ Often synthesizes unseen data | ✅ **Strict Grounded System Prompt** |
| **Exact Page Citations** | ❌ Vague or missing | ❌ Just filename matching | ⚠️ Broad chunk summaries | ✅ **Deduplicated Page-Level Badges** |
| **Scanned / Photographic PDFs** | ⚠️ Extra manual step | ❌ Completely unsearchable | ❌ Fails on raw image PDFs | ✅ **Automatic Multimodal OCR Fallback** |
| **Document Versioning** | ❌ Overwrites or confuses | ⚠️ Cluttered filenames (`_v2_final`) | ❌ Cites deprecated versions | ✅ **Version Tree & Active Pointer** |
| **High-Availability Dual-LLM** | ❌ Single point of failure | N/A | ❌ Single provider lock-in | ✅ **Autonomous Claude ↔ Gemini Failover** |
| **Cold-Start & Embedding Cost** | ❌ High monthly subscription | ✅ Free | ⚠️ External embedding API latency | ✅ **Instant Deterministic Retrieval** |
| **Renewal & Expiry Tracking** | ❌ None | ❌ None | ❌ None | ✅ **Built-in Expiry Radar Dashboard** |

---

## ✨ Deep-Dive Features

### 🧠 Grounded Document Intelligence (RAG)
- **Zero Hallucination Protocol:** Custom system instructions strictly forbid speculative reasoning, outside knowledge assumptions, or hallucinated facts.
- **Explainable Retrieval Scoring:** Utilizes length-normalized lexical term overlap with logarithmic frequency boosting. This delivers instantaneous, deterministic search with zero embedding API latency or cold starts.
- **De-duplicated Source Badges:** Citations are grouped and displayed on each assistant bubble (e.g., `📄 Health_Policy_2025.pdf · p.14`), enabling users to verify facts in seconds.

> [!IMPORTANT]
> **System Instruction Guardrail:** DocuMind's assistant prompt explicitly commands:
> *"Only use facts present in the provided excerpts. Never guess or use outside knowledge. If the excerpts do not contain enough information to answer, say plainly that you could not find that information in the user's documents."*

### 🔄 Dual-Engine LLM Fallback Pipeline
DocuMind guarantees continuous uptime during demos, peak loads, and quota exhaustion:
1. **Primary Provider — Anthropic Claude:** Evaluates contextual excerpts using Claude 3.5 Sonnet for natural prose, nuance, and concise synthesis.
2. **Autonomous Fallback — Google Gemini:** If Claude encounters HTTP 429 (Rate Limit), HTTP 503 (Overloaded), network timeout, or an unconfigured key, the query is dispatched to Google Gemini 3.5 Flash with exponential retry backoff.
3. **Provider Transparency:** Every response records and surfaces the provider used (`claude`, `gemini`, or `none`).

> [!TIP]
> **Zero Downtime Reliability:** In testing scenarios where Anthropic credits deplete or rate limits trigger, DocuMind seamlessly executes Gemini Flash in under 1 second without throwing an error to the user interface.

### 📄 Intelligent Ingestion & Scanned PDF OCR
- **High-Fidelity PDF Parser:** Uses `pdf-parse` with custom spatial coordinate reconstruction (`x`, `y`, width tracking) to preserve paragraph flow and tabular structures.
- **Automated Scanned Fallback:** When parsed digital text falls below a viability threshold (< 30 characters across all pages), DocuMind dispatches the raw PDF buffer to Google Gemini's multimodal vision API to transcribe each page with strict `--- PAGE X ---` delimiters.
- **Sliding-Window Chunking:** Text is broken into 900-character segments with a 150-character overlap, ensuring cross-sentence context is preserved without losing granular page attribution.

> [!NOTE]
> **Why 900-character windows with 150-character overlap?** 
> 900 characters roughly matches a dense single paragraph of legal or contractual text. The 150-character overlap ensures that sentences crossing chunk boundaries remain coherent during lexical matching.

### 📅 Expiry Tracking & Dashboard Intelligence
- **Renewal Radar:** Highlights documents expiring within 30, 60, or 90 days (e.g., driver's licenses, passports, vehicle insurance, leases).
- **Pinned Quick Access:** Pin frequently accessed documents directly to your home dashboard.
- **Vault Metrics:** Real-time visibility into total storage, active version counts, and processed chunks.

---

## 🏗️ System Architecture & Dataflow

### 1. Document Ingestion & Multimodal OCR Pipeline

```mermaid
flowchart TD
    A([User Uploads PDF via Dashboard]) --> B[Store File to /uploads with UUID]
    B --> C[Page-Aware Parser with Spatial Layout Reconstruction]
    C --> D{Total Extracted Text >= 30 Chars?}
    
    D -- YES: Digital Text Available --> E[Digital Page Text Stream with Page Boundaries]
    D -- NO: Scanned / Image PDF --> F[Gemini 3.5 Flash Multimodal Vision OCR]
    F --> G[Parse Page Delimiters: --- PAGE X ---]
    G --> E
    
    E --> H[Sliding Window Chunker: 900 Chars / 150 Chars Overlap]
    H --> I[Tag Each Chunk: userId, documentId, versionId, pageNumber]
    I --> J[(Prisma ORM: Relational Chunk & Metadata Storage)]
    J --> K([Document Ready for Search & Grounded Chat])

    style A fill:#0284c7,stroke:#0369a1,color:#fff
    style D fill:#d97706,stroke:#b45309,color:#fff
    style F fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style J fill:#059669,stroke:#047857,color:#fff
    style K fill:#0d9488,stroke:#0f766e,color:#fff
```

### 2. User-Scoped Conversational RAG & Failover Router

```mermaid
flowchart TD
    U([User Submits Query]) --> RL{Rate Limiter: Max 20 / 10 min}
    RL -- Exceeded --> E429[HTTP 429: Retry-After Header]
    RL -- OK --> S1[User-Scoped Query: WHERE userId = current_user.id]
    
    S1 --> S2[Filter Document Chunks WHERE versionId = currentVersionId]
    S2 --> S3[Length-Normalized Lexical BM25 Scoring]
    S3 --> S4[Select Top 5 Highest-Scoring Chunks]
    
    S4 --> P[Assemble System Prompt + Grounded Excerpts + Query]
    
    P --> C1{Primary Engine: Anthropic Claude Sonnet 3.5}
    C1 -- Success --> R[Synthesize Response]
    C1 -- 429 / 503 / Timeout / No Key --> G1{Fallback Engine: Google Gemini 3.5 Flash}
    G1 -- Exponential Backoff Retries --> R
    G1 -- Both Fail / No Keys --> FB[Grounded Excerpt Display Only]
    
    R --> D[De-duplicate Document & Page Citations]
    D --> OUT([Deliver Grounded Answer + Source Badges to UI])

    style U fill:#0284c7,stroke:#0369a1,color:#fff
    style RL fill:#e11d48,stroke:#be123c,color:#fff
    style C1 fill:#d97706,stroke:#b45309,color:#fff
    style G1 fill:#4285F4,stroke:#1d4ed8,color:#fff
    style OUT fill:#059669,stroke:#047857,color:#fff
```

---

## 🗂️ Document Taxonomy

DocuMind provides 11 pre-configured categories covering personal, household, and business documents:

| Category | Label | Supported Document Types & Typical Use-Cases |
| :--- | :--- | :--- |
| `identity` | 🪪 **Identity & Government** | Aadhaar Card, PAN Card, Passport, Driver's License, Voter ID, Social Security |
| `vehicle` | 🚗 **Vehicle** | Registration Certificate (RC), Vehicle Insurance, Pollution (PUC), Service Records |
| `insurance` | 🛡️ **Insurance** | Health Insurance Policies, Term Life Plans, Home & Property Cover, Travel Insurance |
| `property` | 🏠 **Property & Legal** | Title Deeds, Sale Agreements, Rental & Lease Contracts, Power of Attorney, Wills |
| `financial` | 💳 **Financial** | Bank Statements, Income Tax Returns (ITR), Investment Portfolios, Loan Agreements, Payslips |
| `education` | 🎓 **Education** | University Degrees, Academic Transcripts, Marksheets, Certifications, Diplomas |
| `employment` | 💼 **Employment** | Job Offer Letters, Employment Contracts, Experience Letters, Non-Disclosure Agreements |
| `bills` | ⚡ **Bills & Utilities** | Electricity Bills, Water & Gas Utility Statements, Internet/Broadband Invoices |
| `medical` | 🩺 **Medical & Health** | Diagnostic Lab Reports, Physician Prescriptions, Hospital Discharge Summaries, Vaccines |
| `warranty` | 🧾 **Warranty & Purchases** | Appliance Warranties, Retail Invoices, Electronics Proof of Purchase, Guarantees |
| `other` | 📁 **Custom Vault** | Custom user-defined tags, miscellaneous contracts, estate documents |

---

## 💻 Tech Stack

| Domain | Technology | Purpose & Implementation |
| :--- | :--- | :--- |
| **Full-Stack Framework** | [Next.js 14.2](https://nextjs.org/) | App Router, Server Components, Route Handlers, Streaming |
| **UI Library** | [React 18.3](https://reactjs.org/) | Interactive client components, optimistic state, fluid transitions |
| **Styling & Design** | [Tailwind CSS 3.4](https://tailwindcss.com/) | Custom brand color palette (`navy`, `ink`, `teal`), responsive cards, micro-animations |
| **Database & ORM** | [Prisma 5.20](https://www.prisma.io/) + SQLite / Postgres | Strongly-typed models, relationship cascades, relational indexing |
| **Authentication** | Custom JWT + `bcryptjs` | Salted password hashing, `httpOnly` secure signed cookies |
| **PDF Extraction** | `pdf-parse` | Coordinate-aware, page-by-page digital text extraction |
| **OCR Fallback** | Google Gemini Vision | Multimodal transcription for non-selectable, photographic, and scanned PDFs |
| **Primary LLM** | Anthropic Claude Sonnet 3.5 | Grounded reasoning, synthesis, and strict contextual adherence |
| **Fallback LLM** | Google Gemini 3.5 Flash | Zero-downtime automated fallback with exponential backoff retries |

---

## 📁 Project Structure

```bash
DocuMind/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js        # User authentication & secure cookie issuance
│   │   │   ├── logout/route.js       # Session revocation & cookie invalidation
│   │   │   └── signup/route.js       # User registration & bcrypt password hashing
│   │   ├── chat/route.js             # User-scoped RAG retrieval, rate limiting & dual-LLM handler
│   │   └── documents/
│   │       ├── route.js              # Document library list & new upload parsing / chunking
│   │       └── [id]/
│   │           ├── route.js          # Metadata updates, pin toggle & document deletion
│   │           ├── file/route.js     # Authenticated file preview & download stream
│   │           └── versions/route.js # Upload & re-index new document version (v2, v3...)
│   ├── assistant/page.js             # Conversational RAG assistant interface with source badges
│   ├── dashboard/page.js             # Overview dashboard with expirations, pinned & metrics
│   ├── documents/
│   │   ├── page.js                   # Document library, taxonomy filters & search
│   │   └── [id]/page.js              # Detailed document viewer, audit log & version switcher
│   ├── login/page.js                 # Authentication login screen
│   ├── signup/page.js                # Registration screen
│   ├── globals.css                   # Global styles, fonts, and Tailwind utilities
│   ├── layout.js                     # Root layout, viewport settings & theme provider
│   └── page.js                       # Product landing page & feature showcase
├── components/
│   ├── AppShell.js                   # Authenticated navigation bar & sidebar wrapper
│   ├── AuthShell.js                  # Clean centered card layout for login/signup
│   ├── ChatPanel.js                  # Real-time chat panel with citation badges & prompt suggestions
│   ├── DocuMindLogo.js               # Branded SVG iconography and typography
│   └── UploadModal.js                # Drag-and-drop upload modal with taxonomy selectors
├── lib/
│   ├── auth.js                       # JWT signing, cookie verification & session guards
│   ├── categories.js                 # 11-category master taxonomy definition & labels
│   ├── env-check.js                  # Boot-time validation of API keys and configs
│   ├── llm.js                        # Dual-engine orchestration (Claude ↔ Gemini failover)
│   ├── prisma.js                     # Global Prisma ORM client singleton
│   ├── rag.js                        # PDF parsing, OCR fallback, chunking & lexical scoring
│   └── rateLimit.js                  # Sliding-window in-memory rate limiter
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

Follow these steps to get DocuMind up and running locally in under two minutes:

### Prerequisites

- **Node.js**: `v18.17.0` or later (`node -v`)
- **npm** (`v9+`), **pnpm**, or **yarn**
- At least one AI API key:
  - [Anthropic Console](https://console.anthropic.com/) (Claude 3.5 Sonnet)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini 3.5 Flash & OCR)

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

Create your local `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` and configure your keys:

```env
# Database connection (SQLite default)
DATABASE_URL="file:./dev.db"

# JWT Secret (min 32 random characters)
AUTH_SECRET="your-super-secret-random-jwt-key-min-32-chars"

# Primary LLM Provider: Anthropic Claude
ANTHROPIC_API_KEY="sk-ant-api03-..."
ANTHROPIC_MODEL="claude-sonnet-5"
# ANTHROPIC_WORKSPACE_ID=""  # Optional: For organization routing

# Fallback LLM & Multimodal OCR: Google Gemini
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-3.5-flash"
```

> [!TIP]
> **Single-Key Flexibility:** You can run DocuMind with **only one** API key configured! The engine will gracefully use whichever provider is active. However, configuring both provides optimal intelligence and automatic OCR fallback.

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
<br/>

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
<br/>

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
<br/>

- **Response (200 OK):** Clears the `documind_token` cookie.
</details>

---

### Document Endpoints

<details>
<summary><strong><code>GET /api/documents</code></strong> — List documents</summary>
<br/>

- **Query Parameters:** None.
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
<br/>

- **Request Format:** `multipart/form-data`
- **Fields:**
  - `file`: PDF binary (Max: 15MB)
  - `title`: String (e.g. `"Vehicle RC - Honda City"`)
  - `category`: String (e.g. `"vehicle"`)
  - `subcategory`: Optional string (e.g. `"RC"`)
  - `expiryDate`: Optional ISO string (e.g. `"2028-10-15"`)
- **Action:** Saves PDF, performs text extraction / Gemini Vision OCR fallback, breaks text into overlapping chunks, and registers chunks under version 1.
</details>

<details>
<summary><strong><code>GET /api/documents/[id]</code></strong> — Get single document details</summary>
<br/>

- **Response (200 OK):** Returns document object with all historical versions and metadata.
</details>

<details>
<summary><strong><code>PATCH /api/documents/[id]</code></strong> — Update document metadata</summary>
<br/>

- **Request Body:**
  ```json
  {
    "pinned": true,
    "category": "insurance",
    "subcategory": "Term Life",
    "expiryDate": "2030-05-01T00:00:00.000Z"
  }
  ```
- **Response (200 OK):** Returns updated document object.
</details>

<details>
<summary><strong><code>DELETE /api/documents/[id]</code></strong> — Delete document & files</summary>
<br/>

- **Action:** Cascades deletion to chunks, versions, database document record, and removes physical PDF files from disk.
- **Response (200 OK):** `{ "ok": true }`
</details>

<details>
<summary><strong><code>POST /api/documents/[id]/versions</code></strong> — Upload updated document version</summary>
<br/>

- **Request Format:** `multipart/form-data`
- **Fields:**
  - `file`: New PDF file
- **Action:** Increments `versionNumber`, stores new file, extracts and chunks contents, and updates `currentVersionId`. Future RAG queries automatically point to this new version.
</details>

<details>
<summary><strong><code>GET /api/documents/[id]/file</code></strong> — Stream authenticated PDF</summary>
<br/>

- **Description:** Verifies user ownership before streaming the PDF binary with `Content-Type: application/pdf` for in-browser viewing.
</details>

---

### Conversational RAG Endpoints

<details>
<summary><strong><code>GET /api/chat</code></strong> — Retrieve chat history</summary>
<br/>

- **Response (200 OK):**
  ```json
  {
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "When does my car insurance expire?",
        "sources": []
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "Your vehicle insurance policy expires on November 14, 2026.",
        "sources": [
          {
            "documentId": "c92842e4-df31-482a-a5f1-3942ef99e691",
            "documentTitle": "Car_Insurance.pdf",
            "pageNumber": 1
          }
        ]
      }
    ]
  }
  ```
</details>

<details open>
<summary><strong><code>POST /api/chat</code></strong> — Ask question with grounded RAG</summary>
<br/>

- **Rate Limit:** 20 messages per 10-minute sliding window per user.
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

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ZERO-TRUST SECURITY ARCHITECTURE                  │
├────────────────────────────────┬───────────────────────────────────────┤
│ 1. Multi-Tenant Partitioning   │ WHERE userId = session.user.id on all │
│                                │ chunk retrieval & file requests.      │
├────────────────────────────────┼───────────────────────────────────────┤
│ 2. Version Pinning Guardrail   │ Queries strictly target active        │
│                                │ currentVersionId — no stale terms.    │
├────────────────────────────────┼───────────────────────────────────────┤
│ 3. Signed httpOnly JWT Cookies │ Prevents token theft and XSS attacks. │
│                                │ Secure, SameSite=Lax flags enforced.  │
├────────────────────────────────┼───────────────────────────────────────┤
│ 4. Authenticated File Streams  │ Uploaded files are never public URLs; │
│                                │ accessed only through auth check.     │
├────────────────────────────────┼───────────────────────────────────────┤
│ 5. Zero-Data-Retention AI      │ No public foundational training with  │
│                                │ your confidential documents.          │
└────────────────────────────────┴───────────────────────────────────────┘
```

> [!CAUTION]
> **Production Note:** Ensure your `AUTH_SECRET` is at least 32 random characters and stored securely. In production environments, always enforce HTTPS so `httpOnly; Secure` cookies are transmitted only over encrypted connections.

---

## 🛠️ Production Deployment

DocuMind is built on Next.js 14 and can be deployed on Vercel, Railway, Fly.io, AWS, or Docker:

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
3. Run database migrations:
   ```bash
   npx prisma db push
   ```

### Production Build & Run

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🗺️ Roadmap

- [x] **Page-Aware PDF Parser** with spatial layout reconstruction.
- [x] **Multimodal OCR Fallback** via Google Gemini Vision API for scanned documents.
- [x] **Dual-Engine LLM Failover** (Anthropic Claude Sonnet ↔ Google Gemini Flash).
- [x] **Granular Page Citations** linked directly to source documents.
- [x] **Document Version Control** with automatic version-pinned RAG retrieval.
- [x] **Expiry & Renewal Radar** on dashboard.
- [x] **Sliding-Window Rate Limiting** on authentication and chat endpoints.
- [ ] **Dense Vector Embeddings:** Hybrid search combining BM25 lexical scoring with pgvector embeddings.
- [ ] **Document Expiry Email Notifications:** Automated renewal reminders 30 days in advance.
- [ ] **Mobile Document Scanner (PWA):** Direct smartphone camera capture with automatic auto-crop and PDF synthesis.
- [ ] **Multi-Format Ingestion:** Native support for DOCX, XLSX, TXT, and scanned images (PNG, JPG, HEIC).

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
