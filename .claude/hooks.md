# Hooks (settings.json)

Two hooks work together to prompt you about committing after Claude edits files.

## How it works

**1. PostToolUse — `Write|Edit`**
Every time Claude writes or edits a file, it drops a temp sentinel file at `/tmp/claude-portfolio-changed-{session-id}`. This is just a flag — no content, just presence.

**2. Stop**
When Claude finishes a turn, it checks two conditions:
- Does the sentinel file exist? (i.e. did Claude change files this turn?)
- Does `git status` show uncommitted changes?

If both are true: the sentinel is deleted, and a banner appears — *"Files changed — reply Yes to commit and push, No to skip, or type your next step."* Claude also receives a context note so it knows how to handle your reply.

If either condition is false (no files changed, or everything already committed): the hook exits silently.

## Why the sentinel file?

Without it, the Stop hook would fire on every turn — including turns where Claude just answered a question without touching any files. The sentinel scopes the prompt to turns where edits actually happened.

## Behaviour by reply

| Reply | Claude does |
|---|---|
| Yes | Stages changed files, writes a commit message, commits, pushes to `origin/main` |
| No | Acknowledges and waits |
| Anything else | Treats it as your next instruction |

## To disable temporarily

Comment out or delete the `Stop` hook block in `.claude/settings.json`. The `PostToolUse` sentinel creation is harmless on its own.
