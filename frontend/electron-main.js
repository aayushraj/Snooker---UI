const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
    }
  })

  const startUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : url.format({
        pathname: path.join(__dirname, 'out', 'index.html'),
        protocol: 'file:',
        slashes: true
      })

  win.loadURL(startUrl)

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools()
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
