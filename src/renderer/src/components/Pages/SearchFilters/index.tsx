import React, { useState } from 'react'
import { useAppStore } from '../../../stores/appStore'
import { SearchFilters } from '../../../types/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { Button } from '../../ui/button'
import { AlertTriangle, CheckCircle, Search, Trash2, Copy } from 'lucide-react'

// 导入拆分后的组件
import { IndustryFilter } from './components/IndustryFilter'
import { LocationFilter } from './components/LocationFilter'
import { JobTitleFilter } from './components/JobTitleFilter'
import { CompanySizeFilter } from './components/CompanySizeFilter'
import { JobLevelFilter } from './components/JobLevelFilter'
import { JobRoleFilter } from './components/JobRoleFilter'
import LastNameFilter from './components/LastNameFilter'
import { useSearchFilters } from './hooks/useSearchFilters'

const SearchFiltersPage: React.FC = () => {
  const { apiKey, isApiKeyValid } = useAppStore()
  
  const {
    filters,
    setFilters,
    searchResult,
    isSearching,
    handleSearch,
    handleCreateList,
    handleClearFilters,
    handleCopyFilters
  } = useSearchFilters()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">搜索条件设置</h1>
          <p className="text-gray-600 mt-1">设置详细的筛选条件来精确查找潜在客户</p>
        </div>
      </div>

      {/* API状态检查 */}
      {!isApiKeyValid && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertTitle className="text-yellow-800">API配置提醒</AlertTitle>
          <AlertDescription className="text-yellow-700">
            请先在API配置页面设置有效的API密钥才能使用搜索功能
          </AlertDescription>
        </Alert>
      )}

      {/* 筛选条件区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧筛选条件 */}
        <div className="space-y-6">
          <div className="space-y-4">
            <LastNameFilter 
              filters={filters}
              setFilters={setFilters}
            />
            
            <LocationFilter 
              filters={filters}
              setFilters={setFilters}
            />
          </div>
          
          <JobTitleFilter 
            filters={filters}
            setFilters={setFilters}
          />
          
          <JobLevelFilter 
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* 右侧筛选条件 */}
        <div className="space-y-6">
          <IndustryFilter 
            filters={filters}
            setFilters={setFilters}
          />
          
          <CompanySizeFilter 
            filters={filters}
            setFilters={setFilters}
          />
          
          <JobRoleFilter 
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索操作</CardTitle>
        </CardHeader>
        <CardContent>
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
              <Trash2 className="h-4 w-4 mr-2" />
              清除条件
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCopyFilters}
              disabled={isSearching}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制条件
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 搜索结果 */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              搜索结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6">
              <div className="text-4xl font-bold text-primary mb-2">
                {searchResult.data.total.toLocaleString()}
              </div>
              <div className="text-gray-600 mb-4">找到的潜在客户</div>
              
              <Button 
                onClick={handleCreateList}
                disabled={isSearching}
                size="lg"
              >
                创建潜在客户列表
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SearchFiltersPage
