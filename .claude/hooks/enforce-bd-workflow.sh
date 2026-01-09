#!/bin/bash
# Block git push if bd sync not run or issues still open

# Check for in_progress issues
IN_PROGRESS=$(bd list --status=in_progress 2>/dev/null | grep -c "beads-")

if [ "$IN_PROGRESS" -gt 0 ]; then
  echo "BLOCKED: $IN_PROGRESS bd issue(s) still in_progress" >&2
  echo "Run 'bd close <id>' for completed work first" >&2
  exit 2
fi

# Check if bd sync needed (uncommitted .beads changes)
if git status --porcelain .beads/ 2>/dev/null | grep -q .; then
  echo "BLOCKED: .beads/ has uncommitted changes" >&2
  echo "Run 'bd sync' before pushing" >&2
  exit 2
fi

exit 0
