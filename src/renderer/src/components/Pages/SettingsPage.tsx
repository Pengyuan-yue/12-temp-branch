import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { 
  Settings, 
  Palette, 
  Globe, 
  Bell, 
  Download, 
  Trash2,
  RefreshCw,
  Save,
  AlertCircle
} from 'lucide-react'

interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  notifications: {
    taskComplete: boolean
    taskFailed: boolean
    newUpdate: boolean
  }
  export: {
    defaultFormat: 'excel' | 'csv'
    autoDownload: boolean
    downloadPath: string
  }
  advanced: {
    autoRefresh: boolean
    refreshInterval: number
    maxRetries: number
    requestTimeout: number
  }
}

const SettingsPage: React.FC = () => {
  const { clearAll } = useAppStore()
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'zh-CN',
    notifications: {
      taskComplete: true,
      taskFailed: true,
      newUpdate: true
    },
    export: {
      defaultFormat: 'excel',
      autoDownload: false,
      downloadPath: ''
    },
    advanced: {
      autoRefresh: true,
      refreshInterval: 60,
      maxRetries: 3,
      requestTimeout: 30
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isElectronApiAvailable, setIsElectronApiAvailable] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [reloadAttempts, setReloadAttempts] = useState(0)

  // 检查 electronAPI 是否可用
  useEffect(() => {
    // 直接尝试访问 window 对象
    if (typeof window !== 'undefined') {
      console.log('Window 对象可用，检查 electronAPI');
      
      // 定义检查函数
      const checkElectronApi = () => {
        try {
          // 尝试直接访问 window.electronAPI
          const apiExists = 'electronAPI' in window;
          console.log('electronAPI 存在于 window 对象中:', apiExists);
          
          if (apiExists) {
            setIsElectronApiAvailable(true);
            console.log('electronAPI 已成功加载，可以使用');
          } else {
            console.log('electronAPI 尚未加载，将在3秒后重试');
            
            // 增加重试次数
            setReloadAttempts(prev => {
              const newCount = prev + 1;
              console.log(`重试次数: ${newCount}`);
              
              // 如果重试超过5次，尝试刷新页面
              if (newCount >= 5 && !isReloading) {
                console.log('重试次数过多，建议刷新页面');
              }
              
              return newCount;
            });
            
            setTimeout(checkElectronApi, 3000);
          }
        } catch (error) {
          console.error('检查 electronAPI 时出错:', error);
          setTimeout(checkElectronApi, 3000);
        }
      };
      
      // 开始检查
      checkElectronApi();
    }
    
    return () => {
      // 清理工作
    };
  }, [isReloading]);

  // 手动重新加载页面
  const handleReloadPage = () => {
    setIsReloading(true);
    console.log('尝试重新加载页面...');
    
    // 重置重试次数
    setReloadAttempts(0);
    
    try {
      // 尝试重新加载页面
      window.location.reload();
    } catch (error) {
      console.error('重新加载页面失败:', error);
      setIsReloading(false);
    }
  };

  // 保存设置
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      // 保存设置到本地存储
      localStorage.setItem('app-settings', JSON.stringify(settings))
      
      alert('设置保存成功！')
    } catch (error) {
      console.error('保存设置失败:', error)
      alert('保存设置失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  // 重置设置
  const handleResetSettings = () => {
    if (confirm('确定要重置所有设置吗？这将恢复默认配置。')) {
      setSettings({
        theme: 'light',
        language: 'zh-CN',
        notifications: {
          taskComplete: true,
          taskFailed: true,
          newUpdate: true
        },
        export: {
          defaultFormat: 'excel',
          autoDownload: false,
          downloadPath: ''
        },
        advanced: {
          autoRefresh: true,
          refreshInterval: 60,
          maxRetries: 3,
          requestTimeout: 30
        }
      })
    }
  }

  // 清除所有数据
  const handleClearAllData = () => {
    if (confirm('确定要清除所有应用数据吗？这将删除所有列表、任务和搜索历史。')) {
      clearAll()
      localStorage.clear()
      alert('所有数据已清除')
    }
  }

  // 选择下载路径
  const selectDownloadPath = async () => {
    try {
      // 检查API是否可用
      if (!isElectronApiAvailable) {
        console.error('electronAPI 未加载或不可用');
        alert('系统功能尚未准备好，请重启应用后重试');
        return;
      }
      
      // 确保 window.electronAPI 存在
      if (!window.electronAPI) {
        console.error('window.electronAPI 不存在');
        alert('系统功能不可用，请重启应用后重试');
        return;
      }
      
      // 确保 selectDirectory 方法存在
      if (typeof window.electronAPI.selectDirectory !== 'function') {
        console.error('selectDirectory 方法不可用');
        alert('文件选择功能不可用，请重启应用后重试');
        return;
      }
      
      console.log('调用 selectDirectory 方法');
      // 调用主进程的文件选择对话框
      const result = await window.electronAPI.selectDirectory();
      console.log('selectDirectory 返回结果:', result);
      
      if (result && result.success) {
        // 确保路径是字符串（空字符串或实际路径）
        const downloadPath = result.path || '';
        console.log('设置下载路径:', downloadPath);
        setSettings(prev => ({
          ...prev,
          export: { ...prev.export, downloadPath }
        }));
      } else {
        // 显示具体的错误信息
        const errorMsg = result && result.error ? result.error : '未知错误';
        console.error('选择路径失败:', errorMsg);
        alert(`选择路径失败: ${errorMsg}`);
      }
    } catch (error) {
      console.error('选择路径失败:', error);
      alert(`选择路径失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">应用设置</h1>
        <p className="text-gray-600">配置应用的外观、行为和功能选项</p>
        {!isElectronApiAvailable && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>警告:</strong> 系统功能尚未准备好。部分功能可能不可用。
                {reloadAttempts >= 5 && (
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReloadPage}
                      disabled={isReloading}
                    >
                      {isReloading ? '正在重新加载...' : '刷新页面'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              外观设置
            </CardTitle>
            <CardDescription>自定义应用的外观和主题</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>主题</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(value: 'light' | 'dark' | 'auto') => 
                  setSettings(prev => ({ ...prev, theme: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色主题</SelectItem>
                  <SelectItem value="dark">深色主题</SelectItem>
                  <SelectItem value="auto">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>语言</Label>
              <Select 
                value={settings.language} 
                onValueChange={(value: 'zh-CN' | 'en-US') => 
                  setSettings(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh-CN">简体中文</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 通知设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知设置
            </CardTitle>
            <CardDescription>管理应用通知和提醒</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="taskComplete"
                checked={settings.notifications.taskComplete}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, taskComplete: !!checked }
                  }))
                }
              />
              <Label htmlFor="taskComplete">任务完成通知</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="taskFailed"
                checked={settings.notifications.taskFailed}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, taskFailed: !!checked }
                  }))
                }
              />
              <Label htmlFor="taskFailed">任务失败通知</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="newUpdate"
                checked={settings.notifications.newUpdate}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    notifications: { ...prev.notifications, newUpdate: !!checked }
                  }))
                }
              />
              <Label htmlFor="newUpdate">新版本更新通知</Label>
            </div>
          </CardContent>
        </Card>

        {/* 导出设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              导出设置
            </CardTitle>
            <CardDescription>配置数据导出的默认选项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>默认导出格式</Label>
              <Select 
                value={settings.export.defaultFormat} 
                onValueChange={(value: 'excel' | 'csv') => 
                  setSettings(prev => ({
                    ...prev,
                    export: { ...prev.export, defaultFormat: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoDownload"
                checked={settings.export.autoDownload}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    export: { ...prev.export, autoDownload: !!checked }
                  }))
                }
              />
              <Label htmlFor="autoDownload">任务完成后自动下载</Label>
            </div>

                <div className="space-y-2">
                  <Label>导出文件保存位置</Label>
                  <p className="text-sm text-gray-500">
                    点击"选择"按钮设置导出文件的保存位置
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={settings.export.downloadPath}
                      placeholder="请选择文件夹保存导出结果"
                      readOnly
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={selectDownloadPath}
                      disabled={!isElectronApiAvailable}
                    >
                      选择文件夹
                    </Button>
                  </div>
                  {!isElectronApiAvailable && (
                    <p className="text-amber-500 text-sm">
                      系统功能尚未准备好，请重启应用后再试
                    </p>
                  )}
                  {isElectronApiAvailable && settings.export.downloadPath === '' ? (
                    <p className="text-red-500 text-sm">
                      请选择保存导出文件的文件夹
                    </p>
                  ) : isElectronApiAvailable && settings.export.downloadPath !== '' ? (
                    <p className="text-green-600 text-sm">
                      导出文件将保存到: {settings.export.downloadPath}
                    </p>
                  ) : null}
                </div>
          </CardContent>
        </Card>

        {/* 高级设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              高级设置
            </CardTitle>
            <CardDescription>配置应用的高级功能和性能选项</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRefresh"
                checked={settings.advanced.autoRefresh}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({
                    ...prev,
                    advanced: { ...prev.advanced, autoRefresh: !!checked }
                  }))
                }
              />
              <Label htmlFor="autoRefresh">自动刷新任务状态</Label>
            </div>

            <div className="space-y-2">
              <Label>刷新间隔 (秒)</Label>
              <Input
                type="number"
                value={settings.advanced.refreshInterval}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    advanced: { ...prev.advanced, refreshInterval: parseInt(e.target.value) || 60 }
                  }))
                }
                min="10"
                max="300"
              />
            </div>

            <div className="space-y-2">
              <Label>最大重试次数</Label>
              <Input
                type="number"
                value={settings.advanced.maxRetries}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    advanced: { ...prev.advanced, maxRetries: parseInt(e.target.value) || 3 }
                  }))
                }
                min="1"
                max="10"
              />
            </div>

            <div className="space-y-2">
              <Label>请求超时 (秒)</Label>
              <Input
                type="number"
                value={settings.advanced.requestTimeout}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    advanced: { ...prev.advanced, requestTimeout: parseInt(e.target.value) || 30 }
                  }))
                }
                min="10"
                max="120"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            数据管理
          </CardTitle>
          <CardDescription>管理应用数据和重置选项</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleResetSettings}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重置设置
            </Button>
            
            <Button
              variant="outline"
              onClick={handleClearAllData}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              清除所有数据
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>注意:</strong> 清除所有数据将删除您的API配置、搜索历史、列表和任务记录。此操作不可恢复。
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleResetSettings}
        >
          重置
        </Button>
        
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="bg-lavender-500 hover:bg-lavender-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? '保存中...' : '保存设置'}
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
