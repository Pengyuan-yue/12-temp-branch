/**
 * 测试配置文件
 * 用于管理测试环境设置和常量
 */

// 测试环境配置
export const TEST_CONFIG = {
  // API测试配置
  API: {
    REAL_API_KEY: process.env.VITE_WIZA_API_KEY || 'test-api-key',
    USE_REAL_API: process.env.REAL_API_TEST === 'true',
    BASE_URL: 'https://wiza.co/api',
    TIMEOUT: 30000,
  },

  // 测试超时配置
  TIMEOUTS: {
    SEARCH: 15000,
    LIST_CREATION: 20000,
    API_CALL: 10000,
    UI_INTERACTION: 5000,
    ELEMENT_WAIT: 3000,
  },

  // 测试数据配置
  TEST_DATA: {
    DEFAULT_LAST_NAMES: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'],
    DEFAULT_JOB_TITLES: ['Engineer', 'Manager', 'Director', 'Analyst', 'Specialist'],
    DEFAULT_LOCATIONS: {
      CITIES: [
        { city: 'Toronto', state: 'Ontario', country: 'Canada' },
        { city: 'New York', state: 'New York', country: 'United States' },
        { city: 'London', state: 'England', country: 'United Kingdom' },
        { city: 'Sydney', state: 'New South Wales', country: 'Australia' },
      ],
      STATES: [
        { state: 'California', country: 'United States' },
        { state: 'Ontario', country: 'Canada' },
        { state: 'Bavaria', country: 'Germany' },
      ],
      COUNTRIES: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia'],
    },
    DEFAULT_INDUSTRIES: [
      'information technology and services',
      'financial services',
      'health, wellness and fitness',
      'education management',
      'marketing and advertising',
    ],
    DEFAULT_COMPANY_SIZES: ['1-10', '11-50', '51-200', '201-500', '501-1000'],
  },

  // 模拟数据配置
  MOCK_DATA: {
    SEARCH_RESPONSE_TOTAL: 150,
    PROFILE_COUNT: 5,
    LIST_ID: 123,
    SEARCH_TIME: 1500,
  },

  // 测试标识符
  TEST_IDS: {
    LASTNAME_BADGE: 'lastname-badge',
    JOBTITLE_BADGE: 'jobtitle-badge',
    LOCATION_BADGE: 'location-badge',
    INDUSTRY_CHECKBOX: 'industry-checkbox',
    COMPANY_SIZE_CHECKBOX: 'company-size-checkbox',
    SEARCH_BUTTON: 'search-button',
    CLEAR_BUTTON: 'clear-button',
    CREATE_LIST_BUTTON: 'create-list-button',
  },

  // 错误消息
  ERROR_MESSAGES: {
    API_KEY_INVALID: '请先配置有效的API密钥',
    SEARCH_FAILED: '搜索失败',
    LIST_CREATION_FAILED: '创建列表失败',
    NETWORK_ERROR: '网络错误',
    VALIDATION_ERROR: '验证失败',
    LOCATION_FORMAT_ERROR: '城市类型需要填写：城市、州/省、国家三个字段',
  },

  // 成功消息
  SUCCESS_MESSAGES: {
    SEARCH_COMPLETED: '搜索完成',
    LIST_CREATED: '列表创建成功',
    FILTERS_CLEARED: '筛选条件已清除',
    HISTORY_LOADED: '历史记录已加载',
  },

  // UI文本
  UI_TEXT: {
    SEARCH_BUTTON: '开始搜索',
    SEARCHING: '搜索中...',
    CREATING_LIST: '创建中...',
    ADD_LASTNAME: '添加姓氏',
    ADD_JOBTITLE: '添加职位',
    ADD_LOCATION: '添加地点',
    CLEAR_ALL: '清除所有条件',
    CREATE_LIST: '创建潜在客户列表',
    CONFIRM_CREATE: '确认创建',
    USE_HISTORY: '使用此条件',
    SEARCH_RESULTS: '搜索结果',
    SEARCH_HISTORY: '搜索历史',
    SEARCH_FILTERS: '搜索条件',
  },

  // 表单字段
  FORM_FIELDS: {
    LASTNAME_INPUT: '输入姓氏',
    JOBTITLE_INPUT: '输入职位关键词',
    CITY_INPUT: '城市',
    STATE_INPUT: '州/省',
    COUNTRY_INPUT: '国家',
    LIST_NAME_INPUT: '输入列表名称',
    MAX_PROFILES_INPUT: '最大配置文件数',
  },

  // 选择器
  SELECTORS: {
    INCLUDE_RADIO: '包含',
    EXCLUDE_RADIO: '排除',
    CITY_TYPE: '城市',
    STATE_TYPE: '州/省',
    COUNTRY_TYPE: '国家',
    INCLUDE_LOCATION: '包含地点',
    EXCLUDE_LOCATION: '排除地点',
  },
}

// API测试配置
export const API_CONFIG = {
  // 真实API测试配置
  REAL_API: {
    BASE_URL: 'https://wiza.co/api',
    API_KEY: 'db2e139a8670a05f3e4ca2c7c54014812d80abf118064c7a32be1920443430e9', // 真实API密钥
    TIMEOUT: 30000, // 30秒超时
  },
  
  // 模拟API测试配置
  MOCK_API: {
    BASE_URL: 'http://localhost:3000/api',
    API_KEY: 'test-api-key',
    TIMEOUT: 5000,
  }
}

/**
 * 获取测试环境信息
 */
export const getTestEnvironment = () => {
  return {
    isRealApi: TEST_CONFIG.API.USE_REAL_API,
    apiKey: TEST_CONFIG.API.REAL_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    testMode: process.env.VITE_TEST_MODE,
  }
}

/**
 * 检查是否为真实API测试环境
 */
export const isRealApiTest = (): boolean => {
  // 恢复正常的环境检测
  return process.env.VITE_USE_REAL_API === 'true' || 
         process.env.USE_REAL_API === 'true' ||
         process.env.NODE_ENV === 'real-api-test'
}

/**
 * 获取测试超时时间
 */
export const getTimeout = (type: keyof typeof TEST_CONFIG.TIMEOUTS): number => {
  return TEST_CONFIG.TIMEOUTS[type]
}

/**
 * 获取随机测试数据
 */
export const getRandomTestData = () => {
  const { TEST_DATA } = TEST_CONFIG
  
  return {
    lastName: TEST_DATA.DEFAULT_LAST_NAMES[
      Math.floor(Math.random() * TEST_DATA.DEFAULT_LAST_NAMES.length)
    ],
    jobTitle: TEST_DATA.DEFAULT_JOB_TITLES[
      Math.floor(Math.random() * TEST_DATA.DEFAULT_JOB_TITLES.length)
    ],
    location: TEST_DATA.DEFAULT_LOCATIONS.CITIES[
      Math.floor(Math.random() * TEST_DATA.DEFAULT_LOCATIONS.CITIES.length)
    ],
    industry: TEST_DATA.DEFAULT_INDUSTRIES[
      Math.floor(Math.random() * TEST_DATA.DEFAULT_INDUSTRIES.length)
    ],
    companySize: TEST_DATA.DEFAULT_COMPANY_SIZES[
      Math.floor(Math.random() * TEST_DATA.DEFAULT_COMPANY_SIZES.length)
    ],
  }
}

/**
 * 生成唯一的测试ID
 */
export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 测试断言辅助函数
 */
export const assertions = {
  /**
   * 验证搜索结果数量格式
   */
  searchResultsPattern: (count: number) => 
    new RegExp(`找到.*${count}.*个潜在客户`, 'i'),
  
  /**
   * 验证搜索结果通用格式
   */
  searchResultsGeneral: /找到.*个潜在客户/i,
  
  /**
   * 验证时间格式
   */
  timePattern: /\d+\.\d+秒/,
  
  /**
   * 验证日期格式
   */
  datePattern: /\d{4}-\d{2}-\d{2}/,
}

/**
 * 测试数据验证器
 */
export const validators = {
  /**
   * 验证搜索条件格式
   */
  isValidSearchFilters: (filters: any): boolean => {
    return typeof filters === 'object' && filters !== null
  },
  
  /**
   * 验证API响应格式
   */
  isValidApiResponse: (response: any): boolean => {
    return response && 
           response.status && 
           typeof response.status.code === 'number' &&
           response.data
  },
  
  /**
   * 验证地理位置格式
   */
  isValidLocation: (location: string, type: 'city' | 'state' | 'country'): boolean => {
    const parts = location.split(', ')
    switch (type) {
      case 'city':
        return parts.length === 3
      case 'state':
        return parts.length === 2
      case 'country':
        return parts.length === 1
      default:
        return false
    }
  },
}

/**
 * 性能测试配置
 */
export const PERFORMANCE_CONFIG = {
  // 性能基准
  BENCHMARKS: {
    SEARCH_TIME_MAX: 30000, // 30秒
    LIST_CREATION_TIME_MAX: 60000, // 60秒
    UI_RESPONSE_TIME_MAX: 1000, // 1秒
    MEMORY_USAGE_MAX: 200 * 1024 * 1024, // 200MB
  },
  
  // 性能监控
  MONITORING: {
    ENABLE_TIMING: true,
    ENABLE_MEMORY_TRACKING: true,
    ENABLE_NETWORK_TRACKING: true,
  },
}

/**
 * 可访问性测试配置
 */
export const ACCESSIBILITY_CONFIG = {
  // ARIA标签检查
  ARIA_LABELS: {
    SEARCH_BUTTON: 'search-button',
    FILTER_FORM: 'filter-form',
    RESULTS_TABLE: 'results-table',
    HISTORY_LIST: 'history-list',
  },
  
  // 键盘导航
  KEYBOARD_NAVIGATION: {
    TAB_ORDER: true,
    ENTER_KEY: true,
    ESCAPE_KEY: true,
    ARROW_KEYS: true,
  },
  
  // 颜色对比度
  COLOR_CONTRAST: {
    MIN_RATIO: 4.5,
    LARGE_TEXT_RATIO: 3.0,
  },
} 