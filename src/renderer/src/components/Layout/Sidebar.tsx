import React, { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { cn } from '@/lib/utils'
import { getWizaApi } from '../../services/wizaApi'
import { CreditsResponse } from '@/types/api'

interface SidebarItem {
  id: string
  label: string
  icon: string
  active: boolean
  onClick: () => void
}

interface SidebarProps {
  items: SidebarItem[]
  className?: string
}

export function Sidebar({ items, className }: SidebarProps) {
  const { apiKey, isApiKeyValid } = useAppStore()
  const [credits, setCredits] = useState<CreditsResponse | null>(null)

  // 获取积分信息
  useEffect(() => {
    if (isApiKeyValid && apiKey) {
      const fetchCredits = async () => {
        try {
          const wizaApi = getWizaApi(apiKey)
          const creditsData = await wizaApi.getCredits()
          setCredits(creditsData)
        } catch (error) {
          console.error('获取积分信息失败:', error)
        }
      }
      fetchCredits()
    }
  }, [isApiKeyValid, apiKey])

  return (
    <div 
      className={cn(
        "w-64 h-full bg-gradient-to-b from-lavender-50 to-lavender-100 border-r border-lavender-200 flex flex-col",
        className
      )} 
      style={{ 
        width: '256px',
        height: '100%',
        background: 'linear-gradient(to bottom, #faf8ff, #f3f0ff)',
        borderRight: '1px solid #e9e5ff',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f3f0ff',
        borderColor: '#e9e5ff'
      }}
    >
      {/* 应用标题 */}
      <div className="p-6 border-b border-lavender-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lavender-500 to-lavender-600 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#9f7aea' }}>
            <span className="text-white text-xl font-bold">W</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-lavender-900" style={{ color: '#44337a' }}>Wiza工具</h1>
            <p className="text-xs text-lavender-600" style={{ color: '#805ad5' }}>潜在客户搜索</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
              ${item.active 
                ? 'bg-gradient-to-r from-lavender-500 to-lavender-600 text-white shadow-lg shadow-lavender-500/25' 
                : 'text-lavender-700 hover:bg-lavender-200/50 hover:text-lavender-800'
              }
            `}
            style={item.active ? { backgroundColor: '#9f7aea', color: 'white' } : { color: '#6b46c1' }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            {item.active && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: '#fcd34d' }}></div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* API状态卡片 */}
      <div className="p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-lavender-200/50 p-4 space-y-3 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-lavender-800" style={{ color: '#553c9a' }}>API状态</h3>
            <div className={`w-3 h-3 rounded-full ${isApiKeyValid ? 'bg-green-400 shadow-green-400/50 shadow-sm' : 'bg-gray-300'} ${isApiKeyValid ? 'animate-pulse' : ''}`}></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${isApiKeyValid ? 'text-green-600' : 'text-gray-500'}`}>
                {isApiKeyValid ? '✅ 已连接' : '⚠️ 未连接'}
              </span>
            </div>
            
            {isApiKeyValid && credits && (
              <div className="space-y-1 text-xs text-lavender-600" style={{ color: '#805ad5' }}>
                <div className="flex justify-between">
                  <span>API积分:</span>
                  <span className="font-medium text-lavender-800" style={{ color: '#553c9a' }}>
                    {credits.credits.api_credits.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>导出积分:</span>
                  <span className="font-medium text-lavender-800" style={{ color: '#553c9a' }}>
                    {credits.credits.export_credits.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>邮箱积分:</span>
                  <span className="font-medium text-lavender-800" style={{ color: '#553c9a' }}>
                    {credits.credits.email_credits === 'unlimited' ? '无限' : credits.credits.email_credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>电话积分:</span>
                  <span className="font-medium text-lavender-800" style={{ color: '#553c9a' }}>
                    {credits.credits.phone_credits === 'unlimited' ? '无限' : credits.credits.phone_credits}
                  </span>
                </div>
              </div>
            )}
          </div>

          {!isApiKeyValid && (
            <div className="pt-2 border-t border-lavender-100">
              <p className="text-xs text-lavender-600" style={{ color: '#805ad5' }}>
                请在API配置页面设置密钥
              </p>
            </div>
          )}
        </div>
      </div>


    </div>
  )
}

export default Sidebar 