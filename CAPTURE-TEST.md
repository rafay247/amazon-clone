# Capture Test

## Tool and model

- **Tool:** Claude Code 2.1.220, running as the VS Code extension
- **Model:** `claude-opus-5-5` (Claude Opus 5.5) does both the planning and the execution; no separate planner model

## Mechanism

Claude Code hooks, configured in the repo at [`.claude/settings.json`](.claude/settings.json), all running [`.claude/hooks/capture.py`](.claude/hooks/capture.py):

| Hook event | What it does |
|---|---|
| `SessionStart` | Creates `.agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md` with the front matter, and records the model |
| `UserPromptSubmit` | Appends the prompt verbatim, from the hook's `prompt` field, with a UTC timestamp and the model |
| `Stop` | Reads the session transcript (its path arrives on stdin) and appends the text the turn ended on, which is the text after the turn's last tool call. Thinking, tool calls and intermediate text are left out. Uses `last_assistant_message` when the hook input provides it. |

The hooks fire on their own in every session opened in this repo. The script always exits 0, so it can never block the agent; any error is written to `.agent-logs/.capture-errors.log`.

## Log file the canaries landed in

_Pending: filled in after the two canary sessions._

## Canary entries (raw)

_Pending._

## What I tried first that did not work

- The first setup session (`7ff28d41`) began before the hooks existed, and Claude Code loads hooks at session start. Its first two exchanges were therefore imported from the session transcript with `capture.py --backfill`, which uses the same parser and the transcript's original timestamps. Everything after that is captured live by the hooks.
- A dry run of the `Stop` handler, while a turn was still mid-tool-call, correctly wrote nothing: at that point there's no final text yet.
