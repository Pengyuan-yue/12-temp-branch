import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'
import { 
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

export const useListActions = () => {
  const { 
    removeList,
    setSelectedList,
    setCurrentPage,
    apiKey,
    searchFilters,
    addList,
    setLoading
  } = useAppStore()

  // 状态图标映射
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Loader2
      case 'queued':
        return Loader2
      case 'processing':
        return Loader2
      case 'scraping':
        return Loader2
      case 'finished':
        return CheckCircle
      case 'failed':
        return XCircle
      default:
        return AlertCircle
    }
  }

  // 状态文本映射
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'queued':
        return '队列中'
      case 'processing':
        return '处理中'
      case 'scraping':
        return '数据采集中'
      case 'finished':
        return '已完成'
      case 'failed':
        return '失败'
      default:
        return '未知'
    }
  }

  // 删除列表
  const handleDeleteList = (listId: string) => {
    if (confirm('确定要删除这个列表吗？此操作不可撤销。')) {
      removeList(listId)
    }
  }

  // 查看列表详情
  const handleViewList = (list: any) => {
    setSelectedList(list)
    setCurrentPage('export')
  }

  // 导出列表
  const handleExportList = (list: any) => {
    setSelectedList(list)
    setCurrentPage('export')
  }

  // 继续搜索
  const handleContinueSearch = (list: any) => {
    setSelectedList(list)
    setCurrentPage('continue-search')
  }

  // 重试创建列表
  const handleRetryList = async (list: any) => {
    if (!apiKey) {
      alert('请先配置API密钥')
      return
    }

    // 检查是否有搜索条件
    const hasFilters = searchFilters && Object.values(searchFilters).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    )

    if (!hasFilters) {
      alert('请先在搜索条件页面设置筛选条件')
      return
    }

    setLoading(true)

    try {
      const wizaApi = getWizaApi(apiKey)
      
      const listData = {
        list: {
          name: `${list.name}_重试_${new Date().toLocaleDateString()}`,
          max_profiles: list.maxProfiles || 1000,
          enrichment_level: list.enrichmentLevel || 'partial',
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        },
        filters: searchFilters
      }

      console.log('重试创建列表请求数据:', listData)
      
      const result = await wizaApi.createProspectList(listData)
      
      console.log('列表重试创建成功:', result)

      // 添加到本地状态
      const newList = {
        id: result.data.id.toString(),
        name: listData.list.name,
        status: result.data.status || 'queued',
        progress: 0,
        totalProfiles: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        enrichmentLevel: list.enrichmentLevel || 'partial',
        maxProfiles: list.maxProfiles || 1000
      }

      addList(newList)

      // 显示成功消息
      alert(`列表重试创建成功！\n列表ID: ${result.data.id}\n列表名称: ${listData.list.name}\n状态: ${result.data.status}`)
      
    } catch (error: any) {
      console.error('重试创建列表失败:', error)
      alert('重试创建列表失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return {
    handleDeleteList,
    handleViewList,
    handleExportList,
    handleContinueSearch,
    handleRetryList,
    getStatusIcon,
    getStatusText
  }
} 