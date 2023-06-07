// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

declare global {
    interface Window {
        electronAPI: any,
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    updateSdk: () => ipcRenderer.send('update-sdk'),
    updateVscode: () => ipcRenderer.send('update-vscode'),
    handleStdout: (callback: any) => ipcRenderer.on('stdout-change', callback),
    // handleChangeIsNcs: (bool) => ipcRenderer.send('change-is-ncs', { bool }),
})
