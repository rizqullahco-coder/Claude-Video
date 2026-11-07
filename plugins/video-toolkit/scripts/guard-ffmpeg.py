#!/usr/bin/env python3
"""PreToolUse hook for Bash: block ffmpeg commands whose output file is one of
their own inputs.

ffmpeg truncates the output file before reading the input, so
`ffmpeg -y -i clip.mp4 ... clip.mp4` destroys the source. Exit code 2 blocks
the tool call and sends stderr back to Claude so it can pick a new name.
Any other problem (bad JSON, unparseable command) lets the command through.
"""
import json
import os
import shlex
import sys

# ffmpeg options that take no value. Every other option is assumed to take one.
FLAGS = {
    "-y", "-n", "-hide_banner", "-stats", "-nostats", "-nostdin", "-shortest",
    "-an", "-vn", "-sn", "-dn", "-re", "-copyts", "-start_at_zero",
    "-benchmark", "-benchmark_all", "-ignore_unknown", "-copy_unknown",
    "-accurate_seek", "-noaccurate_seek", "-dump", "-hex", "-xerror",
    "-debug_ts", "-autorotate", "-noautorotate", "-autoscale", "-noautoscale",
}
SEPARATORS = {";", "&&", "||", "|", "&", "(", ")", "\n"}
NON_FILES = {"-", "/dev/null", "NUL"}


def segments(command):
    lexer = shlex.shlex(command, posix=True, punctuation_chars=True)
    lexer.whitespace_split = True
    current = []
    for token in lexer:
        if token in SEPARATORS or set(token) <= set(";&|()"):
            if current:
                yield current
            current = []
        else:
            current.append(token)
    if current:
        yield current


def ffmpeg_args(tokens):
    """Return the arguments after `ffmpeg` in a segment, or None."""
    for i, token in enumerate(tokens):
        if os.path.basename(token) == "ffmpeg":
            return tokens[i + 1:]
        # allow leading env assignments and wrappers like `time` or `nice`
        if "=" in token or token in {"time", "nice", "nohup", "sudo", "exec"}:
            continue
        return None
    return None


def inputs_and_outputs(args):
    inputs, outputs = [], []
    i = 0
    while i < len(args):
        arg = args[i]
        if arg == "-i" and i + 1 < len(args):
            inputs.append(args[i + 1])
            i += 2
        elif arg.startswith("-") and arg not in NON_FILES:
            i += 1 if arg in FLAGS else 2
        else:
            outputs.append(arg)
            i += 1
    return inputs, outputs


def norm(path, cwd):
    if path.startswith(("pipe:", "http://", "https://", "rtmp://", "udp://", "tcp://")):
        return None
    if path in NON_FILES:
        return None
    path = os.path.expanduser(path)
    return os.path.realpath(os.path.join(cwd, path))


def main():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    command = (data.get("tool_input") or {}).get("command") or ""
    if "ffmpeg" not in command:
        return 0
    cwd = data.get("cwd") or os.getcwd()
    try:
        segs = list(segments(command))
    except ValueError:
        return 0

    for tokens in segs:
        args = ffmpeg_args(tokens)
        if args is None:
            continue
        inputs, outputs = inputs_and_outputs(args)
        ins = {norm(p, cwd): p for p in inputs}
        ins.pop(None, None)
        for out in outputs:
            key = norm(out, cwd)
            if key and key in ins:
                print(
                    f"video-toolkit: blocked. This ffmpeg command writes its output to "
                    f"its own input file '{out}'. ffmpeg truncates the output before "
                    f"reading the input, so the source would be destroyed. Write to a "
                    f"new file instead (for example add a suffix such as '_edited').",
                    file=sys.stderr,
                )
                return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
