import { useState, useEffect } from 'react'
import { useAppStore } from '../../../../stores/appStore'

export const useTaskMonitor = () => {
  const { 
    tasks, 
    isTaskRunning,
    updateTask,
    removeTask,
    setTaskRunning,
    clearTasks
  } = useAppStore()

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // 任务状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'running':
        return '进行中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      default:
        return '未知'
    }
  }

  // 任务状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 任务类型文本映射
  const getTaskTypeText = (type: string) => {
    switch (type) {
      case 'search':
        return '潜在客户搜索'
      case 'create_list':
        return '创建列表'
      case 'continue_search':
        return '继续搜索'
      case 'export':
        return '数据导出'
      default:
        return '未知任务'
    }
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  // 计算任务持续时间
  const getTaskDuration = (createdAt: string, updatedAt: string) => {
    const created = new Date(createdAt)
    const updated = new Date(updatedAt)
    const duration = updated.getTime() - created.getTime()
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`
    } else {
      return `${seconds}秒`
    }
  }

  // 暂停/恢复任务
  const toggleTaskRunning = () => {
    setTaskRunning(!isTaskRunning)
  }

  // 删除任务
  const handleRemoveTask = (taskId: string) => {
    if (confirm('确定要删除这个任务吗？')) {
      removeTask(taskId)
    }
  }

  // 重试失败的任务
  const retryTask = (taskId: string) => {
    updateTask(taskId, {
      status: 'pending',
      progress: 0,
      message: '等待重试...'
    })
  }

  // 清空所有任务
  const clearAllTasks = () => {
    if (confirm('确定要清空所有任务吗？')) {
      clearTasks()
    }
  }

  // 自动刷新任务状态
  useEffect(() => {
    if (isTaskRunning) {
      const interval = setInterval(async () => {
        // 检查运行中的任务状态
        for (const task of tasks) {
          if (task.status === 'running' && task.data?.listId) {
            try {
              // 获取真实状态
              const { apiKey } = useAppStore.getState()
              if (apiKey) {
                const { getWizaApi } = await import('../../../../services/wizaApi')
                const wizaApi = getWizaApi(apiKey)
                const statusResponse = await wizaApi.getListStatus(task.data.listId)
                
                if (statusResponse.status.code === 200) {
                  const listStatus = statusResponse.data
                  const progress = listStatus.progress || 0
                  
                  updateTask(task.id, {
                    progress: progress,
                    message: `${listStatus.status === 'processing' ? '处理中' : listStatus.status}... ${Math.floor(progress)}%`,
                    status: listStatus.status === 'finished' ? 'completed' : 
                           listStatus.status === 'failed' ? 'failed' : 'running'
                  })
                }
              } else {
                // 没有API密钥时，显示等待状态
                updateTask(task.id, {
                  message: '等待API密钥配置...',
                  status: 'pending'
                })
              }
            } catch (error) {
              console.error('检查任务状态失败:', error)
              // 如果API调用失败，标记任务为失败
              updateTask(task.id, {
                status: 'failed',
                message: `检查状态失败: ${error instanceof Error ? error.message : '未知错误'}`
              })
            }
          }
        }
      }, 5000) // 每5秒检查一次
      
      setRefreshInterval(interval)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [isTaskRunning, tasks, updateTask])

  return {
    toggleTaskRunning,
    handleRemoveTask,
    retryTask,
    clearAllTasks,
    getStatusText,
    getStatusColor,
    getTaskTypeText,
    formatTime,
    getTaskDuration
  }
} 