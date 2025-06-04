import React from 'react'
import Sidebar from './Sidebar'
import { useAppStore } from '../../stores/appStore'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { currentPage, setCurrentPage } = useAppStore()

  const sidebarItems = [
    {
      id: 'api-config',
      label: 'API配置',
      icon: '🔑',
      active: currentPage === 'api-config',
      onClick: () => setCurrentPage('api-config')
    },
    {
      id: 'search',
      label: '智能搜索',
      icon: '🎯',
      active: currentPage === 'search',
      onClick: () => setCurrentPage('search')
    },
    {
      id: 'lists',
      label: '列表管理',
      icon: '📋',
      active: currentPage === 'lists',
      onClick: () => setCurrentPage('lists')
    },
    {
      id: 'continue-search',
      label: '连续搜索',
      icon: '🔄',
      active: currentPage === 'continue-search',
      onClick: () => setCurrentPage('continue-search')
    },
    {
      id: 'export',
      label: '数据导出',
      icon: '📤',
      active: currentPage === 'export',
      onClick: () => setCurrentPage('export')
    },
    {
      id: 'tasks',
      label: '任务监控',
      icon: '📊',
      active: currentPage === 'tasks',
      onClick: () => setCurrentPage('tasks')
    },
    {
      id: 'settings',
      label: '应用设置',
      icon: '⚙️',
      active: currentPage === 'settings',
      onClick: () => setCurrentPage('settings')
    }
  ]

  return (
    <div 
      className="flex h-screen bg-gradient-to-br from-gray-50 to-lavender-50/30" 
      style={{ 
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, rgba(250, 248, 255, 0.3) 100%)'
      }}
    >
      {/* 侧边栏 */}
      <Sidebar items={sidebarItems} />
      
      {/* 主内容区域 */}
      <main 
        className="flex-1 flex flex-col overflow-hidden"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* 顶部标题栏 */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-lavender-200/50 shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 页面图标 */}
                <div className="w-12 h-12 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">
                    {sidebarItems.find(item => item.active)?.icon || '🏠'}
                  </span>
                </div>
                
                {/* 页面标题和描述 */}
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-lavender-800 to-lavender-600 bg-clip-text text-transparent">
                    {sidebarItems.find(item => item.active)?.label || '欢迎'}
                  </h2>
                  <p className="text-sm text-lavender-600 mt-1 font-medium">
                    {getPageDescription(currentPage)}
                  </p>
                </div>
              </div>
              
              {/* 右侧操作区域 */}
              <div className="flex items-center space-x-4">
                {/* 系统状态 */}
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">系统正常</span>
                </div>
                
                {/* 通知按钮 */}
                <button className="relative p-3 text-lavender-600 hover:text-lavender-700 hover:bg-lavender-50 rounded-xl transition-all duration-200 group">
                  <span className="text-xl">🔔</span>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
                
                {/* 帮助按钮 */}
                <button className="p-3 text-lavender-600 hover:text-lavender-700 hover:bg-lavender-50 rounded-xl transition-all duration-200">
                  <span className="text-xl">❓</span>
                </button>
                
                {/* 设置按钮 */}
                <button 
                  onClick={() => setCurrentPage('settings')}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    currentPage === 'settings' 
                      ? 'bg-lavender-500 text-white shadow-lg' 
                      : 'text-lavender-600 hover:text-lavender-700 hover:bg-lavender-50'
                  }`}
                >
                  <span className="text-xl">⚙️</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            <div className="max-w-7xl mx-auto">
              {/* 内容容器 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-lavender-200/50 min-h-[600px] hover:shadow-xl transition-all duration-300">
                <div className="p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function getPageDescription(page: string): string {
  const descriptions = {
    'api-config': '配置和验证您的Wiza API密钥，开始您的潜在客户搜索之旅',
    'search': '设置搜索条件并立即查看结果，一站式完成潜在客户发现',
    'prospect-search': '基于您的搜索条件查找潜在客户数量，预览搜索结果',
    'lists': '管理您的潜在客户列表，跟踪搜索任务进度',
    'continue-search': '基于现有列表进行连续搜索，批量获取更多潜在客户',
    'export': '导出和下载您的潜在客户数据，支持多种格式',
    'tasks': '实时监控搜索和导出任务，掌握工作进度',
    'settings': '个性化应用设置，优化您的使用体验'
  }
  return descriptions[page] || '欢迎使用Wiza潜在客户搜索工具 - 让客户发现变得简单高效'
}

export default MainLayout 