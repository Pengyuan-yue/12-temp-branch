import { contextBridge, ipcRenderer } from 'electron'

console.log('预加载脚本开始执行');
console.log('当前进程:', process.type);
console.log('进程参数:', process.argv);

// 检查ipcRenderer是否可用
console.log('ipcRenderer是否可用:', !!ipcRenderer);

// 自定义API用于渲染器
const api = {
  // API相关
  validateApiKey: (apiKey: string) => {
    console.log('调用validateApiKey');
    return ipcRenderer.invoke('validate-api-key', apiKey);
  },
  getCredits: (apiKey: string) => {
    console.log('调用getCredits');
    return ipcRenderer.invoke('get-credits', apiKey);
  },
  
  // 搜索相关
  searchProspects: (params: { apiKey: string; filters: any; size?: number }) => {
    console.log('调用searchProspects');
    return ipcRenderer.invoke('search-prospects', params);
  },
  createProspectList: (params: { apiKey: string; data: any }) => {
    console.log('调用createProspectList');
    return ipcRenderer.invoke('create-prospect-list', params);
  },
  continueSearch: (params: { apiKey: string; listId: string; maxProfiles: number }) => {
    console.log('调用continueSearch');
    return ipcRenderer.invoke('continue-search', params);
  },
  
  // 列表管理
  getListStatus: (params: { apiKey: string; listId: string }) => {
    console.log('调用getListStatus');
    return ipcRenderer.invoke('get-list-status', params);
  },
  getListContacts: (params: { apiKey: string; listId: string; segment: string }) => {
    console.log('调用getListContacts');
    return ipcRenderer.invoke('get-list-contacts', params);
  },
  
  // 文件操作
  exportToExcel: (data: any[], filename: string) => {
    console.log('调用exportToExcel');
    return ipcRenderer.invoke('export-to-excel', data, filename);
  },
  selectDirectory: () => {
    console.log('调用selectDirectory');
    return ipcRenderer.invoke('select-directory');
  },
  
  // 应用设置
  getAppVersion: () => {
    console.log('调用getAppVersion');
    return ipcRenderer.invoke('get-app-version');
  },
  openExternal: (url: string) => {
    console.log('调用openExternal');
    return ipcRenderer.invoke('open-external', url);
  },
  
  // 事件监听
  onTaskUpdate: (callback: (data: any) => void) => {
    console.log('注册onTaskUpdate监听器');
    ipcRenderer.on('task-update', (_, data) => callback(data));
  },
  
  removeAllListeners: (channel: string) => {
    console.log(`移除所有${channel}监听器`);
    ipcRenderer.removeAllListeners(channel);
  }
}

console.log('准备暴露API到渲染进程');

// 确保在上下文隔离环境中暴露API
try {
  console.log('尝试暴露electronAPI到window对象');
  
  // 检查是否在渲染进程中
  if (process.type === 'renderer') {
    contextBridge.exposeInMainWorld('electronAPI', api);
    console.log('API通过contextBridge暴露成功，名称为electronAPI');
    
    // 添加一个全局变量，用于检查API是否已暴露
    contextBridge.exposeInMainWorld('__electronAPILoaded', true);
  } else {
    console.warn('不在渲染进程中，无法暴露API');
  }
} catch (error) {
  console.error('contextBridge暴露失败:', error);
  
  // 安全处理错误对象
  if (error instanceof Error) {
    console.error('错误详情:', error.stack || error.message);
  } else {
    console.error('错误详情:', String(error));
  }
}

// 添加一个全局错误处理器，用于捕获预加载脚本中的错误
window.addEventListener('error', (event) => {
  console.error('预加载脚本错误:', event.error);
});

// 直接检查API是否可用
setTimeout(() => {
  console.log('检查electronAPI是否已暴露到window对象:', typeof window.electronAPI !== 'undefined');
  if (typeof window.electronAPI === 'undefined') {
    console.error('警告: electronAPI未被正确暴露到window对象');
    
    // 尝试重新暴露API
    try {
      contextBridge.exposeInMainWorld('electronAPI', api);
      console.log('重试暴露API成功');
    } catch (error) {
      console.error('重试暴露API失败:', error);
    }
  }
}, 1000);

console.log('预加载脚本执行完毕');
