import React from 'react'
import { useAppStore } from '../../../stores/appStore'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { AlertCircle } from 'lucide-react'

// 导入拆分后的组件
import { SearchSettings } from './components/SearchSettings'
import { SearchProgress } from './components/SearchProgress'
import ListSelector from './components/ListSelector'
import { SearchControls } from './components/SearchControls'
import { useContinueSearch } from './hooks/useContinueSearch'

const ContinueSearchPage: React.FC = () => {
  const { currentLists } = useAppStore()
  
  const {
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
  } = useContinueSearch()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">连续搜索</h1>
          <p className="text-gray-600">基于现有列表继续搜索更多潜在客户</p>
        </div>
      </div>

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

      {/* 列表选择器 */}
      <ListSelector 
        availableLists={availableLists}
        selectedListId={settings.selectedListId}
        onSelectList={(listId) => setSettings(prev => ({ ...prev, selectedListId: listId }))}
        onRefreshLists={handleRefreshLists}
      />

      {/* 搜索设置 */}
      {settings.selectedListId && selectedList && (
        <SearchSettings 
          settings={settings}
          setSettings={setSettings}
          selectedList={selectedList}
        />
      )}

      {/* 搜索控制 */}
      {settings.selectedListId && (
        <SearchControls 
          isSearching={isSearching}
          onStart={handleStartContinueSearch}
          onStop={handleStopSearch}
        />
      )}

      {/* 搜索进度 */}
      {isSearching && (
        <SearchProgress 
          progress={searchProgress}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          searchResults={searchResults}
        />
      )}
    </div>
  )
}

export default ContinueSearchPage 