import { useState, useEffect } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'
import { exportService } from '../../../../services/exportService'

interface ExportSettings {
  format: 'excel' | 'csv'
  segment: 'people' | 'valid' | 'risky'
  fields: string[]
  filename: string
}

export const useDataExport = () => {
  const { 
    selectedList, 
    exportData,
    isLoading,
    setExportData,
    apiKey,
    setLoading,
    setError,
    addTask,
    updateTask
  } = useAppStore()

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'excel',
    segment: 'people',
    fields: ['fullName', 'email', 'jobTitle', 'company', 'phone'],
    filename: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filteredContacts, setFilteredContacts] = useState<any[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  // 可导出的字段（不包含图标，图标在组件中定义）
  const availableFields = [
    { id: 'fullName', label: '姓名' },
    { id: 'email', label: '邮箱' },
    { id: 'phone', label: '电话' },
    { id: 'jobTitle', label: '职位' },
    { id: 'company', label: '公司' },
    { id: 'industry', label: '行业' },
    { id: 'location', label: '地点' },
    { id: 'linkedinUrl', label: 'LinkedIn' }
  ]

  // 字段标签映射
  const fieldLabels: Record<string, string> = {
    fullName: '姓名',
    email: '邮箱',
    phone: '电话',
    jobTitle: '职位',
    company: '公司',
    industry: '行业',
    location: '地点',
    linkedinUrl: 'LinkedIn链接'
  }

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(exportData || [])
    } else {
      const filtered = (exportData || []).filter((contact: any) =>
        contact.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredContacts(filtered)
    }
  }, [searchTerm, exportData])

  // 设置默认文件名
  useEffect(() => {
    if (selectedList && !exportSettings.filename) {
      const timestamp = new Date().toISOString().split('T')[0]
      setExportSettings(prev => ({
        ...prev,
        filename: `${selectedList.name}_${timestamp}`
      }))
    }
  }, [selectedList, exportSettings.filename])

  // 切换字段选择
  const toggleField = (fieldId: string) => {
    setExportSettings(prev => ({
      ...prev,
      fields: prev.fields.includes(fieldId)
        ? prev.fields.filter(f => f !== fieldId)
        : [...prev.fields, fieldId]
    }))
  }

  // 全选/取消全选联系人
  const toggleAllContacts = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id))
    }
  }

  // 切换单个联系人选择
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  // 从API获取真实联系人数据
  const fetchContactsFromApi = async () => {
    if (!selectedList || !apiKey) {
      setError('请先选择列表并配置API密钥')
      return
    }

    // 检查列表状态
    if (selectedList.status === 'failed') {
      setError('该列表创建失败，无法导出数据。请重新创建列表或选择其他列表。')
      setFilteredContacts([])
      return
    }

    if (selectedList.status === 'queued' || selectedList.status === 'processing' || selectedList.status === 'scraping') {
      setError('该列表正在处理中，请等待完成后再导出数据。')
      setFilteredContacts([])
      return
    }

    if (selectedList.totalProfiles === 0) {
      setError('该列表没有找到任何联系人，无法导出数据。')
      setFilteredContacts([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const wizaApi = getWizaApi(apiKey)
      const response = await wizaApi.getListContacts(selectedList.id, exportSettings.segment)
      
      if (response.status.code === 200 && response.data) {
        // 转换API数据格式为本地格式
        const contacts = response.data.map((contact: any, index: number) => ({
          id: contact.id || `contact_${index}`,
          firstName: contact.first_name || '',
          lastName: contact.last_name || '',
          fullName: contact.full_name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
          email: contact.email || '',
          phone: contact.phone || '',
          jobTitle: contact.job_title || '',
          company: contact.company || '',
          industry: contact.industry || '',
          location: contact.location || '',
          linkedinUrl: contact.linkedin_url || '',
          confidence: contact.confidence || 'medium'
        }))
        
        setFilteredContacts(contacts)
        setExportData(response.data)
        
        // 默认全选所有联系人
        setSelectedContacts(contacts.map(c => c.id))
        
        console.log(`成功获取 ${contacts.length} 个联系人`)
      } else {
        setError('获取联系人数据失败')
      }
    } catch (error: any) {
      console.error('获取联系人数据失败:', error)
      if (error.message?.includes('No contacts to export')) {
        setError('该列表没有可导出的联系人数据。可能的原因：\n1. 列表还在处理中\n2. 搜索条件过于严格，没有找到匹配的联系人\n3. 列表创建失败')
      } else {
        setError('获取联系人数据失败: ' + (error.message || '未知错误'))
      }
      setFilteredContacts([])
    } finally {
      setLoading(false)
    }
  }

  // 导出数据
  const handleExport = async (alternateFormat?: 'excel' | 'csv') => {
    if (!selectedList || !apiKey) {
      setError('请先选择列表并配置API密钥')
      return
    }

    if (selectedContacts.length === 0) {
      setError('请至少选择一个联系人进行导出')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 创建导出任务
      const taskId = `export_${Date.now()}`
      addTask({
        type: 'export',
        status: 'running',
        progress: 0,
        message: `导出${selectedContacts.length}个联系人到${exportSettings.filename}.${alternateFormat || exportSettings.format}`,
        data: {
          listId: selectedList.id,
          listName: selectedList.name,
          format: alternateFormat || exportSettings.format,
          filename: exportSettings.filename,
          contactCount: selectedContacts.length
        }
      })

      // 获取选中的联系人数据
      const contactsToExport = filteredContacts.filter(contact => 
        selectedContacts.includes(contact.id)
      )

      // 根据选择的字段过滤数据
      const filteredData = contactsToExport.map(contact => {
        const filtered: any = {}
        exportSettings.fields.forEach(field => {
          filtered[field] = contact[field] || ''
        })
        return filtered
      })

      // 更新任务进度
      updateTask(taskId, { progress: 50 })

      // 使用导出服务导出数据
      const format = alternateFormat || exportSettings.format
      let success = false
      
      if (format === 'excel') {
        success = exportService.exportToExcel(
          filteredData, 
          exportSettings.filename, 
          exportSettings.fields,
          fieldLabels
        )
      } else {
        success = exportService.exportToCsv(
          filteredData, 
          exportSettings.filename, 
          exportSettings.fields,
          fieldLabels
        )
      }

      // 更新任务状态
      updateTask(taskId, { 
        status: success ? 'completed' : 'failed', 
        progress: success ? 100 : 0 
      })

      if (success) {
        console.log(`导出成功: ${exportSettings.filename}.${format}`)
      } else {
        throw new Error('导出失败')
      }

    } catch (error: any) {
      console.error('导出失败:', error)
      setError('导出失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return {
    exportSettings,
    setExportSettings,
    searchTerm,
    setSearchTerm,
    filteredContacts,
    selectedContacts,
    setSelectedContacts,
    availableFields,
    fetchContactsFromApi,
    handleExport,
    toggleField,
    toggleAllContacts,
    toggleContact
  }
} 