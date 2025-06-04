import React, { useState } from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { getWizaApi } from '../../../../services/wizaApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../ui/card'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { Label } from '../../../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select'
import { useListManagement } from '../hooks/useListManagement'

interface CreateListForm {
  name: string
  maxProfiles: number
  enrichmentLevel: 'none' | 'partial' | 'full'
}

interface CreateListFormProps {
  onClose: () => void
}

export const CreateListForm: React.FC<CreateListFormProps> = ({ onClose }) => {
  const { 
    searchFilters, 
    apiKey,
    isLoading,
    addList,
    setLoading
  } = useAppStore()

  const { startListMonitoring } = useListManagement()

  const [createForm, setCreateForm] = useState<CreateListForm>({
    name: '',
    maxProfiles: 1000,
    enrichmentLevel: 'partial'
  })

  // 创建列表
  const handleCreateList = async () => {
    if (!createForm.name.trim()) {
      alert('请输入列表名称')
      return
    }

    if (!apiKey) {
      alert('请先配置API密钥')
      return
    }

    // 检查是否有搜索条件
    const hasFilters = searchFilters && Object.values(searchFilters).some(value => 
      Array.isArray(value) ? value.length > 0 : value
    )

    if (!hasFilters) {
      alert('请先在搜索条件页面设置筛选条件')
      return
    }

    setLoading(true)

    try {
      const wizaApi = getWizaApi(apiKey)
      
      const listData = {
        list: {
          name: createForm.name.trim(),
          max_profiles: createForm.maxProfiles,
          enrichment_level: createForm.enrichmentLevel,
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        },
        filters: searchFilters
      }

      console.log('创建列表请求数据:', listData)
      
      const result = await wizaApi.createProspectList(listData)
      
      console.log('列表创建成功，完整响应:', JSON.stringify(result, null, 2))

      // 根据OpenAPI规范，从API响应中正确提取数据
      const apiData = result.data
      const peopleCount = apiData.stats?.people || 0
      
      console.log('解析的API数据:', {
        id: apiData.id,
        name: apiData.name,
        status: apiData.status,
        peopleCount: peopleCount,
        stats: apiData.stats
      })

      // 添加到本地状态
      const newList = {
        id: apiData.id.toString(),
        name: createForm.name.trim(),
        status: apiData.status || 'queued',
        progress: apiData.status === 'finished' ? 100 : 0,
        totalProfiles: peopleCount, // 使用API返回的实际数量
        createdAt: apiData.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        enrichmentLevel: createForm.enrichmentLevel,
        maxProfiles: createForm.maxProfiles,
        filters: searchFilters // 保存搜索条件
      }
      
      console.log('创建的本地列表对象:', newList)

      addList(newList)

      // 如果列表状态不是已完成或失败，启动监控
      if (apiData.status === 'queued' || apiData.status === 'processing' || apiData.status === 'scraping') {
        console.log(`启动列表 ${apiData.id} 的状态监控`)
        startListMonitoring(apiData.id.toString())
      }

      // 显示成功消息
      alert(`列表创建成功！\n列表ID: ${apiData.id}\n列表名称: ${createForm.name}\n状态: ${apiData.status}\n联系人数量: ${peopleCount}`)
      
      // 重置表单并关闭
      setCreateForm({
        name: '',
        maxProfiles: 1000,
        enrichmentLevel: 'partial'
      })
      onClose()
      
    } catch (error: any) {
      console.error('创建列表失败:', error)
      alert('创建列表失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-lavender-200">
      <CardHeader>
        <CardTitle>创建新列表</CardTitle>
        <CardDescription>基于当前搜索条件创建潜在客户列表</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="listName">列表名称</Label>
            <Input
              id="listName"
              placeholder="输入列表名称"
              value={createForm.name}
              onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxProfiles">最大联系人数</Label>
            <Input
              id="maxProfiles"
              type="number"
              min="1"
              max="10000"
              value={createForm.maxProfiles}
              onChange={(e) => setCreateForm(prev => ({ ...prev, maxProfiles: parseInt(e.target.value) || 1000 }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="enrichmentLevel">丰富度等级</Label>
          <Select 
            value={createForm.enrichmentLevel} 
            onValueChange={(value: 'none' | 'partial' | 'full') => setCreateForm(prev => ({ ...prev, enrichmentLevel: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">无</SelectItem>
              <SelectItem value="partial">部分</SelectItem>
              <SelectItem value="full">完整</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            取消
          </Button>
          <Button 
            onClick={handleCreateList}
            disabled={isLoading}
            className="bg-lavender-500 hover:bg-lavender-600"
          >
            {isLoading ? '创建中...' : '创建列表'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 