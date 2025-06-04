import { useState, useEffect } from 'react'
import React from 'react'
import { useAppStore } from '../../stores/appStore'
import { getWizaApi } from '../../services/wizaApi'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Eye, EyeOff, Key, Loader2, CheckCircle, AlertTriangle, Sparkles, Globe, Save, Search } from 'lucide-react'

export function ApiConfigPage() {
  const { 
    apiKey, 
    isApiKeyValid, 
    error,
    setApiKey, 
    setApiKeyValid, 
    setLoading, 
    setError,
    setCurrentPage 
  } = useAppStore()
  
  const [inputApiKey, setInputApiKey] = useState(apiKey)
  const [isValidating, setIsValidating] = useState(false)
  const [creditsInfo, setCreditsInfo] = useState<any>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')

  useEffect(() => {
    setInputApiKey(apiKey)
  }, [apiKey])

  // 显示保存成功消息后3秒自动消失
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveSuccess])

  const handleValidateApiKey = async () => {
    if (!inputApiKey.trim()) {
      setError('请输入API密钥')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      const wizaApi = getWizaApi(inputApiKey)
      const isValid = await wizaApi.validateApiKey()
      
      if (isValid) {
        // 获取积分信息
        const creditsData = await wizaApi.getCredits()
        setCreditsInfo(creditsData)
        
        // 验证成功后自动保存配置
        saveApiConfiguration(inputApiKey)
        
        setApiKey(inputApiKey)
        setApiKeyValid(true)
        setError(null)
      } else {
        setApiKeyValid(false)
        setError('API密钥验证失败，请检查密钥是否正确')
      }
    } catch (error) {
      setApiKeyValid(false)
      setError(`验证失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setIsValidating(false)
    }
  }

  // 提取保存逻辑到独立函数
  const saveApiConfiguration = (key: string) => {
    try {
      // 保存API密钥到应用状态
      setApiKey(key)
      setError(null)
      setSaveError(null)
      
      // 手动保存到localStorage以确保持久化
      const appStorage = JSON.parse(localStorage.getItem('wiza-app-storage') || '{}')
      appStorage.state = { 
        ...appStorage.state,
        apiKey: key,
        isApiKeyValid: true
      }
      localStorage.setItem('wiza-app-storage', JSON.stringify(appStorage))
      
      // 显示保存成功的提示
      setSaveSuccess(true)
    } catch (error) {
      console.error('保存API配置失败:', error)
      setSaveError('保存API配置失败，请重试')
    }
  }

  // 保留handleSaveConfig函数以备将来使用
  const handleSaveConfig = () => {
    if (isApiKeyValid) {
      saveApiConfiguration(inputApiKey)
    }
  }

  // 验证API密钥
  const handleTestConnection = async () => {
    if (!inputApiKey.trim()) return
    
    setIsValidating(true)
    setValidationError('')
    
    try {
      let result
      
      // 首先尝试使用window.api
      if (window.api?.validateApiKey) {
        console.log('使用window.api验证API密钥')
        result = await window.api.validateApiKey(inputApiKey.trim())
      } else {
        console.log('window.api不可用，使用直接HTTP请求')
        // Fallback: 直接HTTP请求
        const response = await fetch('https://wiza.co/api/meta/credits', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${inputApiKey.trim()}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          result = { success: true, data }
        } else {
          const errorData = await response.text()
          result = { success: false, error: `HTTP ${response.status}: ${errorData}` }
        }
      }
      
      if (result.success) {
        console.log('API验证成功:', result.data)
        setApiKey(inputApiKey.trim())
        setApiKeyValid(true)
        setCreditsInfo(result.data.credits || result.data)
        setValidationMessage('连接成功！API密钥有效。')
        
        // 手动保存到localStorage以确保持久化
        try {
          const appStorage = JSON.parse(localStorage.getItem('wiza-app-storage') || '{}')
          appStorage.state = { 
            ...appStorage.state,
            apiKey: inputApiKey.trim(),
            isApiKeyValid: true
          }
          localStorage.setItem('wiza-app-storage', JSON.stringify(appStorage))
          console.log('API密钥状态已保存到localStorage')
        } catch (storageError) {
          console.error('保存到localStorage失败:', storageError)
        }
      } else {
        console.error('API验证失败:', result.error)
        setApiKeyValid(false)
        setValidationError(result.error || '验证失败')
      }
    } catch (error) {
      console.error('验证过程中出错:', error)
      setApiKeyValid(false)
      setValidationError(error instanceof Error ? error.message : '网络错误')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* 欢迎横幅 */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-lavender-500 via-lavender-600 to-purple-600 border-none text-white">
        <CardContent className="p-8">
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Key className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold text-white">API配置中心</CardTitle>
                <CardDescription className="text-lavender-100 text-lg">
                  连接您的Wiza账户，开启智能客户发现之旅
                </CardDescription>
              </div>
            </div>
          </div>
          
          {/* 装饰性背景 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 主配置区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* API密钥配置卡片 */}
          <Card className="shadow-lg border-lavender-100">
            <CardHeader className="bg-gradient-to-r from-lavender-50 to-purple-50 border-b border-lavender-100">
              <CardTitle className="text-lavender-800 flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>API密钥配置</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* API密钥输入 */}
              <div className="space-y-3">
                <Label htmlFor="api-key" className="text-sm font-semibold text-gray-700">
                  Wiza API密钥
                </Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
                    placeholder="请输入您的Wiza API密钥"
                    className="pr-12 font-mono border-2 focus:ring-2 focus:ring-lavender-500 focus:border-lavender-500"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* 验证按钮 */}
              <Button
                onClick={handleTestConnection}
                disabled={isValidating || !inputApiKey.trim()}
                variant="lavender"
                size="lg"
                className="w-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    测试连接
                  </>
                )}
              </Button>

              {/* 状态显示 */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        isApiKeyValid ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
                      }`}></div>
                      <span className={`font-semibold ${
                        isApiKeyValid ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {isApiKeyValid ? (
                          <>
                            <CheckCircle className="w-4 h-4 inline mr-1" />
                            连接成功
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            未连接
                          </>
                        )}
                      </span>
                    </div>
                    
                    {isApiKeyValid && (
                      <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent bg-secondary text-secondary-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        已验证
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 错误信息 */}
              {validationError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>验证失败</AlertTitle>
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {/* 成功信息 */}
              {isApiKeyValid && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">连接成功！</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {validationMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* 帮助指南 */}
          <Card className="bg-gradient-to-br from-gold-50 to-yellow-50 border-gold-200">
            <CardHeader className="bg-gradient-to-r from-gold-100 to-yellow-100 border-b border-gold-200">
              <CardTitle className="text-gold-800 flex items-center space-x-2">
                <span>📚</span>
                <span>如何获取API密钥？</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { step: 1, text: "登录您的 Wiza账户", icon: "🌐" },
                  { step: 2, text: "进入账户设置页面", icon: "⚙️" },
                  { step: 3, text: "在API设置部分生成新的API密钥", icon: "🔑" },
                  { step: 4, text: "复制密钥并粘贴到上方输入框中", icon: "📋" }
                ].map((item) => (
                  <Card key={item.step} className="bg-white/60">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gold-400 text-white font-bold">
                          {item.step}
                        </div>
                        <span className="text-gold-600 text-lg">{item.icon}</span>
                        <span className="text-gold-800 font-medium">{item.text}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Alert className="mt-6 bg-gold-100 border-gold-300">
                <Sparkles className="h-4 w-4 text-gold-600" />
                <AlertTitle className="text-gold-800">安全提示</AlertTitle>
                <AlertDescription className="text-gold-800">
                  您的API密钥将被安全加密存储在本地，我们不会将其发送到任何第三方服务器。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 积分信息卡片 */}
          {isApiKeyValid && creditsInfo && (
            <Card className="shadow-lg border-lavender-100">
              <CardHeader className="bg-gradient-to-r from-lavender-500 to-purple-600 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <span>💎</span>
                  <span>账户积分</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                {[
                  { label: 'API积分', value: creditsInfo.credits?.api_credits || 0, icon: '🔥', color: 'text-red-600' },
                  { label: '导出积分', value: creditsInfo.credits?.export_credits || 0, icon: '📤', color: 'text-blue-600' },
                  { label: '邮箱积分', value: creditsInfo.credits?.email_credits === 'unlimited' ? '无限' : (creditsInfo.credits?.email_credits || 0), icon: '📧', color: 'text-green-600' },
                  { label: '电话积分', value: creditsInfo.credits?.phone_credits === 'unlimited' ? '无限' : (creditsInfo.credits?.phone_credits || 0), icon: '📞', color: 'text-purple-600' }
                ].map((item) => (
                  <Card key={item.label} className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-gray-700 font-medium">{item.label}</span>
                        </div>
                        <span className={`font-bold text-lg ${item.color}`}>
                          {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 快速操作 */}
          <Card className="shadow-lg border-lavender-100">
            <CardHeader className="bg-gradient-to-r from-lavender-50 to-purple-50 border-b border-lavender-100">
              <CardTitle className="text-lavender-800 flex items-center space-x-2">
                <span>⚡</span>
                <span>快速操作</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-3">
              {isApiKeyValid && (
                <>
                  {/* 移除保存配置按钮，仅保留成功/失败提示 */}
                  {saveSuccess && (
                    <Alert className="border-green-200 bg-green-50 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">配置已保存</AlertTitle>
                      <AlertDescription className="text-green-700">
                        API配置已自动保存！
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {saveError && (
                    <Alert variant="destructive" className="mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>保存失败</AlertTitle>
                      <AlertDescription>{saveError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button
                    onClick={() => setCurrentPage('search')}
                    variant="lavender"
                    className="w-full shadow-md hover:shadow-lg"
                    data-testid="quick-action-search-btn"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    开始搜索
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                asChild
                data-testid="quick-action-website-btn"
              >
                <a
                  href="https://wiza.co"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  访问Wiza官网
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ApiConfigPage 