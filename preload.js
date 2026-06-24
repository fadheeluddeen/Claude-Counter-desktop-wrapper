'use strict';

// Runs in the isolated preload world, but we push the actual Counter code into the
// page's MAIN world with webFrame.executeJavaScript — that path is not subject to the
// page's Content-Security-Policy, unlike an injected <script> tag.

const fs = require('fs');
const path = require('path');
const { webFrame } = require('electron');

const VENDOR = path.join(__dirname, 'vendor');
const read = (f) => fs.readFileSync(path.join(VENDOR, f), 'utf8');

// Load order matters: constants defines CC.*, bridge wraps fetch, the rest build on it.
const SCRIPTS = [
  'constants.js',
  'bridge.js',
  'bridge-client.js',
  'o200k_base.js', // vendored tokenizer (large)
  'tokens.js',
  'ui.js',
  'main.js',
];

// Make the extension's runtime probe happy without a real WebExtension runtime.
const SHIM = `
  (() => {
    const g = window;
    g.chrome = g.chrome || {};
    if (!g.chrome.runtime) g.chrome.runtime = {};
    if (typeof g.chrome.runtime.getURL !== 'function') g.chrome.runtime.getURL = (p) => p;
  })();
`;

// bridge.js is executed directly (not as a DOM <script src=...>), so drop a marker
// element with the id the extension looks for, so injectBridgeOnce() short-circuits to true.
const BRIDGE_MARKER = `
  (() => {
    const ID = (window.ClaudeCounter && window.ClaudeCounter.DOM && window.ClaudeCounter.DOM.BRIDGE_SCRIPT_ID) || 'cc-bridge-script';
    if (!document.getElementById(ID)) {
      const m = document.createElement('meta');
      m.id = ID;
      (document.head || document.documentElement).appendChild(m);
    }
  })();
`;

async function injectAll() {
  try {
    await webFrame.executeJavaScript(SHIM);
    await webFrame.executeJavaScript(read('constants.js'));
    await webFrame.executeJavaScript(read('bridge.js'));
    await webFrame.executeJavaScript(BRIDGE_MARKER);
    await webFrame.executeJavaScript(read('bridge-client.js'));
    await webFrame.executeJavaScript(read('o200k_base.js'));
    await webFrame.executeJavaScript(read('tokens.js'));
    await webFrame.executeJavaScript(read('ui.js'));
    await webFrame.executeJavaScript(read('main.js'));
    webFrame.insertCSS(read('styles.css'));
  } catch (err) {
    // Surfaces in the window's DevTools console (View menu / Ctrl+Shift+I) if anything fails.
    console.error('[claude-counter-desktop] injection failed:', err);
  }
}

// The page is a React SPA: once injected, main.js handles in-app route changes itself
// (it listens for the history-patched 'cc:urlchange'). The preload re-runs on every full
// navigation/reload, so a fresh document gets a fresh injection automatically.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectAll, { once: true });
} else {
  injectAll();
}
