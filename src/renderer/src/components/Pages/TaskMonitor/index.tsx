import React from 'react'
import { useAppStore } from '../../../stores/appStore'

// 导入拆分后的组件
import { TaskControls } from './components/TaskControls'
import { TaskList } from './components/TaskList'
import { TaskStats } from './components/TaskStats'
import { useTaskMonitor } from './hooks/useTaskMonitor'

const TaskMonitorPage: React.FC = () => {
  const { tasks, isTaskRunning } = useAppStore()
  
  const {
    toggleTaskRunning,
    handleRemoveTask,
    retryTask,
    clearAllTasks,
    getStatusText,
    getStatusColor,
    getTaskTypeText,
    formatTime,
    getTaskDuration
  } = useTaskMonitor()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">任务监控</h1>
          <p className="text-gray-600">实时监控系统任务状态和进度</p>
        </div>
      </div>

      {/* 任务统计 */}
      <TaskStats tasks={tasks} />

      {/* 任务控制 */}
      <TaskControls 
        isTaskRunning={isTaskRunning}
        onToggleRunning={toggleTaskRunning}
        onClearAll={clearAllTasks}
        tasksCount={tasks.length}
      />

      {/* 任务列表 */}
      <TaskList 
        tasks={tasks}
        onRemoveTask={handleRemoveTask}
        onRetryTask={retryTask}
        getStatusText={getStatusText}
        getStatusColor={getStatusColor}
        getTaskTypeText={getTaskTypeText}
        formatTime={formatTime}
        getTaskDuration={getTaskDuration}
      />
    </div>
  )
}

export default TaskMonitorPage 