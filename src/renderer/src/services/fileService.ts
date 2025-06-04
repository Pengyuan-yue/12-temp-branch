import { Contact } from '../types/api'

/**
 * 文件服务类
 * 处理数据导出功能
 */
export class FileService {
  /**
   * 导出为CSV格式
   */
  static exportToCSV(data: Contact[], fields: string[], filename: string): void {
    // 字段映射
    const fieldLabels: Record<string, string> = {
      fullName: '姓名',
      firstName: '名',
      lastName: '姓',
      email: '邮箱',
      phone: '电话',
      jobTitle: '职位',
      company: '公司',
      industry: '行业',
      location: '地点',
      linkedinUrl: 'LinkedIn链接'
    }

    // 创建CSV头部
    const headers = fields.map(field => fieldLabels[field] || field)
    
    // 创建CSV内容
    const csvContent = [
      headers.join(','),
      ...data.map(contact => 
        fields.map(field => {
          const value = contact[field as keyof Contact] || ''
          // 处理包含逗号的值
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        }).join(',')
      )
    ].join('\n')

    // 添加BOM以支持中文
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    this.downloadFile(blob, `${filename}.csv`)
  }

  /**
   * 导出为Excel格式 (使用CSV格式，Excel可以打开)
   */
  static exportToExcel(data: Contact[], fields: string[], filename: string): void {
    // 字段映射
    const fieldLabels: Record<string, string> = {
      fullName: '姓名',
      firstName: '名',
      lastName: '姓',
      email: '邮箱',
      phone: '电话',
      jobTitle: '职位',
      company: '公司',
      industry: '行业',
      location: '地点',
      linkedinUrl: 'LinkedIn链接'
    }

    // 创建表格HTML
    const headers = fields.map(field => fieldLabels[field] || field)
    
    const tableHTML = `
      <table border="1">
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(contact => `
            <tr>
              ${fields.map(field => {
                const value = contact[field as keyof Contact] || ''
                return `<td>${value}</td>`
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

    // 创建Excel文件内容
    const excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>联系人数据</x:Name>
                  <x:WorksheetSource HRef="sheet001.htm"/>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
        </head>
        <body>
          ${tableHTML}
        </body>
      </html>
    `

    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    })
    
    this.downloadFile(blob, `${filename}.xls`)
  }

  /**
   * 下载文件
   */
  private static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 验证文件名
   */
  static validateFilename(filename: string): boolean {
    // 检查文件名是否包含非法字符
    const invalidChars = /[<>:"/\\|?*]/g
    return !invalidChars.test(filename) && filename.trim().length > 0
  }

  /**
   * 清理文件名
   */
  static sanitizeFilename(filename: string): string {
    // 移除或替换非法字符
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .trim()
  }
}

export default FileService 