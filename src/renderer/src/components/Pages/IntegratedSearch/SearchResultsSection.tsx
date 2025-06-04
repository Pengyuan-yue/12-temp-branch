import React from 'react'
import { SearchResponse } from '../../../types/api'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { 
  Search, 
  Users, 
  Clock, 
  Plus,
  TrendingUp,
  Building,
  MapPin
} from 'lucide-react'

interface SearchResultsSectionProps {
  searchResults: SearchResponse | null
  isSearching: boolean
  isCreatingList: boolean
  onCreateList: () => void
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  searchResults,
  isSearching,
  isCreatingList,
  onCreateList
}) => {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">正在搜索中...</h3>
        <p className="text-gray-600">请稍候，我们正在为您查找潜在客户</p>
      </div>
    )
  }

  if (!searchResults) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Search className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无搜索结果</h3>
        <p className="text-gray-600">请先在"搜索条件"标签页设置筛选条件并执行搜索</p>
      </div>
    )
  }

  const { data } = searchResults
  const totalResults = data.total
  const maxProfiles = Math.min(totalResults, 2500)

  return (
    <div className="space-y-6">
      {/* 搜索结果概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            搜索结果概览
          </CardTitle>
          <CardDescription>
            基于您的搜索条件找到的潜在客户统计
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{totalResults.toLocaleString()}</div>
              <div className="text-sm text-gray-600">找到的潜在客户</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Plus className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{maxProfiles.toLocaleString()}</div>
              <div className="text-sm text-gray-600">可创建列表数量</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {totalResults > 2500 ? Math.ceil(totalResults / 2500) : 1}
              </div>
              <div className="text-sm text-gray-600">需要的列表数量</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 样本数据预览 */}
      {data.profiles && data.profiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              样本数据预览
            </CardTitle>
            <CardDescription>
              以下是搜索结果中的部分样本数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.profiles.slice(0, 5).map((profile, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{profile.full_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{profile.job_title}</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Building className="h-4 w-4" />
                          {profile.job_company_name}
                        </div>
                        
                        {profile.location_name && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            {profile.location_name}
                          </div>
                        )}
                      </div>
                      
                      {profile.industry && (
                        <Badge variant="secondary" className="mt-2">
                          {profile.industry}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {data.profiles.length > 5 && (
                <div className="text-center py-4 text-gray-500">
                  还有 {(totalResults - 5).toLocaleString()} 个潜在客户...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 创建列表操作 */}
      <Card>
        <CardHeader>
          <CardTitle>创建潜在客户列表</CardTitle>
          <CardDescription>
            {totalResults > 2500 
              ? `由于API限制，每个列表最多包含2,500个联系人。您可以创建多个列表来获取所有${totalResults.toLocaleString()}个潜在客户。`
              : `创建包含所有${totalResults.toLocaleString()}个潜在客户的列表。`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">列表配置信息</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 列表名称：搜索列表_{new Date().toLocaleDateString()}</li>
                <li>• 联系人数量：{maxProfiles.toLocaleString()} 个</li>
                <li>• 丰富度等级：部分丰富（包含邮箱）</li>
                <li>• 邮箱类型：工作邮箱、个人邮箱、通用邮箱</li>
              </ul>
            </div>
            
            <Button 
              onClick={onCreateList}
              disabled={isCreatingList}
              className="w-full"
              size="lg"
            >
              {isCreatingList ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  正在创建列表...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  创建潜在客户列表
                </>
              )}
            </Button>
            
            {totalResults > 2500 && (
              <p className="text-sm text-gray-600 text-center">
                创建此列表后，您可以重复搜索来创建更多列表获取剩余的潜在客户
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 