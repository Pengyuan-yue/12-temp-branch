import React, { useState } from 'react'
import { SearchFilters, CompanyIndustry } from '../../../types/api'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Checkbox } from '../../ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { 
  Search, 
  Plus, 
  X, 
  MapPin, 
  Users, 
  Building, 
  Briefcase,
  Trash2,
  Filter
} from 'lucide-react'

interface SearchFiltersSectionProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
  isSearching: boolean
  onSearch: () => void
  onClearFilters: () => void
}

export const SearchFiltersSection: React.FC<SearchFiltersSectionProps> = ({
  filters,
  setFilters,
  isSearching,
  onSearch,
  onClearFilters
}) => {
  // 表单输入状态
  const [newLastName, setNewLastName] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [jobTitleIncludeExclude, setJobTitleIncludeExclude] = useState<'i' | 'e'>('i')
  
  // 地理位置输入状态
  const [newLocation, setNewLocation] = useState('')
  const [locationType, setLocationType] = useState<'city' | 'state' | 'country'>('city')
  const [locationIncludeExclude, setLocationIncludeExclude] = useState<'i' | 'e'>('i')

  // 行业选项
  const industryOptions: { value: CompanyIndustry; label: string; icon: string }[] = [
    { value: 'computer software', label: '计算机软件', icon: '💻' },
    { value: 'financial services', label: '金融服务', icon: '💰' },
    { value: 'hospital & health care', label: '医疗保健', icon: '🏥' },
    { value: 'higher education', label: '高等教育', icon: '🎓' },
    { value: 'machinery', label: '制造业', icon: '🏭' },
    { value: 'retail', label: '零售', icon: '🛍️' },
    { value: 'real estate', label: '房地产', icon: '🏢' },
    { value: 'management consulting', label: '管理咨询', icon: '💼' },
    { value: 'marketing and advertising', label: '营销广告', icon: '📈' },
    { value: 'information technology and services', label: 'IT服务', icon: '🔧' },
    { value: 'banking', label: '银行业', icon: '🏦' },
    { value: 'insurance', label: '保险', icon: '🛡️' },
    { value: 'telecommunications', label: '电信', icon: '📱' },
    { value: 'automotive', label: '汽车', icon: '🚗' },
    { value: 'pharmaceuticals', label: '制药', icon: '💊' },
    { value: 'construction', label: '建筑', icon: '🏗️' },
    { value: 'food & beverages', label: '食品饮料', icon: '🍽️' },
    { value: 'entertainment', label: '娱乐', icon: '🎬' },
    { value: 'logistics and supply chain', label: '物流供应链', icon: '🚚' },
    { value: 'e-learning', label: '在线教育', icon: '📚' }
  ]

  // 公司规模选项
  const companySizeOptions = [
    { value: '1-10', label: '1-10人', icon: '👥' },
    { value: '11-50', label: '11-50人', icon: '👨‍👩‍👧‍👦' },
    { value: '51-200', label: '51-200人', icon: '🏢' },
    { value: '201-500', label: '201-500人', icon: '🏬' },
    { value: '501-1000', label: '501-1000人', icon: '🏭' },
    { value: '1001-5000', label: '1001-5000人', icon: '🌆' },
    { value: '5001-10000', label: '5001-10000人', icon: '🌃' },
    { value: '10001+', label: '10001+人', icon: '🌇' }
  ]

  // 添加姓氏
  const handleAddLastName = () => {
    if (newLastName.trim() && !filters.last_name?.includes(newLastName.trim())) {
      setFilters({
        ...filters,
        last_name: [...(filters.last_name || []), newLastName.trim()]
      })
      setNewLastName('')
    }
  }

  // 移除姓氏
  const handleRemoveLastName = (lastName: string) => {
    setFilters({
      ...filters,
      last_name: filters.last_name?.filter(name => name !== lastName) || []
    })
  }

  // 添加地点
  const handleAddLocation = () => {
    if (!newLocation.trim()) {
      alert('请输入地点名称')
      return
    }

    const locationValue = newLocation.trim()
    
    // 根据API规范验证格式
    if (locationType === 'city') {
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 3) {
        alert('城市格式应为：城市, 州/省, 国家\n例如：Toronto, Ontario, Canada')
        return
      }
    } else if (locationType === 'state') {
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 2) {
        alert('州/省格式应为：州/省, 国家\n例如：Ontario, Canada')
        return
      }
    } else {
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 1) {
        alert('国家格式应为：国家名称\n例如：Canada')
        return
      }
    }

    const location = {
      v: locationValue,
      b: locationType,
      s: locationIncludeExclude
    }
    
    setFilters({
      ...filters,
      location: [...(filters.location || []), location]
    })
    
    setNewLocation('')
  }

  // 移除地点
  const handleRemoveLocation = (index: number) => {
    setFilters({
      ...filters,
      location: filters.location?.filter((_, i) => i !== index) || []
    })
  }

  // 添加职位
  const handleAddJobTitle = () => {
    if (newJobTitle.trim()) {
      const jobTitle = {
        v: newJobTitle.trim(),
        s: jobTitleIncludeExclude
      }
      
      setFilters({
        ...filters,
        job_title: [...(filters.job_title || []), jobTitle]
      })
      
      setNewJobTitle('')
    }
  }

  // 移除职位
  const handleRemoveJobTitle = (index: number) => {
    setFilters({
      ...filters,
      job_title: filters.job_title?.filter((_, i) => i !== index) || []
    })
  }

  // 行业变化处理
  const handleIndustryChange = (industry: CompanyIndustry, checked: boolean) => {
    const currentIndustries = filters.company_industry || []
    if (checked) {
      setFilters({
        ...filters,
        company_industry: [...currentIndustries, industry]
      })
    } else {
      setFilters({
        ...filters,
        company_industry: currentIndustries.filter(i => i !== industry)
      })
    }
  }

  // 公司规模变化处理
  const handleCompanySizeChange = (size: string, checked: boolean) => {
    const currentSizes = filters.company_size || []
    if (checked) {
      setFilters({
        ...filters,
        company_size: [...currentSizes, size]
      })
    } else {
      setFilters({
        ...filters,
        company_size: currentSizes.filter(s => s !== size)
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* 姓氏筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            姓氏筛选
          </CardTitle>
          <CardDescription>
            按姓氏筛选潜在客户（精确匹配）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="输入姓氏，如：张、李、王"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLastName()}
            />
            <Button onClick={handleAddLastName} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {filters.last_name && filters.last_name.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.last_name.map((lastName, index) => (
                <div key={`lastname-${index}`}>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {lastName}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveLastName(lastName)}
                    />
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 地理位置筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            地理位置筛选
          </CardTitle>
          <CardDescription>
            按地理位置筛选潜在客户
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="city">城市</SelectItem>
                <SelectItem value="state">州/省</SelectItem>
                <SelectItem value="country">国家</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={locationIncludeExclude} onValueChange={(value: any) => setLocationIncludeExclude(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="i">包含</SelectItem>
                <SelectItem value="e">排除</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Input
                placeholder={
                  locationType === 'city' ? '城市, 州/省, 国家' :
                  locationType === 'state' ? '州/省, 国家' : '国家'
                }
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
              />
              <Button onClick={handleAddLocation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {filters.location && filters.location.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.location.map((location, index) => (
                <div key={`location-${index}`}>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {location.s === 'e' && '排除: '}{location.v} ({location.b})
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveLocation(index)}
                    />
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 职位筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            职位筛选
          </CardTitle>
          <CardDescription>
            按职位标题筛选潜在客户
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Select value={jobTitleIncludeExclude} onValueChange={(value: any) => setJobTitleIncludeExclude(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="i">包含</SelectItem>
                <SelectItem value="e">排除</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Input
                placeholder="输入职位关键词，如：CEO、经理、总监"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddJobTitle()}
              />
              <Button onClick={handleAddJobTitle} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {filters.job_title && filters.job_title.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.job_title.map((jobTitle, index) => (
                <div key={`jobtitle-${index}`}>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {jobTitle.s === 'e' && '排除: '}{jobTitle.v}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleRemoveJobTitle(index)}
                    />
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 行业筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            行业筛选
          </CardTitle>
          <CardDescription>
            选择目标行业（可多选）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {industryOptions.map((industry) => (
              <div key={industry.value} className="flex items-center space-x-2">
                <Checkbox
                  id={industry.value}
                  checked={filters.company_industry?.includes(industry.value) || false}
                  onCheckedChange={(checked) => handleIndustryChange(industry.value, checked as boolean)}
                />
                <Label htmlFor={industry.value} className="flex items-center gap-2 cursor-pointer">
                  <span>{industry.icon}</span>
                  <span className="text-sm">{industry.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 公司规模筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            公司规模筛选
          </CardTitle>
          <CardDescription>
            按公司员工数量筛选（可多选）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {companySizeOptions.map((size) => (
              <div key={size.value} className="flex items-center space-x-2">
                <Checkbox
                  id={size.value}
                  checked={filters.company_size?.includes(size.value) || false}
                  onCheckedChange={(checked) => handleCompanySizeChange(size.value, checked as boolean)}
                />
                <Label htmlFor={size.value} className="flex items-center gap-2 cursor-pointer">
                  <span>{size.icon}</span>
                  <span className="text-sm">{size.label}</span>
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button 
          onClick={onSearch} 
          disabled={isSearching}
          className="flex-1"
        >
          {isSearching ? (
            <>
              <Search className="h-4 w-4 mr-2 animate-spin" />
              搜索中...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              开始搜索
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onClearFilters}
          disabled={isSearching}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          清除条件
        </Button>
      </div>
    </div>
  )
} 