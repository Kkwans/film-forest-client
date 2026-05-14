# 管理端系统全面重构 - SDD

> 创建: 2026-05-12 02:15
> 重构: 2026-05-12 13:06(按 Spec Coding + Harness 规范重写)
> 状态: 进行中
> 参照模块: crawler/page.tsx(前端表格+弹窗模式)、CrawlerScheduleServiceImpl(后端分层模式)

---

## 一、需求(Proposal)

### 背景
管理端存在 12 个问题:编码乱码、组件不统一、表单字段缺失、爬虫配置报错、数据统计弱等。

### 目标
全面重构管理端,使其:功能完整、UI 统一、代码可维护、前后端分离清晰。

### 范围
- 包含: 12 个问题的修复和增强
- 不包含: 用户端改动、新功能开发

### 已完成
| # | 问题 | 状态 | 产出 |
|---|------|------|------|
| 6 | 爬虫配置 JSON 报错 | ✅ | normalizeGenreFilter() + 前端解析 |
| 1 | 仪表盘乱码 | ✅ | ~5900 条数据编码修复 + charset UTF-8 |
| 3 | 自定义组件库 | ✅ | Toast/Dialog/Modal 三组件 |
| 2 | 表单弹窗组件集成 | ✅ | 内容管理页已集成新组件 |
| 5 | 爬虫配置增强 | ✅ | genre 多选 + Cron 编辑器 + 来源下拉 |
| 4 | 内容管理详情+表单扩展 | ✅ | 10 个新字段 + 详情 Modal |
| 10 | 系统设置优化 | ✅ | alert → Toast |

---

## 二、技术规格(Spec)

### 技术栈
- 前端: Next.js 16 + TypeScript + Tailwind CSS 4
- 后端: SpringBoot 3.2 + MyBatis-Plus 3.5
- 数据库: MySQL 8 (film_forest)
- 部署: Docker on NAS (192.168.5.110)

### 已有组件库
| 组件 | 路径 | 用途 |
|------|------|------|
| Toast | src/components/ui/toast.tsx | 全局提示 |
| Dialog | src/components/ui/dialog.tsx | 确认对话框 |
| Modal | src/components/ui/modal.tsx | 表单弹窗容器 |

### 后端分层规范(Harness)
```
Controller (@RestController) → Service (接口) → ServiceImpl (@Service) → Mapper (BaseMapper<Entity>)
```
参照: `admin-server/.../crawler/service/impl/CrawlerScheduleServiceImpl.java`

### 前端页面规范(Harness)
```
page.tsx ('use client') → api.ts (axios) → 组件 (表格+筛选+弹窗)
```
参照: `admin-ui/src/app/crawler/page.tsx`

---

## 三、任务拆分(Tasks)

### T5: 爬虫配置增强(#5)
- **前置**: T3(组件库)✅
- **参照**: crawler/page.tsx 的表单弹窗模式
- **内容**:
  1. 后端: GET /api/content/genres?contentType=xxx - 从各内容表读取去重 genre
  2. 后端: GET /api/crawler/sources - 获取启用的资源来源列表
  3. 前端: genre 多选 checkbox(从 API 加载,选中后 JSON 数组保存)
  4. 前端: Cron 编辑器(预设下拉 + 自定义输入切换)
  5. 前端: 资源来源下拉(从 API 加载)
  6. 修复 resource_source 表乱码数据
- **验证**: genre 多选保存正确;Cron 预设/自定义切换正常;来源下拉显示正确
- **状态**: ✅ (2026-05-12 13:15)

### T4: 内容管理详情查看 + 表单扩展(#4)
- **前置**: T2(表单弹窗)✅、T3(组件库)✅
- **参照**: crawler/page.tsx 的 Modal + 表格模式
- **内容**:
  1. 前端: ContentRecord 接口扩展(genre、region、language、director、actor、storyline 等)
  2. 前端: "查看详情"按钮 → Modal 展示全部字段(海报+基本信息+剧情简介)
  3. 前端: 新增/编辑表单扩展(类型、年份、评分、类型标签、地区、导演、演员、简介)
  4. 前端: genre/region/director/actor 逗号分隔输入 → JSON 数组保存
  5. 前端: 操作后自动刷新列表
- **验证**: 详情弹窗显示完整信息;编辑表单包含所有字段;保存后列表刷新
- **状态**: ✅ (2026-05-12 13:22)

### T10: 系统设置页面优化(#10)
- **前置**: T3(组件库)✅
- **参照**: crawler/page.tsx 的表单布局
- **内容**:
  1. 前端: 设置页面已分组(基础设置、数据库配置、通知设置、安全设置)
  2. 前端: alert() → toast.success/error/info
  3. 前端: 保存成功/失败使用 Toast 反馈
- **验证**: 保存设置有 Toast 反馈,不再弹 alert
- **状态**: ✅ (2026-05-12 13:25)

### T9: 资源管理完善(#9)
- **前置**: T3(组件库)✅
- **参照**: content/page.tsx 的表格模式
- **内容**:
  1. 资源列表页已从 API 加载真实数据(磁力/网盘)
  2. 资源来源管理已集成 Toast/Dialog 组件
  3. alert/confirm → toast/dialog
- **验证**: 资源列表显示真实数据,操作有 Toast 反馈
- **状态**: ✅

### T8: 数据统计图表增强(#8)
- **前置**: T1(仪表盘)✅
- **参照**: stats/page.tsx 现有图表
- **内容**:
  1. 前端: 内容分布图(各类型占比 + 百分比进度条)
  2. 前端: 爬虫运行详情(每个配置的运行次数、抓取量、进度条)
  3. 前端: 爬虫统计卡片(配置总数、总运行次数、总抓取量、运行中)
- **验证**: 数据从 API 实时加载,显示正确
- **状态**: ✅

### T7: 数据统计 vs 仪表盘区分(#7)
- **前置**: T8(图表增强)✅
- **内容**:
  1. 仪表盘 = 概览(统计卡片 + 最近内容 + 爬虫状态)- 已有
  2. 数据统计 = 详细图表(内容分布 + 爬虫运行详情)- T8 已完成
  3. 两个页面职责明确,不重叠
- **验证**: 仪表盘简洁,数据统计页详细
- **状态**: ✅

### T11: 爬虫脚本全面优化(#11)⭐核心任务
- **前置**: T5(爬虫配置增强)
- **参照**: EXPLORE.md 七味网接口文档
- **内容**:
  1. DB: crawler_schedule 新增 last_crawled_page、last_crawled_id 字段
  2. 后端: CrawlerSchedule 实体新增断点字段
  3. 后端: executeCrawl() 使用断点续爬(从上次页码继续)
  4. 后端: 每页爬取后保存进度(saveCrawlProgress())
  5. 后端: 爬取成功后重置断点(resetCrawlProgress())
  6. 后端: 重复校验已有(existing check),编译通过
- **验证**: API 返回 lastCrawledPage/lastCrawledId 字段;爬虫运行不报错
- **状态**: ✅

### T12: 登录校验 + 通知告警（#12）
- **前置**: 所有其他任务完成
- **参照**: 无（新模块）
- **内容**:
  1. pom.xml: 添加 JWT 依赖（jjwt-api/impl/jackson 0.12.5）
  2. 后端: JwtUtil — Token 生成/解析/验证
  3. 后端: JwtAuthFilter — 白名单放行 login/register，其他 /api/** 需认证
  4. 后端: AuthController — POST /login, /register, /refresh, GET /me
  5. 后端: User 实体 + UserMapper（admin-server 新增）
  6. DB: user 表已存在，admin 用户已注册
- **验证**: 注册→登录→获取 Token→带 Token 访问 API→无 Token 返回 401
- **状态**: ✅

---

## 四、执行依赖图

```
T5(爬虫配置增强)──────┐
T4(内容管理增强)──────┤
T10(系统设置优化)─────┼──→ T11(爬虫脚本优化)──→ T12(登录+通知)
T9(资源管理完善)──────┤
T8(数据统计图表)──→ T7(统计vs仪表盘)┘
```

当前优先级: T5 → T4 → T10 → T9 → T8 → T7 → T11 → T12

---

## 五、验收标准

每个任务完成后必须满足:
1. [ ] 代码风格与项目一致(参照 Harness 模块)
2. [ ] 复用了已有组件/工具
3. [ ] 接口字段前后端对齐
4. [ ] 编译/构建通过
5. [ ] 功能手动验证过
6. [ ] 代码已提交 + 部署
7. [ ] LOG.md 已更新
