import React from 'react'
import { SearchFilters, CompanySize } from '../../../../types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Checkbox } from '../../../ui/checkbox'
import { Label } from '../../../ui/label'
import { Users } from 'lucide-react'

interface CompanySizeFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export const CompanySizeFilter: React.FC<CompanySizeFilterProps> = ({
  filters,
  setFilters
}) => {
  const companySizeOptions: { value: CompanySize; label: string; icon: string }[] = [
    { value: '1-10', label: '1-10人', icon: '👥' },
    { value: '11-50', label: '11-50人', icon: '👨‍👩‍👧‍👦' },
    { value: '51-200', label: '51-200人', icon: '🏢' },
    { value: '201-500', label: '201-500人', icon: '🏬' },
    { value: '501-1000', label: '501-1000人', icon: '🏭' },
    { value: '1001-5000', label: '1001-5000人', icon: '🌆' },
    { value: '5001-10000', label: '5001-10000人', icon: '🌃' },
    { value: '10001+', label: '10000+人', icon: '🏙️' }
  ]

  const handleCompanySizeChange = (size: CompanySize, checked: boolean) => {
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
  )
} 