# Project Context

Current state of the project. Updated as work progresses.

## Project
- **Name**: BalasBro AI Automation Platform
- **Branch**: `feature/ui` (current work is UI-focused)
- **Stack**: Next.js 16.2.6, React 19, Prisma, NextAuth v5, Shadcn/ui

## Key Directories
- `app/api/` — API routes (ai, auth, conversations, messages, orders, etc.)
- `app/dashboard/` — Dashboard pages
- `components/` — UI components
- `docs/` — Compliance, deployment, monitoring docs
- `prisma/` — Database schema

## What's Active
- UI development on feature/ui branch
- Build out the dashboard/frontend components

## Recent Changes
- Initial commit with cleaned/organized code structure
- MFA/TOTP 2FA implementation
- Performance engineering (circuit breakers, load testing)
- Indonesian PDP compliance docs (UU 27/2022)

## Documentation
- Design system: `DESIGN.md` ("Forest Intelligence" theme)
- Graphify knowledge graph available at `graphify-out/`

## Important Files
- `AGENTS.md` — Next.js breaking changes warning (v16 has breaking changes from training data)
- `CLAUDE.md` — Graphify navigation rules
- `.env.example` — Environment variables template