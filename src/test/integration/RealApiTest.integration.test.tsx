import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import IntegratedSearchPage from '../../renderer/src/components/Pages/IntegratedSearchPage'
import { useAppStore } from '../../renderer/src/stores/appStore'
import { API_CONFIG, isRealApiTest } from '../config/test-config'
import { IntegratedSearchTestHelper } from '../utils/test-helpers'

// 只在真实API测试环境下运行
const describeRealApi = isRealApiTest() ? describe : describe.skip

// Mock the store with real API key
vi.mock('../../renderer/src/stores/appStore')

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describeRealApi('真实API集成测试', () => {
  let helper: IntegratedSearchTestHelper
  
  const mockStore = {
    apiKey: API_CONFIG.REAL_API.API_KEY,
    isApiKeyValid: true,
    setError: vi.fn(),
    setLoading: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
  }

  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStore)
    localStorageMock.getItem.mockReturnValue(null)
    vi.clearAllMocks()
    
    render(<IntegratedSearchPage />)
    helper = new IntegratedSearchTestHelper()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('API连接测试', () => {
    it('应该能够验证API密钥有效性', async () => {
      // 验证页面加载时API密钥状态
      expect(screen.getByText('智能搜索')).toBeInTheDocument()
      
      // 搜索按钮应该可用（因为有有效的API密钥）
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      
      // 添加一些搜索条件后，按钮应该可用
      await helper.addLastName('Smith')
      
      await waitFor(() => {
        expect(searchButton).not.toBeDisabled()
      }, { timeout: 5000 })
    }, 30000)
  })

  describe('潜在客户搜索测试', () => {
    it('应该能够执行真实的潜在客户搜索', async () => {
      // 添加搜索条件
      await helper.addLastName('Smith')
      await helper.selectIndustries(['information technology and services'])
      await helper.selectCompanySizes(['1-10', '11-50'])
      
      // 执行搜索
      await helper.performSearch()
      
      // 等待搜索完成
      await helper.waitForSearchComplete(30000)
      
      // 验证搜索结果
      await helper.switchToResultsTab()
      
      // 应该显示搜索结果
      await waitFor(() => {
        expect(screen.getByText(/搜索完成/i)).toBeInTheDocument()
      }, { timeout: 30000 })
      
      // 应该显示潜在客户数量
      expect(screen.getByText(/潜在客户总数/i)).toBeInTheDocument()
    }, 60000)

    it('应该能够搜索特定行业的潜在客户', async () => {
      // 搜索金融服务行业
      await helper.selectIndustries(['financial services'])
      await helper.addLastName('Johnson')
      
      await helper.performSearch()
      await helper.waitForSearchComplete(30000)
      
      await helper.switchToResultsTab()
      
      await waitFor(() => {
        expect(screen.getByText(/搜索完成/i)).toBeInTheDocument()
      }, { timeout: 30000 })
      
      // 验证搜索条件摘要中包含正确的行业
      expect(screen.getByText(/金融服务/i)).toBeInTheDocument()
    }, 60000)

    it('应该能够搜索特定地理位置的潜在客户', async () => {
      // 添加地理位置条件
      await helper.addLocation('city', 'Toronto', 'Ontario', 'Canada')
      await helper.addLastName('Wilson')
      
      await helper.performSearch()
      await helper.waitForSearchComplete(30000)
      
      await helper.switchToResultsTab()
      
      await waitFor(() => {
        expect(screen.getByText(/搜索完成/i)).toBeInTheDocument()
      }, { timeout: 30000 })
      
      // 验证地理位置条件
      expect(screen.getByText(/Toronto, Ontario, Canada/i)).toBeInTheDocument()
    }, 60000)
  })

  describe('列表创建测试', () => {
    it('应该能够创建真实的潜在客户列表', async () => {
      // 设置搜索条件
      await helper.addLastName('Brown')
      await helper.selectIndustries(['computer software'])
      await helper.selectCompanySizes(['51-200'])
      
      // 执行搜索
      await helper.performSearch()
      await helper.waitForSearchComplete(30000)
      
      // 切换到结果页面
      await helper.switchToResultsTab()
      
      // 等待搜索完成
      await waitFor(() => {
        expect(screen.getByText(/搜索完成/i)).toBeInTheDocument()
      }, { timeout: 30000 })
      
      // 创建潜在客户列表
      const listName = `测试列表_${Date.now()}`
      await helper.createProspectList(listName, 5)
      
      // 等待列表创建完成
      await helper.waitForListCreationComplete(60000)
      
      // 验证列表创建成功
      await waitFor(() => {
        expect(screen.getByText(/列表创建成功/i) || screen.getByText(/正在处理/i)).toBeInTheDocument()
      }, { timeout: 60000 })
    }, 120000)
  })

  describe('搜索历史测试', () => {
    it('应该能够保存和重用搜索历史', async () => {
      // 执行第一次搜索
      await helper.addLastName('Davis')
      await helper.selectIndustries(['marketing and advertising'])
      
      await helper.performSearch()
      await helper.waitForSearchComplete(30000)
      
      // 切换到历史页面
      await helper.switchToHistoryTab()
      
      // 验证历史记录被保存
      await waitFor(() => {
        expect(screen.getByText(/Davis/i)).toBeInTheDocument()
      }, { timeout: 5000 })
      
      // 清除当前条件
      await helper.switchToFiltersTab()
      await helper.clearAllFilters()
      
      // 使用历史条件
      await helper.switchToHistoryTab()
      await helper.useHistoryFilters(0)
      
      // 验证条件已恢复
      await helper.switchToFiltersTab()
      expect(screen.getByText('Davis')).toBeInTheDocument()
    }, 90000)
  })

  describe('错误处理测试', () => {
    it('应该能够处理API限制错误', async () => {
      // 尝试创建一个超大的搜索
      await helper.addLastNames(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'])
      await helper.selectIndustries([
        'information technology and services',
        'financial services',
        'computer software',
        'marketing and advertising',
        'management consulting'
      ])
      
      await helper.performSearch()
      
      // 等待响应（可能是成功或错误）
      await waitFor(() => {
        const hasResults = screen.queryByText(/搜索完成/i)
        const hasError = screen.queryByText(/错误/i) || screen.queryByText(/失败/i)
        expect(hasResults || hasError).toBeTruthy()
      }, { timeout: 30000 })
    }, 60000)

    it('应该能够处理网络超时', async () => {
      // 设置一个可能导致超时的复杂搜索
      await helper.addLastName('TestTimeout')
      await helper.selectIndustries(['information technology and services'])
      
      // 模拟网络延迟
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 35000)) // 超过30秒超时
      )
      
      try {
        await helper.performSearch()
        
        // 应该显示超时或错误信息
        await waitFor(() => {
          const hasError = screen.queryByText(/超时/i) || 
                          screen.queryByText(/错误/i) || 
                          screen.queryByText(/失败/i)
          expect(hasError).toBeTruthy()
        }, { timeout: 35000 })
      } finally {
        global.fetch = originalFetch
      }
    }, 40000)
  })

  describe('性能测试', () => {
    it('搜索响应时间应该在合理范围内', async () => {
      const startTime = Date.now()
      
      await helper.addLastName('Performance')
      await helper.selectIndustries(['computer software'])
      
      await helper.performSearch()
      await helper.waitForSearchComplete(30000)
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      // 搜索应该在30秒内完成
      expect(responseTime).toBeLessThan(30000)
      
      console.log(`搜索响应时间: ${responseTime}ms`)
    }, 35000)
  })
})

// 导出测试统计信息
export const getTestStats = () => {
  return {
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...',
    baseUrl: API_CONFIG.REAL_API.BASE_URL,
    timeout: API_CONFIG.REAL_API.TIMEOUT,
    testEnvironment: 'real-api'
  }
} 