import { useState } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'
import { SearchFilters } from '../../../../types/api'

export const useSearchFilters = () => {
  const { apiKey, isApiKeyValid, setError, setLoading } = useAppStore()
  
  const [filters, setFilters] = useState<SearchFilters>({
    company_industry: [],
    last_name: [],
    location: [],
    job_title: [],
    company_size: [],
    job_title_level: [],
    job_role: []
  })
  
  const [searchResult, setSearchResult] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!isApiKeyValid || !apiKey) {
      setError('请先配置有效的API密钥')
      return
    }

    // 检查是否有任何筛选条件
    const hasFilters = Object.values(filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    )

    if (!hasFilters) {
      setError('请至少设置一个筛选条件')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const wizaApi = getWizaApi(apiKey)
      const result = await wizaApi.searchProspects(filters)
      
      setSearchResult(result)
      
      if (result.data.total === 0) {
        setError('未找到符合条件的潜在客户，请调整筛选条件')
      }
    } catch (error: any) {
      console.error('搜索失败:', error)
      setError(error.message || '搜索失败，请检查网络连接和API配置')
    } finally {
      setIsSearching(false)
    }
  }

  const handleCreateList = async () => {
    if (!searchResult || !isApiKeyValid || !apiKey) {
      setError('无法创建列表：缺少搜索结果或API配置')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const wizaApi = getWizaApi(apiKey)
      const listName = `搜索列表_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`
      const maxProfiles = Math.min(searchResult.data.total, 2500)

      const listData = {
        list: {
          name: listName,
          max_profiles: maxProfiles,
          enrichment_level: 'partial' as const,
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        },
        filters
      }

      const result = await wizaApi.createProspectList(listData)
      
      // 显示成功消息
      alert(`列表创建成功！\n列表ID: ${result.data.id}\n列表名称: ${listName}\n预计包含: ${maxProfiles} 个联系人`)
      
      // 清除搜索结果
      setSearchResult(null)
      
    } catch (error: any) {
      console.error('创建列表失败:', error)
      setError(error.message || '创建列表失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      company_industry: [],
      last_name: [],
      location: [],
      job_title: [],
      company_size: [],
      job_title_level: [],
      job_role: []
    })
    setSearchResult(null)
    setError(null)
  }

  const handleCopyFilters = () => {
    const filtersText = JSON.stringify(filters, null, 2)
    navigator.clipboard.writeText(filtersText).then(() => {
      alert('筛选条件已复制到剪贴板')
    }).catch(() => {
      setError('复制失败，请手动复制')
    })
  }

  return {
    filters,
    setFilters,
    searchResult,
    isSearching,
    handleSearch,
    handleCreateList,
    handleClearFilters,
    handleCopyFilters
  }
} 