const { app, BrowserWindow } = require("electron")
const path = require("path")
const url = require("url")

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false, // It's safer to keep nodeIntegration false for security
      contextIsolation: true, // Protect against prototype pollution
      preload: path.join(__dirname, "preload.js"), // Use a preload script for context bridge
    },
  })

  // In production, load the built Next.js app
  // In development, load the Next.js dev server
  const startUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : url.format({
          pathname: path.join(__dirname, "out", "index.html"),
          protocol: "file:",
          slashes: true,
        })

  mainWindow.loadURL(startUrl)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Optional: Create a preload script for secure IPC if needed
// For this basic setup, it's not strictly necessary but good practice
// if you need to expose Node.js APIs to the renderer process.
// For now, we'll keep it minimal.
