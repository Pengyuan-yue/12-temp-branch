import React from 'react'
import { useAppStore } from '../../../stores/appStore'
import { Card, CardContent } from '../../ui/card'
import { Button } from '../../ui/button'
import { Plus, RefreshCw } from 'lucide-react'

// 导入拆分后的组件
import { CreateListForm } from './components/CreateListForm'
import { ListGrid } from './components/ListGrid'
import { ListStats } from './components/ListStats'
import { useListManagement } from './hooks/useListManagement'

const ListManagementPage: React.FC = () => {
  const { currentLists, isLoading } = useAppStore()
  
  const {
    showCreateForm,
    setShowCreateForm,
    enhancedRefreshLists
  } = useListManagement()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">列表管理</h1>
          <p className="text-gray-600">管理您的潜在客户列表，监控创建进度</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={enhancedRefreshLists}
            variant="outline"
            disabled={isLoading || currentLists.length === 0}
            className="mr-2"
            data-testid="refresh-lists-button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '刷新中...' : '刷新列表'}
          </Button>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-lavender-500 hover:bg-lavender-600"
            data-testid="create-list-button"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建新列表
          </Button>
        </div>
      </div>

      {/* 创建列表表单 */}
      {showCreateForm && (
        <CreateListForm 
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {/* 列表展示 */}
      {currentLists.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-gray-500 mb-4">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">暂无列表</h3>
              <p>点击"创建新列表"开始您的第一个潜在客户搜索</p>
            </div>
            <Button 
              onClick={() => setShowCreateForm(true)}
              className="bg-lavender-500 hover:bg-lavender-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建新列表
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <ListGrid />
          <ListStats />
        </>
      )}
    </div>
  )
}

export default ListManagementPage 