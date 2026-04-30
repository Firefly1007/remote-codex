# Upstream Overrides

This directory contains patched files that are applied on top of the upstream project:

- **Upstream**: [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)
- **Tested version**: v1.25.2
- **Upstream license**: GPL-3.0

## What these overrides do

The files in `claudecodeui-1.25.2/` are modified versions of upstream source files. They add:

- **Hardened mode**: restricts the app to Codex-only functionality by default (`CODEX_ONLY_HARDENED_MODE`)
- **Device trust**: first-time device approval flow for new phone logins
- **Cookie-based auth**: session management suitable for WebView and mobile browser environments
- **Windows path compatibility**: ASCII-safe working directory aliases for paths with non-ASCII characters

## How to apply

1. Download upstream `siteboon/claudecodeui` v1.25.2 into `vendor/claudecodeui-1.25.2/`
2. Copy the contents of `claudecodeui-1.25.2/` into the upstream checkout, overwriting existing files
3. Run `npm install` in the upstream directory

## Attribution

This project builds on the work of [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui). The upstream project is licensed under GPL-3.0. All modifications in this directory are provided under the same license.
