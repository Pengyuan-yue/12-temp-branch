import { describe, test, expect } from 'vitest'
import { 
  cn, 
  formatDate, 
  formatBytes, 
  isValidEmail, 
  formatNumber,
  truncateText,
  isEmpty,
  getFileExtension,
  debounce,
  throttle
} from '@/lib/utils'

describe('工具函数测试', () => {
  describe('cn - 类名合并函数', () => {
    test('应该正确合并类名', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    test('应该处理条件类名', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional')
    })

    test('应该处理undefined和null', () => {
      expect(cn('base', undefined, null, 'end')).toBe('base end')
    })
  })

  describe('formatDate - 日期格式化', () => {
    test('应该格式化日期为中文格式', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/2024/)
      expect(formatted).toMatch(/01/)
      expect(formatted).toMatch(/15/)
    })

    test('应该处理字符串日期', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toMatch(/2024/)
    })
  })

  describe('formatBytes - 文件大小格式化', () => {
    test('应该格式化字节为可读格式', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(1073741824)).toBe('1 GB')
    })

    test('应该处理小于1KB的文件', () => {
      expect(formatBytes(512)).toBe('512 Bytes')
      expect(formatBytes(0)).toBe('0 Bytes')
    })

    test('应该处理大文件', () => {
      expect(formatBytes(1099511627776)).toBe('1 TB')
    })

    test('应该支持自定义小数位数', () => {
      expect(formatBytes(1536, 2)).toBe('1.5 KB')
    })
  })

  describe('isValidEmail - 邮箱验证', () => {
    test('应该验证有效邮箱', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    test('应该拒绝无效邮箱', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('formatNumber - 数字格式化', () => {
    test('应该添加千分位分隔符', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1234567)).toBe('1,234,567')
      expect(formatNumber(123)).toBe('123')
    })
  })

  describe('truncateText - 文本截断', () => {
    test('应该截断长文本', () => {
      expect(truncateText('这是一个很长的文本', 5)).toBe('这是一个很...')
    })

    test('应该保持短文本不变', () => {
      expect(truncateText('短文本', 10)).toBe('短文本')
    })
  })

  describe('isEmpty - 空值检查', () => {
    test('应该识别空值', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
    })

    test('应该识别非空值', () => {
      expect(isEmpty('text')).toBe(false)
      expect(isEmpty([1, 2, 3])).toBe(false)
      expect(isEmpty({ key: 'value' })).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })

  describe('getFileExtension - 文件扩展名', () => {
    test('应该获取文件扩展名', () => {
      expect(getFileExtension('file.txt')).toBe('txt')
      expect(getFileExtension('document.pdf')).toBe('pdf')
      expect(getFileExtension('image.jpeg')).toBe('jpeg')
    })

    test('应该处理没有扩展名的文件', () => {
      expect(getFileExtension('filename')).toBe('')
    })
  })

  describe('debounce - 防抖函数', () => {
    test('应该延迟执行函数', async () => {
      let count = 0
      const increment = () => count++
      const debouncedIncrement = debounce(increment, 100)

      debouncedIncrement()
      debouncedIncrement()
      debouncedIncrement()

      expect(count).toBe(0)

      await new Promise(resolve => setTimeout(resolve, 150))
      expect(count).toBe(1)
    })
  })

  describe('throttle - 节流函数', () => {
    test('应该限制函数执行频率', async () => {
      let count = 0
      const increment = () => count++
      const throttledIncrement = throttle(increment, 100)

      throttledIncrement()
      throttledIncrement()
      throttledIncrement()

      expect(count).toBe(1)

      await new Promise(resolve => setTimeout(resolve, 150))
      throttledIncrement()
      expect(count).toBe(2)
    })
  })
}) 