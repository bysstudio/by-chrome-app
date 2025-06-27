import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

//在预加载脚本中暴露安全的IPC方法
contextBridge.exposeInMainWorld('electronAPI', {
  onSetPort: (callback) => {
    ipcRenderer.on('set-port', (event, portData) => callback(portData))
  },
  invoke: (channel, ...args) => {
    const allowedChannels = ['common-choose-path']
    if (!allowedChannels.includes(channel)) {
      throw new Error(`非法 IPC 通道: ${channel}`)
    }
    return ipcRenderer.invoke(channel, ...args)
  }
})


// // Custom APIs for renderer
// const api = {}
//
// // Use `contextBridge` APIs to expose Electron APIs to
// // renderer only if context isolation is enabled, otherwise
// // just add to the DOM global.
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   window.electron = electronAPI
//   window.api = api
// }
