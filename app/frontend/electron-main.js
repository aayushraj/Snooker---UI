const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      preload: path.join(__dirname, 'preload.js') // Use a preload script
    }
  });

  // Load the Next.js app
  // If you are running in development, this will be http://localhost:3000
  // If you are running in production, this will be file://${app.getAppPath()}/out/index.html
  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `file://${app.getAppPath()}/out/index.html`;

  mainWindow.loadURL(startUrl);

  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('set-title', (event, title) => {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
});

ipcMain.handle('dialog:openFile', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  })
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
});

let counter = 0;
ipcMain.handle('get-counter', () => counter)

ipcMain.on('increment-counter', () => {
  counter += 1
  mainWindow.webContents.send('update-counter', counter)
})

ipcMain.on('decrement-counter', () => {
  counter -= 1
  mainWindow.webContents.send('update-counter', counter)
})
