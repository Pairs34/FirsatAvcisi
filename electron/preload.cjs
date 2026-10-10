const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  load: () => ipcRenderer.invoke('store:load'),
  save: (data) => ipcRenderer.invoke('store:save', data),
  openExternal: (url) => ipcRenderer.invoke('url:open', url),
  platform: process.platform,
});
