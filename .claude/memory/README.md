# Agent Memory & Skills Framework

Persistent lessons, patterns, and preferences for this project.
Keeps improving with each session.

## Quick Start
1. Before major tasks, check `patterns/` + `preferences.md`
2. After mistakes/corrections, update `lessons/`
3. When something works well, add to `patterns/`

---

## File Structure

```
.claude/
├── memory/
│   ├── README.md           # This file
│   ├── lessons/           # Mistakes + corrections
│   │   └── _index.md
│   ├── preferences.md      # User's working style
│   ├── patterns/          # What works well
│   │   └── _index.md
│   └── context.md          # Active project state
└── skills/                 # Custom agent skills
    └── ...
```

## Update Frequency
- **After each session**: Log any mistakes or "aha" moments
- **When user corrects me**: Capture the correction immediately
- **When patterns emerge**: Add evidence-based patterns

## Guiding Principles

1. **Be concrete, not hypothetical** — only abstract when 3+ instances exist
2. **User is boss** — AGENTS.md / direct instructions override everything
3. **Check memory first** — especially if same error happened before
4. **Admit uncertainty** — say "I don't know" rather than guessing
5. **Make it useful** — write for future-you who has no context