import React from 'react'
import { useAppStore } from '../../../../stores/appStore'
import { Card, CardContent } from '../../../ui/card'

export const ListStats: React.FC = () => {
  const { currentLists } = useAppStore()

  return (
    <Card className="bg-lavender-50 border-lavender-200">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-lavender-700">
              {currentLists.length}
            </div>
            <div className="text-sm text-lavender-600">总列表数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-700">
              {currentLists.filter(list => list.status === 'finished').length}
            </div>
            <div className="text-sm text-green-600">已完成</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {currentLists.filter(list => list.status === 'processing').length}
            </div>
            <div className="text-sm text-blue-600">处理中</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-lavender-700">
              {currentLists.reduce((sum, list) => sum + list.totalProfiles, 0).toLocaleString()}
            </div>
            <div className="text-sm text-lavender-600">总联系人数</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 