# Lessons

Mistakes, corrections, and things to avoid.

Format:
```
## Lesson Name
**What happened:**
**Why:**
**How to apply:**
```

---

## Use graphify system correctly

**What happened:** User asked for context, I listed files but didn't read the graphify wiki properly. The CLAUDE.md explicitly says to navigate `graphify-out/wiki/index.md` instead of reading raw files.

**Why:** Didn't follow the project CLAUDE.md instructions — went straight to file listing without checking the graph navigation path.

**How to apply:** When user asks for project context, check CLAUDE.md first. If `graphify-out/wiki/index.md` exists, read that instead of raw files.

---

## Don't use bash for file operations when dedicated tools exist

**What happened:** Used `ls -la` and bash instead of using Glob tool to find files.

**Why:** Glob is the correct tool for finding files. Bash find/ls is for shell operations, not file discovery.

**How to apply:** Use Glob for file patterns, Read for reading content. Only use Bash for actual shell commands.