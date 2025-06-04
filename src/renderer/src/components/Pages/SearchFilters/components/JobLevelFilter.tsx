import React from 'react'
import { SearchFilters, JobTitleLevel } from '../../../../types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Checkbox } from '../../../ui/checkbox'
import { Label } from '../../../ui/label'
import { Target } from 'lucide-react'

interface JobLevelFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export const JobLevelFilter: React.FC<JobLevelFilterProps> = ({
  filters,
  setFilters
}) => {
  const jobLevelOptions: { value: JobTitleLevel; label: string }[] = [
    { value: 'CXO', label: 'C级高管' },
    { value: 'VP', label: '副总裁' },
    { value: 'Director', label: '总监' },
    { value: 'Manager', label: '经理' },
    { value: 'Senior', label: '高级' },
    { value: 'Entry', label: '入门级' },
    { value: 'Owner', label: '所有者' },
    { value: 'Partner', label: '合伙人' }
  ]

  const handleJobLevelChange = (level: JobTitleLevel, checked: boolean) => {
    const currentLevels = filters.job_title_level || []
    if (checked) {
      setFilters({
        ...filters,
        job_title_level: [...currentLevels, level]
      })
    } else {
      setFilters({
        ...filters,
        job_title_level: currentLevels.filter(l => l !== level)
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          职位级别筛选
        </CardTitle>
        <CardDescription>
          按职位级别筛选（可多选）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {jobLevelOptions.map((level) => (
            <div key={level.value} className="flex items-center space-x-2">
              <Checkbox
                id={level.value}
                checked={filters.job_title_level?.includes(level.value) || false}
                onCheckedChange={(checked) => handleJobLevelChange(level.value, checked as boolean)}
              />
              <Label htmlFor={level.value} className="cursor-pointer">
                <span className="text-sm">{level.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 