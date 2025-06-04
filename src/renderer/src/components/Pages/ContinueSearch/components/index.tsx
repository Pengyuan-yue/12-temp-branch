import React from 'react'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { Label } from '../../../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Progress } from '../../../ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Search, 
  List, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Target,
  Users,
  Zap
} from 'lucide-react'

// 自定义Badge包装组件解决类型问题
const CustomBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}> = ({ children, className, variant = "default" }) => {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
      variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground" : 
      variant === "outline" ? "text-foreground" :
      variant === "destructive" ? "border-transparent bg-destructive text-destructive-foreground" :
      "border-transparent bg-primary text-primary-foreground"
    } ${className || ""}`}>
      {children}
    </div>
  );
};

// 列表选择器组件
export const ListSelector: React.FC<{
  availableLists: any[]
  selectedListId: string
  onSelectList: (listId: string) => void
  onRefreshLists: () => void
}> = ({ availableLists, selectedListId, onSelectList, onRefreshLists }) => {
  return (
    <Card className="border-lavender-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lavender-700 flex items-center gap-2">
              <List className="h-5 w-5" />
              选择列表
            </CardTitle>
            <CardDescription>
              选择一个现有列表来继续搜索更多潜在客户
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefreshLists}
            className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新列表
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {availableLists.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>暂无可用列表</p>
            <p className="text-sm mt-1">请先创建一个列表</p>
          </div>
        ) : (
          <div className="space-y-3">
            {availableLists.map((list) => (
              <div
                key={list.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedListId === list.id
                    ? 'border-lavender-300 bg-lavender-50'
                    : 'border-gray-200 hover:border-lavender-200 hover:bg-lavender-25'
                }`}
                onClick={() => onSelectList(list.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{list.name}</h3>
                      <CustomBadge 
                        variant={
                          list.status === 'finished' ? 'default' :
                          list.status === 'running' ? 'secondary' :
                          list.status === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {list.statusText}
                      </CustomBadge>
                      {!list.canContinue && (
                        <CustomBadge variant="outline" className="text-orange-600 border-orange-200">
                          不可继续搜索
                        </CustomBadge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>ID: {list.id}</div>
                      <div>联系人数量: {list.totalProfiles.toLocaleString()}</div>
                      <div>创建时间: {new Date(list.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="ml-4">
                    {list.status === 'finished' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {list.status === 'running' && <Clock className="h-5 w-5 text-blue-500" />}
                    {list.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                    {!['finished', 'running', 'failed'].includes(list.status) && <AlertCircle className="h-5 w-5 text-gray-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 搜索设置组件
export const SearchSettings: React.FC<{
  settings: any
  setSettings: (settings: any) => void
  selectedList: any
}> = ({ settings, setSettings, selectedList }) => {
  return (
    <Card className="border-lavender-200">
      <CardHeader>
        <CardTitle className="text-lavender-700 flex items-center gap-2">
          <Target className="h-5 w-5" />
          搜索设置
        </CardTitle>
        <CardDescription>
          配置连续搜索的参数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxProfiles">最大搜索数量</Label>
            <Input
              id="maxProfiles"
              type="number"
              value={settings.maxProfiles}
              onChange={(e) => setSettings(prev => ({ ...prev, maxProfiles: parseInt(e.target.value) || 0 }))}
              min="1"
              max="10000"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              建议设置为 1000-5000 之间
            </p>
          </div>
          
          <div>
            <Label htmlFor="batchSize">批次大小</Label>
            <Select 
              value={settings.batchSize.toString()} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, batchSize: parseInt(value) }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 (快速)</SelectItem>
                <SelectItem value="250">250 (平衡)</SelectItem>
                <SelectItem value="500">500 (推荐)</SelectItem>
                <SelectItem value="1000">1000 (大批量)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              较大的批次可能更高效，但需要更多时间
            </p>
          </div>
        </div>

        {/* 当前列表信息 */}
        <div className="bg-lavender-25 p-4 rounded-lg">
          <h4 className="font-medium text-lavender-700 mb-2">当前选中列表</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <div>名称: {selectedList.name}</div>
            <div>当前联系人数: {selectedList.totalProfiles.toLocaleString()}</div>
            <div>状态: {selectedList.status}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 搜索控制组件
export const SearchControls: React.FC<{
  isSearching: boolean
  onStart: () => void
  onStop: () => void
}> = ({ isSearching, onStart, onStop }) => {
  return (
    <Card className="border-lavender-200">
      <CardContent className="pt-6">
        <div className="flex justify-center gap-4">
          {!isSearching ? (
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-lavender-500 hover:bg-lavender-600 px-8"
            >
              <Play className="h-5 w-5 mr-2" />
              开始连续搜索
            </Button>
          ) : (
            <Button 
              onClick={onStop}
              variant="outline"
              size="lg"
              className="border-red-300 text-red-600 hover:bg-red-50 px-8"
            >
              <Pause className="h-5 w-5 mr-2" />
              停止搜索
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 搜索进度组件
export const SearchProgress: React.FC<{
  progress: number
  currentBatch: number
  totalBatches: number
  searchResults: any
}> = ({ progress, currentBatch, totalBatches, searchResults }) => {
  return (
    <Card className="border-lavender-200">
      <CardHeader>
        <CardTitle className="text-lavender-700 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          搜索进度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>总体进度</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {totalBatches > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>批次进度</span>
              <span>{currentBatch} / {totalBatches}</span>
            </div>
            <Progress value={(currentBatch / totalBatches) * 100} className="h-2" />
          </div>
        )}

        {searchResults && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">搜索结果</h4>
            <div className="text-sm text-green-600">
              <div>列表ID: {searchResults.data?.id}</div>
              <div>状态: {searchResults.data?.status}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 