import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  CheckCircle
} from "lucide-react";
import { ExportSettings } from "@/types/api";

// 按钮变体类型
type ButtonVariant = "default" | "secondary" | "destructive" | "outline";

// 导出组件属性
interface ExportComponentProps {
  children: React.ReactNode;
  className?: string;
}

// 导出组件
const ExportComponent: React.FC<ExportComponentProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
};

// 导出按钮
interface ExportButtonProps {
  variant?: ButtonVariant;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  variant = "default",
  onClick,
  disabled = false,
  icon,
  children
}) => {
  return (
    <Button 
      variant={variant} 
      onClick={onClick} 
      disabled={disabled}
      className="w-full flex items-center justify-center gap-2"
    >
      {icon}
      {children}
    </Button>
  );
};

// 导出设置组件
interface ExportSettingsComponentProps {
  exportSettings: ExportSettings;
  setExportSettings: React.Dispatch<React.SetStateAction<ExportSettings>>;
  availableFields: Array<{id: string; label: string; category: string}>;
  toggleField: (fieldId: string) => void;
  onFetchContacts: () => void;
}

const ExportSettingsComponent: React.FC<ExportSettingsComponentProps> = ({
  exportSettings,
  setExportSettings,
  availableFields,
  toggleField,
  onFetchContacts
}) => {
  const fieldCategories = Array.from(
    new Set(availableFields.map(field => field.category))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          导出设置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>文件格式</Label>
          <Tabs 
            defaultValue={exportSettings.format} 
            onValueChange={(value) => setExportSettings(prev => ({
              ...prev, 
              format: value as 'excel' | 'csv'
            }))}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="excel" className="flex items-center gap-1">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                CSV
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label>文件名</Label>
          <Input 
            value={exportSettings.fileName} 
            onChange={(e) => setExportSettings(prev => ({
              ...prev, 
              fileName: e.target.value
            }))} 
            placeholder="导出文件名"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>选择字段</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExportSettings(prev => ({
                ...prev,
                selectedFields: availableFields.map(f => f.id)
              }))}
            >
              全选
            </Button>
          </div>
          
          <div className="border rounded-md p-4 space-y-4">
            {fieldCategories.map(category => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm">{category}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {availableFields
                    .filter(field => field.category === category)
                    .map(field => (
                      <div key={field.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={field.id}
                          checked={exportSettings.selectedFields.includes(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                        <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="includeHeaders" 
            checked={exportSettings.includeHeaders}
            onCheckedChange={(checked) => setExportSettings(prev => ({
              ...prev, 
              includeHeaders: !!checked
            }))}
          />
          <Label htmlFor="includeHeaders">包含表头</Label>
        </div>

        <Button 
          onClick={onFetchContacts}
          className="w-full"
        >
          获取联系人数据
        </Button>
      </CardContent>
    </Card>
  );
};

// 联系人列表组件
interface ContactsListComponentProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filteredContacts: Array<{id: string; fullName: string; email?: string; company?: string; selected: boolean}>;
  selectedContacts: string[];
  toggleAllContacts: (checked: boolean) => void;
  toggleContact: (id: string) => void;
}

const ContactsListComponent: React.FC<ContactsListComponentProps> = ({
  searchTerm,
  setSearchTerm,
  filteredContacts,
  selectedContacts,
  toggleAllContacts,
  toggleContact
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            联系人列表
            <Badge variant="secondary">
              {filteredContacts.length}
            </Badge>
          </span>
          <Badge variant="outline">
            已选择: {selectedContacts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索联系人..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="border rounded-md overflow-hidden">
          <div className="bg-muted p-2 flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="select-all" 
                checked={
                  filteredContacts.length > 0 && 
                  selectedContacts.length === filteredContacts.length
                }
                onCheckedChange={toggleAllContacts}
              />
              <Label htmlFor="select-all" className="text-sm font-medium">全选</Label>
            </div>
          </div>
          
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                没有找到匹配的联系人
              </div>
            ) : (
              filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="p-3 hover:bg-muted flex items-center space-x-3"
                >
                  <Checkbox 
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => toggleContact(contact.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{contact.fullName}</div>
                    {contact.email && (
                      <div className="text-sm text-muted-foreground truncate">
                        {contact.email}
                      </div>
                    )}
                  </div>
                  {contact.company && (
                    <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                      {contact.company}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 导出确认组件
interface ExportConfirmComponentProps {
  exportSettings: ExportSettings;
  selectedContacts: string[];
  filteredContacts: Array<{id: string; fullName: string; email?: string; company?: string; selected: boolean}>;
  onExport: () => void;
}

const ExportConfirmComponent: React.FC<ExportConfirmComponentProps> = ({
  exportSettings,
  selectedContacts,
  filteredContacts,
  onExport
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          导出确认
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">文件格式:</span>
            <Badge variant="outline" className="font-mono">
              {exportSettings.format === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">文件名:</span>
            <Badge variant="outline" className="font-mono">
              {exportSettings.fileName || '未命名'}
              {exportSettings.format === 'excel' ? '.xlsx' : '.csv'}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">已选字段:</span>
            <Badge variant="outline">
              {exportSettings.selectedFields.length}个字段
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">联系人数量:</span>
            <Badge variant="outline">
              {selectedContacts.length} / {filteredContacts.length}
            </Badge>
          </div>
        </div>
        
        <Button 
          onClick={onExport}
          disabled={selectedContacts.length === 0 || exportSettings.selectedFields.length === 0}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button>
        
        {(selectedContacts.length === 0 || exportSettings.selectedFields.length === 0) && (
          <div className="text-sm text-destructive text-center">
            {selectedContacts.length === 0 ? '请选择至少一个联系人' : '请选择至少一个导出字段'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export {
  ExportComponent,
  ExportButton,
  ExportSettingsComponent as ExportSettings,
  ContactsListComponent as ContactsPreview,
  ExportConfirmComponent as ExportControls
}; 