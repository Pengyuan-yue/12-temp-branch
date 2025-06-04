import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'

interface ContinueSearchSettings {
  selectedListId: string
  maxProfiles: number
  batchSize: number
  autoMode: boolean
}

export const useContinueSearch = () => {
  const { 
    currentLists, 
    apiKey, 
    isLoading,
    setLoading,
    updateList,
    addTask,
    updateTask
  } = useAppStore()

  const [settings, setSettings] = useState<ContinueSearchSettings>({
    selectedListId: '',
    maxProfiles: 2500,
    batchSize: 500,
    autoMode: false
  })

  const [isSearching, setIsSearching] = useState(false)
  const [searchProgress, setSearchProgress] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [totalBatches, setTotalBatches] = useState(0)
  const [searchResults, setSearchResults] = useState<any>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  // 过滤可用于连续搜索的列表
  const availableLists = useMemo(() => {
    return currentLists.filter(list => {
      // 显示所有列表，但标注状态
      return true
    }).map(list => ({
      ...list,
      canContinue: list.status === 'finished' || list.status === 'running',
      statusText: list.status === 'failed' ? '创建失败' :
                  list.status === 'queued' ? '排队中' :
                  list.status === 'running' ? '处理中' :
                  list.status === 'finished' ? '已完成' : '未知状态'
    }))
  }, [currentLists])

  // 计算批次信息
  useEffect(() => {
    if (settings.maxProfiles && settings.batchSize) {
      const batches = Math.ceil(settings.maxProfiles / settings.batchSize)
      setTotalBatches(batches)
    }
  }, [settings.maxProfiles, settings.batchSize])

  // 获取选中列表的详细信息
  const selectedList = currentLists.find(list => list.id === settings.selectedListId)

  // 刷新列表
  const handleRefreshLists = async () => {
    if (!apiKey) {
      setSearchError('请先配置API密钥')
      return
    }

    setLoading(true)
    setSearchError(null)
    
    try {
      const wizaApi = getWizaApi(apiKey)
      
      // 获取所有列表的最新状态
      const promises = currentLists.map(async (list) => {
        try {
          const status = await wizaApi.getListStatus(list.id)
          
          // 安全地获取数据
          const peopleCount = status.data.stats?.people || 0
          
          // 更新本地列表状态
          updateList(list.id, {
            status: status.data.status,
            progress: status.data.status === 'finished' ? 100 : 
              status.data.status === 'failed' ? 0 : 
              Math.round((peopleCount / 100) * 10),
            totalProfiles: peopleCount,
            updatedAt: new Date().toISOString()
          })
          return { success: true, id: list.id }
        } catch (error) {
          console.error(`刷新列表 ${list.id} 失败:`, error)
          return { success: false, id: list.id, error }
        }
      })
      
      const results = await Promise.all(promises)
      const successCount = results.filter(r => r.success).length
      
      if (successCount === 0 && currentLists.length > 0) {
        setSearchError('所有列表刷新失败，请检查API密钥和网络连接')
      }
      
    } catch (error) {
      console.error('刷新列表失败:', error)
      setSearchError('刷新列表失败: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  // 开始连续搜索
  const handleStartContinueSearch = async () => {
    if (!apiKey) {
      setSearchError('请先配置API密钥')
      return
    }

    if (!settings.selectedListId) {
      setSearchError('请选择要继续搜索的列表')
      return
    }

    if (!selectedList) {
      setSearchError('选中的列表不存在')
      return
    }

    // 检查列表状态
    if (selectedList.status === 'failed') {
      setSearchError('该列表创建失败，无法继续搜索。请选择其他列表或重新创建列表。')
      return
    }

    if (selectedList.status === 'queued') {
      setSearchError('该列表正在排队中，请等待处理完成后再继续搜索。')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchProgress(0)
    setCurrentBatch(0)

    try {
      const wizaApi = getWizaApi(apiKey)
      
      const result = await wizaApi.continueSearch(settings.selectedListId, settings.maxProfiles)
      
      setSearchResults(result)
      setSearchProgress(100)
      
      // 更新列表状态
      updateList(settings.selectedListId, {
        status: result.data.status,
        updatedAt: new Date().toISOString()
      })

      alert(`连续搜索已启动！\n列表ID: ${result.data.id}\n状态: ${result.data.status}`)
      
    } catch (error: any) {
      console.error('连续搜索失败:', error)
      setSearchError('连续搜索失败: ' + (error.message || '未知错误'))
    } finally {
      setIsSearching(false)
    }
  }

  // 停止搜索
  const handleStopSearch = () => {
    setIsSearching(false)
    setSearchProgress(0)
    setCurrentBatch(0)
  }

  return {
    settings,
    setSettings,
    isSearching,
    searchProgress,
    currentBatch,
    totalBatches,
    searchResults,
    searchError,
    availableLists,
    selectedList,
    handleRefreshLists,
    handleStartContinueSearch,
    handleStopSearch
  }
} 