import React from 'react'
import { SearchFilters, JobRole } from '../../../../types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Checkbox } from '../../../ui/checkbox'
import { Label } from '../../../ui/label'
import { Briefcase } from 'lucide-react'

interface JobRoleFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export const JobRoleFilter: React.FC<JobRoleFilterProps> = ({
  filters,
  setFilters
}) => {
  const jobRoleOptions: { value: JobRole; label: string }[] = [
    { value: 'sales', label: '销售' },
    { value: 'marketing', label: '市场营销' },
    { value: 'engineering', label: '工程技术' },
    { value: 'finance', label: '财务' },
    { value: 'human_resources', label: '人力资源' },
    { value: 'operations', label: '运营' },
    { value: 'customer_service', label: '客户服务' },
    { value: 'design', label: '设计' },
    { value: 'legal', label: '法务' },
    { value: 'education', label: '教育' }
  ]

  const handleJobRoleChange = (role: JobRole, checked: boolean) => {
    const currentRoles = filters.job_role || []
    if (checked) {
      setFilters({
        ...filters,
        job_role: [...currentRoles, role]
      })
    } else {
      setFilters({
        ...filters,
        job_role: currentRoles.filter(r => r !== role)
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          职位角色筛选
        </CardTitle>
        <CardDescription>
          按职位角色筛选（可多选）
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {jobRoleOptions.map((role) => (
            <div key={role.value} className="flex items-center space-x-2">
              <Checkbox
                id={role.value}
                checked={filters.job_role?.includes(role.value) || false}
                onCheckedChange={(checked) => handleJobRoleChange(role.value, checked as boolean)}
              />
              <Label htmlFor={role.value} className="cursor-pointer">
                <span className="text-sm">{role.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 