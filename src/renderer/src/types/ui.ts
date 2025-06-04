import * as React from "react"
import { type VariantProps } from "class-variance-authority"

// 基础组件Props类型
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Button组件相关类型
export interface ButtonVariants {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "lavender" | "lavender-outline" | "gold" | "gold-outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export interface ButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  ButtonVariants {
  asChild?: boolean
}

// Badge组件相关类型
export interface BadgeVariants {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export interface BadgeProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  BadgeVariants {}

// Input组件相关类型
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

// Label组件相关类型
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

// Card组件相关类型
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// Select组件相关类型
export interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children: React.ReactNode
}

export interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

// Checkbox组件相关类型
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

// Progress组件相关类型
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

// Dialog组件相关类型
export interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

// Tabs组件相关类型
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

// Alert组件相关类型
export interface AlertVariants {
  variant?: "default" | "destructive"
}

export interface AlertProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  AlertVariants {}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// Switch组件相关类型
export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

// Slider组件相关类型
export interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number[]
  onValueChange?: (value: number[]) => void
  defaultValue?: number[]
  max?: number
  min?: number
  step?: number
  disabled?: boolean
}

// Textarea组件相关类型
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Separator组件相关类型
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

// Toast组件相关类型
export interface ToastVariants {
  variant?: "default" | "destructive" | "success" | "warning" | "info"
}

export interface ToastProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  ToastVariants {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface ToastTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export interface ToastDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

// DropdownMenu组件相关类型
export interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}
export interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number
}
export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
  disabled?: boolean
}
export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}
export interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

// 通用事件处理器类型
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void
export type ChangeHandler<T = string> = (value: T) => void
export type FormSubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void

// 通用状态类型
export type LoadingState = "idle" | "loading" | "success" | "error"
export type ValidationState = "valid" | "invalid" | "pending"

// 组件尺寸类型
export type ComponentSize = "sm" | "md" | "lg" | "xl"
export type ComponentVariant = "primary" | "secondary" | "success" | "warning" | "error" | "info"

// 响应式断点类型
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

// 主题相关类型
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
  lavender: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
  gold: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
  }
}

// 动画相关类型
export type AnimationDuration = "fast" | "normal" | "slow"
export type AnimationEasing = "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear"

// 表单相关类型
export interface FormFieldProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helperText?: string
}

// 数据表格相关类型
export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: number | string
  align?: "left" | "center" | "right"
  sortable?: boolean
  filterable?: boolean
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: string | ((record: T) => string)
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>
}

// 模态框相关类型
export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: number | string
  closable?: boolean
  maskClosable?: boolean
}

// 通知相关类型
export interface NotificationProps {
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
  onClose?: () => void
} 