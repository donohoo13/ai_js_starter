#!/usr/bin/env bash
# Human-in-the-loop reproduction loop.
# Copy this file, edit the steps below, and run it.
# The agent runs the script; the user follows prompts in their terminal.
#
# Usage:
#   bash hitl-loop.template.sh
#
# Two helpers:
#   step "<instruction>"          → show instruction, wait for Enter
#   capture VAR "<question>"      → show question, read response into VAR
#
# Captured values print as KEY=VALUE lines for the agent to parse. An EXIT
# trap prints them even when the run aborts (EOF, Ctrl-C, closed stdin), so
# the agent always gets a parseable partial result instead of a bare exit 1.

set -euo pipefail

CAPTURED=""
STATUS="incomplete"

on_exit() {
  printf '\n--- Captured (%s) ---\n' "$STATUS"
  if [ -n "$CAPTURED" ]; then
    printf '%s' "$CAPTURED"
  fi
}
trap on_exit EXIT

abort() {
  printf '\n(aborted: %s)\n' "$1"
  exit 1
}

step() {
  printf '\n>>> %s\n' "$1"
  read -r -p "    [Enter when done] " _ || abort "no input at step: $1"
}

capture() {
  local var="$1" question="$2" answer
  printf '\n>>> %s\n' "$question"
  read -r -p "    > " answer || abort "no input at capture: $var"
  printf -v "$var" '%s' "$answer"
  CAPTURED+="${var}=${answer}"$'\n'
}

# --- edit below ---------------------------------------------------------

step "Open the app at http://localhost:3000 and sign in."

capture ERRORED "Click the 'Export' button. Did it throw an error? (y/n)"

capture ERROR_MSG "Paste the error message (or 'none'):"

# --- edit above ---------------------------------------------------------

STATUS="complete"
