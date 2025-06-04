import '@testing-library/jest-dom'
import { vi } from 'vitest'

// 为真实API测试设置环境变量
process.env.VITE_TEST_MODE = 'integration'

// Mock DOM APIs that are not available in jsdom
Object.defineProperty(window, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
})

Object.defineProperty(window, 'IntersectionObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 只在单元测试时模拟Electron APIs，集成测试时使用真实API
if (process.env.VITEST_POOL_ID !== undefined && !process.env.REAL_API_TEST) {
  // Mock Electron APIs for unit tests
  Object.defineProperty(window, 'api', {
    value: {
      validateApiKey: vi.fn(),
      searchProspects: vi.fn(),
      createProspectList: vi.fn(),
      getListStatus: vi.fn(),
      getListContacts: vi.fn(),
      getCreditBalance: vi.fn(),
      continueSearch: vi.fn(),
      exportToCSV: vi.fn(),
      exportToExcel: vi.fn(),
    },
    writable: true,
  })

  Object.defineProperty(window, 'electron', {
    value: {
      ipcRenderer: {
        invoke: vi.fn(),
        on: vi.fn(),
        removeAllListeners: vi.fn(),
      },
    },
    writable: true,
  })
} 