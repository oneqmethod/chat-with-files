# Chat with Files

Upload documents and chat with them using Google Gemini's File Search API. A RAG (Retrieval-Augmented Generation) application built with Next.js 16, PayloadCMS, and shadcn/ui.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PayloadCMS](https://img.shields.io/badge/PayloadCMS-3-blue)](https://payloadcms.com/)

## Features

- **User Authentication** - Register/login with secure session management
- **File Upload** - Upload PDFs, documents, and text files
- **Automatic Indexing** - Files are indexed to Google Gemini File Search in the background
- **Contextual Chat** - AI searches your uploaded files to answer questions
- **Source Citations** - Responses include references to source documents
- **Dark/Light Theme** - Toggle between themes with persistence

## Tech Stack

| Layer    | Technology                                      |
| -------- |-------------------------------------------------|
| Frontend | Next.js 16 (App Router, RSC)                    |
| Backend  | PayloadCMS 3 + MongoDB                          |
| AI       | Google Gemini 3 Flash Preview + File Search API |
| UI       | shadcn/ui + Tailwind CSS v4                     |
| Auth     | Payload built-in authentication                 |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- MongoDB (local or Atlas)
- Google Cloud account with Gemini API access

### Setup

```bash
# Clone the repository
git clone https://github.com/oneqmethod/chat-with-files.git
cd chat-with-files

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

### Environment Variables

Edit `.env` with your values:

```env
# MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/chat-with-files

# Payload secret (generate a random string)
PAYLOAD_SECRET=your-secret-key-min-32-chars

# Google Gemini API key
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and register your first account.

## Usage

### 1. Register an Account

Create an account at `/register`. This automatically provisions a Google Gemini File Search store for your files.

### 2. Upload Files

Navigate to `/files` and upload your documents. Supported formats include PDF, TXT, and common document types. Files are automatically indexed in the background.

File status progression:

- `pending` → File uploaded, waiting for processing
- `indexing` → Being indexed to Google Gemini
- `ready` → Available for chat queries
- `error` → Indexing failed

### 3. Start Chatting

Go to `/chat/new` and ask questions about your uploaded files. The AI will search your documents and provide answers with source citations.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/           # Public pages
│   │   ├── (app)/            # Authenticated routes
│   │   │   ├── chat/[id]/    # Chat interface
│   │   │   ├── dashboard/    # User dashboard
│   │   │   └── files/        # File management
│   │   └── (auth)/           # Login/register
│   ├── (payload)/            # Admin panel (auto-generated)
│   └── api/                  # API routes
│       ├── chat/             # Chat streaming endpoint
│       └── files/            # File upload/delete
├── collections/              # Payload collections
│   ├── Users.ts              # User accounts + Gemini store
│   ├── Chats.ts              # Chat conversations
│   ├── Messages.ts           # Chat messages + sources
│   └── Media.ts              # Uploaded files
├── components/
│   ├── ui/                   # shadcn components
│   └── ai-elements/          # AI chat components
├── lib/
│   ├── gemini.ts             # Google Gemini integration
│   ├── access.ts             # Access control helpers
│   └── utils.ts              # Utilities
└── payload.config.ts         # Payload configuration
```

## Commands

```bash
pnpm dev                  # Start development server
pnpm build                # Production build
pnpm exec tsc --noEmit    # Type check
pnpm test:int             # Integration tests (Vitest)
pnpm test:e2e             # E2E tests (Playwright)
pnpm generate:types       # Regenerate Payload types
```

### Adding shadcn Components

```bash
pnpm dlx shadcn@latest add button card dialog
pnpm dlx shadcn@latest search <query>
```

## Contributing

Contributions are welcome! Please follow these steps:

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/chat-with-files.git
cd chat-with-files
pnpm install
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow existing code style (Prettier auto-formats on commit)
- Use TypeScript strict mode
- Write tests for new functionality
- Update documentation if needed

### 4. Test Your Changes

```bash
pnpm exec tsc --noEmit    # Type check
pnpm test:int             # Run integration tests
pnpm test:e2e             # Run E2E tests
```

### 5. Submit PR

Push your branch and open a pull request with:

- Clear description of changes
- Screenshots for UI changes
- Test coverage for new features

## Development with Claude Code

This project uses Claude Code for AI-assisted development with structured workflows.

### Issue Tracking with bd (Beads)

The project uses `bd` for persistent issue tracking across sessions:

```bash
# Find available work
bd ready

# View issue details
bd show <issue-id>

# Claim an issue
bd update <issue-id> --status=in_progress

# Create new issue
bd create --title="Feature description" --type=task --priority=2

# Close completed work
bd close <issue-id>

# Sync with git
bd sync
```

### Development Workflow

1. **Find Work**: `bd ready` to see available issues
2. **Claim Issue**: `bd update <id> --status=in_progress`
3. **Implement**: Make your changes
4. **Test**: Run type checks and tests
5. **Close Issue**: `bd close <id>`
6. **Commit & Push**: Complete the git workflow

### Session Close Protocol

Before ending a development session, always complete:

```bash
git status                    # Check changes
git add <files>               # Stage changes
bd sync                       # Sync beads
git commit -m "Your message"  # Commit
bd sync                       # Sync again
git push                      # Push to remote
```

### Using Skills

Claude Code includes project-specific skills for up-to-date documentation:

- `/payload` - PayloadCMS patterns, hooks, access control
- `/shadcn` - Component search, registry lookup
- `/nextjs` - App Router, RSC, server actions

## Architecture

### Data Flow

```
User Registration
       ↓
Creates Gemini File Search Store
       ↓
Upload File → Media Record (pending)
       ↓
Background Job (every 30s)
       ↓
Index to Gemini → Media Record (ready)
       ↓
Chat Message → Gemini + File Search Tool
       ↓
Stream Response with Source Citations
```

### Collections

| Collection | Purpose                    | Key Relations |
| ---------- | -------------------------- | ------------- |
| Users      | Accounts + Gemini store ID | -             |
| Chats      | Conversations              | → Users       |
| Messages   | Chat messages + sources    | → Chats       |
| Media      | Uploaded files             | → Users       |

### Background Jobs

The `uploadToGoogle` task runs every 30 seconds to process pending file uploads:

1. Fetches pending Media records
2. Uploads to user's Gemini File Search store
3. Updates status to `ready` or `error`

## Docker (Optional)

```bash
# Start MongoDB
docker-compose up -d

# Run development server
pnpm dev
```

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with [Next.js](https://nextjs.org/), [PayloadCMS](https://payloadcms.com/), and [Google Gemini](https://ai.google.dev/).
