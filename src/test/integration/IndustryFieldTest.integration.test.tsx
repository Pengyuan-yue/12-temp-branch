import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'
import type { SearchFilters, CompanyIndustry } from '../../renderer/src/types/api'

describe('行业字段测试', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('major字段 vs company_industry字段对比测试', () => {
    it('应该测试major字段的IT行业搜索', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Davis'],
        major: ['computer software']
      }

      console.log('🔍 测试major字段：计算机软件行业...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 major字段搜索结果:', {
          status: response.status,
          total: response.data?.total,
          field: 'major',
          value: 'computer software'
        })
        
        expect(response.status.code).toBe(200)
        
        console.log(`✅ major字段搜索完成！找到 ${response.data.total} 个结果`)
        
      } catch (error) {
        console.error('❌ major字段搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该测试company_industry字段的IT行业搜索', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Davis'],
        company_industry: ['computer software' as CompanyIndustry]
      }

      console.log('🔍 测试company_industry字段：计算机软件行业...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 company_industry字段搜索结果:', {
          status: response.status,
          total: response.data?.total,
          field: 'company_industry',
          value: 'computer software'
        })
        
        expect(response.status.code).toBe(200)
        
        console.log(`✅ company_industry字段搜索完成！找到 ${response.data.total} 个结果`)
        
      } catch (error) {
        console.error('❌ company_industry字段搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该测试不同行业枚举值', async () => {
      const industries: CompanyIndustry[] = [
        'information technology and services',
        'financial services',
        'computer software',
        'marketing and advertising',
        'health, wellness and fitness'
      ]

      console.log('🔍 测试多个行业枚举值...')
      
      for (const industry of industries) {
        try {
          const searchFilters: SearchFilters = {
            last_name: ['Smith'],
            company_industry: [industry]
          }

          const response = await wizaApi.searchProspects(searchFilters)
          
          console.log(`📊 行业"${industry}"搜索结果: ${response.data.total} 个潜在客户`)
          
          expect(response.status.code).toBe(200)
          
        } catch (error) {
          console.error(`❌ 行业"${industry}"搜索失败:`, error)
        }
      }
      
      console.log('✅ 多行业枚举值测试完成')
    }, 60000)
  })

  describe('行业+地理位置组合测试', () => {
    it('应该能够搜索硅谷地区的IT行业潜在客户', async () => {
      const searchFilters: SearchFilters = {
        location: [{
          v: 'San Francisco, California, United States',
          b: 'city',
          s: 'i'
        }],
        company_industry: ['information technology and services' as CompanyIndustry]
      }

      console.log('🔍 开始搜索硅谷地区IT行业潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 硅谷IT行业搜索结果:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '地理位置: 旧金山 + 行业: IT服务'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 硅谷IT行业搜索成功！找到 ${response.data.total} 个潜在客户`)
        
      } catch (error) {
        console.error('❌ 硅谷IT行业搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该能够搜索纽约金融行业的潜在客户', async () => {
      const searchFilters: SearchFilters = {
        location: [{
          v: 'New York, New York, United States',
          b: 'city',
          s: 'i'
        }],
        company_industry: ['financial services' as CompanyIndustry]
      }

      console.log('🔍 开始搜索纽约金融行业潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 纽约金融行业搜索结果:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '地理位置: 纽约 + 行业: 金融服务'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 纽约金融行业搜索成功！找到 ${response.data.total} 个潜在客户`)
        
      } catch (error) {
        console.error('❌ 纽约金融行业搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('行业+职位组合测试', () => {
    it('应该能够搜索IT行业的CTO职位', async () => {
      const searchFilters: SearchFilters = {
        job_title: [{
          v: 'CTO',
          s: 'i'
        }],
        company_industry: ['information technology and services' as CompanyIndustry]
      }

      console.log('🔍 开始搜索IT行业CTO职位...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 IT行业CTO搜索结果:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '职位: CTO + 行业: IT服务'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ IT行业CTO搜索成功！找到 ${response.data.total} 个潜在客户`)
        
      } catch (error) {
        console.error('❌ IT行业CTO搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('行业字段验证测试', () => {
    it('应该验证有效的行业枚举值', async () => {
      const validIndustries: CompanyIndustry[] = [
        'accounting',
        'airlines/aviation',
        'banking',
        'biotechnology',
        'computer software',
        'financial services',
        'information technology and services',
        'marketing and advertising',
        'real estate'
      ]

      console.log('🔍 验证有效行业枚举值...')
      
      let successCount = 0
      let totalCount = validIndustries.length
      
      for (const industry of validIndustries) {
        try {
          const searchFilters: SearchFilters = {
            company_industry: [industry]
          }

          const response = await wizaApi.searchProspects(searchFilters)
          
          if (response.status.code === 200) {
            successCount++
            console.log(`✅ "${industry}": ${response.data.total} 个结果`)
          } else {
            console.log(`❌ "${industry}": 请求失败`)
          }
          
        } catch (error) {
          console.log(`❌ "${industry}": 发生错误`)
        }
      }
      
      const successRate = (successCount / totalCount) * 100
      console.log(`📊 行业枚举值验证完成: ${successCount}/${totalCount} (${successRate.toFixed(1)}%)`)
      
      expect(successRate).toBeGreaterThan(80) // 期望80%以上的成功率
      
    }, 120000) // 2分钟超时
  })
})

// 导出测试统计信息
export const getIndustryFieldTestInfo = () => {
  return {
    description: '行业字段对比测试',
    testTypes: [
      'major字段 vs company_industry字段对比',
      '行业+地理位置组合测试',
      '行业+职位组合测试',
      '行业字段验证测试'
    ],
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...',
    baseUrl: API_CONFIG.REAL_API.BASE_URL,
    testEnvironment: 'real-api-industry-field-test'
  }
} 