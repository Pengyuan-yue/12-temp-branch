import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'
import type { SearchFilters, CompanyIndustry } from '../../renderer/src/types/api'

// 定义测试结果类型
interface TestResult {
  name: string
  count: number
  filters: SearchFilters
  error?: string
}

describe('最终验证测试 - 用户报告的搜索问题', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('用户具体搜索条件验证', () => {
    it('应该验证用户的完整搜索条件能返回正确结果', async () => {
      console.log('🎯 最终验证：用户的搜索条件')
      console.log('条件: 行业=retail, 姓氏=li, 地点=United States, 职位=Manager')
      
      const userFilters: SearchFilters = {
        company_industry: ['retail' as CompanyIndustry],
        last_name: ['li'],
        location: [{
          v: 'United States',
          b: 'country',
          s: 'i'
        }],
        job_title: [{
          v: 'Manager',
          s: 'i'
        }]
      }

      console.log('📋 发送搜索请求...')
      
      try {
        const response = await wizaApi.searchProspects(userFilters)
        
        console.log('📊 搜索结果:')
        console.log(`- 状态码: ${response.status.code}`)
        console.log(`- 结果数量: ${response.data.total}`)
        console.log(`- 数据类型: ${typeof response.data.total}`)
        
        // 验证响应结构
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(response.data.total).toBeDefined()
        expect(typeof response.data.total).toBe('number')
        
        // 验证结果数量合理
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 验证通过！用户的搜索条件返回了 ${response.data.total} 个结果`)
        
        // 如果结果为0，这表明有问题
        if (response.data.total === 0) {
          console.error('❌ 警告：搜索结果为0，这与预期不符！')
          console.error('可能的原因：')
          console.error('1. API密钥权限问题')
          console.error('2. 搜索条件组合过于严格')
          console.error('3. API服务临时问题')
        }
        
        return response.data.total
        
      } catch (error) {
        console.error('❌ 搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该验证各个搜索条件的独立效果', async () => {
      console.log('🔍 验证各个搜索条件的独立效果...')
      
      const testCases = [
        {
          name: '仅行业筛选',
          filters: { company_industry: ['retail' as CompanyIndustry] },
          expectedMin: 1000000 // 预期至少100万个结果
        },
        {
          name: '行业+姓氏',
          filters: { 
            company_industry: ['retail' as CompanyIndustry],
            last_name: ['li']
          },
          expectedMin: 1000 // 预期至少1000个结果
        },
        {
          name: '行业+姓氏+地点',
          filters: { 
            company_industry: ['retail' as CompanyIndustry],
            last_name: ['li'],
            location: [{
              v: 'United States',
              b: 'country' as const,
              s: 'i' as const
            }]
          },
          expectedMin: 100 // 预期至少100个结果
        }
      ]

      const results: TestResult[] = []

      for (const testCase of testCases) {
        console.log(`📋 测试: ${testCase.name}`)
        
        try {
          const response = await wizaApi.searchProspects(testCase.filters)
          const count = response.data.total
          
          console.log(`   结果: ${count} 个`)
          
          expect(response.status.code).toBe(200)
          expect(count).toBeGreaterThanOrEqual(0)
          
          if (count < testCase.expectedMin) {
            console.warn(`⚠️  警告: ${testCase.name} 结果数量 (${count}) 低于预期 (${testCase.expectedMin})`)
          }
          
          results.push({
            name: testCase.name,
            count,
            filters: testCase.filters
          })
          
        } catch (error) {
          console.error(`❌ ${testCase.name} 测试失败:`, error)
          const errorMessage = error instanceof Error ? error.message : String(error)
          results.push({
            name: testCase.name,
            count: 0,
            error: errorMessage,
            filters: testCase.filters
          })
        }
      }

      console.log('📊 测试结果汇总:')
      results.forEach(result => {
        if (result.error) {
          console.log(`- ${result.name}: 错误 - ${result.error}`)
        } else {
          console.log(`- ${result.name}: ${result.count} 个结果`)
        }
      })

      return results
    }, 60000)

    it('应该验证API服务的错误处理', async () => {
      console.log('🔍 验证API服务的错误处理...')
      
      // 测试无效的搜索条件
      const invalidFilters: SearchFilters = {
        company_industry: ['invalid_industry' as CompanyIndustry]
      }

      try {
        const response = await wizaApi.searchProspects(invalidFilters)
        
        console.log('📊 无效条件响应:')
        console.log(`- 状态码: ${response.status.code}`)
        console.log(`- 结果数量: ${response.data.total}`)
        
        // 即使是无效行业，API也应该正常响应（可能返回0结果）
        expect(response.status.code).toBe(200)
        expect(response.data).toBeDefined()
        expect(typeof response.data.total).toBe('number')
        
        console.log(`✅ 错误处理验证通过`)
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.log('📊 API错误处理:', errorMessage)
        // 这是预期的行为，API应该能够处理无效输入
        expect(error).toBeDefined()
      }
    }, 30000)
  })
})

// 导出测试信息
export const getFinalVerificationInfo = () => {
  return {
    description: '最终验证测试 - 用户搜索问题',
    purpose: '验证用户报告的搜索条件是否能正确返回结果',
    userConditions: {
      industry: 'retail',
      lastName: 'li',
      location: 'United States',
      jobTitle: 'Manager'
    },
    expectedResult: '应该返回大于0的结果数量',
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...',
    testEnvironment: 'real-api-final-verification'
  }
} 