# Patterns

What works well in this project.

Format:
```
## Pattern Name
**Context:** When this applies
**What to do:** The approach
**Evidence:** Example from codebase
```

---

## Reading project context

**Context:** When user asks what this project is about
**What to do:** Check CLAUDE.md for project-specific rules first. Then use graphify if available.
**Evidence:** CLAUDE.md says to navigate `graphify-out/wiki/index.md` not raw files.

---

## Verifying before completing

**Context:** Before reporting a task as complete
**What to do:** Actually verify the changes — check the diff, ensure tests pass if applicable
**Evidence:** The system prompt explicitly says to verify UI changes by testing in browser

---

## Skill invocation

**Context:** Any task that matches a skill
**What to do:** Invoke the skill BEFORE doing anything else, even if there's only 1% chance it applies
**Evidence:** The `superpowers:using-superpowers` skill has this as an explicit rule