import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'
import type { SearchFilters, CompanyIndustry } from '../../renderer/src/types/api'

describe('修复问题验证测试', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('行业字段修复验证', () => {
    it('应该使用company_industry字段而不是major字段', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Smith'],
        company_industry: ['computer software' as CompanyIndustry]
      }

      console.log('🔍 验证company_industry字段使用...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 company_industry字段搜索结果:', {
          status: response.status,
          total: response.data?.total,
          field: 'company_industry',
          value: 'computer software'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ company_industry字段正常工作！找到 ${response.data.total} 个结果`)
        
      } catch (error) {
        console.error('❌ company_industry字段测试失败:', error)
        throw error
      }
    }, 30000)

    it('应该支持多个有效的行业枚举值', async () => {
      const validIndustries: CompanyIndustry[] = [
        'computer software',
        'financial services',
        'information technology and services'
      ]

      console.log('🔍 验证多个行业枚举值...')
      
      for (const industry of validIndustries) {
        try {
          const searchFilters: SearchFilters = {
            last_name: ['Johnson'],
            company_industry: [industry]
          }

          const response = await wizaApi.searchProspects(searchFilters)
          
          console.log(`📊 行业"${industry}": ${response.data.total} 个结果`)
          
          expect(response.status.code).toBe(200)
          expect(response.data.total).toBeGreaterThanOrEqual(0)
          
        } catch (error) {
          console.error(`❌ 行业"${industry}"测试失败:`, error)
          throw error
        }
      }
      
      console.log('✅ 所有行业枚举值验证通过')
    }, 60000)
  })

  describe('API fallback机制验证', () => {
    it('应该能够在没有window.api的情况下进行搜索', async () => {
      // 模拟window.api不可用的情况
      const originalWindowApi = (global as any).window?.api
      if ((global as any).window) {
        (global as any).window.api = undefined
      }

      try {
        const searchFilters: SearchFilters = {
          last_name: ['Davis'],
          company_industry: ['computer software' as CompanyIndustry]
        }

        console.log('🔍 测试HTTP fallback搜索...')
        
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 HTTP fallback搜索结果:', {
          status: response.status,
          total: response.data?.total
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ HTTP fallback搜索成功！找到 ${response.data.total} 个结果`)
        
      } catch (error) {
        console.error('❌ HTTP fallback搜索失败:', error)
        throw error
      } finally {
        // 恢复window.api
        if ((global as any).window) {
          (global as any).window.api = originalWindowApi
        }
      }
    }, 30000)

    it('应该能够在没有window.api的情况下验证API密钥', async () => {
      // 模拟window.api不可用的情况
      const originalWindowApi = (global as any).window?.api
      if ((global as any).window) {
        (global as any).window.api = undefined
      }

      try {
        console.log('🔍 测试HTTP fallback API密钥验证...')
        
        const isValid = await wizaApi.validateApiKey()
        
        console.log('📊 HTTP fallback API密钥验证结果:', isValid)
        
        expect(isValid).toBe(true)
        
        console.log('✅ HTTP fallback API密钥验证成功！')
        
      } catch (error) {
        console.error('❌ HTTP fallback API密钥验证失败:', error)
        throw error
      } finally {
        // 恢复window.api
        if ((global as any).window) {
          (global as any).window.api = originalWindowApi
        }
      }
    }, 30000)
  })

  describe('搜索条件组合验证', () => {
    it('应该支持行业+地理位置的有效组合', async () => {
      const searchFilters: SearchFilters = {
        company_industry: ['information technology and services' as CompanyIndustry],
        location: [{
          v: 'San Francisco, California, United States',
          b: 'city',
          s: 'i'
        }]
      }

      console.log('🔍 验证行业+地理位置组合搜索...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 组合搜索结果:', {
          status: response.status,
          total: response.data?.total,
          conditions: '行业: IT服务 + 地理位置: 旧金山'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 行业+地理位置组合搜索成功！找到 ${response.data.total} 个结果`)
        
      } catch (error) {
        console.error('❌ 组合搜索失败:', error)
        throw error
      }
    }, 30000)
  })
})

// 导出测试统计信息
export const getFixedIssuesTestInfo = () => {
  return {
    description: '修复问题验证测试',
    testTypes: [
      '行业字段修复验证',
      'API fallback机制验证',
      '搜索条件组合验证'
    ],
    fixedIssues: [
      '将major字段替换为company_industry字段',
      '为所有API方法添加HTTP fallback',
      '更新行业选项以匹配API规范',
      '修复测试环境中的window.api不可用问题'
    ],
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...',
    baseUrl: API_CONFIG.REAL_API.BASE_URL,
    testEnvironment: 'real-api-fixed-issues-test'
  }
} 