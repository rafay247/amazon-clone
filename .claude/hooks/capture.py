#!/usr/bin/env python3
"""8x agent capture hook for Claude Code.

Wired in .claude/settings.json to:
  SessionStart     -> creates the session log and records the model
  UserPromptSubmit -> appends the prompt, verbatim
  Stop             -> appends the final response text of the turn

Writes one file per session to .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md.
Only the prompt and the final response are captured: no thinking, no tool calls.

Also usable by hand to import an existing transcript:
  python3 .claude/hooks/capture.py --backfill <transcript.jsonl>

Never blocks Claude Code: all errors are swallowed and written to .agent-logs/.capture-errors.log.
"""
import datetime as dt
import glob
import json
import os
import re
import subprocess
import sys
import time
import traceback

PROJECT = "amazon-clone"
TOOL = "claude-code"
PROJECT_DIR = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
LOG_DIR = os.path.join(PROJECT_DIR, ".agent-logs")


def now_iso():
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        f"{dt.datetime.now(dt.timezone.utc).microsecond // 1000:03d}Z"


def author():
    if os.environ.get("EIGHTX_AUTHOR"):
        return os.environ["EIGHTX_AUTHOR"]
    for key in ("github.user", "user.name"):
        try:
            out = subprocess.run(["git", "config", "--get", key], cwd=PROJECT_DIR,
                                 capture_output=True, text=True, timeout=3).stdout.strip()
            if out:
                return out
        except Exception:
            pass
    return "unknown"


# ---------- transcript parsing ----------

def read_transcript(path):
    entries = []
    try:
        with open(path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        entries.append(json.loads(line))
                    except json.JSONDecodeError:
                        pass
    except OSError:
        pass
    return entries


def is_real_prompt(e):
    """A user-typed prompt (not a tool result, not injected meta content)."""
    if e.get("type") != "user" or e.get("isMeta") or e.get("isSidechain"):
        return False
    c = (e.get("message") or {}).get("content")
    if isinstance(c, str):
        return True
    if isinstance(c, list):
        return any(b.get("type") == "text" for b in c) and \
            not any(b.get("type") == "tool_result" for b in c)
    return False


def prompt_text(e):
    c = e["message"]["content"]
    if isinstance(c, str):
        return c
    return "".join(b.get("text", "") for b in c if b.get("type") == "text")


def model_of(e):
    m = (e.get("message") or {}).get("model")
    return m if m and not m.startswith("<") else None


def split_turns(entries):
    """Yield (prompt_entry, final_text, final_ts, model) per turn.

    The final response is the assistant text that comes after the last tool call
    of the turn, i.e. what the turn ended on.
    """
    turns = []
    cur = None
    for e in entries:
        if is_real_prompt(e):
            cur = {"prompt": e, "text": [], "ts": None, "model": None}
            turns.append(cur)
            continue
        if cur is None or e.get("type") != "assistant" or e.get("isSidechain"):
            continue
        cur["model"] = model_of(e) or cur["model"]
        for b in (e.get("message") or {}).get("content") or []:
            if b.get("type") == "tool_use":
                cur["text"] = []
            elif b.get("type") == "text" and b.get("text", "").strip():
                cur["text"].append(b["text"])
                cur["ts"] = e.get("timestamp")
    return turns


def last_model(entries):
    for e in reversed(entries):
        if e.get("type") == "assistant" and model_of(e):
            return model_of(e)
    return None


# ---------- log file ----------

def log_path(session_id, ts_iso=None):
    existing = glob.glob(os.path.join(LOG_DIR, f"*_{session_id}.md"))
    if existing:
        return existing[0]
    t = dt.datetime.fromisoformat(ts_iso.replace("Z", "+00:00")) if ts_iso \
        else dt.datetime.now(dt.timezone.utc)
    return os.path.join(LOG_DIR, f"{t.strftime('%Y-%m-%d_%H-%M-%S')}_{session_id}.md")


def ensure_log(session_id, model, ts_iso=None):
    os.makedirs(LOG_DIR, exist_ok=True)
    path = log_path(session_id, ts_iso)
    if not os.path.exists(path):
        date = (ts_iso or now_iso())[:10]
        header = (
            "---\n"
            f"session_id: {session_id}\n"
            f"date: {date}\n"
            f"author: {author()}\n"
            f"model: {model or 'unknown'}\n"
            f"tool: {TOOL}\n"
            f"project: {PROJECT}\n"
            "total_exchanges: 0\n"
            "first_prompt_time: \n"
            "last_prompt_time: \n"
            "---\n\n"
            f"# Session Log - {date}\n\n"
            f"Session: `{session_id[:8]}` | Project: `{PROJECT}` | Author: `{author()}`\n\n"
            "---\n"
        )
        with open(path, "w", encoding="utf-8") as f:
            f.write(header)
    return path


def set_field(text, key, value):
    return re.sub(rf"^{key}:.*$", f"{key}: {value}", text, count=1, flags=re.M)


def get_field(text, key):
    m = re.search(rf"^{key}:[ \t]*(.*)$", text, flags=re.M)
    return m.group(1).strip() if m else ""


def append_entry(path, session_id, kind, ts, model, body):
    with open(path, encoding="utf-8") as f:
        text = f.read()
    n = int(get_field(text, "total_exchanges") or 0)
    if kind == "PROMPT":
        n += 1
        text = set_field(text, "total_exchanges", n)
        if not get_field(text, "first_prompt_time"):
            text = set_field(text, "first_prompt_time", ts)
        text = set_field(text, "last_prompt_time", ts)
    if model and get_field(text, "model") in ("", "unknown"):
        text = set_field(text, "model", model)
    num = max(n, 1)
    text = text.rstrip("\n") + (
        f"\n\n\n[LOG_ENTRY type={kind} num={num} session={session_id[:8]}]\n"
        f"timestamp: {ts}\n"
        f"model: {model or 'unknown'}\n\n"
        f"{body.rstrip()}\n"
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def last_logged_model(path):
    try:
        with open(path, encoding="utf-8") as f:
            # Only entry metadata: prompt bodies can contain pasted "model:" lines.
            models = re.findall(r"^\[LOG_ENTRY [^\]]*\]\ntimestamp: [^\n]*\nmodel: (.+)$",
                                f.read(), flags=re.M)
        return models[-1].strip() if models else None
    except OSError:
        return None


# ---------- hook handlers ----------

def latest_model_in_other_logs(exclude):
    """Fresh sessions have no assistant turn yet; reuse the most recent known model."""
    for p in sorted(glob.glob(os.path.join(LOG_DIR, "*.md")), reverse=True):
        if p != exclude:
            m = last_logged_model(p)
            if m and m != "unknown":
                return m
    return None


def on_session_start(data):
    # The VS Code extension omits the model here, and a session with no prompts
    # should not leave an empty log behind, so only create the file when it's known.
    if data.get("model"):
        ensure_log(data["session_id"], data["model"])


def on_prompt(data):
    sid = data["session_id"]
    model = last_model(read_transcript(data.get("transcript_path", ""))) or data.get("model")
    path = ensure_log(sid, model)
    if not model:
        logged = last_logged_model(path)
        model = logged if logged not in (None, "unknown") else latest_model_in_other_logs(path)
    append_entry(path, sid, "PROMPT", now_iso(), model, data.get("prompt", ""))


def on_stop(data):
    sid = data["session_id"]
    tpath = data.get("transcript_path", "")
    text, model = None, None
    # The transcript can lag the hook by a moment; wait briefly for the final text.
    for _ in range(10):
        turns = split_turns(read_transcript(tpath))
        if turns and turns[-1]["text"]:
            text = "\n\n".join(turns[-1]["text"])
            model = turns[-1]["model"]
            break
        time.sleep(0.3)
    if data.get("last_assistant_message"):
        text = data["last_assistant_message"]
    if not text:
        return
    path = ensure_log(sid, model)
    append_entry(path, sid, "RESPONSE", now_iso(), model or last_logged_model(path), text)


def backfill(transcript):
    entries = read_transcript(transcript)
    sid = next((e["sessionId"] for e in entries if e.get("sessionId")), None)
    turns = split_turns(entries)
    if not sid or not turns:
        print("nothing to backfill")
        return
    path = ensure_log(sid, turns[0]["model"], turns[0]["prompt"].get("timestamp"))
    for t in turns:
        append_entry(path, sid, "PROMPT", t["prompt"]["timestamp"], t["model"], prompt_text(t["prompt"]))
        if t["text"]:
            append_entry(path, sid, "RESPONSE", t["ts"], t["model"], "\n\n".join(t["text"]))
    print(path)


def main():
    if len(sys.argv) == 3 and sys.argv[1] == "--backfill":
        backfill(sys.argv[2])
        return
    data = json.load(sys.stdin)
    event = data.get("hook_event_name")
    if event == "SessionStart":
        on_session_start(data)
    elif event == "UserPromptSubmit":
        on_prompt(data)
    elif event == "Stop":
        on_stop(data)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        try:
            os.makedirs(LOG_DIR, exist_ok=True)
            with open(os.path.join(LOG_DIR, ".capture-errors.log"), "a") as f:
                f.write(f"{now_iso()}\n{traceback.format_exc()}\n")
        except Exception:
            pass
    sys.exit(0)
