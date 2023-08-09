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
    setVersion: (version: string) => ipcRenderer.send('set-version', version),
    handleStdout: (callback: any) => ipcRenderer.on('stdout-change', callback),
    setIsRmModules: (isRmModules: boolean) => ipcRenderer.send('set-is-rm-modules', isRmModules),
    handleSDKVersionsChange: (callback: any) => ipcRenderer.on('ncs_sdk_versions_change', callback),
    handleCurrentSDKVersionChange: (callback: any) => ipcRenderer.on('ncs_current_sdk_version_change', callback),
    setSDKVersion: (version: string) => ipcRenderer.send('set-ncs-sdk-version', version),
})
