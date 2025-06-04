import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SearchFilters, SearchResponse, Contact, ListStatusResponse } from '../types/api'
import { getWizaApi } from '../services/wizaApi'

// 任务状态
export interface Task {
  id: string
  type: 'search' | 'create_list' | 'continue_search' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  message: string
  listId?: string
  createdAt: Date
  updatedAt: Date
  data?: {
    listId?: string;
    listName?: string;
    format?: string;
    filename?: string;
    contactCount?: number;
  };
}

// 列表信息
export interface List {
  id: string
  name: string
  status: 'pending' | 'processing' | 'queued' | 'scraping' | 'finished' | 'failed'
  totalProfiles: number
  progress: number
  createdAt: string
  updatedAt: string
  filters: SearchFilters
  enrichmentLevel?: 'none' | 'partial' | 'full'
  maxProfiles?: number
}

// 应用状态接口
interface AppState {
  // API配置
  apiKey: string
  isApiKeyValid: boolean
  
  // 搜索状态
  searchFilters: SearchFilters
  searchResults: SearchResponse | null
  
  // 列表管理
  currentLists: List[]
  selectedList: List | null
  
  // 任务管理
  tasks: Task[]
  isTaskRunning: boolean
  
  // UI状态
  currentPage: string
  isLoading: boolean
  error: string | null
  
  // 导出数据
  exportData: Contact[]
  
  // Actions
  setApiKey: (apiKey: string) => void
  setApiKeyValid: (valid: boolean) => void
  setSearchFilters: (filters: SearchFilters) => void
  setSearchResults: (results: SearchResponse | null) => void
  addList: (list: List) => void
  updateList: (listId: string, updates: Partial<List>) => void
  removeList: (listId: string) => void
  setSelectedList: (list: List | null) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  removeTask: (taskId: string) => void
  setTaskRunning: (running: boolean) => void
  setCurrentPage: (page: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setExportData: (data: Contact[]) => void
  searchProspects: (filters: SearchFilters) => Promise<SearchResponse>
  clearAll: () => void
}

// 创建store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      apiKey: '',
      isApiKeyValid: false,
      searchFilters: {},
      searchResults: null,
      currentLists: [],
      selectedList: null,
      tasks: [],
      isTaskRunning: false,
      currentPage: 'api-config',
      isLoading: false,
      error: null,
      exportData: [],

      // Actions
      setApiKey: (apiKey: string) => {
        set({ apiKey, isApiKeyValid: false })
      },

      setApiKeyValid: (valid: boolean) => {
        set({ isApiKeyValid: valid })
      },

      setSearchFilters: (filters: SearchFilters) => {
        set({ searchFilters: filters })
      },

      setSearchResults: (results: SearchResponse | null) => {
        set({ searchResults: results })
      },

      addList: (list: List) => {
        console.log('添加列表:', list)
        set(state => ({
          currentLists: [...state.currentLists, list]
        }))
      },

      updateList: (listId: string, updates: Partial<List>) => {
        console.log('更新列表:', listId, updates)
        set(state => ({
          currentLists: state.currentLists.map(list =>
            list.id === listId ? { ...list, ...updates } : list
          )
        }))
      },

      removeList: (listId: string) => {
        console.log('删除列表:', listId)
        set(state => ({
          currentLists: state.currentLists.filter(list => list.id !== listId),
          selectedList: state.selectedList?.id === listId ? null : state.selectedList
        }))
      },

      setSelectedList: (list: List | null) => {
        set({ selectedList: list })
      },

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set(state => ({
          tasks: [...state.tasks, task]
        }))
        return task.id
      },

      updateTask: (taskId: string, updates: Partial<Task>) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId 
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          )
        }))
      },

      removeTask: (taskId: string) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }))
      },

      setTaskRunning: (running: boolean) => {
        set({ isTaskRunning: running })
      },

      setCurrentPage: (page: string) => {
        set({ currentPage: page })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      setExportData: (data: Contact[]) => {
        set({ exportData: data })
      },

      searchProspects: async (filters: SearchFilters) => {
        const { apiKey } = get()
        if (!apiKey) {
          throw new Error('API密钥未设置')
        }
        
        set({ isLoading: true, error: null })
        try {
          const wizaApi = getWizaApi(apiKey)
          const result = await wizaApi.searchProspects(filters)
          set({ searchResults: result, isLoading: false })
          return result
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '搜索失败'
          set({ error: errorMessage, isLoading: false })
          throw error
        }
      },

      clearAll: () => {
        set({
          searchFilters: {},
          searchResults: null,
          currentLists: [],
          selectedList: null,
          tasks: [],
          isTaskRunning: false,
          error: null,
          exportData: []
        })
      }
    }),
    {
      name: 'wiza-app-storage',
      storage: {
        getItem: (name) => {
          try {
            const data = localStorage.getItem(name)
            console.log('从存储读取数据:', name, data)
            return data
          } catch (error) {
            console.error('读取存储失败:', error)
            return null
          }
        },
        setItem: (name, value) => {
          try {
            console.log('写入数据到存储:', name, typeof value === 'string' ? value : JSON.stringify(value))
            localStorage.setItem(name, typeof value === 'string' ? value : JSON.stringify(value))
          } catch (error) {
            console.error('写入存储失败:', error)
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name)
          } catch (error) {
            console.error('移除存储失败:', error)
          }
        }
      },
      partialize: (state) => ({
        apiKey: state.apiKey,
        searchFilters: state.searchFilters,
        currentLists: state.currentLists,
        currentPage: state.currentPage
      })
    }
  )
)

// 选择器函数
export const useApiKey = () => useAppStore(state => state.apiKey)
export const useIsApiKeyValid = () => useAppStore(state => state.isApiKeyValid)
export const useSearchFilters = () => useAppStore(state => state.searchFilters)
export const useSearchResults = () => useAppStore(state => state.searchResults)
export const useCurrentLists = () => useAppStore(state => state.currentLists)
export const useSelectedList = () => useAppStore(state => state.selectedList)
export const useTasks = () => useAppStore(state => state.tasks)
export const useIsTaskRunning = () => useAppStore(state => state.isTaskRunning)
export const useCurrentPage = () => useAppStore(state => state.currentPage)
export const useIsLoading = () => useAppStore(state => state.isLoading)
export const useError = () => useAppStore(state => state.error)
export const useExportData = () => useAppStore(state => state.exportData) 