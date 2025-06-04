import { ipcMain } from 'electron'
import { net } from 'electron'

// API基础URL - 根据OpenAPI规范
const API_BASE_URL = 'https://wiza.co/api'

/**
 * 通用API请求函数
 */
async function makeApiRequest(endpoint: string, options: {
  method?: string
  headers?: Record<string, string>
  body?: any
} = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  console.log(`[API] 请求: ${options.method || 'GET'} ${url}`)
  if (options.body) {
    console.log('[API] 请求体:', JSON.stringify(options.body, null, 2))
  }
  
  return new Promise((resolve, reject) => {
    const request = net.request({
      method: options.method || 'GET',
      url: url
    })

    // 设置请求头
    request.setHeader('Content-Type', 'application/json')
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        request.setHeader(key, value)
      })
    }

    let responseData = ''

    request.on('response', (response) => {
      console.log(`[API] 响应状态码: ${response.statusCode}`)
      
      response.on('data', (chunk) => {
        responseData += chunk.toString()
      })

      response.on('end', () => {
        try {
          const data = JSON.parse(responseData)
          console.log(`[API] 响应数据:`, JSON.stringify(data, null, 2))
          
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data)
          } else {
            console.error(`[API] 错误响应: ${response.statusCode}`, data.message || data)
            reject(new Error(data.message || `HTTP ${response.statusCode}`))
          }
        } catch (error) {
          console.error(`[API] 解析响应失败:`, responseData)
          reject(new Error(`解析响应失败: ${responseData}`))
        }
      })
    })

    request.on('error', (error) => {
      console.error(`[API] 请求错误:`, error)
      reject(error)
    })

    // 发送请求体
    if (options.body) {
      request.write(JSON.stringify(options.body))
    }

    request.end()
  })
}

/**
 * 注册所有API相关的IPC处理器
 */
export function registerApiHandlers() {
  // 验证API密钥
  ipcMain.handle('validate-api-key', async (_, apiKey: string) => {
    try {
      const response = await makeApiRequest('/meta/credits', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      return { success: true, data: response }
    } catch (error) {
      console.error('API密钥验证失败:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 搜索潜在客户
  ipcMain.handle('search-prospects', async (_, { apiKey, filters, size }) => {
    try {
      const requestBody: any = { filters }
      
      // 根据OpenAPI规范，size参数是可选的，默认为0
      if (size !== undefined) {
        requestBody.size = size
      }
      
      const response = await makeApiRequest('/prospects/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: requestBody
      })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 创建潜在客户列表
  ipcMain.handle('create-prospect-list', async (_, { apiKey, data }) => {
    try {
      const response = await makeApiRequest('/prospects/create_prospect_list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: data
      })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 继续搜索
  ipcMain.handle('continue-search', async (_, { apiKey, listId, maxProfiles }) => {
    try {
      const response = await makeApiRequest('/prospects/continue_search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: { id: listId, max_profiles: maxProfiles }
      })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 获取列表状态
  ipcMain.handle('get-list-status', async (_, { apiKey, listId }) => {
    try {
      console.log(`主进程: 获取列表${listId}状态`)
      const response: any = await makeApiRequest(`/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      console.log(`列表${listId}状态响应:`, response)
      
      // 确保响应格式符合预期
      if (!response.data || !response.data.status) {
        console.warn('API响应格式不符合预期:', response)
      }
      
      return { success: true, data: response }
    } catch (error) {
      console.error(`获取列表${listId}状态失败:`, error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 获取列表联系人
  ipcMain.handle('get-list-contacts', async (_, { apiKey, listId, segment }) => {
    try {
      const response = await makeApiRequest(`/lists/${listId}/contacts?segment=${segment}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })

  // 获取积分信息
  ipcMain.handle('get-credits', async (_, apiKey: string) => {
    try {
      const response = await makeApiRequest('/meta/credits', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      })
      return { success: true, data: response }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  })
} 