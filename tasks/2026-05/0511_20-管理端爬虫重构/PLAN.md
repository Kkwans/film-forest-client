# 管理端重建 + 七味网接口梳理

> 创建时间: 2026-05-11 02:23
> 状态: 进行中
> 间隔: 30分钟 | 超时: 30分钟

## 任务概述

1. **P0 - 七味网接口梳理**: 梳理 pkmp4.xyz 所有子页面的有效接口和页面信息结构
2. **P1 - 管理端代码梳理与修复**: 全面梳理管理端前后端代码现状，自测并修复问题

## P0 - 七味网接口梳理

### 目标页面
- 首页: https://www.pkmp4.xyz/
- 电影列表页: https://www.pkmp4.xyz/vt/1.html
- 剧集列表页: https://www.pkmp4.xyz/vt/2.html
- 综艺列表页: https://www.pkmp4.xyz/vt/3.html
- 动漫列表页: https://www.pkmp4.xyz/vt/4.html
- 短剧列表页: https://www.pkmp4.xyz/vt/30.html
- 电影详情页: https://www.pkmp4.xyz/mv/160215.html
- 剧集详情页: https://www.pkmp4.xyz/mv/76321.html
- 搜索结果页: https://www.pkmp4.xyz/vs/-------------.html?wd=计划
- 分类筛选页: 各种 /ms/ 开头的 URL

### 交付物
- [x] EXPLORE.md: 七味网完整接口文档（URL规则 + 页面结构 + 数据字段 + 反爬分析）

## P1 - 管理端代码梳理

### 前端页面（admin-ui）
- [x] 首页 (stats/page.tsx) - 无问题
- [x] 内容管理 (content/page.tsx) - 修复新增/编辑/预览按钮
- [x] 爬虫管理 (crawler/page.tsx) - 无问题
- [x] 资源管理 (resources/page.tsx) - localStorage 设计合理
- [x] 系统设置 (settings/page.tsx) - 更新密码增加提示

### 后端接口（admin-server）
- [x] CrawlerController - 爬虫管理 API ✅
- [x] ContentController - 内容管理 API ✅
- [x] ResourceController - 资源管理 API ✅
- [x] CrawlerCore - 爬虫核心逻辑（修复评分提取）
- [x] CrawlerScheduler - 定时调度（升级CronExpression）

### 交付物
- [x] admin-issues.md: 管理端问题清单（含修复方案）
