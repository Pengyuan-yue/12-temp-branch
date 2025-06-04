// 全局类型定义
declare global {
  interface Window {
    api: {
      // API相关
      validateApiKey: (apiKey: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      getCredits: (apiKey: string) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      // 搜索相关
      searchProspects: (params: { 
        apiKey: string; 
        filters: any; 
        size?: number 
      }) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      createProspectList: (params: { 
        apiKey: string; 
        data: any 
      }) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      continueSearch: (params: { 
        apiKey: string; 
        listId: string; 
        maxProfiles: number 
      }) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      // 列表管理
      getListStatus: (params: { 
        apiKey: string; 
        listId: string 
      }) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      getListContacts: (params: { 
        apiKey: string; 
        listId: string; 
        segment: string 
      }) => Promise<{ success: boolean; data?: any; error?: string }>;
      
      // 文件操作
      exportToExcel: (data: any[], filename: string) => Promise<any>;
      selectDirectory: () => Promise<any>;
      
      // 应用设置
      getAppVersion: () => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      
      // 事件监听
      onTaskUpdate: (callback: (data: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    
    electron: any;
  }
}

export {};

// 全局类型声明

// 声明xlsx模块
declare module 'xlsx' {
  export const utils: {
    book_new: () => any;
    json_to_sheet: (data: any[]) => any;
    book_append_sheet: (workbook: any, worksheet: any, name: string) => void;
    sheet_to_csv: (worksheet: any) => string;
  };
  export function writeFile(workbook: any, filename: string): void;
}

// 声明Radix UI组件
declare module '@radix-ui/react-popover' {
  export const Root: React.FC<any>;
  export const Trigger: React.FC<any>;
  export const Content: React.FC<any>;
  export const Portal: React.FC<any>;
}

// 声明Lucide图标
declare module 'lucide-react' {
  export const Plus: React.FC<any>;
  export const X: React.FC<any>;
  export const Users: React.FC<any>;
  export const ChevronDown: React.FC<any>;
  export const MapPin: React.FC<any>;
  export const Globe: React.FC<any>;
  export const Loader2: React.FC<any>;
  export const RefreshCw: React.FC<any>;
  export const List: React.FC<any>;
  export const Clock: React.FC<any>;
  export const CheckCircle: React.FC<any>;
  export const AlertCircle: React.FC<any>;
  export const AlertTriangle: React.FC<any>;
  export const Download: React.FC<any>;
  export const FileSpreadsheet: React.FC<any>;
  export const FileText: React.FC<any>;
  export const Eye: React.FC<any>;
  export const Filter: React.FC<any>;
  export const Search: React.FC<any>;
  export const Mail: React.FC<any>;
  export const Phone: React.FC<any>;
  export const Building: React.FC<any>;
}

// 声明React模块
declare module 'react' {
  interface CSSProperties {
    [key: string]: any;
  }
}

// 声明class-variance-authority
declare module 'class-variance-authority' {
  export function cva(base: string, config: any): any;
  export type VariantProps<T extends (...args: any) => any> = any;
} 