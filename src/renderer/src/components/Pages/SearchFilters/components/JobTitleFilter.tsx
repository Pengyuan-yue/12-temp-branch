import React, { useState } from 'react'
import { SearchFilters } from '../../../../types/api'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select'
import { Plus, X, Briefcase } from 'lucide-react'

interface JobTitleFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export const JobTitleFilter: React.FC<JobTitleFilterProps> = ({
  filters,
  setFilters
}) => {
  const [newJobTitle, setNewJobTitle] = useState('')
  const [jobTitleIncludeExclude, setJobTitleIncludeExclude] = useState<'i' | 'e'>('i')

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

  const handleRemoveJobTitle = (index: number) => {
    setFilters({
      ...filters,
      job_title: filters.job_title?.filter((_, i) => i !== index) || []
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddJobTitle()
    }
  }

  return (
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
              onKeyPress={handleKeyPress}
            />
            <Button onClick={handleAddJobTitle} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {filters.job_title && filters.job_title.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.job_title.map((jobTitle, index) => (
              <div 
                key={`jobtitle-${index}`}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground"
              >
                {jobTitle.s === 'e' && '排除: '}{jobTitle.v}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => handleRemoveJobTitle(index)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 