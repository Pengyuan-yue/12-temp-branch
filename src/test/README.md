# Wiza Desktop App 测试文档

## 概述

本项目使用 Vitest 作为测试框架，包含单元测试和集成测试，专门针对智能搜索页面的各表单功能进行全面测试。

## 测试结构

```
src/test/
├── unit/                           # 单元测试
│   ├── IntegratedSearchPage.test.tsx    # 智能搜索页面单元测试
│   └── utils.test.ts                    # 工具函数测试
├── integration/                    # 集成测试
│   ├── IntegratedSearchPage.integration.test.tsx  # 智能搜索页面集成测试
│   └── wiza-api.test.ts                # API集成测试
├── utils/                          # 测试工具
│   └── test-helpers.ts                  # 测试辅助函数
├── config/                         # 测试配置
│   └── test-config.ts                   # 测试配置文件
├── setup.ts                        # 测试设置
├── real-api.config.ts              # 真实API测试配置
└── README.md                       # 测试文档
```

## 智能搜索页面测试

### 单元测试 (`IntegratedSearchPage.test.tsx`)

#### 测试覆盖范围

1. **组件渲染测试**
   - 页面基本元素渲染
   - 表单字段显示
   - API密钥验证状态

2. **姓氏筛选功能**
   - 添加姓氏
   - 移除姓氏
   - 重复姓氏验证
   - 空值验证

3. **职位筛选功能**
   - 添加职位关键词
   - 包含/排除选项切换
   - 移除职位关键词

4. **地理位置筛选功能**
   - 城市类型地理位置
   - 州/省类型地理位置
   - 国家类型地理位置
   - 格式验证
   - 移除地理位置

5. **行业筛选功能**
   - 单选和多选行业
   - 取消选择

6. **公司规模筛选功能**
   - 单选和多选公司规模

7. **搜索功能**
   - 搜索按钮状态
   - 搜索条件验证

8. **界面交互**
   - 标签页切换
   - 高级选项展开/收起
   - 清除功能

9. **搜索历史**
   - 历史记录加载
   - 使用历史条件

10. **错误处理**
    - localStorage错误
    - 无效数据处理

#### 运行单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行智能搜索页面单元测试
npm run test:search

# 监视模式运行测试
npm run test:search:watch

# 生成覆盖率报告
npm run test:coverage:unit
```

### 集成测试 (`IntegratedSearchPage.integration.test.tsx`)

#### 测试覆盖范围

1. **完整搜索流程测试**
   - 端到端搜索流程
   - 潜在客户列表创建

2. **搜索条件组合测试**
   - 复杂搜索条件组合
   - 不同类型地理位置处理

3. **错误处理和边界情况**
   - API搜索错误
   - 列表创建错误
   - 无效API密钥
   - 网络超时

4. **性能和用户体验**
   - 搜索时间测试
   - 进度指示器
   - 搜索历史保存

5. **数据完整性**
   - 搜索条件格式化
   - 特殊字符处理

#### 运行集成测试

```bash
# 运行集成测试（使用模拟API）
npm run test:integration

# 运行集成测试（使用真实API）
npm run test:integration:real

# 生成集成测试覆盖率
npm run test:coverage:integration
```

## 测试工具和辅助函数

### IntegratedSearchTestHelper 类

提供链式调用的测试辅助方法：

```typescript
const helper = new IntegratedSearchTestHelper()

await helper
  .addLastName('Smith')
  .addJobTitle('Engineer')
  .addLocation('city', 'Toronto', 'Ontario', 'Canada')
  .selectIndustries(['信息技术与服务'])
  .selectCompanySizes(['11-50人'])
  .performSearch()
  .waitForSearchComplete()
  .expectSearchResults(150)
```

### 测试数据生成器

```typescript
// 创建测试搜索条件
const filters = createTestFilters({
  last_name: ['Smith'],
  company_size: ['11-50']
})

// 创建复杂测试条件
const complexFilters = createComplexTestFilters()

// 创建模拟API响应
const mockResponse = createMockSearchResponse(150, 5)
```

## 测试配置

### 环境变量

```bash
# 使用真实API进行测试
REAL_API_TEST=true

# 设置API密钥
VITE_WIZA_API_KEY=your_api_key_here

# 设置测试模式
VITE_TEST_MODE=integration
```

### 测试配置文件

`src/test/config/test-config.ts` 包含：

- API测试配置
- 超时时间设置
- 测试数据常量
- 错误和成功消息
- UI文本常量
- 性能基准
- 可访问性配置

## 测试最佳实践

### 1. 测试命名

```typescript
describe('IntegratedSearchPage 单元测试', () => {
  describe('姓氏筛选功能测试', () => {
    it('应该能够添加姓氏', async () => {
      // 测试实现
    })
  })
})
```

### 2. 异步测试

```typescript
it('应该能够完成搜索流程', async () => {
  const user = userEvent.setup()
  
  // 执行用户操作
  await user.type(input, 'Smith')
  await user.click(button)
  
  // 等待异步操作完成
  await waitFor(() => {
    expect(screen.getByText('搜索完成')).toBeInTheDocument()
  }, { timeout: 10000 })
})
```

### 3. 模拟和存根

```typescript
// 模拟API服务
vi.mock('../../renderer/src/services/wizaApi', () => ({
  getWizaApi: vi.fn(() => ({
    searchProspects: vi.fn().mockResolvedValue(mockResponse),
  }))
}))

// 模拟状态管理
vi.mock('../../renderer/src/stores/appStore')
```

### 4. 清理和设置

```typescript
beforeEach(() => {
  vi.mocked(useAppStore).mockReturnValue(mockStore)
  vi.clearAllMocks()
})

afterEach(() => {
  vi.clearAllMocks()
})
```

## 持续集成

### GitHub Actions 配置

```yaml
- name: 运行测试
  run: |
    npm run test:ci
    
- name: 上传覆盖率报告
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### 测试脚本

```bash
# CI环境测试
npm run test:ci

# 生成JUnit格式报告
npm run test:ci
```

## 覆盖率目标

- **单元测试覆盖率**: ≥ 90%
- **集成测试覆盖率**: ≥ 80%
- **整体覆盖率**: ≥ 85%

## 性能基准

- **搜索时间**: ≤ 30秒
- **列表创建时间**: ≤ 60秒
- **UI响应时间**: ≤ 1秒
- **内存使用**: ≤ 200MB

## 故障排除

### 常见问题

1. **测试超时**
   ```bash
   # 增加超时时间
   await waitFor(() => {
     // 断言
   }, { timeout: 15000 })
   ```

2. **API密钥问题**
   ```bash
   # 设置环境变量
   export VITE_WIZA_API_KEY=your_key
   ```

3. **模拟问题**
   ```typescript
   // 确保正确清理模拟
   afterEach(() => {
     vi.clearAllMocks()
   })
   ```

### 调试技巧

1. **使用测试UI**
   ```bash
   npm run test:ui
   ```

2. **启用详细输出**
   ```bash
   npm run test -- --reporter=verbose
   ```

3. **单独运行失败的测试**
   ```bash
   npm run test -- --run --reporter=verbose src/test/unit/IntegratedSearchPage.test.tsx
   ```

## 贡献指南

### 添加新测试

1. 确定测试类型（单元/集成）
2. 使用适当的测试工具
3. 遵循命名约定
4. 添加适当的文档
5. 确保测试通过

### 测试审查清单

- [ ] 测试覆盖所有功能分支
- [ ] 包含错误处理测试
- [ ] 使用适当的断言
- [ ] 测试是独立的
- [ ] 有清晰的测试描述
- [ ] 包含性能考虑
- [ ] 遵循可访问性标准

## 参考资料

- [Vitest 文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [React Testing 最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Wiza API 文档](docs/API规范/openapi.yaml) 