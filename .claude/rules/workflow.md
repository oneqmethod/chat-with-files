# Workflow (MANDATORY)

## Planning Phase

- Spin up Explore agents in parallel for context gathering
- No limit on agents - use as many as needed for independent research paths
- Monitor context consumption; agents return summaries

## Implementation Phase

1. `bd create "title"` for each task
2. `bd update <id> --status in_progress`
3. Implement ONE issue at a time
4. `bd close <id>` when done
5. Session end: `bd sync && git commit && git push`

**VIOLATIONS:**

- NEVER edit code without claimed bd issue
- NEVER commit without `bd sync`
- NEVER end session without `git push`
