'use strict';

const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');

// A normal-looking Chrome UA avoids any Electron-UA edge cases on the login flow.
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 880,
    title: 'Claude',
    backgroundColor: '#262624',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // preload stays isolated; we inject into the main world explicitly
      nodeIntegration: false,
      sandbox: false,           // lets the preload read the vendor files via fs
      spellcheck: true,
    },
  });

  // Use a clean UA for the whole session.
  win.webContents.setUserAgent(CHROME_UA);

  win.loadURL('https://claude.ai/');

  // Open external links (docs, OAuth popups to other domains, etc.) in the real browser,
  // but keep claude.ai / anthropic auth navigation inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const host = new URL(url).hostname;
      if (host.endsWith('claude.ai') || host.endsWith('anthropic.com') || host.includes('google')) {
        return { action: 'allow' };
      }
    } catch (_) {}
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  // Persist cookies/login to disk so you stay signed in between launches.
  session.defaultSession.setUserAgent(CHROME_UA);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
