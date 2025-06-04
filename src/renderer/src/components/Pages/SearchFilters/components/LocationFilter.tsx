import React, { useState, useEffect } from 'react'
import { SearchFilters } from '../../../../types/api'
import { Button } from '../../../ui/button'
import { Input } from '../../../ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select'
import { Plus, X, MapPin, Globe, Loader2 } from 'lucide-react'
import { useAppStore } from '../../../../stores/appStore'

interface LocationFilterProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

// 常用地区数据
const POPULAR_REGIONS = {
  '东南亚': [
    { name: '新加坡', type: 'country', value: 'Singapore' },
    { name: '马来西亚', type: 'country', value: 'Malaysia' },
    { name: '印度尼西亚', type: 'country', value: 'Indonesia' },
    { name: '菲律宾', type: 'country', value: 'Philippines' },
    { name: '泰国', type: 'country', value: 'Thailand' },
    { name: '越南', type: 'country', value: 'Vietnam' }
  ],
  '东亚': [
    { name: '中国', type: 'country', value: 'China' },
    { name: '中国香港', type: 'country', value: 'Hong Kong' },
    { name: '中国台湾', type: 'country', value: 'Taiwan' },
    { name: '日本', type: 'country', value: 'Japan' },
    { name: '韩国', type: 'country', value: 'South Korea' }
  ],
  '北美': [
    { name: '美国', type: 'country', value: 'United States' },
    { name: '加拿大', type: 'country', value: 'Canada' }
  ],
  '欧洲': [
    { name: '英国', type: 'country', value: 'United Kingdom' },
    { name: '德国', type: 'country', value: 'Germany' },
    { name: '法国', type: 'country', value: 'France' }
  ]
}

// 主要城市数据
const MAJOR_CITIES = {
  '新加坡': [
    { name: '新加坡市', type: 'city', value: 'Singapore, , Singapore' }
  ],
  '马来西亚': [
    { name: '吉隆坡', type: 'city', value: 'Kuala Lumpur, Kuala Lumpur, Malaysia' },
    { name: '新山', type: 'city', value: 'Johor Bahru, Johor, Malaysia' },
    { name: '槟城', type: 'city', value: 'George Town, Penang, Malaysia' }
  ],
  '中国': [
    { name: '北京', type: 'city', value: 'Beijing, Beijing, China' },
    { name: '上海', type: 'city', value: 'Shanghai, Shanghai, China' },
    { name: '广州', type: 'city', value: 'Guangzhou, Guangdong, China' },
    { name: '深圳', type: 'city', value: 'Shenzhen, Guangdong, China' }
  ],
  '美国': [
    { name: '纽约', type: 'city', value: 'New York, New York, United States' },
    { name: '旧金山', type: 'city', value: 'San Francisco, California, United States' },
    { name: '洛杉矶', type: 'city', value: 'Los Angeles, California, United States' }
  ]
}

export const LocationFilter: React.FC<LocationFilterProps> = ({
  filters,
  setFilters
}) => {
  const { setError } = useAppStore()
  const [newLocation, setNewLocation] = useState('')
  const [locationType, setLocationType] = useState<'city' | 'state' | 'country'>('country')
  const [locationIncludeExclude, setLocationIncludeExclude] = useState<'i' | 'e'>('i')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [userCountry, setUserCountry] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{city?: string, state?: string, country: string} | null>(null)
  const [locationOptions, setLocationOptions] = useState<Array<{name: string, value: string}>>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // 移除IP定位功能，仅保留浏览器定位
  // 不再自动获取位置，等待用户点击按钮

  // 获取精确位置
  const getPreciseLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理位置功能')
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)
    
    try {
      // 直接请求位置权限
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let errorMsg = '获取位置失败: '
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg += '用户拒绝了地理位置请求。请检查浏览器权限设置。'
                break
              case error.POSITION_UNAVAILABLE:
                errorMsg += '无法获取位置信息。请确保设备已启用定位服务。'
                break
              case error.TIMEOUT:
                errorMsg += '请求超时。请检查网络连接或重试。'
                break
              default:
                errorMsg += '未知错误'
            }
            reject(new Error(errorMsg))
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,  // 延长超时时间
            maximumAge: 0
          }
        )
      })
      
      const { latitude, longitude } = position.coords
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
      
      if (!response.ok) {
        throw new Error('位置解析服务不可用')
      }
      
      const data = await response.json()
      if (data.error) {
        throw new Error(data.error.message || '无法解析位置')
      }
      
      if (data.address) {
        const { city, town, village, state, country } = data.address
        const actualCity = city || town || village || '未知城市'
        const actualState = state || '未知州/省'
        const actualCountry = country || '未知国家'
        
        // 创建位置选项
        const options = []
        let cityLevelValue = ''
        
        if (actualCity && actualState && actualCountry) {
          cityLevelValue = `${actualCity}, ${actualState}, ${actualCountry}`
          options.push({
            name: cityLevelValue,
            value: cityLevelValue
          })
        }
        
        if (actualState && actualCountry) {
          const stateLevelValue = `${actualState}, ${actualCountry}`
          options.push({
            name: stateLevelValue,
            value: stateLevelValue
          })
        }
        
        if (actualCountry) {
          options.push({
            name: actualCountry,
            value: actualCountry
          })
        }
        
        if (options.length > 0) {
          setLocationOptions(options)
          setLocationType('city')
          setNewLocation(options[0].value) // 默认选择最精确的选项
        } else {
          throw new Error('无法解析位置信息')
        }
      } else {
        throw new Error('无法解析位置信息')
      }
    } catch (error) {
      console.error('获取精确位置失败:', error)
      setLocationError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const handleAddLocation = () => {
    if (!newLocation.trim()) {
      setError('请输入地点名称')
      return
    }

    const locationValue = newLocation.trim()
    let isValidFormat = false
    let formatHint = ''

    // 根据API规范验证格式
    switch (locationType) {
      case 'city':
        const cityParts = locationValue.split(',').map(p => p.trim())
        isValidFormat = cityParts.length === 3 && cityParts.every(p => p.length > 0)
        formatHint = '城市格式应为：城市, 州/省, 国家\n例如：Toronto, Ontario, Canada'
        break
      case 'state':
        const stateParts = locationValue.split(',').map(p => p.trim())
        isValidFormat = stateParts.length === 2 && stateParts.every(p => p.length > 0)
        formatHint = '州/省格式应为：州/省, 国家\n例如：Ontario, Canada'
        break
      case 'country':
        isValidFormat = !locationValue.includes(',') && locationValue.length > 0
        formatHint = '国家格式应为：国家名称\n例如：Canada'
        break
    }

    if (!isValidFormat) {
      setError(`地理位置格式错误。${formatHint}`)
      return
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
    setError(null)
  }

  const handleAddPredefinedLocation = (locationData: { name: string, type: string, value: string }) => {
    const location = {
      v: locationData.value,
      b: locationData.type as 'city' | 'state' | 'country',
      s: locationIncludeExclude
    }
    
    // 检查是否已存在相同的位置
    const isDuplicate = filters.location?.some(
      loc => loc.v === location.v && loc.b === location.b && loc.s === location.s
    )
    
    if (!isDuplicate) {
      setFilters({
        ...filters,
        location: [...(filters.location || []), location]
      })
    }
  }

  const handleRemoveLocation = (index: number) => {
    setFilters({
      ...filters,
      location: filters.location?.filter((_, i) => i !== index) || []
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLocation()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          地理位置筛选
        </CardTitle>
        <CardDescription>
          按地理位置筛选潜在客户
          {isDetectingLocation && <span className="ml-1 text-xs">(正在检测您的位置...)</span>}
          {userCountry && <span className="ml-1 text-xs">(检测到您在{userCountry})</span>}
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
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              variant="default" 
              onClick={getPreciseLocation}
              disabled={isLoadingLocation}
              size="sm"
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoadingLocation ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  <span>定位</span>
                </>
              )}
            </Button>
            <Button onClick={handleAddLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        
        {/* 位置错误提示 */}
        {locationError && (
          <div className="text-red-500 text-sm text-center">{locationError}</div>
        )}
        
        {/* 位置选项 */}
        {locationOptions.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">检测到的位置</div>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((option, index) => (
                <Button 
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
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

        {/* 快捷区域选择 */}
        <div>
          <div className="text-sm font-medium mb-2">常用地区</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(POPULAR_REGIONS).map(([region, countries]) => (
              <div key={region} className="space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">{region}</div>
                <div className="flex flex-wrap gap-1">
                  {countries.map(country => (
                    <Button 
                      key={country.value} 
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleAddPredefinedLocation(country)}
                    >
                      {country.name}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 常用城市快捷选择 */}
        {locationType === 'city' && (
          <div>
            <div className="text-sm font-medium mb-2">主要城市</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(MAJOR_CITIES).map(([country, cities]) => (
                <div key={country} className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">{country}</div>
                  <div className="flex flex-wrap gap-1">
                    {cities.map(city => (
                      <Button 
                        key={city.value} 
                        variant="outline" 
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleAddPredefinedLocation(city)}
                      >
                        {city.name}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {filters.location && filters.location.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">已选择的地点</div>
            <div className="flex flex-wrap gap-2">
              {filters.location.map((location, index) => (
                <div 
                  key={`location-${index}`}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground"
                >
                  {location.s === 'e' && '排除: '}{location.v} ({location.b === 'city' ? '城市' : location.b === 'state' ? '州/省' : '国家'})
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => handleRemoveLocation(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
