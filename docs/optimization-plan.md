# 影视森林前端代码优化计划

## 一、现状分析

### 1.1 重复代码统计
- `animate-pulse` 加载状态：52处
- 内联样式 `backgroundColor: var(--bg-*)`：153处
- Toast 调用：64处
- 详情页加载状态：4个页面重复相同模式

### 1.2 已有组件
- `Skeleton` 基础组件（未充分利用）
- `Toast` 组件（使用硬编码渐变色）
- `Dialog` 组件（已使用 CSS 变量）

## 二、优化目标

### 2.1 代码层
- [ ] 统一代码规范
- [ ] 提高可维护性和可扩展性
- [ ] 复用模块做成组件
- [ ] 提高代码复用率

### 2.2 展示层
- [ ] 统一页面风格
- [ ] 相同功能模块使用统一组件样式
- [ ] 组件样式相同但可区分颜色和细节

## 三、优化方案

### 3.1 已创建的复用组件

#### Loading 骨架屏组件
- `DetailPageSkeleton` - 详情页加载状态
- `ResourceListSkeleton` - 资源列表加载状态
- `CardGridSkeleton` - 卡片网格加载状态
- `SearchResultSkeleton` - 搜索结果加载状态
- `FormSkeleton` - 表单加载状态
- `StatCardSkeleton` - 统计卡片加载状态

#### 空状态组件
- `EmptyState` - 通用空状态
- `SearchEmpty` - 搜索无结果
- `ListEmpty` - 列表为空

### 3.2 待优化项

#### 前端
1. **详情页统一** - 4个详情页（movie/drama/variety/anime）结构相同，可提取为通用组件
2. **列表页统一** - 电影/剧集/综艺/动漫列表页结构相同，可提取为通用组件
3. **筛选器组件** - 年份/地区/类型筛选器重复，可提取为通用组件
4. **资源展示组件** - 磁力/网盘资源展示重复，可提取为通用组件

#### 后端
1. **Controller 规范** - 统一返回格式、错误处理
2. **Service 规范** - 统一事务管理、日志记录
3. **工具类** - 提取通用工具方法

## 四、实施步骤

### 第一阶段：组件提取（当前）
- [x] 创建 Loading 骨架屏组件
- [x] 创建空状态组件
- [ ] 提取详情页通用组件
- [ ] 提取列表页通用组件
- [ ] 提取筛选器组件

### 第二阶段：代码规范
- [ ] 统一前端代码风格
- [ ] 统一后端代码风格
- [ ] 添加代码注释

### 第三阶段：性能优化
- [ ] 优化 N+1 查询
- [ ] 添加索引
- [ ] 优化前端打包

## 五、组件使用规范

### Loading 状态
```tsx
import { CardGridSkeleton } from '@/components/ui/loading-skeleton';

if (loading) {
  return <CardGridSkeleton count={12} />;
}
```

### 空状态
```tsx
import { EmptyState } from '@/components/ui/empty-state';

if (items.length === 0) {
  return <EmptyState title="暂无内容" description="稍后再来看看吧" />;
}
```

### Toast 提示
```tsx
import { useToast } from '@/components/Toast';

const { showToast } = useToast();
showToast('操作成功', 'success');
```
