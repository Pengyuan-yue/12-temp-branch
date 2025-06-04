import React, { useState } from 'react'
import { useAppStore } from '../../../stores/appStore'
import { SearchFilters, SearchResponse } from '../../../types/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { AlertCircle, CheckCircle, Search, Users, Plus, X } from 'lucide-react'
import { useIntegratedSearch } from './hooks/useIntegratedSearch'

const IntegratedSearchPage: React.FC = () => {
  const { apiKey, isApiKeyValid } = useAppStore()
  
  // 使用自定义Hook管理搜索状态
  const {
    filters,
    setFilters,
    searchResults,
    isSearching,
    isCreatingList,
    searchError,
    successMessage,
    searchHistory,
    handleSearch,
    handleCreateList,
    handleClearFilters,
    handleUseHistoryFilters
  } = useIntegratedSearch()

  const [activeTab, setActiveTab] = useState<'filters' | 'results' | 'history'>('filters')
  const [newLastName, setNewLastName] = useState('')

  // 添加姓氏
  const handleAddLastName = () => {
    if (newLastName.trim() && !filters.last_name?.includes(newLastName.trim())) {
      setFilters({
        ...filters,
        last_name: [...(filters.last_name || []), newLastName.trim()]
      })
      setNewLastName('')
    }
  }

  // 移除姓氏
  const handleRemoveLastName = (lastName: string) => {
    setFilters({
      ...filters,
      last_name: filters.last_name?.filter(name => name !== lastName) || []
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">智能搜索</h1>
          <p className="text-gray-600 mt-1">设置搜索条件，查找潜在客户并创建列表</p>
        </div>
      </div>

      {/* API状态检查 */}
      {!isApiKeyValid && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-800">API配置提醒</AlertTitle>
          <AlertDescription className="text-yellow-700">
            请先在API配置页面设置有效的API密钥
          </AlertDescription>
        </Alert>
      )}

      {/* 错误提示 */}
      {searchError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-800">操作失败</AlertTitle>
          <AlertDescription className="text-red-700">
            {searchError}
          </AlertDescription>
        </Alert>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">操作成功</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* 主要内容区域 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索配置</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">搜索条件</TabsTrigger>
              <TabsTrigger value="results">搜索结果</TabsTrigger>
              <TabsTrigger value="history">搜索历史</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="mt-6">
              <div className="space-y-6">
                {/* 姓氏筛选 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      姓氏筛选
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="输入姓氏，如：张、李、王"
                        value={newLastName}
                        onChange={(e) => setNewLastName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLastName()}
                      />
                      <Button onClick={handleAddLastName} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {filters.last_name && filters.last_name.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {filters.last_name.map((lastName, index) => (
                          <div key={`lastname-${index}`} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
                            {lastName}
                            <X 
                              className="h-3 w-3 cursor-pointer" 
                              onClick={() => handleRemoveLastName(lastName)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !isApiKeyValid}
                    className="flex-1"
                  >
                    {isSearching ? (
                      <>
                        <Search className="h-4 w-4 mr-2 animate-spin" />
                        搜索中...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        开始搜索
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    disabled={isSearching}
                  >
                    清除条件
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-primary animate-spin mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">正在搜索中...</h3>
                  <p className="text-gray-600">请稍候，我们正在为您查找潜在客户</p>
                </div>
              ) : !searchResults ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无搜索结果</h3>
                  <p className="text-gray-600">请先在"搜索条件"标签页设置筛选条件并执行搜索</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>搜索结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {searchResults.data.total.toLocaleString()}
                        </div>
                        <div className="text-gray-600">找到的潜在客户</div>
                      </div>
                      
                      <Button 
                        onClick={handleCreateList}
                        disabled={isCreatingList}
                        className="w-full mt-4"
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              {searchHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无搜索历史</h3>
                  <p className="text-gray-600">执行搜索后，历史记录将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((history) => (
                    <Card key={history.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              {new Date(history.timestamp).toLocaleString('zh-CN')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {history.totalResults.toLocaleString()} 个结果
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleUseHistoryFilters(history.filters)
                              setActiveTab('filters')
                            }}
                          >
                            使用此条件
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default IntegratedSearchPage 