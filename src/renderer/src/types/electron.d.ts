// 为 Electron API 提供全局类型定义
interface ElectronAPI {
  // 文件系统操作
  selectDirectory: () => Promise<{success: boolean, path?: string, error?: string}>;
  exportToExcel: (data: any[], filename: string) => Promise<boolean>;
  
  // API 相关
  validateApiKey: (apiKey: string) => Promise<any>;
  getCredits: (apiKey: string) => Promise<any>;
  
  // 搜索相关
  searchProspects: (params: { apiKey: string; filters: any; size?: number }) => Promise<any>;
  createProspectList: (params: { apiKey: string; data: any }) => Promise<any>;
  continueSearch: (params: { apiKey: string; listId: string; maxProfiles: number }) => Promise<any>;
  
  // 列表管理
  getListStatus: (params: { apiKey: string; listId: string }) => Promise<any>;
  getListContacts: (params: { apiKey: string; listId: string; segment: string }) => Promise<any>;
  
  // 应用设置
  getAppVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  
  // 事件监听
  onTaskUpdate: (callback: (data: any) => void) => void;
  removeAllListeners: (channel: string) => void;
}

// 扩展全局 Window 接口
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {}; 