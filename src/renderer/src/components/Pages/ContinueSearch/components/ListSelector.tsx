import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { ListDetails } from "@/types/api";
import { formatDate } from "@/lib/utils";

// 列表状态标签映射
const statusBadgeMap: Record<string, { variant: string; label: string; icon: React.ReactNode }> = {
  completed: {
    variant: "success",
    label: "已完成",
    icon: <CheckCircle className="w-3 h-3 mr-1" />
  },
  in_progress: {
    variant: "info",
    label: "进行中",
    icon: <Clock className="w-3 h-3 mr-1" />
  },
  failed: {
    variant: "destructive",
    label: "失败",
    icon: <AlertTriangle className="w-3 h-3 mr-1" />
  }
};

interface ListSelectorProps {
  availableLists: ListDetails[];
  selectedListId: string | null;
  onSelectList: (listId: string) => void;
  onRefreshLists: () => void;
}

/**
 * 列表选择器组件
 * 用于展示和选择可用的列表
 */
const ListSelector: React.FC<ListSelectorProps> = ({
  availableLists,
  selectedListId,
  onSelectList,
  onRefreshLists
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date");
  
  // 过滤和排序列表
  const filteredLists = availableLists
    .filter(list => 
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.location && list.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (list.industry && list.industry.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  
  // 获取列表状态标签
  const getStatusBadge = (status: string) => {
    const statusInfo = statusBadgeMap[status] || {
      variant: "secondary",
      label: "未知",
      icon: null
    };
    
    return (
      <Badge variant={statusInfo.variant as any}>
        <div className="flex items-center">
          {statusInfo.icon}
          {statusInfo.label}
        </div>
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">搜索列表</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshLists}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          刷新
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索列表..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant={sortBy === "date" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("date")}
          >
            日期
          </Button>
          <Button
            variant={sortBy === "name" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("name")}
          >
            名称
          </Button>
          <Button
            variant={sortBy === "status" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("status")}
          >
            状态
          </Button>
        </div>
      </div>
      
      {filteredLists.length === 0 ? (
        <div className="border rounded-md p-8 text-center text-muted-foreground">
          {searchTerm ? "没有找到匹配的列表" : "暂无可用列表"}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLists.map(list => (
            <div
              key={list.id}
              className={`border rounded-md p-4 cursor-pointer transition-colors ${
                selectedListId === list.id ? "border-primary bg-accent" : "hover:bg-accent/50"
              }`}
              onClick={() => onSelectList(list.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{list.name}</h3>
                {getStatusBadge(list.status)}
              </div>
              
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  创建时间: {formatDate(list.createdAt, "date")}
                </div>
                <div>
                  {list.totalProspects > 0 ? (
                    <span>
                      {list.completedProspects} / {list.totalProspects} 联系人
                    </span>
                  ) : (
                    <span>暂无联系人</span>
                  )}
                </div>
              </div>
              
              {list.status === "in_progress" && list.progress > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${list.progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-right text-muted-foreground">
                    {list.progress.toFixed(0)}%
                  </div>
                </div>
              )}
              
              {(list.location || list.industry || list.lastNames) && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {list.location && (
                    <Badge variant="outline">{list.location}</Badge>
                  )}
                  {list.industry && (
                    <Badge variant="outline">{list.industry}</Badge>
                  )}
                  {list.lastNames && list.lastNames.length > 0 && (
                    <Badge variant="outline">
                      {list.lastNames.length > 3 
                        ? `${list.lastNames.slice(0, 3).join(", ")}...` 
                        : list.lastNames.join(", ")
                      }
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListSelector; 