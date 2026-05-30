# Custom Skills Directory

This directory stores custom agent skills for this project.

## What is a Skill?

A skill is a specialized capability that can be invoked during conversations. It contains:
- **Trigger conditions**: When should this skill be used
- **Procedures**: Step-by-step instructions for the task
- **Checklists**: Verification steps

## Creating a New Skill

Create a markdown file in this directory:

```markdown
---
name: skill-name
description: One-line description of when to invoke this skill
---

# Skill Name

## When to Use
- Trigger condition 1
- Trigger condition 2

## Procedure
1. Step one
2. Step two

## Checklist
- [ ] Verify step 1
- [ ] Verify step 2
```

## Existing Custom Skills

(Add skills you create here)

---

## Skill Naming Convention
- Use kebab-case: `component-dev`, `api-testing`
- Include the domain: `vercel-deploy`, `prisma-migrations`

## Invocation
Skills are invoked via the `Skill` tool with `skill: "skill-name"`.

## Integration with Memory

Update `memory/patterns/_index.md` when a skill proves effective.
Update `memory/lessons/_index.md` when a skill approach needs correction.