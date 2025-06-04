import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Button } from '../../../ui/button'
import { Progress } from '../../../ui/progress'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause, 
  Play, 
  Trash2,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Timer
} from 'lucide-react'

// 自定义Badge组件
const CustomBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}> = ({ children, className, variant = "default" }) => {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variantClasses = {
    default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground"
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </div>
  )
}

// 任务状态图标映射
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'running':
      return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

// 任务统计组件
export const TaskStats: React.FC<{
  tasks: any[]
}> = ({ tasks }) => {
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">总任务数</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">等待中</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">进行中</p>
              <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">已完成</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">失败</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 任务控制组件
export const TaskControls: React.FC<{
  isTaskRunning: boolean
  onToggleRunning: () => void
  onClearAll: () => void
  tasksCount: number
}> = ({ isTaskRunning, onToggleRunning, onClearAll, tasksCount }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          任务控制
        </CardTitle>
        <CardDescription>管理任务监控和清理操作</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onToggleRunning}
              variant={isTaskRunning ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isTaskRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  暂停监控
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  开始监控
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isTaskRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isTaskRunning ? '监控中' : '已暂停'}
              </span>
            </div>
          </div>

          <Button
            onClick={onClearAll}
            variant="outline"
            disabled={tasksCount === 0}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            清空所有任务
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// 任务列表组件
export const TaskList: React.FC<{
  tasks: any[]
  onRemoveTask: (taskId: string) => void
  onRetryTask: (taskId: string) => void
  getStatusText: (status: string) => string
  getStatusColor: (status: string) => string
  getTaskTypeText: (type: string) => string
  formatTime: (dateString: string) => string
  getTaskDuration: (createdAt: string, updatedAt: string) => string
}> = ({ 
  tasks, 
  onRemoveTask, 
  onRetryTask, 
  getStatusText, 
  getStatusColor, 
  getTaskTypeText, 
  formatTime, 
  getTaskDuration 
}) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>暂无任务</p>
            <p className="text-sm">系统任务将在这里显示</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          任务列表
        </CardTitle>
        <CardDescription>共 {tasks.length} 个任务</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <div className="font-medium">{getTaskTypeText(task.type)}</div>
                    <div className="text-sm text-gray-500">
                      {task.data?.listName || task.data?.filename || '未命名任务'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CustomBadge className={getStatusColor(task.status)}>
                    {getStatusText(task.status)}
                  </CustomBadge>
                  
                  <div className="flex gap-1">
                    {task.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRetryTask(task.id)}
                        className="h-8 px-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRemoveTask(task.id)}
                      className="h-8 px-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              {task.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>{Math.floor(task.progress || 0)}%</span>
                  </div>
                  <Progress value={task.progress || 0} className="h-2" />
                </div>
              )}

              {/* 任务信息 */}
              <div className="text-sm text-gray-600 space-y-1">
                {task.message && (
                  <div>状态: {task.message}</div>
                )}
                <div className="flex justify-between">
                  <span>创建时间: {formatTime(task.createdAt)}</span>
                  <span>持续时间: {getTaskDuration(task.createdAt, task.updatedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 