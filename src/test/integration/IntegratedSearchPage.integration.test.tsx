import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll } from 'vitest'
import IntegratedSearchPage from '../../renderer/src/components/Pages/IntegratedSearchPage'
import { useAppStore } from '../../renderer/src/stores/appStore'
import { getWizaApi } from '../../renderer/src/services/wizaApi'

// 集成测试配置
const REAL_API_KEY = process.env.VITE_WIZA_API_KEY || 'test-api-key'
const USE_REAL_API = process.env.REAL_API_TEST === 'true'

// Mock store for integration tests
vi.mock('../../renderer/src/stores/appStore')

// 模拟API响应数据
const mockSearchResponse = {
  status: { code: 200, message: '' },
  data: {
    total: 150,
    profiles: [
      {
        full_name: 'John Smith',
        linkedin_url: 'linkedin.com/in/john-smith',
        industry: 'Information Technology and Services',
        job_title: 'Software Engineer',
        job_company_name: 'Tech Corp',
        location_name: 'Toronto, Ontario, Canada'
      },
      {
        full_name: 'Jane Doe',
        linkedin_url: 'linkedin.com/in/jane-doe',
        industry: 'Financial Services',
        job_title: 'Financial Analyst',
        job_company_name: 'Finance Inc',
        location_name: 'Toronto, Ontario, Canada'
      }
    ]
  }
}

const mockCreateListResponse = {
  status: { code: 200, message: '🧙 Wiza is working on it!' },
  type: 'list',
  data: {
    id: 123,
    name: 'Test List',
    status: 'queued',
    stats: { people: 0 },
    created_at: new Date().toISOString(),
    enrichment_level: 'partial'
  }
}

describe('IntegratedSearchPage 集成测试', () => {
  const mockStore = {
    apiKey: REAL_API_KEY,
    isApiKeyValid: true,
    setError: vi.fn(),
    setLoading: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
  }

  let mockWizaApi: any

  beforeAll(() => {
    // 设置集成测试环境
    if (!USE_REAL_API) {
      console.log('使用模拟API进行集成测试')
    } else {
      console.log('使用真实API进行集成测试')
    }
  })

  beforeEach(() => {
    vi.mocked(useAppStore).mockReturnValue(mockStore)
    
    // 根据配置决定是否使用真实API
    if (!USE_REAL_API) {
      mockWizaApi = {
        searchProspects: vi.fn().mockResolvedValue(mockSearchResponse),
        createProspectList: vi.fn().mockResolvedValue(mockCreateListResponse),
      }
      
      vi.mocked(getWizaApi).mockReturnValue(mockWizaApi)
    }
    
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('完整搜索流程测试', () => {
    it('应该能够完成完整的搜索流程', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 1. 添加搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 2. 添加职位条件
      const jobTitleInput = screen.getByPlaceholderText('输入职位关键词')
      const addJobTitleButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(jobTitleInput, 'Engineer')
      await user.click(addJobTitleButton)

      // 3. 添加地理位置
      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addLocationButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addLocationButton)

      // 4. 选择行业
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      await user.click(itCheckbox)

      // 5. 选择公司规模
      const companySizeCheckbox = screen.getByLabelText('11-50人')
      await user.click(companySizeCheckbox)

      // 6. 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      expect(searchButton).not.toBeDisabled()
      
      await user.click(searchButton)

      // 7. 验证搜索状态
      expect(screen.getByText('搜索中...')).toBeInTheDocument()

      // 8. 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 9. 验证搜索结果
      if (!USE_REAL_API) {
        expect(mockWizaApi.searchProspects).toHaveBeenCalledWith({
          last_name: ['Smith'],
          job_title: [{ v: 'Engineer', s: 'i' }],
          location: [{ v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' }],
          company_industry: ['information technology and services'],
          company_size: ['11-50']
        })
      }

      // 10. 切换到结果标签
      const resultsTab = screen.getByRole('button', { name: /搜索结果/i })
      await user.click(resultsTab)

      // 11. 验证结果显示
      await waitFor(() => {
        expect(screen.getByText(/找到.*个潜在客户/i)).toBeInTheDocument()
      })
    }, 15000)

    it('应该能够创建潜在客户列表', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 1. 先执行搜索
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 2. 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 3. 切换到结果标签
      const resultsTab = screen.getByRole('button', { name: /搜索结果/i })
      await user.click(resultsTab)

      // 4. 创建列表
      const createListButton = screen.getByRole('button', { name: /创建潜在客户列表/i })
      await user.click(createListButton)

      // 5. 填写列表信息
      const listNameInput = screen.getByPlaceholderText('输入列表名称')
      const maxProfilesInput = screen.getByPlaceholderText('最大配置文件数')
      
      await user.type(listNameInput, 'Test Integration List')
      await user.clear(maxProfilesInput)
      await user.type(maxProfilesInput, '10')

      // 6. 确认创建
      const confirmCreateButton = screen.getByRole('button', { name: /确认创建/i })
      await user.click(confirmCreateButton)

      // 7. 验证创建状态
      expect(screen.getByText('创建中...')).toBeInTheDocument()

      // 8. 等待创建完成
      await waitFor(() => {
        expect(screen.queryByText('创建中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 9. 验证API调用
      if (!USE_REAL_API) {
        expect(mockWizaApi.createProspectList).toHaveBeenCalledWith({
          filters: { last_name: ['Smith'] },
          list: {
            name: 'Test Integration List',
            max_profiles: 10,
            enrichment_level: 'partial',
            email_options: {
              accept_work: true,
              accept_personal: true,
              accept_generic: true
            }
          }
        })
      }

      // 10. 验证成功消息
      await waitFor(() => {
        expect(screen.getByText(/列表创建成功/i)).toBeInTheDocument()
      })
    }, 20000)
  })

  describe('搜索条件组合测试', () => {
    it('应该能够处理复杂的搜索条件组合', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加多个姓氏
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)
      await user.type(lastNameInput, 'Johnson')
      await user.click(addLastNameButton)

      // 添加多个职位（包含和排除）
      const jobTitleInput = screen.getByPlaceholderText('输入职位关键词')
      const addJobTitleButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(jobTitleInput, 'Manager')
      await user.click(addJobTitleButton)
      
      // 切换到排除模式
      const excludeRadio = screen.getByLabelText('排除')
      await user.click(excludeRadio)
      
      await user.type(jobTitleInput, 'Intern')
      await user.click(addJobTitleButton)

      // 添加多个地理位置
      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addLocationButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addLocationButton)

      // 选择多个行业
      const itCheckbox = screen.getByLabelText('信息技术与服务')
      const financeCheckbox = screen.getByLabelText('金融服务')
      await user.click(itCheckbox)
      await user.click(financeCheckbox)

      // 选择多个公司规模
      const smallCompanyCheckbox = screen.getByLabelText('11-50人')
      const mediumCompanyCheckbox = screen.getByLabelText('51-200人')
      await user.click(smallCompanyCheckbox)
      await user.click(mediumCompanyCheckbox)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 验证复杂条件的API调用
      if (!USE_REAL_API) {
        expect(mockWizaApi.searchProspects).toHaveBeenCalledWith({
          last_name: ['Smith', 'Johnson'],
          job_title: [
            { v: 'Manager', s: 'i' },
            { v: 'Intern', s: 'e' }
          ],
          location: [{ v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' }],
          company_industry: ['information technology and services', 'financial services'],
          company_size: ['11-50', '51-200']
        })
      }
    }, 15000)

    it('应该能够处理不同类型的地理位置', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加城市类型地理位置
      let cityInput = screen.getByPlaceholderText('城市')
      let stateInput = screen.getByPlaceholderText('州/省')
      let countryInput = screen.getByPlaceholderText('国家')
      const addLocationButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addLocationButton)

      // 切换到州/省类型
      const stateTypeRadio = screen.getByLabelText('州/省')
      await user.click(stateTypeRadio)
      
      // 清空输入框
      stateInput = screen.getByPlaceholderText('州/省')
      countryInput = screen.getByPlaceholderText('国家')
      await user.clear(stateInput)
      await user.clear(countryInput)
      
      await user.type(stateInput, 'California')
      await user.type(countryInput, 'United States')
      await user.click(addLocationButton)

      // 切换到国家类型
      const countryTypeRadio = screen.getByLabelText('国家')
      await user.click(countryTypeRadio)
      
      countryInput = screen.getByPlaceholderText('国家')
      await user.clear(countryInput)
      await user.type(countryInput, 'United Kingdom')
      await user.click(addLocationButton)

      // 添加一个姓氏以启用搜索
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 验证地理位置格式
      if (!USE_REAL_API) {
        expect(mockWizaApi.searchProspects).toHaveBeenCalledWith({
          last_name: ['Smith'],
          location: [
            { v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' },
            { v: 'California, United States', b: 'state', s: 'i' },
            { v: 'United Kingdom', b: 'country', s: 'i' }
          ]
        })
      }
    }, 15000)
  })

  describe('错误处理和边界情况测试', () => {
    it('应该处理API搜索错误', async () => {
      if (!USE_REAL_API) {
        mockWizaApi.searchProspects.mockRejectedValue(new Error('API Error'))
      }

      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 验证错误处理
      if (!USE_REAL_API) {
        await waitFor(() => {
          expect(screen.getByText(/搜索失败/i)).toBeInTheDocument()
        }, { timeout: 5000 })
      }
    }, 10000)

    it('应该处理API创建列表错误', async () => {
      if (!USE_REAL_API) {
        mockWizaApi.createProspectList.mockRejectedValue(new Error('Create List Error'))
      }

      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 先执行成功的搜索
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 切换到结果标签
      const resultsTab = screen.getByRole('button', { name: /搜索结果/i })
      await user.click(resultsTab)

      // 尝试创建列表
      const createListButton = screen.getByRole('button', { name: /创建潜在客户列表/i })
      await user.click(createListButton)

      const listNameInput = screen.getByPlaceholderText('输入列表名称')
      await user.type(listNameInput, 'Test Error List')

      const confirmCreateButton = screen.getByRole('button', { name: /确认创建/i })
      await user.click(confirmCreateButton)

      // 验证错误处理
      if (!USE_REAL_API) {
        await waitFor(() => {
          expect(screen.getByText(/创建列表失败/i)).toBeInTheDocument()
        }, { timeout: 5000 })
      }
    }, 15000)

    it('应该处理无效的API密钥', async () => {
      vi.mocked(useAppStore).mockReturnValue({
        ...mockStore,
        isApiKeyValid: false,
      })

      render(<IntegratedSearchPage />)

      // 验证警告消息
      expect(screen.getByText(/请先配置有效的API密钥/i)).toBeInTheDocument()

      // 验证搜索按钮被禁用
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      expect(searchButton).toBeDisabled()
    })

    it('应该处理网络超时', async () => {
      if (!USE_REAL_API) {
        mockWizaApi.searchProspects.mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
          )
        )
      }

      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 验证超时处理
      if (!USE_REAL_API) {
        await waitFor(() => {
          expect(screen.getByText(/搜索失败/i)).toBeInTheDocument()
        }, { timeout: 5000 })
      }
    }, 10000)
  })

  describe('性能和用户体验测试', () => {
    it('应该在合理时间内完成搜索', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      const startTime = Date.now()

      // 添加搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      const endTime = Date.now()
      const searchTime = endTime - startTime

      // 验证搜索时间合理（模拟API应该很快，真实API可能较慢）
      if (!USE_REAL_API) {
        expect(searchTime).toBeLessThan(5000) // 5秒内完成
      } else {
        expect(searchTime).toBeLessThan(30000) // 30秒内完成
      }
    }, 35000)

    it('应该显示搜索进度指示器', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      // 执行搜索
      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      // 验证加载指示器
      expect(screen.getByText('搜索中...')).toBeInTheDocument()
      
      // 验证按钮状态变化
      expect(searchButton).toBeDisabled()

      // 等待搜索完成
      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 验证按钮恢复
      expect(searchButton).not.toBeDisabled()
    }, 15000)

    it('应该保存和恢复搜索历史', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 执行搜索
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'TestHistory')
      await user.click(addLastNameButton)

      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 切换到历史标签
      const historyTab = screen.getByRole('button', { name: /搜索历史/i })
      await user.click(historyTab)

      // 验证历史记录
      await waitFor(() => {
        expect(screen.getByText(/TestHistory/i)).toBeInTheDocument()
      })

      // 使用历史记录
      const useHistoryButton = screen.getByRole('button', { name: /使用此条件/i })
      await user.click(useHistoryButton)

      // 切换回筛选标签验证条件恢复
      const filtersTab = screen.getByRole('button', { name: /搜索条件/i })
      await user.click(filtersTab)

      expect(screen.getByText('TestHistory')).toBeInTheDocument()
    }, 20000)
  })

  describe('数据完整性测试', () => {
    it('应该正确格式化搜索条件', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加各种类型的搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'Smith')
      await user.click(addLastNameButton)

      const jobTitleInput = screen.getByPlaceholderText('输入职位关键词')
      const addJobTitleButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(jobTitleInput, 'Software Engineer')
      await user.click(addJobTitleButton)

      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addLocationButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'Toronto')
      await user.type(stateInput, 'Ontario')
      await user.type(countryInput, 'Canada')
      await user.click(addLocationButton)

      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 验证API调用参数格式
      if (!USE_REAL_API) {
        const expectedFilters = {
          last_name: ['Smith'],
          job_title: [{ v: 'Software Engineer', s: 'i' }],
          location: [{ v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' }]
        }
        
        expect(mockWizaApi.searchProspects).toHaveBeenCalledWith(expectedFilters)
      }
    }, 15000)

    it('应该正确处理特殊字符和Unicode', async () => {
      const user = userEvent.setup()
      render(<IntegratedSearchPage />)

      // 添加包含特殊字符的搜索条件
      const lastNameInput = screen.getByPlaceholderText('输入姓氏')
      const addLastNameButton = screen.getByRole('button', { name: /添加姓氏/i })
      
      await user.type(lastNameInput, 'O\'Connor')
      await user.click(addLastNameButton)

      const jobTitleInput = screen.getByPlaceholderText('输入职位关键词')
      const addJobTitleButton = screen.getByRole('button', { name: /添加职位/i })
      
      await user.type(jobTitleInput, 'VP & Director')
      await user.click(addJobTitleButton)

      const cityInput = screen.getByPlaceholderText('城市')
      const stateInput = screen.getByPlaceholderText('州/省')
      const countryInput = screen.getByPlaceholderText('国家')
      const addLocationButton = screen.getByRole('button', { name: /添加地点/i })
      
      await user.type(cityInput, 'São Paulo')
      await user.type(stateInput, 'São Paulo')
      await user.type(countryInput, 'Brazil')
      await user.click(addLocationButton)

      const searchButton = screen.getByRole('button', { name: /开始搜索/i })
      await user.click(searchButton)

      await waitFor(() => {
        expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
      }, { timeout: 10000 })

      // 验证特殊字符处理
      if (!USE_REAL_API) {
        expect(mockWizaApi.searchProspects).toHaveBeenCalledWith({
          last_name: ['O\'Connor'],
          job_title: [{ v: 'VP & Director', s: 'i' }],
          location: [{ v: 'São Paulo, São Paulo, Brazil', b: 'city', s: 'i' }]
        })
      }
    }, 15000)
  })
}) 