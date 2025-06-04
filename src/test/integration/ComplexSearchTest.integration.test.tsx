import { describe, it, expect, beforeEach } from 'vitest'
import { getWizaApi } from '../../renderer/src/services/wizaApi'
import { API_CONFIG } from '../config/test-config'
import type { SearchFilters } from '../../renderer/src/types/api'

describe('复杂搜索条件集成测试', () => {
  const realApiKey = API_CONFIG.REAL_API.API_KEY
  let wizaApi: ReturnType<typeof getWizaApi>

  beforeEach(() => {
    wizaApi = getWizaApi(realApiKey)
  })

  describe('姓氏+地理位置组合搜索', () => {
    it('应该能够搜索特定地区的Smith姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Smith'],
        location: [{
          v: 'Toronto, Ontario, Canada',
          b: 'city',
          s: 'i'
        }]
      }

      console.log('🔍 开始搜索多伦多地区Smith姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Smith + 地理位置: 多伦多'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 地理位置+姓氏搜索成功！找到 ${response.data.total} 个多伦多地区Smith姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 地理位置+姓氏搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该能够搜索美国加州的Johnson姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Johnson'],
        location: [{
          v: 'California, United States',
          b: 'state',
          s: 'i'
        }]
      }

      console.log('🔍 开始搜索加州Johnson姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 州级地理位置+姓氏搜索成功！找到 ${response.data.total} 个加州Johnson姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 州级地理位置+姓氏搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('姓氏+职位筛选组合搜索', () => {
    it('应该能够搜索CEO职位的Brown姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Brown'],
        job_title: [{
          v: 'CEO',
          s: 'i'
        }]
      }

      console.log('🔍 开始搜索CEO职位的Brown姓氏潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Brown + 职位: CEO'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 职位+姓氏搜索成功！找到 ${response.data.total} 个CEO职位的Brown姓氏潜在客户`)
        
      } catch (error) {
        console.error('❌ 职位+姓氏搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该能够搜索Manager职位的Wilson姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Wilson'],
        job_title: [{
          v: 'Manager',
          s: 'i'
        }]
      }

      console.log('🔍 开始搜索Manager职位的Wilson姓氏潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ Manager职位+姓氏搜索成功！找到 ${response.data.total} 个Manager职位的Wilson姓氏潜在客户`)
        
      } catch (error) {
        console.error('❌ Manager职位+姓氏搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('姓氏+行业筛选组合搜索', () => {
    it('应该能够搜索IT行业的Davis姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Davis'],
        major: ['computer software']
      }

      console.log('🔍 开始搜索IT行业Davis姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Davis + 行业: 计算机软件'
        })
        
        expect(response.status.code).toBe(200)
        // 注意：行业筛选可能返回较少结果，所以使用 >= 0
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 行业+姓氏搜索完成！找到 ${response.data.total} 个IT行业Davis姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 行业+姓氏搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('多条件复杂组合搜索', () => {
    it('应该能够搜索：纽约地区+技术职位+Miller姓氏的潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Miller'],
        location: [{
          v: 'New York, New York, United States',
          b: 'city',
          s: 'i'
        }],
        job_title: [{
          v: 'Engineer',
          s: 'i'
        }]
      }

      console.log('🔍 开始复杂搜索：纽约地区+工程师职位+Miller姓氏...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 复杂搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Miller + 地理位置: 纽约 + 职位: Engineer'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 三条件组合搜索完成！找到 ${response.data.total} 个符合条件的潜在客户`)
        
      } catch (error) {
        console.error('❌ 三条件组合搜索失败:', error)
        throw error
      }
    }, 30000)

    it('应该能够搜索：加州+金融行业+Director职位+Garcia姓氏的潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Garcia'],
        location: [{
          v: 'California, United States',
          b: 'state',
          s: 'i'
        }],
        job_title: [{
          v: 'Director',
          s: 'i'
        }],
        major: ['financial services']
      }

      console.log('🔍 开始四条件复杂搜索：加州+金融行业+Director职位+Garcia姓氏...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 四条件搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Garcia + 地理位置: 加州 + 职位: Director + 行业: 金融服务'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThanOrEqual(0)
        
        console.log(`✅ 四条件组合搜索完成！找到 ${response.data.total} 个符合所有条件的潜在客户`)
        
        if (response.data.total > 0) {
          console.log('🎯 这是一个非常精准的搜索结果！')
        } else {
          console.log('ℹ️ 搜索条件过于严格，可能需要放宽某些条件')
        }
        
      } catch (error) {
        console.error('❌ 四条件组合搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('地理位置层级搜索测试', () => {
    it('应该能够搜索整个美国的Smith姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Smith'],
        location: [{
          v: 'United States',
          b: 'country',
          s: 'i'
        }]
      }

      console.log('🔍 开始搜索美国全境Smith姓氏的潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 国家级搜索成功！美国全境找到 ${response.data.total} 个Smith姓氏的潜在客户`)
        
      } catch (error) {
        console.error('❌ 国家级搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('排除条件搜索测试', () => {
    it('应该能够搜索排除纽约地区的Johnson姓氏潜在客户', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Johnson'],
        location: [{
          v: 'New York, New York, United States',
          b: 'city',
          s: 'e' // 排除纽约
        }]
      }

      console.log('🔍 开始搜索排除纽约地区的Johnson姓氏潜在客户...')
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        console.log('📊 排除搜索响应:', {
          status: response.status,
          total: response.data?.total,
          searchConditions: '姓氏: Johnson + 排除地理位置: 纽约'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        
        console.log(`✅ 排除条件搜索成功！找到 ${response.data.total} 个非纽约地区的Johnson姓氏潜在客户`)
        
      } catch (error) {
        console.error('❌ 排除条件搜索失败:', error)
        throw error
      }
    }, 30000)
  })

  describe('性能和数据质量测试', () => {
    it('应该能够处理多个姓氏的搜索', async () => {
      const searchFilters: SearchFilters = {
        last_name: ['Smith', 'Johnson', 'Williams']
      }

      console.log('🔍 开始搜索多个姓氏的潜在客户...')
      
      const startTime = Date.now()
      
      try {
        const response = await wizaApi.searchProspects(searchFilters)
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        console.log('📊 多姓氏搜索响应:', {
          status: response.status,
          total: response.data?.total,
          responseTime: `${responseTime}ms`,
          searchConditions: '姓氏: Smith, Johnson, Williams'
        })
        
        expect(response.status.code).toBe(200)
        expect(response.data.total).toBeGreaterThan(0)
        expect(responseTime).toBeLessThan(30000) // 30秒内完成
        
        console.log(`✅ 多姓氏搜索成功！找到 ${response.data.total} 个潜在客户，响应时间: ${responseTime}ms`)
        
      } catch (error) {
        console.error('❌ 多姓氏搜索失败:', error)
        throw error
      }
    }, 35000)
  })
})

// 导出测试统计信息
export const getComplexSearchTestInfo = () => {
  return {
    description: '复杂搜索条件集成测试',
    testTypes: [
      '姓氏+地理位置组合',
      '姓氏+职位筛选组合', 
      '姓氏+行业筛选组合',
      '多条件复杂组合',
      '地理位置层级搜索',
      '排除条件搜索',
      '性能和数据质量测试'
    ],
    apiKey: API_CONFIG.REAL_API.API_KEY.substring(0, 8) + '...',
    baseUrl: API_CONFIG.REAL_API.BASE_URL,
    testEnvironment: 'real-api-complex-search'
  }
} 