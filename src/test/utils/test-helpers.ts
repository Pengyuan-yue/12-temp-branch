import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { SearchFilters } from '../../renderer/src/types/api'

/**
 * 智能搜索页面测试辅助工具类
 * 提供链式调用的测试方法
 */
export class IntegratedSearchTestHelper {
  private user = userEvent.setup()

  /**
   * 确保在搜索条件标签页
   */
  private async ensureOnFiltersTab() {
    const filtersTab = screen.getByRole('button', { name: /搜索条件/i })
    await this.user.click(filtersTab)
    // 等待标签页切换完成
    await waitFor(() => {
      expect(screen.getByPlaceholderText('输入姓氏')).toBeInTheDocument()
    }, { timeout: 2000 })
  }

  /**
   * 添加姓氏筛选条件
   */
  async addLastName(lastName: string) {
    await this.ensureOnFiltersTab()
    
    const input = screen.getByPlaceholderText('输入姓氏')
    const addButton = screen.getByRole('button', { name: /添加姓氏/i })

    await this.user.clear(input)
    await this.user.type(input, lastName)
    await this.user.click(addButton)

    // 验证姓氏已添加
    await waitFor(() => {
      expect(screen.getByText(lastName)).toBeInTheDocument()
    })
  }

  /**
   * 批量添加姓氏
   */
  async addLastNames(lastNames: string[]) {
    for (const lastName of lastNames) {
      await this.addLastName(lastName)
    }
  }

  /**
   * 添加职位筛选条件
   */
  async addJobTitle(jobTitle: string, includeExclude: 'i' | 'e' = 'i') {
    await this.ensureOnFiltersTab()
    
    // 设置包含/排除选项
    const includeRadio = screen.getByLabelText('包含')
    const excludeRadio = screen.getByLabelText('排除')
    
    if (includeExclude === 'i') {
      await this.user.click(includeRadio)
    } else {
      await this.user.click(excludeRadio)
    }

    const input = screen.getByPlaceholderText('输入职位关键词')
    const addButton = screen.getByRole('button', { name: /添加职位/i })

    await this.user.clear(input)
    await this.user.type(input, jobTitle)
    await this.user.click(addButton)

    // 验证职位已添加
    await waitFor(() => {
      expect(screen.getByText(jobTitle)).toBeInTheDocument()
    })
  }

  /**
   * 添加地理位置筛选条件
   */
  async addLocation(
    type: 'city' | 'state' | 'country',
    city?: string,
    state?: string,
    country?: string,
    includeExclude: 'i' | 'e' = 'i'
  ) {
    await this.ensureOnFiltersTab()
    
    // 选择地理位置类型
    const typeRadio = screen.getByLabelText(
      type === 'city' ? '城市' : type === 'state' ? '州/省' : '国家'
    )
    await this.user.click(typeRadio)

    // 设置包含/排除选项
    const includeRadio = screen.getByLabelText('包含', { selector: 'input[name="location-include-exclude"]' })
    const excludeRadio = screen.getByLabelText('排除', { selector: 'input[name="location-include-exclude"]' })
    
    if (includeExclude === 'i') {
      await this.user.click(includeRadio)
    } else {
      await this.user.click(excludeRadio)
    }

    // 填写地理位置信息
    if (city) {
      const cityInput = screen.getByPlaceholderText('城市')
      await this.user.clear(cityInput)
      await this.user.type(cityInput, city)
    }

    if (state) {
      const stateInput = screen.getByPlaceholderText('州/省')
      await this.user.clear(stateInput)
      await this.user.type(stateInput, state)
    }

    if (country) {
      const countryInput = screen.getByPlaceholderText('国家')
      await this.user.clear(countryInput)
      await this.user.type(countryInput, country)
    }

    const addButton = screen.getByRole('button', { name: /添加地点/i })
    await this.user.click(addButton)

    // 验证地理位置已添加
    const expectedText = type === 'city' ? `${city}, ${state}, ${country}` :
                        type === 'state' ? `${state}, ${country}` : country
    
    if (expectedText) {
      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument()
      })
    }
  }

  /**
   * 选择行业
   */
  async selectIndustries(industries: string[]) {
    await this.ensureOnFiltersTab()
    
    for (const industry of industries) {
      const checkbox = screen.getByLabelText(new RegExp(industry, 'i'))
      await this.user.click(checkbox)
    }
  }

  /**
   * 选择公司规模
   */
  async selectCompanySizes(sizes: string[]) {
    await this.ensureOnFiltersTab()
    
    for (const size of sizes) {
      const checkbox = screen.getByLabelText(size)
      await this.user.click(checkbox)
    }
  }

  /**
   * 执行搜索
   */
  async performSearch() {
    const searchButton = screen.getByRole('button', { name: /开始搜索/i })
    await this.user.click(searchButton)
  }

  /**
   * 等待搜索完成
   */
  async waitForSearchComplete(timeout = 10000) {
    await waitFor(() => {
      expect(screen.queryByText('搜索中...')).not.toBeInTheDocument()
    }, { timeout })
    return this
  }

  /**
   * 切换到结果标签
   */
  async switchToResultsTab() {
    const resultsTab = screen.getByRole('button', { name: /搜索结果/i })
    await this.user.click(resultsTab)
    return this
  }

  /**
   * 切换到历史标签
   */
  async switchToHistoryTab() {
    const historyTab = screen.getByRole('button', { name: /搜索历史/i })
    await this.user.click(historyTab)
    return this
  }

  /**
   * 切换到筛选标签
   */
  async switchToFiltersTab() {
    const filtersTab = screen.getByRole('button', { name: /搜索条件/i })
    await this.user.click(filtersTab)
    return this
  }

  /**
   * 创建潜在客户列表
   */
  async createProspectList(listName: string, maxProfiles: number = 10) {
    const createListButton = screen.getByRole('button', { name: /创建潜在客户列表/i })
    await this.user.click(createListButton)

    const listNameInput = screen.getByPlaceholderText('输入列表名称')
    const maxProfilesInput = screen.getByPlaceholderText('最大配置文件数')
    
    await this.user.type(listNameInput, listName)
    await this.user.clear(maxProfilesInput)
    await this.user.type(maxProfilesInput, maxProfiles.toString())

    const confirmCreateButton = screen.getByRole('button', { name: /确认创建/i })
    await this.user.click(confirmCreateButton)
    
    return this
  }

  /**
   * 等待列表创建完成
   */
  async waitForListCreationComplete(timeout = 10000) {
    await waitFor(() => {
      expect(screen.queryByText('创建中...')).not.toBeInTheDocument()
    }, { timeout })
    return this
  }

  /**
   * 清除所有筛选条件
   */
  async clearAllFilters() {
    const clearButton = screen.getByRole('button', { name: /清除所有条件/i })
    await this.user.click(clearButton)
    return this
  }

  /**
   * 使用历史搜索条件
   */
  async useHistoryFilters(index = 0) {
    const useButtons = screen.getAllByRole('button', { name: /使用此条件/i })
    if (useButtons[index]) {
      await this.user.click(useButtons[index])
    }
    return this
  }

  /**
   * 验证搜索结果显示
   */
  expectSearchResults(expectedCount?: number) {
    if (expectedCount !== undefined) {
      expect(screen.getByText(new RegExp(`找到.*${expectedCount}.*个潜在客户`, 'i'))).toBeInTheDocument()
    } else {
      expect(screen.getByText(/找到.*个潜在客户/i)).toBeInTheDocument()
    }
    return this
  }

  /**
   * 验证错误消息
   */
  expectError(errorMessage: string | RegExp) {
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    return this
  }

  /**
   * 验证成功消息
   */
  expectSuccess(successMessage: string | RegExp) {
    expect(screen.getByText(successMessage)).toBeInTheDocument()
    return this
  }

  /**
   * 验证筛选条件标签存在
   */
  expectFilterTag(tagText: string) {
    expect(screen.getByText(tagText)).toBeInTheDocument()
    return this
  }

  /**
   * 验证筛选条件标签不存在
   */
  expectNoFilterTag(tagText: string) {
    expect(screen.queryByText(tagText)).not.toBeInTheDocument()
    return this
  }

  /**
   * 验证按钮状态
   */
  expectButtonState(buttonName: string | RegExp, disabled: boolean) {
    const button = screen.getByRole('button', { name: buttonName })
    if (disabled) {
      expect(button).toBeDisabled()
    } else {
      expect(button).not.toBeDisabled()
    }
    return this
  }

  /**
   * 验证复选框状态
   */
  expectCheckboxState(labelText: string, checked: boolean) {
    const checkbox = screen.getByLabelText(labelText)
    if (checked) {
      expect(checkbox).toBeChecked()
    } else {
      expect(checkbox).not.toBeChecked()
    }
    return this
  }
}

/**
 * 创建测试用的搜索条件
 */
export const createTestFilters = (overrides: Partial<SearchFilters> = {}): SearchFilters => {
  const defaultFilters: SearchFilters = {
    last_name: ['Smith'],
    job_title: [{ v: 'Engineer', s: 'i' }],
    location: [{ v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' }],
    company_industry: ['information technology and services'],
    company_size: ['11-50']
  }

  return { ...defaultFilters, ...overrides }
}

/**
 * 创建复杂的测试搜索条件
 */
export const createComplexTestFilters = (): SearchFilters => {
  return {
    last_name: ['Smith', 'Johnson', 'Williams'],
    job_title: [
      { v: 'Manager', s: 'i' },
      { v: 'Director', s: 'i' },
      { v: 'Intern', s: 'e' }
    ],
    location: [
      { v: 'Toronto, Ontario, Canada', b: 'city', s: 'i' },
      { v: 'California, United States', b: 'state', s: 'i' },
      { v: 'United Kingdom', b: 'country', s: 'e' }
    ],
    company_industry: [
      'information technology and services',
      'financial services',
      'health, wellness and fitness'
    ],
    company_size: ['11-50', '51-200', '201-500']
  }
}

/**
 * 模拟API响应数据生成器
 */
export const createMockSearchResponse = (total: number = 150, profileCount: number = 2) => {
  const profiles = Array.from({ length: profileCount }, (_, index) => ({
    full_name: `Test User ${index + 1}`,
    linkedin_url: `linkedin.com/in/test-user-${index + 1}`,
    industry: 'Information Technology and Services',
    job_title: `Software Engineer ${index + 1}`,
    job_company_name: `Tech Corp ${index + 1}`,
    location_name: 'Toronto, Ontario, Canada'
  }))

  return {
    status: { code: 200, message: '' },
    data: { total, profiles }
  }
}

/**
 * 模拟列表创建响应数据生成器
 */
export const createMockListResponse = (listId: number = 123, listName: string = 'Test List') => {
  return {
    status: { code: 200, message: '🧙 Wiza is working on it!' },
    type: 'list',
    data: {
      id: listId,
      name: listName,
      status: 'queued',
      stats: { people: 0 },
      created_at: new Date().toISOString(),
      enrichment_level: 'partial'
    }
  }
}

/**
 * 等待元素出现的辅助函数
 */
export const waitForElement = async (
  selector: () => HTMLElement | null,
  timeout = 5000
) => {
  await waitFor(() => {
    const element = selector()
    expect(element).toBeInTheDocument()
  }, { timeout })
}

/**
 * 等待元素消失的辅助函数
 */
export const waitForElementToDisappear = async (
  selector: () => HTMLElement | null,
  timeout = 5000
) => {
  await waitFor(() => {
    const element = selector()
    expect(element).not.toBeInTheDocument()
  }, { timeout })
}

/**
 * 验证API调用参数的辅助函数
 */
export const expectApiCall = (
  mockFn: any,
  expectedParams: any,
  callIndex = 0
) => {
  expect(mockFn).toHaveBeenCalledWith(expectedParams)
  if (callIndex > 0) {
    expect(mockFn).toHaveBeenNthCalledWith(callIndex + 1, expectedParams)
  }
}

/**
 * 模拟localStorage的辅助函数
 */
export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}
  
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key])
    },
    get storage() {
      return { ...storage }
    }
  }
}

/**
 * 创建测试用的搜索历史数据
 */
export const createTestSearchHistory = (count: number = 3) => {
  return Array.from({ length: count }, (_, index) => ({
    id: `history-${index + 1}`,
    timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    filters: createTestFilters({ 
      last_name: [`TestUser${index + 1}`] 
    }),
    totalResults: 100 + index * 50,
    searchTime: 1500 + index * 200
  }))
} 