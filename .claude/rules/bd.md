# bd (Beads) Rules

## CRITICAL - Non-Negotiable

YOU MUST:

- Create bd issues BEFORE writing ANY code
- Have exactly ONE issue `in_progress` while coding
- Run `bd sync` before AND after every git commit
- Push to remote before ending session

NEVER skip these steps. No exceptions for "small changes".

---

Issue tracking with bd. Run `bd onboard` to get started.

## Commands

```bash
bd ready                              # Find available work
bd show <id>                          # View issue details
bd update <id> --status in_progress   # Claim work
bd close <id>                         # Complete work
bd sync                               # Sync with git
bd create "title"                     # Create issue
```

## Session Completion

**Before ending session**, complete ALL steps. Work is NOT done until `git push` succeeds.

1. File issues for remaining work (`bd create`)
2. Run quality gates if code changed (tests, linters, build)
3. Update issue status - close finished, update in-progress
4. Push to remote:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. Verify all changes committed AND pushed

## Critical Rules

- Work NOT complete until `git push` succeeds
- NEVER stop before pushing
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry
