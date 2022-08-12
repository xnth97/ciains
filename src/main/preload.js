const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Renderer -> Main
  loadFiles: () => ipcRenderer.invoke('load-files'),
  install: (addr, port, files) => ipcRenderer.invoke('install', addr, port, files),
  getHostInfo: () => ipcRenderer.invoke('get-host-info'),
  setHostInfo: (addr, port) => ipcRenderer.invoke('set-host-info', addr, port),
  getConsoleInfo: () => ipcRenderer.invoke('get-console-info'),
  detectAddress: () => ipcRenderer.invoke('detect-ip'),

  // Main -> Renderer
  handleOpenFiles: (callback) => ipcRenderer.on('open-files', callback),
  handleOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
});
