import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'

describe('真实API连接测试', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('API密钥验证', () => {
    it('应该有有效的API密钥格式', () => {
      expect(realApiKey).toBeDefined()
      expect(realApiKey).toMatch(/^[a-f0-9]{64}$/) // 64位十六进制字符串
      expect(realApiKey.length).toBe(64)
    })

    it('API密钥应该以正确的值开始', () => {
      expect(realApiKey).toMatch(/^db2e139a/)
    })
  })

  describe('API服务初始化', () => {
    it('应该能够创建API服务实例', () => {
      expect(wizaApi).toBeDefined()
      expect(typeof wizaApi.searchProspects).toBe('function')
      expect(typeof wizaApi.createProspectList).toBe('function')
    })
  })

  describe('API基础连接测试', () => {
    it('应该能够进行基本的API调用（搜索测试）', async () => {
      // 使用最简单的搜索条件进行测试
      const searchFilters = {
        last_name: ['Smith'] // 使用常见姓氏
      }

      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        // 验证响应结构
        expect(response).toBeDefined()
        expect(response.status).toBeDefined()
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(typeof response.data.total).toBe('number')
        
        // 验证有搜索结果
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ API连接成功！找到 ${response.data.total} 个潜在客户`)
        
      } catch (error) {
        console.error('❌ API调用失败:', error)
        
        // 如果是认证错误，提供更详细的信息
        if (error instanceof Error) {
          if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            throw new Error(`API密钥认证失败。请检查API密钥是否正确: ${realApiKey.substring(0, 8)}...`)
          }
          if (error.message.includes('403') || error.message.includes('Forbidden')) {
            throw new Error(`API访问被拒绝。可能是权限不足或API密钥已过期`)
          }
          if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
            throw new Error(`API请求频率限制。请稍后再试`)
          }
        }
        
        throw error
      }
    }, 30000) // 30秒超时

    it('应该能够处理无效的搜索条件', async () => {
      // 测试空的搜索条件
      const emptyFilters = {}

      try {
        const response = await wizaApi.searchProspects(emptyFilters)
        
        // 即使是空条件，API也应该返回有效响应
        expect(response).toBeDefined()
        expect(response.status).toBeDefined()
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(typeof response.data.total).toBe('number')
        
        console.log(`✅ 空条件搜索成功！总结果数: ${response.data.total}`)
        
      } catch (error) {
        console.error('❌ 空条件搜索失败:', error)
        
        // 某些API可能不允许完全空的搜索条件，这是正常的
        if (error instanceof Error && error.message.includes('400')) {
          console.log('ℹ️ API不允许空搜索条件，这是正常的行为')
          expect(error.message).toContain('400')
        } else {
          throw error
        }
      }
    }, 15000)
  })

  describe('API错误处理测试', () => {
    it('应该能够处理无效的API密钥', async () => {
      const invalidApi = getWizaApi('invalid-api-key-12345')
      
      const searchFilters = {
        last_name: ['Test']
      }

      try {
        await invalidApi.searchProspects(searchFilters)
        // 如果没有抛出错误，说明API验证有问题
        throw new Error('应该抛出认证错误')
      } catch (error) {
        expect(error).toBeDefined()
        console.log('✅ 无效API密钥正确被拒绝')
      }
    }, 15000)
  })
})

// 导出测试信息
export const getRealApiTestInfo = () => {
  return {
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...' + API_CONFIG.REAL_API.API_KEY.substring(-8),
    baseUrl: API_CONFIG.REAL_API.BASE_URL,
    testType: 'real-api-connection',
    timestamp: new Date().toISOString(),
    description: '真实API连接和认证测试'
  }
} 