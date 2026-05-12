const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    abrirSelectorCarpeta: () => ipcRenderer.invoke('select-folder'),
    ejecutarSast: (rutaCarpeta) => ipcRenderer.invoke('ejecutar-sast', rutaCarpeta),
    procesarJson: (webIp, webPort, actualAgent) => ipcRenderer.invoke('json-processing', webIp, webPort, actualAgent),
    sendTreemap: (rutaCarpeta, agentIp, agentPort) => ipcRenderer.invoke('tree-sending', rutaCarpeta, agentIp, agentPort),
    openServer: (rutaCarpeta) => ipcRenderer.invoke('server-opening', rutaCarpeta),
    extraerCode: (path, line) => ipcRenderer.invoke('extracting-code', path, line),
    postN8n: (agentIp, agentPort, vulnJson) => ipcRenderer.invoke('n8n-sending', agentIp, agentPort, vulnJson),
    procesarPDF: (vulnList, rutaCarpeta) => ipcRenderer.invoke('pdf-processing', vulnList, rutaCarpeta)
});