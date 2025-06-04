import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, MapPin, Globe, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 区域分类
const REGIONS = {
  "亚洲": [
    "中国", "日本", "韩国", "新加坡", "马来西亚", "泰国", 
    "印度尼西亚", "菲律宾", "越南", "印度", "巴基斯坦"
  ],
  "北美洲": [
    "美国", "加拿大", "墨西哥"
  ],
  "欧洲": [
    "英国", "德国", "法国", "意大利", "西班牙", "荷兰", 
    "比利时", "瑞典", "瑞士", "俄罗斯", "波兰"
  ],
  "大洋洲": [
    "澳大利亚", "新西兰"
  ],
  "南美洲": [
    "巴西", "阿根廷", "智利", "哥伦比亚", "秘鲁"
  ],
  "非洲": [
    "南非", "埃及", "尼日利亚", "肯尼亚", "摩洛哥"
  ]
};

// 主要城市
const MAJOR_CITIES = {
  "中国": ["北京", "上海", "广州", "深圳", "杭州", "成都", "重庆", "南京", "武汉", "西安"],
  "美国": ["纽约", "洛杉矶", "芝加哥", "休斯顿", "旧金山", "波士顿", "西雅图", "迈阿密"],
  "日本": ["东京", "大阪", "京都", "名古屋", "福冈", "札幌"],
  "英国": ["伦敦", "曼彻斯特", "利物浦", "伯明翰", "爱丁堡", "格拉斯哥"],
  "新加坡": ["新加坡"],
  "马来西亚": ["吉隆坡", "槟城", "新山", "马六甲", "亚庇"],
  "澳大利亚": ["悉尼", "墨尔本", "布里斯班", "珀斯", "阿德莱德"]
};

interface LocationFilterProps {
  filters: {
    locations?: string[];
  };
  setFilters: (filters: any) => void;
}

/**
 * 地理位置筛选组件
 * 用于选择和管理地理位置过滤条件
 */
const LocationFilter: React.FC<LocationFilterProps> = ({ filters, setFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [showCities, setShowCities] = useState(false);
  
  // 获取当前选中的地理位置
  const selectedLocations = filters.locations || [];
  
  // 添加地理位置到过滤器
  const addLocation = (location: string) => {
    if (selectedLocations.includes(location)) return;
    
    setFilters({
      ...filters,
      locations: [...selectedLocations, location]
    });
  };
  
  // 从过滤器中移除地理位置
  const removeLocation = (location: string) => {
    setFilters({
      ...filters,
      locations: selectedLocations.filter(loc => loc !== location)
    });
  };
  
  // 切换区域展开状态
  const toggleRegion = (region: string) => {
    setExpandedRegion(expandedRegion === region ? null : region);
    setExpandedCountry(null);
  };
  
  // 切换国家展开状态
  const toggleCountry = (country: string) => {
    setExpandedCountry(expandedCountry === country ? null : country);
  };
  
  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    const results: string[] = [];
    
    // 搜索区域
    Object.keys(REGIONS).forEach(region => {
      if (region.toLowerCase().includes(term)) {
        results.push(region);
      }
      
      // 搜索国家
      REGIONS[region].forEach(country => {
        if (country.toLowerCase().includes(term)) {
          results.push(country);
        }
        
        // 搜索城市
        if (MAJOR_CITIES[country]) {
          MAJOR_CITIES[country].forEach(city => {
            if (city.toLowerCase().includes(term)) {
              results.push(`${country}-${city}`);
            }
          });
        }
      });
    });
    
    // 去重并限制结果数量
    return Array.from(new Set(results)).slice(0, 20);
  }, [searchTerm]);
  
  // 格式化地理位置显示
  const formatLocation = (location: string) => {
    if (location.includes('-')) {
      const [country, city] = location.split('-');
      return `${city}（${country}）`;
    }
    return location;
  };
  
  // 检查是否为区域
  const isRegion = (location: string) => {
    return Object.keys(REGIONS).includes(location);
  };
  
  // 检查是否为国家
  const isCountry = (location: string) => {
    return Object.values(REGIONS).flat().includes(location);
  };
  
  // 检查是否为城市
  const isCity = (location: string) => {
    return location.includes('-');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            地理位置筛选
          </span>
          <Badge variant="outline">
            已选择: {selectedLocations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索地区、国家或城市..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 已选择的地理位置 */}
        <div className="flex flex-wrap gap-2">
          {selectedLocations.length === 0 ? (
            <div className="text-sm text-muted-foreground">未选择地理位置</div>
          ) : (
            selectedLocations.map(location => (
              <Badge key={location} variant="secondary" className="flex items-center gap-1">
                {formatLocation(location)}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeLocation(location)}
                />
              </Badge>
            ))
          )}
        </div>
        
        {/* 搜索结果 */}
        {searchTerm.trim() !== "" && searchResults.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 text-sm font-medium">
              搜索结果
            </div>
            <div className="p-2 flex flex-wrap gap-2">
              {searchResults.map(location => (
                <Button
                  key={location}
                  variant={selectedLocations.includes(location) ? "default" : "outline"}
                  size="sm"
                  onClick={() => selectedLocations.includes(location) 
                    ? removeLocation(location) 
                    : addLocation(location)
                  }
                  className="h-7 px-2"
                >
                  {formatLocation(location)}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* 显示城市选项 */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-cities" 
            checked={showCities}
            onCheckedChange={(checked) => setShowCities(!!checked)}
          />
          <label 
            htmlFor="show-cities" 
            className="text-sm font-medium leading-none cursor-pointer"
          >
            显示主要城市
          </label>
        </div>
        
        {/* 区域和国家列表 */}
        <div className="space-y-2">
          {Object.entries(REGIONS).map(([region, countries]) => (
            <div key={region} className="border rounded-md overflow-hidden">
              <div 
                className="bg-muted p-2 flex items-center justify-between cursor-pointer"
                onClick={() => toggleRegion(region)}
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 py-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectedLocations.includes(region) 
                        ? removeLocation(region) 
                        : addLocation(region);
                    }}
                  >
                    {selectedLocations.includes(region) ? "取消" : "选择"}
                  </Button>
                  <span className="font-medium">{region}</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  expandedRegion === region && "transform rotate-180"
                )} />
              </div>
              
              {expandedRegion === region && (
                <div className="p-2 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {countries.map(country => (
                      <div key={country} className="relative">
                        <Button
                          variant={selectedLocations.includes(country) ? "default" : "outline"}
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => selectedLocations.includes(country) 
                            ? removeLocation(country) 
                            : addLocation(country)
                          }
                        >
                          {country}
                          {MAJOR_CITIES[country] && showCities && (
                            <ChevronDown 
                              className={cn(
                                "ml-1 h-3 w-3 transition-transform",
                                expandedCountry === country && "transform rotate-180"
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCountry(country);
                              }}
                            />
                          )}
                        </Button>
                        
                        {expandedCountry === country && MAJOR_CITIES[country] && showCities && (
                          <div className="absolute z-10 mt-1 w-auto min-w-[150px] bg-background border rounded-md shadow-md p-2">
                            <div className="flex flex-col gap-1">
                              {MAJOR_CITIES[country].map(city => (
                                <Button
                                  key={`${country}-${city}`}
                                  variant={selectedLocations.includes(`${country}-${city}`) ? "default" : "outline"}
                                  size="sm"
                                  className="h-7 px-2 justify-start"
                                  onClick={() => selectedLocations.includes(`${country}-${city}`) 
                                    ? removeLocation(`${country}-${city}`) 
                                    : addLocation(`${country}-${city}`)
                                  }
                                >
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {city}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationFilter; 