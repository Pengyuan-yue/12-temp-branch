import { describe, test, expect, beforeAll } from 'vitest'
import { REAL_API_CONFIG, skipIfNoApiKey } from '../real-api.config'

// 真实API测试 - 使用真实的Wiza API
describe('Wiza API 真实集成测试', () => {
  beforeAll(() => {
    if (skipIfNoApiKey()) {
      console.log('跳过真实API测试：请设置环境变量 WIZA_API_KEY')
      return
    }
  })

  test('API密钥验证', async () => {
    if (skipIfNoApiKey()) return

    const response = await fetch(`${REAL_API_CONFIG.BASE_URL}/meta/credits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
      },
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('credits')
    expect(data.credits).toHaveProperty('email_credits')
    expect(data.credits).toHaveProperty('phone_credits')
    expect(data.credits).toHaveProperty('api_credits')
    
    console.log('✅ API密钥验证成功')
    console.log(`📊 积分余额: Email=${data.credits.email_credits}, Phone=${data.credits.phone_credits}, API=${data.credits.api_credits}`)
  }, REAL_API_CONFIG.TIMEOUT)

  test('潜在客户搜索', async () => {
    if (skipIfNoApiKey()) return

    const searchPayload = {
      filters: REAL_API_CONFIG.TEST_SEARCH_FILTERS,
      size: 0, // 只获取数量，不获取具体数据
    }

    const response = await fetch(`${REAL_API_CONFIG.BASE_URL}/prospects/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchPayload),
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toHaveProperty('code', 200)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('total')
    expect(typeof data.data.total).toBe('number')
    
    console.log(`✅ 搜索成功，找到 ${data.data.total} 个潜在客户`)
  }, REAL_API_CONFIG.TIMEOUT)

  test('创建潜在客户列表', async () => {
    if (skipIfNoApiKey()) return

    const listPayload = {
      filters: REAL_API_CONFIG.TEST_SEARCH_FILTERS,
      list: REAL_API_CONFIG.TEST_LIST_CONFIG,
    }

    const response = await fetch(`${REAL_API_CONFIG.BASE_URL}/prospects/create_prospect_list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listPayload),
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toHaveProperty('code', 200)
    expect(data).toHaveProperty('type', 'list')
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('id')
    expect(typeof data.data.id).toBe('number')
    
    console.log(`✅ 列表创建成功，列表ID: ${data.data.id}`)
    
    // 保存列表ID供后续测试使用
    globalThis.__TEST_LIST_ID__ = data.data.id
  }, REAL_API_CONFIG.TIMEOUT)

  test('查询列表状态', async () => {
    if (skipIfNoApiKey()) return
    
    // 如果没有列表ID，先创建一个
    if (!globalThis.__TEST_LIST_ID__) {
      const listPayload = {
        filters: REAL_API_CONFIG.TEST_SEARCH_FILTERS,
        list: { ...REAL_API_CONFIG.TEST_LIST_CONFIG, name: `状态测试_${Date.now()}` },
      }

      const createResponse = await fetch(`${REAL_API_CONFIG.BASE_URL}/prospects/create_prospect_list`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listPayload),
      })
      
      const createData = await createResponse.json()
      globalThis.__TEST_LIST_ID__ = createData.data.id
    }

    const response = await fetch(`${REAL_API_CONFIG.BASE_URL}/lists/${globalThis.__TEST_LIST_ID__}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
      },
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('status')
    expect(data.status).toHaveProperty('code', 200)
    expect(data).toHaveProperty('data')
    expect(data.data).toHaveProperty('status')
    expect(['queued', 'processing', 'scraping', 'finished', 'failed']).toContain(data.data.status)
    
    console.log(`✅ 列表状态查询成功，状态: ${data.data.status}`)
  }, REAL_API_CONFIG.TIMEOUT)

  test('获取积分余额', async () => {
    if (skipIfNoApiKey()) return

    const response = await fetch(`${REAL_API_CONFIG.BASE_URL}/meta/credits`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REAL_API_CONFIG.API_KEY}`,
      },
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('credits')
    expect(data.credits).toHaveProperty('email_credits')
    expect(data.credits).toHaveProperty('phone_credits')
    expect(data.credits).toHaveProperty('api_credits')
    
    // 验证积分是数字或'unlimited'
    const emailCredits = data.credits.email_credits
    const phoneCredits = data.credits.phone_credits
    const apiCredits = data.credits.api_credits
    
    expect(typeof emailCredits === 'number' || emailCredits === 'unlimited').toBe(true)
    expect(typeof phoneCredits === 'number' || phoneCredits === 'unlimited').toBe(true)
    expect(typeof apiCredits).toBe('number')
    
    console.log(`✅ 积分查询成功: Email=${emailCredits}, Phone=${phoneCredits}, API=${apiCredits}`)
  }, REAL_API_CONFIG.TIMEOUT)
})

// 扩展全局类型
declare global {
  var __TEST_LIST_ID__: number | undefined
} 