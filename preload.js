const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // You can expose functions here that your renderer process needs to call in the main process
  // For example, to interact with the file system or native dialogs
  // openFile: () => ipcRenderer.invoke('dialog:openFile')
});
