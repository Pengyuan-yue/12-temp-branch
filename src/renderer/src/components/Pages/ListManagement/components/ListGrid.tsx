import React from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { Card, CardContent } from '../../../ui/card'
import { Button } from '../../../ui/button'
import { 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../../ui/dropdown-menu'
import { useListActions } from '../hooks/useListActions'

export const ListGrid: React.FC = () => {
  const { currentLists } = useAppStore()
  
  const {
    handleDeleteList,
    handleViewList,
    handleExportList,
    handleContinueSearch,
    handleRetryList,
    getStatusIcon,
    getStatusText
  } = useListActions()

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finished':
        return 'bg-green-100 text-green-800'
      case 'running':
      case 'processing':
      case 'scraping':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid gap-4">
      {currentLists.map((list) => (
        <Card key={list.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-medium text-gray-900">{list.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      ID: {list.id}
                    </span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">
                      创建时间: {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                    {list.updatedAt !== list.createdAt && (
                      <>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          更新时间: {new Date(list.updatedAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(list.status)}`}>
                      {getStatusText(list.status)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {list.totalProfiles} 个联系人
                    </span>
                  </div>
                  {list.status === 'running' && (
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${list.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{list.progress}%</span>
                      </div>
                    </div>
                  )}
                  {list.status === 'failed' && (
                    <div className="mt-1">
                      <span className="text-xs text-red-600">
                        列表创建失败，可能是搜索条件过于严格或API限制
                      </span>
                    </div>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => handleViewList(list)}
                      disabled={list.status === 'failed' || list.totalProfiles === 0}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleExportList(list)}
                      disabled={list.status !== 'finished' || list.totalProfiles === 0}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      导出数据
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleContinueSearch(list)}
                      disabled={list.status === 'failed' || list.status === 'queued'}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      继续搜索
                    </DropdownMenuItem>
                    {list.status === 'failed' && (
                      <DropdownMenuItem 
                        onClick={() => handleRetryList(list)}
                        className="text-orange-600"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        重试创建
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteList(list.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除列表
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 