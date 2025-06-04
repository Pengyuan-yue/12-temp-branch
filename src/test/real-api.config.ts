// 真实API测试配置
export const REAL_API_CONFIG = {
  // 从环境变量获取真实API密钥
  API_KEY: process.env.WIZA_API_KEY || '',
  BASE_URL: 'https://wiza.co/api',
  
  // 测试超时设置
  TIMEOUT: 30000,
  
  // 测试数据
  TEST_SEARCH_FILTERS: {
    job_title: [{ v: 'CEO', s: 'i' }],
    company_size: ['1-10', '11-50'],
  },
  
  TEST_LIST_CONFIG: {
    name: `测试列表_${new Date().toISOString()}`,
    max_profiles: 2,
    enrichment_level: 'partial' as const,
    email_options: {
      accept_work: true,
      accept_personal: true,
      accept_generic: true,
    },
  },
}

// 检查是否有真实API密钥
export const hasRealApiKey = (): boolean => {
  return Boolean(REAL_API_CONFIG.API_KEY && REAL_API_CONFIG.API_KEY.length > 0)
}

// 跳过测试的条件
export const skipIfNoApiKey = () => {
  if (!hasRealApiKey()) {
    console.warn('跳过真实API测试：未设置WIZA_API_KEY环境变量')
    return true
  }
  return false
} 