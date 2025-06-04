import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import IntegratedSearchPage from '../../renderer/src/components/Pages/IntegratedSearchPage'
import { useAppStore } from '../../renderer/src/stores/appStore'

// Mock the store
vi.mock('../../renderer/src/stores/appStore')

// Mock the API service
vi.mock('../../renderer/src/services/wizaApi', () => ({
  getWizaApi: vi.fn(() => ({
    searchProspects: vi.fn(),
    createProspectList: vi.fn(),
  }))
}))

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

describe('IntegratedSearchPage 单元测试', () => {
  const mockStore = {
    apiKey: 'test-api-key',
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
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染测试', () => {
    it('应该正确渲染智能搜索页面', () => {
      render(<IntegratedSearchPage />)
      
      expect(screen.getByText('智能搜索')).toBeInTheDocument()
      expect(screen.getByText('搜索条件')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /开始搜索/i })).toBeInTheDocument()
    })

    it('应该显示所有必要的表单字段', () => {
      render(<IntegratedSearchPage />)
      
      // 检查姓氏输入
      expect(screen.getByPlaceholderText('输入姓氏')).toBeInTheDocument()
      
      // 检查职位输入
      expect(screen.getByPlaceholderText('输入职位关键词')).toBeInTheDocument()
      
      // 检查地理位置输入
      expect(screen.getByPlaceholderText('城市')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('州/省')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('国家')).toBeInTheDocument()
      
      // 检查行业选择
      expect(screen.getByText('行业筛选')).toBeInTheDocument()
      
      // 检查公司规模选择
      expect(screen.getByText('公司规模')).toBeInTheDocument()
    })

    it('当API密钥无效时应该显示警告', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        isApiKeyValid: false,
      })
      
      render(<IntegratedSearchPage />)
      
      expect(screen.getByText(/请先配置有效的API密钥/i)).toBeInTheDocument()
    })
  })

  describe('姓氏筛选功能测试', () => {
    it('应该能够添加姓氏', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const input = screen.getByPlaceholderText('输入姓氏')
      const addButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(input, 'Smith')
      await user.click(addButton)
      
      expect(screen.getByText('Smith')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('应该能够移除姓氏', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 先添加一个姓氏
      const input = screen.getByPlaceholderText('输入姓氏')
      const addButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(input, 'Smith')
      await user.click(addButton)
      
      // 然后移除它
      const removeButton = screen.getByRole('button', { name: /移除 Smith/i })
      await user.click(removeButton)
      
      expect(screen.queryByText('Smith')).not.toBeInTheDocument()
    })

    it('不应该添加重复的姓氏', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const input = screen.getByPlaceholderText('输入姓氏')
      const addButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      // 添加第一次
      await user.type(input, 'Smith')
      await user.click(addButton)
      
      // 尝试添加相同的姓氏
      await user.type(input, 'Smith')
      await user.click(addButton)
      
      // 应该只有一个Smith
      const smithElements = screen.getAllByText('Smith')
      expect(smithElements).toHaveLength(1)
    })

    it('不应该添加空的姓氏', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const addButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      // 尝试添加空姓氏
      await user.click(addButton)
      
      // 不应该有任何姓氏标签
      expect(screen.queryByTestId('lastname-badge')).not.toBeInTheDocument()
    })
  })

  describe('职位筛选功能测试', () => {
    it('应该能够添加职位关键词', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const input = screen.getByPlaceholderText('输入职位关键词')
      const addButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(input, 'CEO')
      await user.click(addButton)
      
      expect(screen.getByText('CEO')).toBeInTheDocument()
      expect(input).toHaveValue('')
    })

    it('应该能够切换包含/排除选项', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const includeRadio = screen.getByLabelText('包含')
      const excludeRadio = screen.getByLabelText('排除')
      
      // 默认应该选择包含
      expect(includeRadio).toBeChecked()
      expect(excludeRadio).not.toBeChecked()
      
      // 切换到排除
      await user.click(excludeRadio)
      
      expect(excludeRadio).toBeChecked()
      expect(includeRadio).not.toBeChecked()
    })

    it('应该能够移除职位关键词', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 先添加一个职位
      const input = screen.getByPlaceholderText('输入职位关键词')
      const addButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(input, 'CEO')
      await user.click(addButton)
      
      // 然后移除它
      const removeButton = screen.getByRole('button', { name: /移除 CEO/i })
      await user.click(removeButton)
      
      expect(screen.queryByText('CEO')).not.toBeInTheDocument()
    })
  })

  describe('地理位置筛选功能测试', () => {
    it('应该能够添加城市类型的地理位置', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addButton)
      
      expect(screen.getByText('Toronto, Ontario, Canada')).toBeInTheDocument()
    })

    it('应该能够添加州/省类型的地理位置', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 选择州/省类型
      const stateTypeRadio = screen.getByLabelText('州/省')
      await user.click(stateTypeRadio)
      
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addButton)
      
      expect(screen.getByText('Ontario, Canada')).toBeInTheDocument()
    })

    it('应该能够添加国家类型的地理位置', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 选择国家类型
      const countryTypeRadio = screen.getByLabelText('国家')
      await user.click(countryTypeRadio)
      
      const countryInput = screen.getByPlaceholderText('国家')
      const addButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(countryInput, 'Canada')
      await user.click(addButton)
      
      expect(screen.getByText('Canada')).toBeInTheDocument()
    })

    it('应该验证地理位置格式', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const addButton = screen.getByRole('button', { name: /添加地点/i })
      
      // 尝试添加不完整的城市信息
      const cityInput = screen.getByPlaceholderText('城市')
      await user.type(cityInput, 'Toronto')
      await user.click(addButton)
      
      // 应该显示错误提示
      expect(screen.getByText(/城市类型需要填写：城市、州\/省、国家三个字段/i)).toBeInTheDocument()
    })

    it('应该能够移除地理位置', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 先添加一个完整的地理位置
      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addButton)
      
      // 然后移除它
      const removeButton = screen.getByRole('button', { name: /移除地点/i })
      await user.click(removeButton)
      
      expect(screen.queryByText('Toronto, Ontario, Canada')).not.toBeInTheDocument()
    })
  })

  describe('行业筛选功能测试', () => {
    it('应该能够选择行业', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      await user.click(itCheckbox)
      
      expect(itCheckbox).toBeChecked()
    })

    it('应该能够取消选择行业', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      
      // 先选择
      await user.click(itCheckbox)
      expect(itCheckbox).toBeChecked()
      
      // 再取消选择
      await user.click(itCheckbox)
      expect(itCheckbox).not.toBeChecked()
    })

    it('应该能够选择多个行业', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      const financeCheckbox = screen.getByLabelText('金融服务')
      
      await user.click(itCheckbox)
      await user.click(financeCheckbox)
      
      expect(itCheckbox).toBeChecked()
      expect(financeCheckbox).toBeChecked()
    })
  })

  describe('公司规模筛选功能测试', () => {
    it('应该能够选择公司规模', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const smallCompanyCheckbox = screen.getByLabelText('1-10人')
      await user.click(smallCompanyCheckbox)
      
      expect(smallCompanyCheckbox).toBeChecked()
    })

    it('应该能够选择多个公司规模', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const smallCheckbox = screen.getByLabelText('1-10人')
      const mediumCheckbox = screen.getByLabelText('11-50人')
      
      await user.click(smallCheckbox)
      await user.click(mediumCheckbox)
      
      expect(smallCheckbox).toBeChecked()
      expect(mediumCheckbox).toBeChecked()
    })
  })

  describe('搜索功能测试', () => {
    it('当没有API密钥时应该禁用搜索按钮', () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        isApiKeyValid: false,
      })
      
      render(<IntegratedSearchPage />)
      
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      expect(searchButton).toBeDisabled()
    })

    it('当没有搜索条件时应该禁用搜索按钮', () => {
      render(<IntegratedSearchPage />)
      
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      expect(searchButton).toBeDisabled()
    })

    it('当有搜索条件时应该启用搜索按钮', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 添加一个姓氏
      const input = screen.getByPlaceholderText('输入姓氏')
      const addButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(input, 'Smith')
      await user.click(addButton)
      
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      expect(searchButton).not.toBeDisabled()
    })
  })

  describe('清除功能测试', () => {
    it('应该能够清除所有筛选条件', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 添加一些筛选条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)
      
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      await user.click(itCheckbox)
      
      // 清除所有条件
      const clearButton = screen.getByRole('button', { name: /清除所有条件/i })
      await user.click(clearButton)
      
      // 验证条件已清除
      expect(screen.queryByText('Smith')).not.toBeInTheDocument()
      expect(itCheckbox).not.toBeChecked()
    })
  })

  describe('搜索历史测试', () => {
    it('应该能够加载和显示搜索历史', async () => {
      const mockHistory = [
        {
          id: '1',
          timestamp: '2024-01-01T08:00:00.000Z',
          filters: { last_name: ['Smith'] },
          totalResults: 100,
          searchTime: 1500
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))
      
      render(<IntegratedSearchPage />)
      
      // 切换到历史标签页
      const historyTab = screen.getByRole('button', { name: /搜索历史/i })
      await userEvent.setup().click(historyTab)
      
      // 验证历史记录显示
      expect(screen.getByText('2024/1/1 08:00:00')).toBeInTheDocument()
      expect(screen.getByText('100 个结果')).toBeInTheDocument()
    })

    it('应该能够使用历史搜索条件', async () => {
      const user = userEvent.setup()
      const mockHistory = [
        {
          id: '1',
          timestamp: '2024-01-01T08:00:00.000Z',
          filters: { last_name: ['Smith'] },
          totalResults: 100,
          searchTime: 1500
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory))
      
      render(<IntegratedSearchPage />)
      
      // 切换到历史标签页
      const historyTab = screen.getByRole('button', { name: /搜索历史/i })
      await user.click(historyTab)
      
      // 使用历史条件
      const useButton = screen.getByRole('button', { name: /重用/i })
      await user.click(useButton)
      
      // 切换回搜索条件标签页验证条件已应用
      const filtersTab = screen.getByRole('button', { name: /搜索条件/i })
      await user.click(filtersTab)
      
      // 验证姓氏已添加
      expect(screen.getByText('Smith')).toBeInTheDocument()
    })
  })

  describe('表单验证测试', () => {
    it('应该验证必填字段', async () => {
      // 模拟无效的API密钥
      const mockStore = {
        apiKey: '',
        isApiKeyValid: false,
        setError: vi.fn(),
        setLoading: vi.fn(),
        addTask: vi.fn(),
        updateTask: vi.fn()
      }
      
      vi.mocked(useAppStore).mockReturnValue(mockStore)
      
      render(<IntegratedSearchPage />)
      
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      
      // 按钮应该被禁用（因为没有API密钥）
      expect(searchButton).toBeDisabled()
    })

    it('应该验证地理位置格式', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      const addLocationButton = screen.getByRole('button', { name: /添加地理位置/i })

      // 只填写城市，不填写州/省和国家
      const cityInput = screen.getByPlaceholderText(/输入城市名称/i)
      await user.type(cityInput, 'Toronto')
      
      await user.click(addLocationButton)
      
      // 应该不会添加不完整的地理位置
      expect(screen.queryByText('Toronto')).not.toBeInTheDocument()
    })
  })

  describe('界面交互测试', () => {
    it('应该能够切换标签页', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      const resultsTab = screen.getByRole('button', { name: /搜索结果/i })
      const historyTab = screen.getByRole('button', { name: /搜索历史/i })
      
      await user.click(resultsTab)
      expect(screen.getByText('还没有搜索结果')).toBeInTheDocument()
      
      await user.click(historyTab)
      expect(screen.getByText('暂无搜索历史')).toBeInTheDocument()
    })

    it('应该能够清除所有筛选条件', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)
      
      // 添加一些筛选条件
      const lastNameInput = screen.getByPlaceholderText(/输入姓氏/i)
      await user.type(lastNameInput, 'Smith')
      await user.keyboard('{Enter}')
      
      // 选择一个行业
      const industryCheckbox = screen.getByRole('checkbox', { name: /信息技术与服务/i })
      await user.click(industryCheckbox)
      
      // 清除所有条件
      const clearButton = screen.getByRole('button', { name: /清空所有条件/i })
      await user.click(clearButton)
      
      // 验证条件已清除
      expect(screen.queryByText('Smith')).not.toBeInTheDocument()
      expect(industryCheckbox).not.toBeChecked()
    })
  })

  describe('错误处理测试', () => {
    it('应该处理localStorage错误', () => {
      // 模拟localStorage.getItem抛出错误
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const originalGetItem = Storage.prototype.getItem
      
      Storage.prototype.getItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage error')
      })

      // 组件应该能够正常渲染，不会因为localStorage错误而崩溃
      const { container } = render(<IntegratedSearchPage />)
      
      // 验证组件已渲染
      expect(container).toBeInTheDocument()
      expect(screen.getByText('智能搜索')).toBeInTheDocument()

      // 恢复原始方法
      Storage.prototype.getItem = originalGetItem
      consoleSpy.mockRestore()
    })

    it('应该处理无效的搜索历史数据', () => {
      // 模拟localStorage返回无效JSON
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorageMock.getItem.mockReturnValue('invalid json')

      // 组件应该能够正常渲染
      const { container } = render(<IntegratedSearchPage />)
      
      expect(container).toBeInTheDocument()
      expect(screen.getByText('智能搜索')).toBeInTheDocument()
      
      consoleSpy.mockRestore()
    })
  })
}) 