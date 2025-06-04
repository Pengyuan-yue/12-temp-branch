import React from 'react'
import { useAppStore } from '../../../stores/appStore'
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'
import { AlertCircle } from 'lucide-react'

// 导入拆分后的组件
import { ExportSettings, ContactsPreview, ExportControls } from './components/index'
import { useDataExport } from './hooks/useDataExport'

const DataExportPage: React.FC = () => {
  const { selectedList, error } = useAppStore()
  
  const {
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
  } = useDataExport()

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">数据导出</h1>
          <p className="text-gray-600">
            {selectedList ? `导出列表: ${selectedList.name}` : '请先选择要导出的列表'}
          </p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-800">操作失败</AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 如果没有选择列表 */}
      {!selectedList && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>请选择列表</AlertTitle>
          <AlertDescription>
            请先在列表管理页面选择要导出的列表
          </AlertDescription>
        </Alert>
      )}

      {/* 如果有选择列表 */}
      {selectedList && (
        <>
          {/* 导出设置 */}
          <ExportSettings 
            exportSettings={exportSettings}
            setExportSettings={setExportSettings}
            availableFields={availableFields}
            toggleField={toggleField}
            onFetchContacts={fetchContactsFromApi}
          />

          {/* 联系人预览 */}
          <ContactsPreview 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredContacts={filteredContacts}
            selectedContacts={selectedContacts}
            toggleAllContacts={toggleAllContacts}
            toggleContact={toggleContact}
          />

          {/* 导出控制 */}
          <ExportControls 
            exportSettings={exportSettings}
            selectedContacts={selectedContacts}
            filteredContacts={filteredContacts}
            onExport={handleExport}
          />
        </>
      )}
    </div>
  )
}

export default DataExportPage 