import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'
import type { SearchFilters } from '../../renderer/src/types/api'

describe('直接API测试', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('API密钥和连接测试', () => {
    it('应该有有效的API密钥', () => {
      expect(realApiKey).toBeDefined()
      expect(realApiKey.length).toBe(64)
      expect(realApiKey).toMatch(/^[a-f0-9]{64}$/)
      console.log(`✅ 使用API密钥: ${realApiKey.substring(0, 8)}...`)
    })

    it('应该能够创建API服务实例', () => {
      expect(wizaApi).toBeDefined()
      expect(typeof wizaApi.searchProspects).toBe('function')
      expect(typeof wizaApi.createProspectList).toBe('function')
      expect(typeof wizaApi.getListStatus).toBe('function')
      console.log('✅ API服务实例创建成功')
    })
  })

  describe('潜在客户搜索API测试', () => {
    it('应该能够搜索Smith姓氏的潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Smith']
      }

      console.log('🔍 开始搜索Smith姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 搜索响应:', {
          status: response.status,
          total: response.data?.total
        })
        
        expect(response).toBeDefined()
        expect(response.status).toBeDefined()
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(typeof response.data.total).toBe('number')
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 搜索成功！找到 ${response.data.total} 个Smith姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该能够搜索特定行业的潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Johnson'],
        major: ['information technology and services']
      }

      console.log('🔍 开始搜索IT行业Johnson姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 行业搜索成功！找到 ${response.data.total} 个IT行业Johnson姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 行业搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('列表创建API测试', () => {
    it('应该能够创建潜在客户列表', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Wilson']
      }

      const createListData = {
        filters: searchFilters,
        list: {
          name: `API测试列表_${Date.now()}`,
          max_profiles: 3,
          enrichment_level: 'partial' as const,
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        }
      }

      console.log('📝 开始创建潜在客户列表...')
      console.log('列表配置:', createListData)
      
      try {
        const response = await wizaApi.createProspectList(createListData)
        
        console.log('📋 列表创建响应:', {
          status: response.status,
          listId: response.data?.id,
          listName: response.data?.name,
          listStatus: response.data?.status
        })
        
        expect(response).toBeDefined()
        expect(response.status).toBeDefined()
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(response.data.id).toBeDefined()
        expect(response.data.name).toBe(createListData.list.name)
        expect(response.data.status).toBeDefined()
        
        console.log(`✅ 列表创建成功！列表ID: ${response.data.id}, 状态: ${response.data.status}`)
        
        return response.data.id
        
      } catch (error) {
        console.error('❌ 列表创建失败:', error)
        throw error
      }
    }, 60000)
  })

  describe('错误处理测试', () => {
    it('应该正确处理无效的API密钥', async () => {
      const invalidApi = getWizaApi('invalid-api-key-12345')
      
      console.log('🧪 测试无效API密钥处理...')
      
      try {
        await invalidApi.searchProspects({ last_name: ['Test'] })
        throw new Error('应该抛出认证错误')
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.log('✅ 无效API密钥被正确拒绝:', errorMessage)
        expect(error).toBeDefined()
        expect(errorMessage).toMatch(/401|unauthorized|invalid/i)
      }
    }, 10000)
  })
}) 