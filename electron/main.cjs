const { app, BrowserWindow, ipcMain, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');

let mainWindow;

app.disableHardwareAcceleration();

if (process.argv.includes('--dev')) {
  app.setPath('userData', path.join(__dirname, '..', '.local-data'));
}

function dataPath() {
  return path.join(app.getPath('userData'), 'workspace.json');
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1510,
    height: 940,
    minWidth: 1100,
    minHeight: 680,
    backgroundColor: '#090c14',
    title: 'Fırsat Avcısı',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.once('ready-to-show', () => mainWindow.show());

  if (process.argv.includes('--dev')) {
    await mainWindow.loadURL('http://127.0.0.1:5174');
  } else {
    await mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

ipcMain.handle('store:load', async () => {
  try {
    return JSON.parse(await fs.readFile(dataPath(), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
});

ipcMain.handle('store:save', async (_event, data) => {
  const payload = JSON.stringify(data);
  if (payload.length > 2_000_000) throw new Error('Yerel veri boyutu sınırı aşıldı.');
  const destination = dataPath();
  const temporary = destination + '.tmp';
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(temporary, payload, 'utf8');
  await fs.rename(temporary, destination);
  return true;
});

ipcMain.handle('url:open', async (_event, url) => {
  if (typeof url !== 'string' || !url.startsWith('https://')) return false;
  await shell.openExternal(url);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
