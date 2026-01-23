const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    abrirSelectorCarpeta: () => ipcRenderer.invoke('select-folder')
});