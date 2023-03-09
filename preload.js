const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    updateSdk: () => ipcRenderer.send('update-sdk'),
    updateVscode: () => ipcRenderer.send('update-vscode'),
    handleStdout: (callback) => ipcRenderer.on('stdout-change', callback)
})
