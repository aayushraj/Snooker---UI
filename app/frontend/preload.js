// See the Electron documentation for details on how to use preload scripts:
// @ts-ignore
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Invoke methods
  setTitle: (title: string) => ipcRenderer.invoke('set-title', title),
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  onUpdateCounter: (callback: any) => ipcRenderer.on('update-counter', callback),
  getCounter: () => ipcRenderer.invoke('get-counter')
}
);
