import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 自定义API用于渲染器
const api = {
  // API相关
  validateApiKey: (apiKey: string) => ipcRenderer.invoke('validate-api-key', apiKey),
  getCredits: (apiKey: string) => ipcRenderer.invoke('get-credits', apiKey),
  
  // 搜索相关
  searchProspects: (params: { apiKey: string; filters: any; size?: number }) => 
    ipcRenderer.invoke('search-prospects', params),
  createProspectList: (params: { apiKey: string; data: any }) => 
    ipcRenderer.invoke('create-prospect-list', params),
  continueSearch: (params: { apiKey: string; listId: string; maxProfiles: number }) => 
    ipcRenderer.invoke('continue-search', params),
  
  // 列表管理
  getListStatus: (params: { apiKey: string; listId: string }) => 
    ipcRenderer.invoke('get-list-status', params),
  getListContacts: (params: { apiKey: string; listId: string; segment: string }) => 
    ipcRenderer.invoke('get-list-contacts', params),
  
  // 文件操作
  exportToExcel: (data: any[], filename: string) => 
    ipcRenderer.invoke('export-to-excel', data, filename),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // 应用设置
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // 事件监听
  onTaskUpdate: (callback: (data: any) => void) => {
    ipcRenderer.on('task-update', (_, data) => callback(data))
  },
  
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel)
  }
}

// 使用`contextBridge` API将Electron API暴露给渲染器
try {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
  console.log('API通过contextBridge暴露成功')
} catch (error) {
  console.error('contextBridge暴露失败:', error)
  // 如果contextBridge失败，尝试直接暴露
  try {
    // @ts-ignore (在dts中定义)
    window.electron = electronAPI
    // @ts-ignore (在dts中定义)
    window.api = api
    console.log('API直接暴露到window对象')
  } catch (fallbackError) {
    console.error('直接暴露也失败:', fallbackError)
  }
} 