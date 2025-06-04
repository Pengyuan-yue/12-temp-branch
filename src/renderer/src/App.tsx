import MainLayout from './components/Layout/MainLayout'
import ApiConfigPage from './components/Pages/ApiConfigPage'
import SearchFiltersPage from './components/Pages/SearchFilters/index'
import ProspectSearchPage from './components/Pages/ProspectSearchPage'
import IntegratedSearchPage from './components/Pages/IntegratedSearchPage'
import ListManagementPage from './components/Pages/ListManagement/index'
import ContinueSearchPage from './components/Pages/ContinueSearch/index'
import DataExportPage from './components/Pages/DataExport/index'
import TaskMonitorPage from './components/Pages/TaskMonitor/index'
import SettingsPage from './components/Pages/SettingsPage'
import { useAppStore } from './stores/appStore'

function App() {
  
  let currentPage: string
  try {
    const store = useAppStore()
    currentPage = store.currentPage
    console.log('Current page from store:', currentPage)
  } catch (error) {
    console.error('Error accessing store:', error)
    currentPage = 'api-config'
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'api-config':
        return <ApiConfigPage />
      case 'search':
        return <IntegratedSearchPage />
      case 'search-filters':
        return <SearchFiltersPage />
      case 'prospect-search':
        return <ProspectSearchPage />
      case 'lists':
        return <ListManagementPage />
      case 'continue-search':
        return <ContinueSearchPage />
      case 'export':
        return <DataExportPage />
      case 'tasks':
        return <TaskMonitorPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <ApiConfigPage />
    }
  }

  return (
    <div 
      className="App min-h-screen bg-gradient-to-br from-gray-50 to-lavender-50"
      style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, #faf8ff 50%, #f3f0ff 100%)'
      }}
    >
      <MainLayout>
        {renderCurrentPage()}
      </MainLayout>
    </div>
  )
}

export default App
