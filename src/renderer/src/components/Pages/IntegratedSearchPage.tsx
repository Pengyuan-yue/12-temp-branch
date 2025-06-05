import React, { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { getWizaApi } from '../../services/wizaApi'
import { SearchFilters, SearchResponse, Location, JobTitleFilter, CompanyIndustry, CompanySize } from '../../types/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Checkbox } from '../ui/checkbox'
import { Progress } from '../ui/progress'
import { Separator } from '../ui/separator'
import { 
  Search, 
  Plus, 
  X, 
  MapPin, 
  Users, 
  Building, 
  Rocket, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Target,
  Filter,
  Trash2,
  Copy,
  Play,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Settings,
  Zap,
  TrendingUp,
  Clock,
  Briefcase,
  Info
} from 'lucide-react'
import LastNameFilter from './SearchFilters/components/LastNameFilter'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

// 自定义Badge包装组件解决类型问题
const CustomBadge: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}> = ({ children, className, variant = "default" }) => {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
      variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground" : 
      variant === "outline" ? "text-foreground" :
      variant === "destructive" ? "border-transparent bg-destructive text-destructive-foreground" :
      "border-transparent bg-primary text-primary-foreground"
    } ${className || ""}`}>
      {children}
    </div>
  );
};

interface SearchHistory {
  id: string
  timestamp: string
  filters: SearchFilters
  totalResults: number
  searchTime: number
}

const IntegratedSearchPage: React.FC = () => {
  const { apiKey, isApiKeyValid, setError, setLoading, addTask, updateTask, addList, setCurrentPage } = useAppStore()
  
  // 搜索条件状态
  const [filters, setFilters] = useState<SearchFilters>({})
  
  // 扩展SearchResponse类型以包含本地使用的额外字段
  interface LocalSearchResponse extends SearchResponse {
    searchTime: number;
    timestamp: string;
  }
  
  // 搜索结果和状态
  const [searchResults, setSearchResults] = useState<LocalSearchResponse | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [searchTime, setSearchTime] = useState<number>(0)
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  
  // 表单输入状态
  const [newLastName, setNewLastName] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [jobTitleIncludeExclude, setJobTitleIncludeExclude] = useState<'i' | 'e'>('i')
  
  // 地理位置输入状态 - 符合API规范
  const [newLocation, setNewLocation] = useState('')
  const [locationType, setLocationType] = useState<'city' | 'state' | 'country'>('city')
  const [locationIncludeExclude, setLocationIncludeExclude] = useState<'i' | 'e'>('i')
  
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [locationOptions, setLocationOptions] = useState<Array<{name: string, value: string}>>([])
  
  // 界面状态
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'filters' | 'results' | 'history'>('filters')

  // 行业选项 (基于API规范的CompanyIndustry枚举)
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

  // 公司规模选项 - 使用 CompanySize 类型
  const companySizeOptions: { value: CompanySize; label: string; icon: string }[] = [
    { value: '1-10', label: '1-10人', icon: '👥' },
    { value: '11-50', label: '11-50人', icon: '👨‍👩‍👧‍👦' },
    { value: '51-200', label: '51-200人', icon: '🏢' },
    { value: '201-500', label: '201-500人', icon: '🏬' },
    { value: '501-1000', label: '501-1000人', icon: '🏭' },
    { value: '1001-5000', label: '1001-5000人', icon: '🌆' },
    { value: '5001-10000', label: '5001-10000人', icon: '🌃' },
    { value: '10001+', label: '10001+人', icon: '🌇' }
  ]

  // 加载搜索历史
  useEffect(() => {
    const savedHistory = localStorage.getItem('wiza-search-history')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('加载搜索历史失败:', error)
      }
    }
  }, [])

  // 保存搜索历史
  const saveSearchHistory = (newHistory: SearchHistory) => {
    const updatedHistory = [newHistory, ...searchHistory.slice(0, 9)]
    setSearchHistory(updatedHistory)
    localStorage.setItem('wiza-search-history', JSON.stringify(updatedHistory))
  }

  // 添加姓氏
  const handleAddLastName = () => {
    if (newLastName.trim() && !filters.last_name?.includes(newLastName.trim())) {
      setFilters(prev => ({
        ...prev,
        last_name: [...(prev.last_name || []), newLastName.trim()]
      }))
      setNewLastName('')
    }
  }

  // 移除姓氏
  const handleRemoveLastName = (lastName: string) => {
    setFilters(prev => ({
      ...prev,
      last_name: prev.last_name?.filter(name => name !== lastName) || []
    }))
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
      // 城市格式：'city, state, country'
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 3) {
        alert('城市格式应为：城市, 州/省, 国家\n例如：Toronto, Ontario, Canada')
        return
      }
    } else if (locationType === 'state') {
      // 州/省格式：'state, country'
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 2) {
        alert('州/省格式应为：州/省, 国家\n例如：Ontario, Canada')
        return
      }
    } else {
      // 国家格式：'country'
      const parts = locationValue.split(',').map(p => p.trim())
      if (parts.length !== 1) {
        alert('国家格式应为：国家名称\n例如：Canada')
        return
      }
    }

    // 地点名称自动纠正映射
    const locationCorrections: Record<string, string> = {
      'United State': 'United States',
      'US': 'United States',
      'USA': 'United States',
      'America': 'United States',
      'UK': 'United Kingdom',
      'Britain': 'United Kingdom',
      'England': 'United Kingdom',
      'China': 'China',
      '中国': 'China',
      'Japan': 'Japan',
      '日本': 'Japan',
      'Korea': 'South Korea',
      '韩国': 'South Korea',
      'Germany': 'Germany',
      '德国': 'Germany',
      'France': 'France',
      '法国': 'France',
      'Italy': 'Italy',
      '意大利': 'Italy',
      'Spain': 'Spain',
      '西班牙': 'Spain',
      'Australia': 'Australia',
      '澳大利亚': 'Australia',
      'Brazil': 'Brazil',
      '巴西': 'Brazil',
      'India': 'India',
      '印度': 'India',
      'Russia': 'Russia',
      '俄罗斯': 'Russia',
      'Mexico': 'Mexico',
      '墨西哥': 'Mexico',
      'Netherlands': 'Netherlands',
      '荷兰': 'Netherlands',
      'Sweden': 'Sweden',
      '瑞典': 'Sweden',
      'Norway': 'Norway',
      '挪威': 'Norway',
      'Denmark': 'Denmark',
      '丹麦': 'Denmark',
      'Finland': 'Finland',
      '芬兰': 'Finland',
      'Switzerland': 'Switzerland',
      '瑞士': 'Switzerland',
      'Austria': 'Austria',
      '奥地利': 'Austria',
      'Belgium': 'Belgium',
      '比利时': 'Belgium',
      'Poland': 'Poland',
      '波兰': 'Poland',
      'Singapore': 'Singapore',
      '新加坡': 'Singapore',
      'Thailand': 'Thailand',
      '泰国': 'Thailand',
      'Vietnam': 'Vietnam',
      '越南': 'Vietnam',
      'Malaysia': 'Malaysia',
      '马来西亚': 'Malaysia',
      'Indonesia': 'Indonesia',
      '印度尼西亚': 'Indonesia',
      'Philippines': 'Philippines',
      '菲律宾': 'Philippines',
      'New Zealand': 'New Zealand',
      '新西兰': 'New Zealand',
      'South Africa': 'South Africa',
      '南非': 'South Africa',
      'Egypt': 'Egypt',
      '埃及': 'Egypt',
      'Israel': 'Israel',
      '以色列': 'Israel',
      'Turkey': 'Turkey',
      '土耳其': 'Turkey',
      'Argentina': 'Argentina',
      '阿根廷': 'Argentina',
      'Chile': 'Chile',
      '智利': 'Chile',
      'Colombia': 'Colombia',
      '哥伦比亚': 'Colombia',
      'Peru': 'Peru',
      '秘鲁': 'Peru'
    }

    // 检查是否需要自动纠正
    let correctedLocation = locationValue
    const correction = locationCorrections[locationValue]
    if (correction) {
      correctedLocation = correction
      console.log(`🔧 地点名称自动纠正: "${locationValue}" → "${correctedLocation}"`)
    }

    // 创建符合API规范的Location对象
    const newLocationObj: Location = {
      v: correctedLocation,
      b: locationType,
      s: locationIncludeExclude
    }

    // 检查是否已存在相同的地点
    const existingIndex = filters.location?.findIndex(
      loc => loc.v === correctedLocation && loc.b === locationType
    )

    if (existingIndex !== undefined && existingIndex >= 0) {
      alert('该地点已存在')
      return
    }

    // 添加到筛选条件
    setFilters(prev => ({
      ...prev,
      location: [...(prev.location || []), newLocationObj]
    }))

    // 清空输入框
    setNewLocation('')
    
    // 调试信息
    console.log('🌍 添加地理位置:', newLocationObj)
  }

  // 移除地点
  const handleRemoveLocation = (index: number) => {
    setFilters(prev => ({
      ...prev,
      location: prev.location?.filter((_, i) => i !== index) || []
    }))
  }

  // 添加职位
  // 获取精确位置
  const getPreciseLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理位置功能')
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let errorMsg = '获取位置失败: '
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg = '用户拒绝了地理位置请求'
                break
              case error.POSITION_UNAVAILABLE:
                errorMsg = '位置信息不可用'
                break
              case error.TIMEOUT:
                errorMsg = '获取位置请求超时'
                break
            }
            reject(new Error(errorMsg))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,  // 延长超时时间
            maximumAge: 0
          }
        )
      })
      
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      
      const data = await response.json()
      if (data.address) {
        const { city, town, village, state, country } = data.address
        const locationName = city || town || village || state || country
        
        // 创建位置选项
        const options = []
        let cityLevelValue = ''
        if (city || town || village) {
          cityLevelValue = `${city || town || village}, ${state}, ${country}`
          options.push({
            name: `${city || town || village}, ${state}, ${country}`,
            value: cityLevelValue
          })
        }
        if (state) {
          const stateLevelValue = `${state}, ${country}`
          options.push({
            name: stateLevelValue,
            value: stateLevelValue
          })
        }
        options.push({
          name: country,
          value: country
        })
        
        setLocationOptions(options)
        setLocationType('city')
        
        // 自动填充最精确的位置到输入框
        if (cityLevelValue) {
          setNewLocation(cityLevelValue)
        } else if (state) {
          setNewLocation(`${state}, ${country}`)
        } else {
          setNewLocation(country)
        }
      }
    } catch (error) {
      console.error('获取精确位置失败:', error)
      setLocationError('无法获取精确位置，请确保已启用位置服务')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleAddJobTitle = () => {
    if (newJobTitle.trim()) {
      // 创建正确的职位对象结构，按照API规范 job_title 应该是一个对象数组
      const jobTitle: JobTitleFilter = {
        v: newJobTitle.trim(),
        s: jobTitleIncludeExclude // 使用用户选择的包含/排除选项
      }
      
      // 检查是否已经存在相同的职位和选项组合
      const exists = filters.job_title?.some(title => 
        typeof title === 'object' && title.v === jobTitle.v && title.s === jobTitle.s
      )
      
      if (!exists) {
        setFilters(prev => ({
          ...prev,
          job_title: [...(prev.job_title || []), jobTitle]
        }))
        setNewJobTitle('')
      } else {
        alert('该职位条件已存在')
      }
    }
  }

  // 移除职位
  const handleRemoveJobTitle = (index: number) => {
    setFilters(prev => ({
      ...prev,
      job_title: prev.job_title?.filter((_, i) => i !== index) || []
    }))
  }

  // 行业变更
  const handleIndustryChange = (industry: CompanyIndustry, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      company_industry: checked 
        ? [...(prev.company_industry || []), industry]
        : prev.company_industry?.filter(m => m !== industry) || []
    }))
  }

  // 公司规模变更
  const handleCompanySizeChange = (size: CompanySize, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      company_size: checked 
        ? [...(prev.company_size || []), size]
        : prev.company_size?.filter(s => s !== size) || []
    }))
  }

  // 搜索处理函数
  const handleSearch = async () => {
    if (!apiKey) {
      setSearchError('请先配置API密钥')
      return
    }

    // 检查是否有搜索条件
    const hasFilters = Object.values(filters).some(filter => 
      Array.isArray(filter) ? filter.length > 0 : filter
    )
    
    if (!hasFilters) {
      setSearchError('请至少设置一个搜索条件')
      return
    }

    setIsSearching(true)
    setSearchError(null)
    setSearchResults(null)
    
    const startTime = Date.now()

    try {
      const wizaApi = getWizaApi(apiKey)
      
      // 首先检查账户积分状态
      console.log('检查账户积分状态...')
      try {
        const credits = await wizaApi.getCredits()
        console.log('账户积分信息:', credits)
        
        // 检查API积分是否足够
        if (credits.credits.api_credits !== undefined && credits.credits.api_credits <= 0) {
          setSearchError('API积分不足，请充值后再试')
          return
        }
      } catch (creditError) {
        console.warn('获取积分信息失败:', creditError)
        // 不阻止搜索，但记录警告
      }
      
      console.log('准备发送的搜索条件:', filters)
      
      const result = await wizaApi.searchProspects(filters, 30)
      const endTime = Date.now()
      const searchTime = endTime - startTime
      
      console.log('搜索结果:', result)
      
      if (result.status.code === 200) {
        const searchResult: LocalSearchResponse = {
          status: { code: 200 },
          data: {
            total: result.data.total
          },
          searchTime,
          timestamp: new Date().toISOString()
        }
        
        setSearchResults(searchResult)
        
        // 保存搜索历史
        const historyItem: SearchHistory = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          filters: { ...filters },
          totalResults: result.data.total,
          searchTime
        }
        saveSearchHistory(historyItem)
        
        // 切换到结果标签页
        setActiveTab('results')
      } else {
        setSearchError(`搜索失败: 状态码 ${result.status.code}`)
      }
    } catch (error) {
      console.error('搜索失败:', error)
      let errorMessage = '搜索失败'
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP 401')) {
          errorMessage = 'API密钥无效，请重新配置'
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = '权限不足，请检查账户状态'
        } else if (error.message.includes('credits')) {
          errorMessage = '积分不足，请充值后再试'
        } else {
          errorMessage = `搜索失败: ${error.message}`
        }
      }
      
      setSearchError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  // 创建列表
  const handleCreateList = async () => {
    if (!searchResults || !isApiKeyValid || !apiKey) {
      setSearchError('请先进行搜索')
      return
    }

    const totalResults = searchResults.data.total
    const maxProfiles = Math.min(totalResults, 2500)
    const listName = `搜索列表_${new Date().toLocaleDateString()}`

    setIsCreatingList(true)
    setSearchError(null)

    try {
      const wizaApi = getWizaApi(apiKey)
      const result = await wizaApi.createProspectList({
        filters,
        list: {
          name: listName,
          max_profiles: maxProfiles,
          enrichment_level: 'partial',
          email_options: {
            accept_work: true,
            accept_personal: true,
            accept_generic: true
          }
        }
      })
      
      console.log('列表创建成功:', result)
      
      // 检查API响应格式
      if (!result.data || !result.data.id) {
        throw new Error('API响应格式错误：缺少列表ID')
      }
      
      // 创建本地列表记录并添加到状态管理中
        const newList = {
          id: String(result.data.id),
          name: listName,
          status: (result.data.status || 'queued') as 'queued' | 'pending' | 'processing' | 'scraping' | 'finished' | 'failed',
          totalProfiles: result.data.stats?.people || maxProfiles,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          filters: filters,
          maxProfiles: maxProfiles
        }

      // 添加列表到状态管理
      addList(newList)
      
      // 显示成功消息
      const successMessage = totalResults > 2500 
        ? `列表创建成功！已创建包含前${formatNumber(maxProfiles)}个联系人的列表。剩余${formatNumber(totalResults - maxProfiles)}个联系人可通过创建新列表获取。`
        : `列表创建成功！已创建包含${formatNumber(maxProfiles)}个联系人的列表。`
      
      setSearchError(null)
      setSearchResults(null) // 清除搜索结果
      
      // 显示成功提示
      setSuccessMessage(successMessage)
      
      // 启动列表状态监控
      startListMonitoring(String(result.data.id))
      
      // 跳转到列表管理页面
      setTimeout(() => {
        setCurrentPage('lists')
        setSuccessMessage(null) // 清除成功消息
      }, 3000) // 延迟跳转，让用户看到成功消息
      
    } catch (error) {
      console.error('创建列表失败:', error)
      let errorMessage = '创建列表失败'
      
      if (error instanceof Error) {
        // 解析具体的错误信息
        if (error.message.includes('HTTP 400')) {
          errorMessage = '请求参数错误，请检查搜索条件'
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'API密钥无效，请重新配置'
        } else if (error.message.includes('HTTP 403')) {
          errorMessage = '权限不足，请检查账户状态'
        } else if (error.message.includes('payment method')) {
          errorMessage = '请添加有效的付款方式'
        } else if (error.message.includes('subscription')) {
          errorMessage = '请确保您有有效的订阅'
        } else {
          errorMessage = `创建列表失败: ${error.message}`
        }
      }
      
      setSearchError(errorMessage)
    } finally {
      setIsCreatingList(false)
    }
  }

  // 列表状态监控函数
  const startListMonitoring = (listId: string) => {
    if (!apiKey) return

    const checkStatus = async () => {
      try {
        console.log(`开始检查列表 ${listId} 的状态`)
        const wizaApi = getWizaApi(apiKey)
        const status = await wizaApi.getListStatus(listId)
        
        console.log(`列表 ${listId} 的状态:`, status.data)
        
        // 检查API响应格式
        if (!status.data) {
          console.error('API响应格式错误：缺少data字段')
          return
        }
        
        // 安全地获取stats数据
        const peopleCount = status.data.stats?.people || 0
        const listStatus = status.data.status || 'unknown'
        
        console.log(`列表 ${listId} API返回的联系人数量: ${peopleCount}`)
        console.log(`列表 ${listId} API返回的状态: ${listStatus}`)
        
        // 使用store的updateList方法更新列表状态
        const store = useAppStore.getState()
        const currentList = store.currentLists.find(list => list.id === listId)
        const maxProfiles = currentList?.maxProfiles || 1000
        
        // 计算进度百分比
        let progress = 0
        if (listStatus === 'finished') {
          progress = 100
        } else if (listStatus === 'failed') {
          progress = 0
        } else if (listStatus === 'queued') {
          progress = 10
        } else if (listStatus === 'processing' || listStatus === 'scraping') {
          // 根据联系人数量和目标数量计算进度
          progress = Math.min(Math.round((peopleCount / maxProfiles) * 90), 90) // 最多90%，完成时才100%
        }
        
        console.log(`列表 ${listId} 计算的进度: ${progress}%`)
        
        store.updateList(listId, {
          status: listStatus,
          progress: progress,
          // 重要：确保totalProfiles使用API返回的实际数量
          totalProfiles: peopleCount,
          updatedAt: new Date().toISOString()
        })

        // 如果列表还在处理中，继续监控
        if (['processing', 'queued', 'scraping'].includes(listStatus)) {
          setTimeout(checkStatus, 60000) // 每分钟检查一次
        } else if (listStatus === 'finished') {
          console.log(`列表 ${listId} 已完成`)
        } else if (listStatus === 'failed') {
          console.error(`列表 ${listId} 创建失败`)
          // 可以在这里添加失败通知
        }
      } catch (error) {
        console.error(`监控列表 ${listId} 状态失败:`, error)
        // 如果监控失败，可以尝试重新监控
        setTimeout(checkStatus, 120000) // 2分钟后重试
      }
    }

    // 立即检查一次，然后开始定期检查
    checkStatus()
  }

  // 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  // 格式化时间
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  // 使用历史搜索条件
  const handleUseHistoryFilters = (historyFilters: SearchFilters) => {
    setFilters(historyFilters)
    setActiveTab('filters')
    setSearchError(null)
  }

  // 清空所有条件 - 使用正确的 CompanySize 类型
  const handleClearFilters = () => {
    setFilters({
      company_industry: [],
      last_name: [],
      location: [],
      job_title: [],
      company_size: [] as CompanySize[]
    })
    setSearchError(null)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">智能搜索</h1>
          <p className="text-gray-600">设置搜索条件并立即查看潜在客户数量</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !apiKey}
            className="bg-lavender-500 hover:bg-lavender-600"
          >
            {isSearching ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isSearching ? '搜索中...' : '开始搜索'}
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {searchError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-800">操作失败</AlertTitle>
          <AlertDescription className="text-red-700">
            {searchError}
          </AlertDescription>
        </Alert>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-800">操作成功</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'filters'
              ? 'bg-white text-lavender-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Filter className="h-4 w-4 inline mr-2" />
          搜索条件
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'results'
              ? 'bg-white text-lavender-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="h-4 w-4 inline mr-2" />
          搜索结果
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-lavender-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="h-4 w-4 inline mr-2" />
          搜索历史
        </button>
      </div>

      {/* 搜索条件标签页 */}
      {activeTab === 'filters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基础搜索条件 */}
          <div className="space-y-6">
            {/* 百家姓筛选组件 - 保留外层卡片但移除内部浅蓝色背景 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-lavender-500" />
                  姓氏筛选
                </CardTitle>
                <CardDescription>
                  按姓氏筛选潜在客户
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LastNameFilter 
                  filters={filters}
                  setFilters={setFilters}
                />
              </CardContent>
            </Card>

            {/* 地理位置筛选 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-lavender-500" />
                  地理位置
                </CardTitle>
                <CardDescription>
                  按城市或地区筛选潜在客户
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Select value={locationType} onValueChange={(value: 'city' | 'state' | 'country') => setLocationType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="city">城市</SelectItem>
                        <SelectItem value="state">州/省</SelectItem>
                        <SelectItem value="country">国家</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={locationIncludeExclude} onValueChange={(value: 'i' | 'e') => setLocationIncludeExclude(value)}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="i">包含</SelectItem>
                        <SelectItem value="e">排除</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    {locationType === 'city' && (
                      <Input
                        placeholder="城市, 州/省, 国家 (例如: Toronto, Ontario, Canada)"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                      />
                    )}
                    {locationType === 'state' && (
                      <Input
                        placeholder="州/省, 国家 (例如: Ontario, Canada)"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                      />
                    )}
                    {locationType === 'country' && (
                      <Input
                        placeholder="国家 (例如: Canada)"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
                      />
                    )}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={getPreciseLocation}
                        disabled={isLoadingLocation}
                        size="sm"
                        className="flex-1"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-1" />
                            定位
                          </>
                        )}
                      </Button>
                      <Button onClick={handleAddLocation} size="sm" className="flex-1">
                        <Plus className="h-4 w-4 mr-1" />
                        添加
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* 位置选项 */}
                {locationOptions.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-medium mb-1">检测到的位置</div>
                    <div className="flex flex-wrap gap-1">
                      {locationOptions.map((option, index) => (
                        <Button 
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => {
                            setNewLocation(option.value)
                            handleAddLocation()
                          }}
                        >
                          {option.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* API规范格式说明 */}
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  <div className="font-semibold text-blue-700 mb-1">📍 API规范格式要求：</div>
                  <div className="space-y-1">
                    <div><strong>城市：</strong> 城市, 州/省, 国家 (例如: Toronto, Ontario, Canada)</div>
                    <div><strong>州/省：</strong> 州/省, 国家 (例如: Ontario, Canada)</div>
                    <div><strong>国家：</strong> 国家名称 (例如: Canada)</div>
                  </div>
                  <div className="mt-2 text-blue-600">
                    💡 系统支持常见地名自动纠正 (如: US → United States)
                  </div>
                </div>

                {/* 已添加的地理位置 */}
                {filters.location && filters.location.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.location.map((location, index) => (
                      <CustomBadge 
                        key={index}
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                      >
                        {location.s === 'i' ? '包含' : '排除'}: {location.v} ({location.b === 'city' ? '城市' : location.b === 'state' ? '州/省' : '国家'})
                        <button
                          onClick={() => handleRemoveLocation(index)}
                          className="ml-1 hover:text-green-600"
                        >
                          ×
                        </button>
                      </CustomBadge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 职位条件 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-lavender-500" />
                  职位筛选
                </CardTitle>
                <CardDescription>
                  根据职位或职能搜索（支持包含/排除）
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* 包含/排除选择器 */}
                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">筛选方式:</Label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="job-include"
                          name="jobTitleFilter"
                          checked={jobTitleIncludeExclude === 'i'}
                          onChange={() => setJobTitleIncludeExclude('i')}
                          className="w-4 h-4 text-green-600"
                          aria-label="包含这些职位"
                        />
                        <Label htmlFor="job-include" className="text-sm text-green-700 cursor-pointer">
                          包含 (匹配这些职位)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="job-exclude"
                          name="jobTitleFilter"
                          checked={jobTitleIncludeExclude === 'e'}
                          onChange={() => setJobTitleIncludeExclude('e')}
                          className="w-4 h-4 text-red-600"
                          aria-label="排除这些职位"
                        />
                        <Label htmlFor="job-exclude" className="text-sm text-red-700 cursor-pointer">
                          排除 (不包含这些职位)
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* 职位输入 */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="输入职位，如：Manager, Director, CEO..."
                      value={newJobTitle}
                      onChange={(e) => setNewJobTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddJobTitle()}
                      className="flex-1"
                    />
                    <Button onClick={handleAddJobTitle} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {filters.job_title?.map((title, index) => (
                    <CustomBadge 
                      key={index} 
                      variant={typeof title === 'object' && title.s === 'e' ? "destructive" : "secondary"} 
                      className="flex items-center gap-1"
                    >
                      <span className="text-xs">
                        {typeof title === 'object' && title.s === 'e' ? '排除' : '包含'}:
                      </span>
                      {typeof title === 'string' ? title : title.v}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleRemoveJobTitle(index)}
                      />
                    </CustomBadge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 高级搜索条件 */}
          <div className="space-y-6">
            {/* 行业筛选 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-lavender-500" />
                  行业筛选
                </CardTitle>
                <CardDescription>
                  选择目标行业领域
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {industryOptions.map((industry) => (
                    <div key={industry.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`industry-${industry.value}`}
                        checked={filters.company_industry?.includes(industry.value) || false}
                        onCheckedChange={(checked) => 
                          handleIndustryChange(industry.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`industry-${industry.value}`}
                        className="text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>{industry.icon}</span>
                        {industry.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 公司规模 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-lavender-500" />
                  公司规模
                </CardTitle>
                <CardDescription>
                  按员工数量筛选公司
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {companySizeOptions.map((size) => (
                    <div key={size.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size.value}`}
                        checked={filters.company_size?.includes(size.value) || false}
                        onCheckedChange={(checked) => 
                          handleCompanySizeChange(size.value, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`size-${size.value}`}
                        className="text-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>{size.icon}</span>
                        {size.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Settings className="h-5 w-5" />
                  快速操作
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空所有条件
                </Button>

              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 搜索结果标签页 */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {isSearching && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  正在搜索...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={50} className="h-2" />
                <p className="text-sm text-blue-700 mt-2">正在分析搜索条件并获取结果...</p>
              </CardContent>
            </Card>
          )}

          {searchResults && !isSearching && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 搜索结果概览 */}
              <div className="lg:col-span-2">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      搜索完成
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      搜索耗时: {formatDuration(searchTime)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-3xl font-bold text-green-600">
                          {formatNumber(searchResults.data?.total || 0)}
                        </div>
                        <div className="text-sm text-gray-600">潜在客户总数</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.min(searchResults.data?.total || 0, 2500)}
                        </div>
                        <div className="text-sm text-gray-600">单个列表最大容量</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {searchResults.data?.total > 2500 ? '(超出部分需创建多个列表)' : '(可全部包含在一个列表中)'}
                        </div>
                      </div>
                    </div>

                    {/* 添加详细说明 */}
                    {searchResults.data?.total > 2500 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <div className="font-medium mb-1">关于列表限制</div>
                            <div>
                              根据Wiza API规范，每个列表最多可包含2500个联系人。
                              您的搜索结果有 {formatNumber(searchResults.data.total)} 个潜在客户，
                              建议创建 {Math.ceil(searchResults.data.total / 2500)} 个列表来获取所有结果。
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div className="flex justify-center">
                      <Button 
                        onClick={handleCreateList}
                        className="bg-lavender-500 hover:bg-lavender-600"
                        disabled={!searchResults.data?.total || isCreatingList}
                      >
                        {isCreatingList ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            创建中...
                          </>
                        ) : (
                          <>
                            <Rocket className="h-4 w-4 mr-2" />
                            创建潜在客户列表
                            {searchResults.data?.total > 2500 && (
                              <span className="ml-1 text-xs">
                                (前{formatNumber(2500)}个)
                              </span>
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 搜索条件摘要 */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-lavender-500" />
                      搜索条件
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {filters.company_industry && filters.company_industry.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">行业:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filters.company_industry.map(industry => (
                            <CustomBadge key={industry} variant="outline" className="text-xs">
                              {industryOptions.find(opt => opt.value === industry)?.label || industry}
                            </CustomBadge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filters.last_name && filters.last_name.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">姓氏:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filters.last_name.slice(0, 5).map(name => (
                            <CustomBadge key={name} variant="outline" className="text-xs">
                              {name}
                            </CustomBadge>
                          ))}
                          {filters.last_name.length > 5 && (
                            <CustomBadge variant="outline" className="text-xs">
                              +{filters.last_name.length - 5} 更多
                            </CustomBadge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {filters.location && filters.location.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">地点:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filters.location.map((location, index) => (
                            <CustomBadge key={index} variant="outline" className="text-xs">
                              {location.v}
                            </CustomBadge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {filters.company_size && filters.company_size.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-600">公司规模:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {filters.company_size.map(size => (
                            <CustomBadge key={size} variant="outline" className="text-xs">
                              {companySizeOptions.find(opt => opt.value === size)?.label || size}
                            </CustomBadge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!searchResults && !isSearching && (
            <Card className="border-gray-200">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">还没有搜索结果</h3>
                <p className="text-gray-600 mb-4">设置搜索条件后点击"开始搜索"查看结果</p>
                <Button 
                  onClick={() => setActiveTab('filters')}
                  variant="outline"
                  className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  设置搜索条件
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 搜索历史标签页 */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {searchHistory.length > 0 ? (
            searchHistory.map((history) => (
              <Card key={history.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(history.timestamp).toLocaleString('zh-CN')}
                        </span>
                        <CustomBadge variant="outline" className="text-xs">
                          {formatNumber(history.totalResults)} 个结果
                        </CustomBadge>
                        <CustomBadge variant="outline" className="text-xs">
                          {formatDuration(history.searchTime)}
                        </CustomBadge>
                      </div>
                      
                      <div className="text-sm text-gray-700 space-y-1">
                        {history.filters.company_industry && history.filters.company_industry.length > 0 && (
                          <div>行业: {history.filters.company_industry.join(', ')}</div>
                        )}
                        {history.filters.last_name && history.filters.last_name.length > 0 && (
                          <div>姓氏: {history.filters.last_name.slice(0, 3).join(', ')}
                            {history.filters.last_name.length > 3 && ` +${history.filters.last_name.length - 3}个`}
                          </div>
                        )}
                        {history.filters.location && history.filters.location.length > 0 && (
                          <div>地点: {history.filters.location.map(l => l.v).join(', ')}</div>
                        )}
                        {history.filters.job_title && history.filters.job_title.length > 0 && (
                          <div>职位: {history.filters.job_title.map(t => 
                            typeof t === 'string' ? t : t.v
                          ).slice(0, 3).join(', ')}
                            {history.filters.job_title.length > 3 && ` +${history.filters.job_title.length - 3}个`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUseHistoryFilters(history.filters)}
                      className="border-lavender-300 text-lavender-600 hover:bg-lavender-50"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      重用
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-gray-200">
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无搜索历史</h3>
                <p className="text-gray-600">进行搜索后，历史记录将显示在这里</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default IntegratedSearchPage
