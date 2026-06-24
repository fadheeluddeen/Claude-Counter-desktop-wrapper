# Claude Counter — Desktop

A tiny [Electron](https://www.electronjs.org/) app that opens **claude.ai** in its own
window and overlays the [Claude Counter](#credits) token/usage display — so you get the
approximate token count, cache timer, and session/weekly usage bars in a standalone
desktop window instead of a browser tab.

This is **not** a modification of Anthropic's official Claude desktop app. It's a separate,
minimal browser-window wrapper that loads claude.ai and injects the Counter's scripts.

## Install & run

You need [Node.js](https://nodejs.org) 18+.

> **Important:** install with **pnpm**, not npm. Recent npm versions have a
> [bug (npm/cli#4828)](https://github.com/npm/cli/issues/4828) that fails to install
> Electron's platform binary on Windows. pnpm handles it correctly.

```bash
git clone <your-repo-url>
cd claude-counter-desktop

npm install -g pnpm   # if you don't already have pnpm
pnpm install          # downloads Electron (~100 MB, one time)
pnpm start
```

Sign in to Claude in the window as usual. The overlay appears once a conversation loads.
Press **Ctrl+Shift+I** (Cmd+Opt+I on macOS) to open DevTools if anything looks off.

## How it works

- `main.js` opens a `BrowserWindow` on `https://claude.ai/` with a persistent session, so
  your login survives restarts.
- `preload.js` injects the Counter's scripts into the page's **main world** via
  `webFrame.executeJavaScript`, which (unlike a `<script>` tag) is not blocked by
  claude.ai's Content-Security-Policy.
- `vendor/` holds the Claude Counter scripts plus its tokenizer, copied from the original
  project (see Credits).

## Build a standalone installer (optional)

```bash
pnpm add -D electron-builder
pnpm exec electron-builder        # produces an installer for your OS in dist/
```

## Notes & caveats

- **Personal use.** This just renders claude.ai with a local overlay; data stays on your
  machine and only claude.ai is contacted. Don't redistribute it as "Claude".
- **It can break.** The overlay reads claude.ai's internal `/usage` and conversation
  endpoints and watches the DOM. If those change, refresh the files in `vendor/` from a
  newer Claude Counter release (keep the load order in `preload.js` the same).
- The token count is an approximation (uses the `o200k_base` tokenizer); the usage bars
  come from Claude's own live data.

## Credits

The overlay code in `vendor/` is from the **Claude Counter** browser extension by the
Claude Counter contributors, used under the MIT License. Original project:
`<link-to-original-claude-counter-repo>`.

This desktop wrapper (`main.js`, `preload.js`, `package.json`) is original work.

## License

- This wrapper: MIT — see [`LICENSE`](./LICENSE).
- Bundled Claude Counter code: MIT — see [`vendor/LICENSE`](./vendor/LICENSE).
- Bundled tokenizer (`gpt-tokenizer` / `o200k_base`): MIT — see
  [`vendor/THIRD_PARTY_NOTICES.md`](./vendor/THIRD_PARTY_NOTICES.md).

Unofficial project. Not affiliated with, endorsed by, or sponsored by Anthropic. "Claude" is a trademark of Anthropic. This tool loads claude.ai and only reads your own account's usage data, locally on your machine.
![alt text](image-1.png)