import * as XLSX from 'xlsx'

interface ExportOptions {
  format: 'excel' | 'csv'
  filename: string
  fields: string[]
  fieldLabels?: Record<string, string>
}

/**
 * 导出服务 - 用于处理数据导出功能
 */
export const exportService = {
  /**
   * 导出数据为Excel或CSV文件
   * @param data 要导出的数据
   * @param options 导出选项
   * @returns 导出是否成功
   */
  exportData: (data: any[], options: ExportOptions): boolean => {
    try {
      if (!data || data.length === 0) {
        console.error('没有可导出的数据')
        return false
      }

      // 如果提供了字段标签映射，则使用它来重命名列
      const processedData = data.map(item => {
        const newItem: Record<string, any> = {}
        options.fields.forEach(field => {
          const key = options.fieldLabels?.[field] || field
          newItem[key] = item[field] || ''
        })
        return newItem
      })

      // 创建工作簿
      const wb = XLSX.utils.book_new()
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(processedData)
      
      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '联系人数据')
      
      // 生成文件名
      const fileName = `${options.filename || 'export'}.${options.format === 'excel' ? 'xlsx' : 'csv'}`
      
      // 导出文件
      if (options.format === 'excel') {
        XLSX.writeFile(wb, fileName)
      } else {
        // 导出为CSV
        const csvContent = XLSX.utils.sheet_to_csv(ws)
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        
        link.setAttribute('href', url)
        link.setAttribute('download', fileName)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
      return true
    } catch (error) {
      console.error('导出数据失败:', error)
      return false
    }
  },

  /**
   * 导出数据为Excel文件
   * @param data 要导出的数据
   * @param filename 文件名（不含扩展名）
   * @param fields 要导出的字段
   * @param fieldLabels 字段标签映射
   * @returns 导出是否成功
   */
  exportToExcel: (
    data: any[], 
    filename: string, 
    fields: string[] = [], 
    fieldLabels?: Record<string, string>
  ): boolean => {
    return exportService.exportData(data, {
      format: 'excel',
      filename,
      fields: fields.length > 0 ? fields : Object.keys(data[0] || {}),
      fieldLabels
    })
  },

  /**
   * 导出数据为CSV文件
   * @param data 要导出的数据
   * @param filename 文件名（不含扩展名）
   * @param fields 要导出的字段
   * @param fieldLabels 字段标签映射
   * @returns 导出是否成功
   */
  exportToCsv: (
    data: any[], 
    filename: string, 
    fields: string[] = [], 
    fieldLabels?: Record<string, string>
  ): boolean => {
    return exportService.exportData(data, {
      format: 'csv',
      filename,
      fields: fields.length > 0 ? fields : Object.keys(data[0] || {}),
      fieldLabels
    })
  }
} 