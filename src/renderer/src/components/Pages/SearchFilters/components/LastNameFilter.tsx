import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { X, Plus, Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// 中国百家姓（按拼音首字母分组）
const CHINESE_LAST_NAMES_BY_INITIAL: Record<string, string[]> = {
  A: ["安", "艾", "敖", "奥"],
  B: ["白", "鲍", "毕", "卞", "蔡", "曹", "陈", "崔"],
  C: ["蔡", "曹", "陈", "崔"],
  D: ["戴", "邓", "丁", "董", "杜", "段"],
  F: ["范", "方", "费", "冯", "符", "傅"],
  G: ["高", "葛", "龚", "古", "顾", "关", "郭"],
  H: ["韩", "何", "贺", "洪", "侯", "胡", "华", "黄"],
  J: ["姜", "蒋", "金", "井", "江", "焦", "靳"],
  K: ["康", "柯", "孔"],
  L: ["赖", "雷", "黎", "李", "梁", "廖", "林", "刘", "龙", "卢", "陆", "路", "罗"],
  M: ["马", "毛", "梅", "孟", "莫"],
  N: ["倪", "聂", "牛", "宁"],
  O: ["欧"],
  P: ["潘", "庞", "裴", "彭"],
  Q: ["戚", "钱", "强", "乔", "秦", "邱", "裘", "曲"],
  R: ["任", "荣"],
  S: ["沙", "商", "邵", "沈", "盛", "施", "石", "宋", "苏", "孙"],
  T: ["谭", "汤", "唐", "陶", "田", "童", "涂"],
  W: ["万", "汪", "王", "魏", "卫", "温", "文", "翁", "吴", "伍", "武"],
  X: ["夏", "向", "肖", "谢", "辛", "邢", "徐", "许", "薛", "荀"],
  Y: ["严", "颜", "杨", "姚", "叶", "易", "殷", "尹", "应", "游", "于", "余", "俞", "袁", "岳"],
  Z: ["曾", "詹", "张", "章", "赵", "郑", "钟", "周", "朱", "祝", "庄", "卓"]
};

// 东南亚常见姓氏
const SEA_LAST_NAMES: Record<string, string[]> = {
  "马来西亚": ["林", "陈", "李", "黄", "张", "王", "刘", "吴", "杨", "蔡", "Tan", "Lim", "Wong", "Lee", "Ng"],
  "新加坡": ["陈", "林", "李", "黄", "张", "王", "吴", "刘", "杨", "郭", "Tan", "Lim", "Lee", "Ng", "Wong"],
  "菲律宾": ["Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Tran", "Nguyen"],
  "印尼": ["黄", "陈", "林", "李", "张", "吴", "王", "刘", "Tan", "Lim", "Wong", "Wijaya", "Gunawan", "Susanto"],
  "泰国": ["陈", "林", "李", "黄", "张", "Somchai", "Srisuk", "Charoenkul", "Saetang", "Jaidee"],
  "越南": ["阮", "陈", "黎", "范", "Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Vo", "Dang"]
};

interface LastNameFilterProps {
  filters: {
    lastNames?: string[];
  };
  setFilters: (filters: any) => void;
}

/**
 * 百家姓过滤器组件
 * 用于选择和管理中国及东南亚地区的姓氏过滤条件
 */
const LastNameFilter: React.FC<LastNameFilterProps> = ({ filters, setFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedInitial, setExpandedInitial] = useState<string | null>(null);
  
  // 获取当前选中的姓氏
  const selectedLastNames = filters.lastNames || [];
  
  // 添加姓氏到过滤器
  const addLastName = (name: string) => {
    if (selectedLastNames.includes(name)) return;
    
    setFilters({
      ...filters,
      lastNames: [...selectedLastNames, name]
    });
  };
  
  // 从过滤器中移除姓氏
  const removeLastName = (name: string) => {
    setFilters({
      ...filters,
      lastNames: selectedLastNames.filter(n => n !== name)
    });
  };
  
  // 切换类别展开状态
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    setExpandedInitial(null);
  };
  
  // 切换首字母展开状态
  const toggleInitial = (initial: string) => {
    setExpandedInitial(expandedInitial === initial ? null : initial);
  };
  
  // 过滤搜索结果
  const filteredLastNames = searchTerm.trim() === "" 
    ? [] 
    : Object.values(CHINESE_LAST_NAMES_BY_INITIAL)
        .flat()
        .concat(Object.values(SEA_LAST_NAMES).flat())
        .filter(name => 
          name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          name.includes(searchTerm)
        )
        .filter((name, index, self) => self.indexOf(name) === index) // 去重
        .slice(0, 20); // 限制结果数量

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>姓氏筛选（百家姓功能）</span>
          <Badge variant="outline">
            已选择: {selectedLastNames.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          包含中国百家姓和东南亚常见姓氏快速选择
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索百家姓..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* 已选择的姓氏 */}
        <div className="flex flex-wrap gap-2">
          {selectedLastNames.length === 0 ? (
            <div className="text-sm text-muted-foreground">未选择姓氏</div>
          ) : (
            selectedLastNames.map(lastName => (
              <Badge key={lastName} variant="secondary" className="flex items-center gap-1">
                {lastName}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeLastName(lastName)}
                />
              </Badge>
            ))
          )}
        </div>
        
        {/* 搜索结果 */}
        {searchTerm.trim() !== "" && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 text-sm font-medium">
              搜索结果
            </div>
            <div className="p-2 flex flex-wrap gap-2">
              {filteredLastNames.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">无匹配结果</div>
              ) : (
                filteredLastNames.map(lastName => (
                  <Button
                    key={lastName}
                    variant={selectedLastNames.includes(lastName) ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectedLastNames.includes(lastName) 
                      ? removeLastName(lastName) 
                      : addLastName(lastName)
                    }
                    className="h-7 px-2"
                  >
                    {lastName}
                  </Button>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* 中国百家姓（按拼音首字母分组） */}
        <div className="border rounded-md overflow-hidden">
          <div 
            className="bg-muted p-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleCategory("中国百家姓")}
          >
            <span className="font-medium">中国百家姓（按拼音首字母分组）</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandedCategory === "中国百家姓" && "transform rotate-180"
            )} />
          </div>
          
          {expandedCategory === "中国百家姓" && (
            <div className="p-2">
              <div className="grid grid-cols-8 gap-1 mb-2">
                {Object.keys(CHINESE_LAST_NAMES_BY_INITIAL).map(initial => (
                  <Button
                    key={initial}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleInitial(initial)}
                    className={cn(
                      "h-7 px-2",
                      expandedInitial === initial && "bg-accent text-accent-foreground"
                    )}
                  >
                    {initial}
                  </Button>
                ))}
              </div>
              
              {expandedInitial && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md">
                  {CHINESE_LAST_NAMES_BY_INITIAL[expandedInitial].map(lastName => (
                    <Button
                      key={lastName}
                      variant={selectedLastNames.includes(lastName) ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectedLastNames.includes(lastName) 
                        ? removeLastName(lastName) 
                        : addLastName(lastName)
                      }
                      className="h-7 px-2"
                    >
                      {lastName}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 东南亚常见姓氏 */}
        <div className="border rounded-md overflow-hidden">
          <div 
            className="bg-muted p-2 flex items-center justify-between cursor-pointer"
            onClick={() => toggleCategory("东南亚姓氏")}
          >
            <span className="font-medium">东南亚姓氏</span>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              expandedCategory === "东南亚姓氏" && "transform rotate-180"
            )} />
          </div>
          
          {expandedCategory === "东南亚姓氏" && (
            <div className="p-2">
              <div className="grid grid-cols-2 gap-1 mb-2">
                {Object.keys(SEA_LAST_NAMES).map(country => (
                  <Button
                    key={country}
                    variant="outline"
                    size="sm"
                    onClick={() => toggleInitial(country)}
                    className={cn(
                      "h-7",
                      expandedInitial === country && "bg-accent text-accent-foreground"
                    )}
                  >
                    {country}
                  </Button>
                ))}
              </div>
              
              {expandedInitial && SEA_LAST_NAMES[expandedInitial] && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md">
                  {SEA_LAST_NAMES[expandedInitial].map((lastName, index) => (
                    <Button
                      key={`${lastName}-${index}`}
                      variant={selectedLastNames.includes(lastName) ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectedLastNames.includes(lastName) 
                        ? removeLastName(lastName) 
                        : addLastName(lastName)
                      }
                      className="h-7 px-2"
                    >
                      {lastName}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// 默认导出，但确保导出的是LastNameFilter组件
export default LastNameFilter;
