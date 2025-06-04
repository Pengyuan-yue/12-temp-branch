import React from 'react'
import { SearchFilters, CompanyIndustry } from '../../../../types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Checkbox } from '../../../ui/checkbox'
import { Label } from '../../../ui/label'
import { Building } from 'lucide-react'

interface IndustryFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export const IndustryFilter: React.FC<IndustryFilterProps> = ({
  filters,
  setFilters
}) => {
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

  return (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
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
  )
} 