import { useState, useEffect } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'

export const useListManagement = () => {
  const { 
    currentLists, 
    apiKey,
    setLoading,
    updateList
  } = useAppStore()

  const [showCreateForm, setShowCreateForm] = useState(false)

  // 从API加载列表
  useEffect(() => {
    const loadListsFromApi = async () => {
      if (!apiKey) return
      
      console.log('开始从API刷新列表状态')
      
      // 如果本地有列表，直接刷新它们的状态
      if (currentLists.length > 0) {
        // 不调用setLoading，让enhancedRefreshLists自己管理加载状态
        enhancedRefreshLists()
      } else {
        console.log('本地没有列表数据。请创建新列表或等待之前创建的列表同步。')
        // 注意：根据API规范，没有获取所有列表的端点
        // 用户必须创建新列表或依赖本地存储的列表ID
      }
    }
    
    loadListsFromApi()
  }, [apiKey]) // 仅在apiKey变化时执行

  // 监控列表状态
  const startListMonitoring = (listId: string) => {
    if (!apiKey) return

    const checkStatus = async () => {
      try {
        console.log(`开始检查列表 ${listId} 的状态`)
        const wizaApi = getWizaApi(apiKey)
        const status = await wizaApi.getListStatus(listId)
        
        console.log(`列表 ${listId} 的完整状态响应:`, JSON.stringify(status, null, 2))
        
        // 根据OpenAPI规范，正确地获取stats数据
        const apiData = status.data
        const peopleCount = apiData.stats?.people || 0
        
        console.log(`列表 ${listId} 解析的联系人数量: ${peopleCount}`)
        console.log(`列表 ${listId} 当前状态: ${apiData.status}`)
        
        // 获取当前列表的目标数量
        const currentList = currentLists.find(list => list.id === listId)
        const maxProfiles = currentList?.maxProfiles || 1000
        
        // 计算进度百分比
        let progress = 0
        if (apiData.status === 'finished') {
          progress = 100
        } else if (apiData.status === 'failed') {
          progress = 0
        } else if (apiData.status === 'queued') {
          progress = 10
        } else if (apiData.status === 'processing' || apiData.status === 'scraping') {
          // 对于处理中的状态，根据联系人数量估算进度
          progress = Math.min(Math.round((peopleCount / maxProfiles) * 90), 90) // 最多显示90%，直到完成
        }
        
        console.log(`列表 ${listId} 计算的进度: ${progress}%`)
        
        // 更新列表状态
        const updateData = {
          status: apiData.status,
          progress: progress,
          // 重要：确保totalProfiles显示API返回的实际联系人数量
          totalProfiles: peopleCount,
          updatedAt: new Date().toISOString()
        }
        
        console.log(`列表 ${listId} 更新数据:`, updateData)
        updateList(listId, updateData)

        // 如果列表还在处理中，继续监控
        if (apiData.status === 'processing' || apiData.status === 'queued' || apiData.status === 'scraping') {
          console.log(`列表 ${listId} 仍在处理中，30秒后继续检查`)
          setTimeout(checkStatus, 30000) // 每30秒检查一次，更频繁的更新
        } else {
          console.log(`列表 ${listId} 已完成或失败，停止监控`)
        }
      } catch (error) {
        console.error(`监控列表 ${listId} 状态失败:`, error)
        // 如果API调用失败，可能是网络问题，继续尝试监控
        if (error instanceof Error && !error.message.includes('404')) {
          console.log(`列表 ${listId} 监控遇到错误，60秒后重试`)
          setTimeout(checkStatus, 60000) // 1分钟后重试
        } else {
          console.log(`列表 ${listId} 不存在或其他严重错误，停止监控`)
        }
      }
    }

    // 立即检查一次，然后开始定期检查
    return checkStatus()
  }

  // 增强的刷新列表功能
  const enhancedRefreshLists = async () => {
    if (!apiKey || currentLists.length === 0) {
      console.log('无法刷新列表：缺少API密钥或没有列表')
      return
    }

    setLoading(true)
    
    try {
      console.log(`开始刷新 ${currentLists.length} 个列表的状态`)
      
      const wizaApi = getWizaApi(apiKey)
      let successCount = 0
      let failCount = 0
      
      // 按顺序处理每个列表，避免并发请求过多
      for (const list of currentLists) {
        try {
          console.log(`刷新列表 ${list.id} 状态`)
          const status = await wizaApi.getListStatus(list.id)
          
          console.log(`列表 ${list.id} 的状态:`, status.data)
          
          // 正确地获取stats数据
          const peopleCount = status.data.stats?.people || 0
          
          // 计算进度百分比
          let progress = 0
          if (status.data.status === 'finished') {
            progress = 100
          } else if (status.data.status === 'failed') {
            progress = 0
          } else if (status.data.status === 'queued') {
            progress = 10
          } else if (status.data.status === 'processing' || status.data.status === 'scraping') {
            // 对于处理中的状态，根据联系人数量和目标数量估算进度
            const maxProfiles = list.maxProfiles || 1000
            progress = Math.min(Math.round((peopleCount / maxProfiles) * 90), 90) // 最多显示90%，直到完成
          }
          
          // 更新列表状态
          updateList(list.id, {
            status: status.data.status,
            progress: progress,
            totalProfiles: peopleCount,
            updatedAt: new Date().toISOString()
          })
          
          successCount++;
          
          // 如果列表状态是processing，启动监控
          if (status.data.status === 'processing' || status.data.status === 'queued' || status.data.status === 'scraping') {
            startListMonitoring(list.id)
          }
        } catch (error) {
          console.error(`刷新列表 ${list.id} 失败:`, error)
          failCount++;
        }
        
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      console.log(`列表刷新完成: 成功 ${successCount}/${currentLists.length} 个, 失败 ${failCount} 个`)
      
      if (successCount === 0) {
        alert('所有列表刷新失败，请检查API密钥和网络连接')
      } else if (failCount > 0) {
        alert(`部分列表刷新失败，${successCount}/${currentLists.length} 个列表已更新`)
      } else {
        alert('所有列表刷新成功')
      }
    } catch (error) {
      console.error('刷新列表过程中发生错误:', error)
      alert('刷新列表失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return {
    showCreateForm,
    setShowCreateForm,
    enhancedRefreshLists,
    startListMonitoring
  }
} 