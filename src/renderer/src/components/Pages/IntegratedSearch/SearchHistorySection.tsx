import React from 'react'
import { SearchFilters } from '../../../types/api'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { 
  History, 
  Clock, 
  Users, 
  Search,
  ArrowRight,
  Trash2
} from 'lucide-react'

interface SearchHistory {
  id: string
  timestamp: string
  filters: SearchFilters
  totalResults: number
  searchTime: number
}

interface SearchHistorySectionProps {
  searchHistory: SearchHistory[]
  onUseHistoryFilters: (filters: SearchFilters) => void
  onSwitchToFilters: () => void
}

export const SearchHistorySection: React.FC<SearchHistorySectionProps> = ({
  searchHistory,
  onUseHistoryFilters,
  onSwitchToFilters
}) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  const formatSearchTime = (time: number) => {
    return `${(time / 1000).toFixed(1)}秒`
  }

  const getFilterSummary = (filters: SearchFilters) => {
    const summary: string[] = []
    
    if (filters.last_name && filters.last_name.length > 0) {
      summary.push(`姓氏: ${filters.last_name.slice(0, 2).join(', ')}${filters.last_name.length > 2 ? '...' : ''}`)
    }
    
    if (filters.location && filters.location.length > 0) {
      summary.push(`地点: ${filters.location.slice(0, 2).map(l => l.v).join(', ')}${filters.location.length > 2 ? '...' : ''}`)
    }
    
    if (filters.job_title && filters.job_title.length > 0) {
      summary.push(`职位: ${filters.job_title.slice(0, 2).map(j => j.v).join(', ')}${filters.job_title.length > 2 ? '...' : ''}`)
    }
    
    if (filters.company_industry && filters.company_industry.length > 0) {
      summary.push(`行业: ${filters.company_industry.slice(0, 2).join(', ')}${filters.company_industry.length > 2 ? '...' : ''}`)
    }
    
    if (filters.company_size && filters.company_size.length > 0) {
      summary.push(`规模: ${filters.company_size.slice(0, 2).join(', ')}${filters.company_size.length > 2 ? '...' : ''}`)
    }
    
    return summary.length > 0 ? summary.join(' | ') : '无特定条件'
  }

  const handleUseFilters = (filters: SearchFilters) => {
    onUseHistoryFilters(filters)
    onSwitchToFilters()
  }

  if (searchHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <History className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无搜索历史</h3>
        <p className="text-gray-600">执行搜索后，历史记录将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">搜索历史记录</h3>
        <div>
          <Badge className="bg-blue-100 text-blue-800">
            {searchHistory.length} 条记录
          </Badge>
        </div>
      </div>
      
      <div className="space-y-4">
        {searchHistory.map((history) => (
          <Card key={history.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDate(history.timestamp)}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  {history.totalResults.toLocaleString()} 个结果
                  <span>•</span>
                  {formatSearchTime(history.searchTime)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <CardDescription className="mb-4">
                {getFilterSummary(history.filters)}
              </CardDescription>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    {history.totalResults.toLocaleString()} 个潜在客户
                  </Badge>
                  
                  {history.totalResults > 2500 && (
                    <Badge className="bg-orange-100 text-orange-800">
                      需要多个列表
                    </Badge>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUseFilters(history.filters)}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  使用此条件
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">
          最多保存最近 10 次搜索记录
        </p>
      </div>
    </div>
  )
} 