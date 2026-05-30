---
name: verification
description: Verification before completing any task
---

# Verification Before Completion

Every task must be verified before marking complete.

## When to Use
- Before reporting a task as done
- After implementing a feature
- When user asks "is it ready"
- Before creating a PR

## Procedure

### 1. Code Changes
- [ ] Read the actual changes made
- [ ] No syntax errors or obvious bugs
- [ ] Follows project conventions (naming, structure)

### 2. Files Changed
- [ ] All expected files modified
- [ ] No unexpected side effects
- [ ] No sensitive data accidentally committed

### 3. Tests
- [ ] Unit tests pass if available
- [ ] If no tests, manually verify the code path

### 4. UI Changes
- [ ] Start dev server
- [ ] Test the feature in browser
- [ ] Test edge cases
- [ ] Check for console errors

### 5. Documentation
- [ ] Update relevant docs if behavior changed
- [ ] Update `memory/context.md` if project state changed

## Anti-Patterns to Avoid

**Don't mark complete if:**
- Haven't tested the UI
- Tests fail
- Only "looks right" in code review
- Did part of the task (missing edge cases)