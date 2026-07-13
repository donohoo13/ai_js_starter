#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/doctor.sh
# Warn-only check that this machine has the toolchain prerequisites the project
# expects. Claude Code's LSP plugins (typescript-lsp, pyright-lsp) ship only
# server configuration; each language server binary is a separate per-machine
# install, and when it is missing LSP code intelligence silently degrades to
# text search. Wire this into package.json "prepare" so every `pnpm install`
# self-reports gaps. It informs, never blocks: always exits 0.

have() { command -v "$1" >/dev/null 2>&1; }
warn() {
  printf '! %s\n  fix: %s\n' "$1" "$2" >&2
}

# TypeScript / JavaScript
if [[ -f package.json || -f tsconfig.json ]]; then
  have typescript-language-server || warn \
    "typescript-language-server not found: LSP code intelligence for TS/JS is inactive" \
    "npm i -g typescript-language-server typescript"
fi

# Python
if [[ -f pyproject.toml || -f requirements.txt || -f uv.lock ]]; then
  have pyright-langserver || warn \
    "pyright-langserver not found: LSP code intelligence for Python is inactive" \
    "npm i -g pyright"
fi

# Adopting another language? Three steps: enable its plugin in
# .claude/settings.json enabledPlugins, install its binary, add a block above
# gated on its manifest. Official plugins -> binary (detect via manifest):
#   gopls-lsp -> gopls (go.mod)                    go install golang.org/x/tools/gopls@latest
#   rust-analyzer-lsp -> rust-analyzer (Cargo.toml)  rustup component add rust-analyzer
#   ruby-lsp -> ruby-lsp (Gemfile)                 gem install ruby-lsp
#   jdtls-lsp -> jdtls (pom.xml, build.gradle)
#   csharp-lsp -> csharp-ls (*.csproj)
#   clangd-lsp, kotlin-lsp, lua-lsp, php-lsp, swift-lsp also exist in the
#   claude-plugins-official marketplace.

exit 0
