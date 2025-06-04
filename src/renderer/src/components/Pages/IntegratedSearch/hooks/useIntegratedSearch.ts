import { useState, useEffect } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'
import { SearchFilters, SearchResponse } from '../../../../types/api'

interface SearchHistory {
  id: string
  timestamp: string
  filters: SearchFilters
  totalResults: number
  searchTime: number
}

export const useIntegratedSearch = () => {
  const { 
    apiKey, 
    isApiKeyValid, 
    addList, 
    setCurrentPage,
    updateList 
  } = useAppStore()
  
  // 搜索条件状态
  const [filters, setFilters] = useState<SearchFilters>({})
  
  // 搜索结果和状态
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number>(0)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  // 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('wiza-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('加载搜索历史失败:', error)
      }
    }
  }, [])

  // 保存搜索历史
  const saveSearchHistory = (newHistory: SearchHistory) => {
    const updatedHistory = [newHistory, ...searchHistory.slice(0, 9)]
    setSearchHistory(updatedHistory)
    localStorage.setItem('wiza-search-history', JSON.stringify(updatedHistory))
  }

  // 搜索功能
  const handleSearch = async () => {
    if (!apiKey || !isApiKeyValid) {
      setSearchError('请先配置有效的API密钥')
      return
    }

    // 检查是否有搜索条件
    const hasFilters = Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    )

    if (!hasFilters) {
      setSearchError('请至少设置一个搜索条件')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSuccessMessage(null)
    const startTime = Date.now()

    // 验证和转换所有筛选条件格式以符合API规范
    const apiReadyFilters: SearchFilters = {
      ...filters,
      company_industry: filters.company_industry || [],
      last_name: filters.last_name || [],
      location: filters.location || [],
      job_title: filters.job_title || [],
      company_size: filters.company_size || []
    }

    try {
      const wizaApi = getWizaApi(apiKey)
      const result = await wizaApi.searchProspects(apiReadyFilters, 30)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      setSearchTime(duration)
      setSearchResults(result)
      
      // 保存搜索历史
      const historyItem: SearchHistory = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        filters: apiReadyFilters,
        totalResults: result.data.total,
        searchTime: duration
      }
      saveSearchHistory(historyItem)
      
    } catch (error) {
      console.error('搜索失败:', error)
      setSearchError(error instanceof Error ? error.message : '搜索失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  // 创建列表功能
  const handleCreateList = async () => {
    if (!searchResults || !isApiKeyValid || !apiKey) {
      setSearchError('请先进行搜索')
      return
    }

    const totalResults = searchResults.data.total
    const maxProfiles = Math.min(totalResults, 2500)
    const listName = `搜索列表_${new Date().toLocaleDateString()}`

    setIsCreatingList(true)
    setSearchError(null)

    try {
      const wizaApi = getWizaApi(apiKey)
      const result = await wizaApi.createProspectList({
        filters,
        list: {
          name: listName,
          max_profiles: maxProfiles,
          enrichment_level: 'partial',
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        }
      })
      
      // 检查API响应结构
      if (!result.data || !result.data.id) {
        throw new Error('API响应格式错误：缺少列表ID')
      }

      // 添加到本地状态
      const newList = {
        id: String(result.data.id),
        name: listName,
        status: result.data.status || 'queued',
        totalProfiles: maxProfiles,
        progress: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        filters: filters
      }

      addList(newList)

      // 显示成功消息
      const successMessage = totalResults > 2500 
        ? `列表创建成功！已创建包含前${formatNumber(maxProfiles)}个联系人的列表。剩余${formatNumber(totalResults - maxProfiles)}个联系人可通过创建新列表获取。`
        : `列表创建成功！已创建包含${formatNumber(maxProfiles)}个联系人的列表。`
      
      setSearchError(null)
      setSearchResults(null)
      setSuccessMessage(successMessage)
      
      // 启动列表状态监控
      startListMonitoring(String(result.data.id))
      
      // 跳转到列表管理页面
      setTimeout(() => {
        setCurrentPage('lists')
        setSuccessMessage(null)
      }, 3000)
      
    } catch (error) {
      console.error('创建列表失败:', error)
      setSearchError(error instanceof Error ? error.message : '创建列表失败，请重试')
    } finally {
      setIsCreatingList(false)
    }
  }

  // 监控列表状态
  const startListMonitoring = (listId: string) => {
    if (!apiKey) return

    const checkStatus = async () => {
      try {
        const wizaApi = getWizaApi(apiKey)
        const status = await wizaApi.getListStatus(listId)
        
        const peopleCount = status.data.stats?.people || 0
        
        updateList(listId, {
          status: status.data.status,
          progress: status.data.status === 'finished' ? 100 : 
                  status.data.status === 'failed' ? 0 : 
                  Math.round((peopleCount / 100) * 10),
          totalProfiles: peopleCount,
          updatedAt: new Date().toISOString()
        })

        if (status.data.status === 'processing' || status.data.status === 'queued') {
          setTimeout(checkStatus, 60000)
        }
      } catch (error) {
        console.error(`监控列表 ${listId} 状态失败:`, error)
      }
    }

    checkStatus()
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  // 使用历史搜索条件
  const handleUseHistoryFilters = (historyFilters: SearchFilters) => {
    setFilters(historyFilters)
    setSearchError(null)
    setSuccessMessage(null)
  }

  // 清除搜索条件
  const handleClearFilters = () => {
    setFilters({})
    setSearchResults(null)
    setSearchError(null)
    setSuccessMessage(null)
  }

  return {
    filters,
    setFilters,
    searchResults,
    isSearching,
    isCreatingList,
    searchError,
    successMessage,
    searchTime,
    searchHistory,
    handleSearch,
    handleCreateList,
    handleUseHistoryFilters,
    handleClearFilters
  }
} 