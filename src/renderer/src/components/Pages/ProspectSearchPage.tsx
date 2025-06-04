import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { getWizaApi } from '../../services/wizaApi'
import { JobTitleFilter } from '../../types/api'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { 
  Search, 
  Users, 
  MapPin, 
  Building, 
  Briefcase,
  Clock,
  TrendingUp,
  Filter,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import type { SearchResponse, SearchFilters } from '../../types/api'

interface SearchHistory {
  id: string
  timestamp: string
  filters: SearchFilters
  totalResults: number
  searchTime: number
}

const ProspectSearchPage: React.FC = () => {
  const { 
    searchFilters, 
    apiKey, 
    isLoading,
    setLoading,
    setCurrentPage
  } = useAppStore()

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number>(0)

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
    const updatedHistory = [newHistory, ...searchHistory.slice(0, 9)] // 保留最近10条
    setSearchHistory(updatedHistory)
    localStorage.setItem('wiza-search-history', JSON.stringify(updatedHistory))
  }

  // 执行搜索
  const handleSearch = async () => {
    if (!apiKey) {
      setSearchError('请先配置API密钥')
      setCurrentPage('api-config')
      return
    }

    if (!searchFilters || Object.keys(searchFilters).length === 0) {
      setSearchError('请先设置搜索条件')
      setCurrentPage('search')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    const startTime = Date.now()

    try {
      const wizaApi = getWizaApi(apiKey)
      const response = await wizaApi.searchProspects(searchFilters)
      
      const endTime = Date.now()
      const duration = endTime - startTime
      setSearchTime(duration)
      
      setSearchResults(response)

      // 保存到搜索历史
      const historyItem: SearchHistory = {
        id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        filters: searchFilters,
        totalResults: response.data?.total || 0,
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

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  // 格式化时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // 格式化搜索条件显示
  const formatFilters = (filters: SearchFilters) => {
    const conditions: string[] = []
    
    if (filters.company_industry && filters.company_industry.length > 0) {
      conditions.push(`行业: ${filters.company_industry.join(', ')}`)
    }
    if (filters.last_name && filters.last_name.length > 0) {
      conditions.push(`姓氏: ${filters.last_name.join(', ')}`)
    }
    if (filters.location && filters.location.length > 0) {
      conditions.push(`地点: ${filters.location.map(l => l.v).join(', ')}`)
    }
    if (filters.job_title && filters.job_title.length > 0) {
      conditions.push(`职位: ${filters.job_title.join(', ')}`)
    }
    if (filters.company_size && filters.company_size.length > 0) {
      conditions.push(`公司规模: ${filters.company_size.join(', ')}`)
    }

    return conditions.length > 0 ? conditions.join(' | ') : '无筛选条件'
  }

  // 重新使用历史搜索条件
  const handleUseHistoryFilters = (filters: SearchFilters) => {
    // 这里应该更新搜索条件到store
    // TODO: 实现搜索条件的重新应用
    setCurrentPage('search')
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">潜在客户搜索</h1>
          <p className="text-gray-600">基于您设置的条件搜索潜在客户数量</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setCurrentPage('search')}
            className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            修改条件
          </Button>
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !apiKey}
            className="bg-lavender-500 hover:bg-lavender-600"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isSearching ? '搜索中...' : '开始搜索'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {searchError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-800">搜索失败</AlertTitle>
          <AlertDescription className="text-red-700">
            {searchError}
          </AlertDescription>
        </Alert>
      )}

      {/* 当前搜索条件 */}
      <Card className="border-lavender-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-lavender-500" />
            当前搜索条件
          </CardTitle>
          <CardDescription>
            以下是您当前设置的搜索筛选条件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {searchFilters && Object.keys(searchFilters).length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {formatFilters(searchFilters)}
              </div>
              <div className="flex flex-wrap gap-2">
                {searchFilters.company_industry?.map((industry: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-lavender-100 text-lavender-700">
                    <Building className="h-3 w-3 mr-1" />
                    {industry}
                  </Badge>
                ))}
                {searchFilters.last_name?.map((name: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700">
                    <Users className="h-3 w-3 mr-1" />
                    {name}
                  </Badge>
                ))}
                {searchFilters.location?.map((loc: any, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-700">
                    <MapPin className="h-3 w-3 mr-1" />
                    {loc.v}
                  </Badge>
                ))}
                {searchFilters.job_title?.map((title: JobTitleFilter, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-700">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {title.v}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Filter className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>尚未设置搜索条件</p>
              <div className="mb-3 text-sm text-blue-600">
                点击下方按钮设置搜索条件，其中包括"百家姓筛选"功能
              </div>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => setCurrentPage('search')}
              >
                设置搜索条件
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              搜索结果
            </CardTitle>
            <CardDescription className="text-green-700">
              搜索完成，找到 {formatNumber(searchResults.data?.total || 0)} 个潜在客户
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 结果统计 */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatNumber(searchResults.data?.total || 0)}
                </div>
                <div className="text-sm text-green-700">潜在客户总数</div>
              </div>
              
              {/* 搜索时间 */}
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatDuration(searchTime)}
                </div>
                <div className="text-sm text-blue-700">搜索用时</div>
              </div>
              
              {/* 预估质量 */}
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {searchResults.data?.total > 1000 ? '高' : searchResults.data?.total > 100 ? '中' : '低'}
                </div>
                <div className="text-sm text-purple-700">数据质量</div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* 操作按钮 */}
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setCurrentPage('lists')}
                className="bg-lavender-500 hover:bg-lavender-600"
              >
                <Play className="h-4 w-4 mr-2" />
                创建列表
              </Button>
              <Button 
                variant="outline"
                onClick={() => setCurrentPage('search')}
                className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                调整条件
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索历史 */}
      {searchHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              搜索历史
            </CardTitle>
            <CardDescription>
              最近的搜索记录，点击可重新应用搜索条件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchHistory.slice(0, 5).map((history) => (
                <div 
                  key={history.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUseHistoryFilters(history.filters)}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {formatFilters(history.filters)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(history.timestamp).toLocaleString('zh-CN')} • 
                      找到 {formatNumber(history.totalResults)} 个结果 • 
                      用时 {formatDuration(history.searchTime)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatNumber(history.totalResults)}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索提示 */}
      {!searchResults && !isSearching && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                准备开始搜索
              </h3>
              <p className="text-blue-700 mb-4">
                点击"开始搜索"按钮来查看基于您的筛选条件能找到多少潜在客户
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-600">
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  实时数据统计
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  精准匹配算法
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  高质量数据源
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProspectSearchPage
