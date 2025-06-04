import {
  SearchFilters,
  SearchResponse,
  CreateListData,
  ListResponse,
  ListStatusResponse,
  ContinueSearchResponse,
  ContactsResponse,
  CreditsResponse,
  ErrorResponse
} from '@/types/api'

/**
 * Wiza API服务类
 * 封装所有与Wiza API的交互
 */
export class WizaApiService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * 更新API密钥
   */
  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  /**
   * 验证API密钥有效性
   * 通过获取积分信息来验证
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // 首先尝试使用window.api
      if (window.api?.validateApiKey) {
        const result = await window.api.validateApiKey(this.apiKey)
        if (result.success) {
          return true
        } else {
          console.error('API密钥验证失败:', result.error)
          return false
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api验证失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求验证API密钥
      try {
        const response = await fetch('https://wiza.co/api/meta/credits', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          return true
        } else {
          console.error('API密钥验证失败:', response.status, response.statusText)
          return false
        }
      } catch (httpError) {
        console.error('HTTP请求验证API密钥失败:', httpError)
        return false
      }
    }
  }

  /**
   * 搜索潜在客户数量
   * 基于prospect_search.yaml
   */
  async searchProspects(filters: SearchFilters, size?: number): Promise<SearchResponse> {
    try {
      // 首先尝试使用window.api
      if (window.api?.searchProspects) {
        const result = await window.api.searchProspects({ 
          apiKey: this.apiKey, 
          filters,
          size 
        })
        if (result.success) {
          return result.data
        } else {
          throw new Error(`API请求失败: ${result.error}`)
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api搜索失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求
      const response = await fetch('https://wiza.co/api/prospects/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: filters,
          size: size || 0
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
    }
  }

  /**
   * 创建潜在客户列表
   * 基于create_prospect_list.yaml
   */
  async createProspectList(data: CreateListData): Promise<ListResponse> {
    // 验证数据
    this.validateCreateListData(data)
    
    // 构建请求体，确保符合OpenAPI规范
    const requestBody = {
      list: {
        name: data.list.name,
        max_profiles: data.list.max_profiles,
        enrichment_level: data.list.enrichment_level,
        email_options: data.list.email_options,
        // 可选字段的条件包含
        ...(data.list.skip_duplicates !== undefined && { skip_duplicates: data.list.skip_duplicates }),
        ...(data.list.callback_url && { callback_url: data.list.callback_url })
      },
      filters: data.filters
    }
    
    console.log('创建列表请求体:', JSON.stringify(requestBody, null, 2))
    
    try {
      // 首先尝试使用window.api
      if (window.api?.createProspectList) {
        const result = await window.api.createProspectList({ apiKey: this.apiKey, data: requestBody })
        if (result.success) {
          console.log('列表创建API调用成功:', result.data)
          return result.data
        } else {
          console.error('列表创建API调用失败:', result.error)
          throw new Error(this.getDetailedErrorMessage(result.error || '未知错误'))
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api创建列表失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求 - 使用正确的端点
      const response = await fetch('https://wiza.co/api/prospects/create_prospect_list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('列表创建HTTP请求成功:', responseData)
        return responseData
      } else {
        const errorData = await response.text()
        console.error('列表创建HTTP请求失败:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          requestBody: requestBody,
          headers: {
            'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
            'Content-Type': 'application/json'
          }
        })
        
        // 尝试解析错误响应为JSON
        let parsedError = errorData
        try {
          const errorJson = JSON.parse(errorData)
          if (errorJson.status && errorJson.status.message) {
            parsedError = errorJson.status.message
          }
        } catch (e) {
          // 如果不是JSON，使用原始错误文本
        }
        
        // 根据HTTP状态码提供更详细的错误信息
        const detailedError = this.getHttpErrorMessage(response.status, parsedError)
        throw new Error(detailedError)
      }
    }
  }

  /**
   * 获取详细的错误信息
   */
  private getDetailedErrorMessage(error: string): string {
    // 常见错误模式匹配
    if (error.includes('payment') || error.includes('billing')) {
      return `支付相关问题: ${error}\n建议：请检查您的支付方式和账单状态`
    }
    
    if (error.includes('subscription') || error.includes('plan')) {
      return `订阅相关问题: ${error}\n建议：请检查您的订阅状态和计划限制`
    }
    
    if (error.includes('email') || error.includes('email_options')) {
      return `邮箱设置问题: ${error}\n建议：请检查邮箱类型设置（工作邮箱、个人邮箱、通用邮箱）`
    }
    
    if (error.includes('credits') || error.includes('balance')) {
      return `积分不足: ${error}\n建议：请充值或检查您的积分余额`
    }
    
    if (error.includes('filters') || error.includes('search')) {
      return `搜索条件问题: ${error}\n建议：请检查搜索条件的格式和有效性`
    }
    
    if (error.includes('suspended') || error.includes('disabled')) {
      return `账户状态异常: ${error}\n建议：请联系客服检查账户状态`
    }
    
    return `列表创建失败: ${error}\n建议：请检查API密钥、积分余额和搜索条件`
  }

  /**
   * 根据HTTP状态码获取错误信息
   */
  private getHttpErrorMessage(status: number, errorData: string): string {
    switch (status) {
      case 400:
        return `请求格式错误 (400): ${errorData}\n可能原因：搜索条件格式不正确或缺少必需字段`
      case 401:
        return `认证失败 (401): ${errorData}\n可能原因：API密钥无效或已过期`
      case 402:
        return `支付问题 (402): ${errorData}\n可能原因：积分不足或支付方式有问题`
      case 403:
        return `权限不足 (403): ${errorData}\n可能原因：账户被暂停或没有相应权限`
      case 404:
        return `资源不存在 (404): ${errorData}\n可能原因：API端点不正确`
      case 422:
        return `数据验证失败 (422): ${errorData}\n可能原因：搜索条件不符合要求或数据格式错误`
      case 429:
        return `请求过于频繁 (429): ${errorData}\n建议：请稍后重试`
      case 500:
        return `服务器内部错误 (500): ${errorData}\n建议：请稍后重试或联系技术支持`
      default:
        return `HTTP错误 (${status}): ${errorData}`
    }
  }

  /**
   * 验证创建列表数据
   */
  private validateCreateListData(data: CreateListData): void {
    // 验证必需字段
    if (!data.list.name || data.list.name.trim() === '') {
      throw new Error('列表名称不能为空')
    }
    
    if (!data.list.max_profiles || data.list.max_profiles <= 0) {
      throw new Error('最大联系人数必须大于0')
    }
    
    if (!data.list.enrichment_level) {
      throw new Error('丰富度等级不能为空')
    }
    
    if (!['none', 'partial', 'full'].includes(data.list.enrichment_level)) {
      throw new Error('丰富度等级必须是 none、partial 或 full')
    }
    
    if (!data.list.email_options) {
      throw new Error('邮箱选项不能为空')
    }
    
    // 验证邮箱选项
    const { accept_work, accept_personal, accept_generic } = data.list.email_options
    if (!accept_work && !accept_personal && !accept_generic) {
      throw new Error('至少需要接受一种邮箱类型')
    }
    
    if (!data.filters || Object.keys(data.filters).length === 0) {
      throw new Error('搜索条件不能为空')
    }
    
    // 详细验证搜索条件
    this.validateSearchFilters(data.filters)
    
    console.log('数据验证通过:', {
      listName: data.list.name,
      maxProfiles: data.list.max_profiles,
      enrichmentLevel: data.list.enrichment_level,
      filtersCount: Object.keys(data.filters).length,
      filterDetails: this.getFilterSummary(data.filters)
    })
  }

  /**
   * 验证搜索条件格式和内容
   */
  private validateSearchFilters(filters: SearchFilters): void {
    // 验证地理位置格式
    if (filters.location) {
      filters.location.forEach((loc, index) => {
        if (!loc.v || !loc.b) {
          throw new Error(`地理位置 ${index + 1} 格式不正确：缺少必需字段`)
        }
        if (!['city', 'state', 'country'].includes(loc.b)) {
          throw new Error(`地理位置 ${index + 1} 类型无效：${loc.b}`)
        }
        if (loc.s && !['i', 'e'].includes(loc.s)) {
          throw new Error(`地理位置 ${index + 1} 包含/排除标志无效：${loc.s}`)
        }
      })
    }
    
    // 验证职位标题格式
    if (filters.job_title) {
      filters.job_title.forEach((title, index) => {
        if (!title.v || !title.s) {
          throw new Error(`职位标题 ${index + 1} 格式不正确：缺少必需字段`)
        }
        if (!['i', 'e'].includes(title.s)) {
          throw new Error(`职位标题 ${index + 1} 包含/排除标志无效：${title.s}`)
        }
      })
    }
    
    // 验证公司名称格式
    if (filters.job_company) {
      filters.job_company.forEach((company, index) => {
        if (!company.v || !company.s) {
          throw new Error(`公司名称 ${index + 1} 格式不正确：缺少必需字段`)
        }
        if (!['i', 'e'].includes(company.s)) {
          throw new Error(`公司名称 ${index + 1} 包含/排除标志无效：${company.s}`)
        }
      })
    }

    // 验证姓氏数组
    if (filters.last_name && Array.isArray(filters.last_name)) {
      if (filters.last_name.length === 0) {
        console.warn('姓氏筛选条件为空数组')
      }
      filters.last_name.forEach((name, index) => {
        if (!name || typeof name !== 'string' || name.trim() === '') {
          throw new Error(`姓氏 ${index + 1} 不能为空`)
        }
      })
    }

    // 验证行业数组
    if (filters.company_industry && Array.isArray(filters.company_industry)) {
      if (filters.company_industry.length === 0) {
        console.warn('行业筛选条件为空数组')
      }
    }

    // 验证公司规模数组 - 重要：空数组可能导致搜索失败
    if (filters.company_size && Array.isArray(filters.company_size)) {
      if (filters.company_size.length === 0) {
        console.warn('⚠️ 公司规模筛选条件为空数组 - 这可能导致列表创建失败')
        console.warn('建议：要么删除company_size字段，要么提供有效的公司规模选项')
        
        // 从筛选条件中移除空的company_size数组
        delete filters.company_size
        console.log('已自动移除空的company_size筛选条件')
      }
    }

    // 清理其他空数组字段
    this.cleanupEmptyArrays(filters)

    // 检查是否有实际的筛选条件
    const hasValidFilters = this.hasValidFilters(filters)
    if (!hasValidFilters) {
      throw new Error('没有有效的搜索条件，请至少设置一个筛选条件')
    }
  }

  /**
   * 清理空数组字段
   */
  private cleanupEmptyArrays(filters: SearchFilters): void {
    // 移除所有空数组字段，因为它们可能导致API调用失败
    const fieldsToCheck = [
      'company_size', 'company_industry', 'last_name', 'first_name',
      'job_title_level', 'job_role'
    ] as const

    fieldsToCheck.forEach(field => {
      if (filters[field] && Array.isArray(filters[field]) && filters[field]!.length === 0) {
        console.log(`移除空的${field}筛选条件`)
        delete filters[field]
      }
    })
  }

  /**
   * 检查是否有有效的筛选条件
   */
  private hasValidFilters(filters: SearchFilters): boolean {
    const checks = [
      filters.location && filters.location.length > 0,
      filters.job_title && filters.job_title.length > 0,
      filters.last_name && filters.last_name.length > 0,
      filters.company_industry && filters.company_industry.length > 0,
      filters.company_size && filters.company_size.length > 0,
      filters.job_company && filters.job_company.length > 0,
      filters.first_name && filters.first_name.length > 0,
      filters.job_title_level && filters.job_title_level.length > 0,
      filters.job_role && filters.job_role.length > 0
    ]
    
    return checks.some(check => check === true)
  }

  /**
   * 获取筛选条件摘要
   */
  private getFilterSummary(filters: SearchFilters): any {
    return {
      location: filters.location?.length || 0,
      job_title: filters.job_title?.length || 0,
      last_name: filters.last_name?.length || 0,
      company_industry: filters.company_industry?.length || 0,
      company_size: filters.company_size?.length || 0,
      job_company: filters.job_company?.length || 0,
      first_name: filters.first_name?.length || 0,
      job_title_level: filters.job_title_level?.length || 0,
      job_role: filters.job_role?.length || 0,
      hasEmptyArrays: [
        filters.company_size?.length === 0 ? 'company_size' : null,
        filters.company_industry?.length === 0 ? 'company_industry' : null,
        filters.last_name?.length === 0 ? 'last_name' : null
      ].filter(Boolean)
    }
  }

  /**
   * 获取列表状态
   * 基于get_list.yaml
   */
  async getListStatus(listId: string): Promise<ListStatusResponse> {
    console.log(`获取列表 ${listId} 状态`)
    
    try {
      // 首先尝试使用window.api
      if (window.api?.getListStatus) {
        const result = await window.api.getListStatus({ apiKey: this.apiKey, listId })
        console.log(`列表 ${listId} 状态响应:`, result)
        
        if (result.success) {
          // 确保返回的数据符合ListStatusResponse接口
          if (!result.data?.data?.status) {
            console.warn('API返回的列表状态数据格式不符合预期', result.data)
          }
          return result.data
        } else {
          throw new Error(`API请求失败: ${result.error}`)
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api获取列表状态失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求
      const response = await fetch(`https://wiza.co/api/lists/${listId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const responseData = await response.json()
        console.log(`列表 ${listId} HTTP状态响应:`, responseData)
        return responseData
      } else {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
    }
  }

  /**
   * 继续搜索
   * 基于continue_prospect_search.yaml
   */
  async continueSearch(
    listId: string, 
    maxProfiles: number
  ): Promise<ContinueSearchResponse> {
    try {
      // 首先尝试使用window.api
      if (window.api?.continueSearch) {
        const result = await window.api.continueSearch({ apiKey: this.apiKey, listId, maxProfiles })
        if (result.success) {
          return result.data
        } else {
          throw new Error(`API请求失败: ${result.error}`)
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api继续搜索失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求
      // 根据OpenAPI规范，id字段必须是integer类型
      const requestBody = {
        id: parseInt(listId), // 确保id是integer类型
        max_profiles: maxProfiles
      }
      
      console.log('继续搜索请求体:', requestBody)
      
      const response = await fetch('https://wiza.co/api/prospects/continue_search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        return responseData
      } else {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
    }
  }

  /**
   * 获取列表联系人
   * 基于get_list_contacts.yaml
   */
  async getListContacts(
    listId: string, 
    segment: 'people' | 'valid' | 'risky' = 'people'
  ): Promise<ContactsResponse> {
    try {
      // 首先尝试使用window.api
      if (window.api?.getListContacts) {
        const result = await window.api.getListContacts({ apiKey: this.apiKey, listId, segment })
        if (result.success) {
          return result.data
        } else {
          throw new Error(`API请求失败: ${result.error}`)
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api获取联系人失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求
      const response = await fetch(`https://wiza.co/api/lists/${listId}/contacts?segment=${segment}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const responseData = await response.json()
        return responseData
      } else {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
    }
  }

  /**
   * 获取积分信息
   * 基于get_credits.yaml
   */
  async getCredits(): Promise<CreditsResponse> {
    try {
      // 首先尝试使用window.api
      if (window.api?.getCredits) {
        const result = await window.api.getCredits(this.apiKey)
        if (result.success) {
          return result.data
        } else {
          throw new Error(`API请求失败: ${result.error}`)
        }
      } else {
        throw new Error('window.api不可用')
      }
    } catch (error) {
      console.log('window.api获取积分失败，使用直接HTTP请求:', error)
      
      // Fallback: 直接HTTP请求
      const response = await fetch('https://wiza.co/api/meta/credits', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const responseData = await response.json()
        return responseData
      } else {
        const errorData = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }
    }
  }

  /**
   * 批量操作：创建列表并监控完成
   */
  async createAndMonitorList(
    filters: SearchFilters,
    listConfig: { name: string; max_profiles: number; enrichment_level: 'none' | 'partial' | 'full' },
    onProgress?: (status: ListStatusResponse) => void
  ): Promise<ContactsResponse> {
    // 1. 创建列表
    const createResponse = await this.createProspectList({
      filters,
      list: listConfig
    })

    const listId = createResponse.data.id.toString()  // 转换为字符串以兼容现有接口

    // 2. 监控列表状态
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getListStatus(listId)
          
          if (onProgress) {
            onProgress(status)
          }

          if (status.data.status === 'finished') {
            // 3. 获取联系人数据
            const contacts = await this.getListContacts(listId, 'people')
            resolve(contacts)
          } else if (status.data.status === 'failed') {
            reject(new Error('列表创建失败'))
          } else {
            // 继续监控
            setTimeout(checkStatus, 60000) // 每分钟检查一次
          }
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }
}

// 创建默认实例
let wizaApiInstance: WizaApiService | null = null

/**
 * 获取Wiza API实例
 */
export function getWizaApi(apiKey?: string): WizaApiService {
  if (!wizaApiInstance || (apiKey && apiKey !== wizaApiInstance['apiKey'])) {
    if (!apiKey) {
      throw new Error('API密钥未设置')
    }
    wizaApiInstance = new WizaApiService(apiKey)
  }
  return wizaApiInstance
}

/**
 * 重置API实例
 */
export function resetWizaApi(): void {
  wizaApiInstance = null
}