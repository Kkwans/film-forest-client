---
created: 2026-05-18
---

# DESIGN -- NAS 文件浏览器二次开发 技术设计

## 架构概览

```
nas-file-browser/
├── cmd/                    # Go 入口
├── http/                   # HTTP 路由和处理器
├── files/                  # 文件操作核心逻辑
├── storage/                # 数据库存储层
├── users/                  # 用户管理
├── settings/               # 系统设置
├── frontend/               # Vue 3 前端
│   ├── src/
│   │   ├── views/files/
│   │   │   ├── Editor.vue      # ★ 改造：集成 Vditor
│   │   │   ├── Preview.vue     # ★ 改造：美化预览
│   │   │   └── FileListing.vue # ★ 优化：列表样式
│   │   ├── css/
│   │   │   ├── mdPreview.css   # ★ 改造：Markdown 渲染样式
│   │   │   └── styles.css      # 全局样式入口
│   │   ├── components/         # Vue 组件
│   │   ├── i18n/               # 国际化
│   │   └── stores/             # Pinia 状态管理
│   └── dist/                   # 构建产物
├── Dockerfile.custom       # 自定义构建
└── docker-compose.yml
```

## 核心改动设计

### 1. Markdown 编辑器改造 (Editor.vue)

**现有方案**: Ace 编辑器 + marked 简单预览（点击按钮切换）
**新方案**: Vditor 编辑器（原生支持 IR/SV/源码/阅读四种模式）

**实现方式**:
- Markdown 文件打开时动态加载 Vditor (CDN)
- 非 Markdown 文件保持原有 Ace 编辑器
- Vditor 配置：中文、Typora 风格工具栏、暗色主题适配

**关键代码改动**:
- `frontend/src/views/files/Editor.vue`: 替换 Ace 为 Vditor
- 保留原有 save/close/keydown 逻辑
- Vditor getValue() 获取内容用于保存

### 2. Markdown 渲染样式 (mdPreview.css)

**现有方案**: 5 行 CSS（padding + border + font-size + line-height）
**新方案**: 200+ 行专业级样式

**设计要点**:
- 中文字体栈：PingFang SC / Microsoft YaHei
- 代码块：暗色背景 (#1e293b) + 语法高亮
- 表格：圆角 + 阴影 + hover 效果
- 引用块：蓝色左边框 + 浅蓝背景
- 暗色模式：全量适配

### 3. UI 样式优化

**策略**: 渐进式优化，不破坏现有功能
- CSS 变量驱动主题
- 增加圆角、阴影、过渡动画
- 优化间距和排版

### 4. 构建流程

```dockerfile
# 两阶段构建
FROM golang:1.22-alpine AS builder
# 1. pnpm build 前端
# 2. go build 后端
FROM alpine:3.19
# 最终镜像 < 100MB
```

## 数据流

```
用户打开 .md 文件
  → FileBrowser 路由到 Editor.vue
  → 检测 isMarkdownFile
  → 动态加载 Vditor CDN
  → Vditor 初始化（IR 模式）
  → 用户编辑 → Vditor 自动渲染
  → Ctrl+S → Vditor.getValue() → API PUT 保存
```

## 与上游同步策略

- 改动集中在 3 个文件：Editor.vue、mdPreview.css、styles.css
- 不修改后端 Go 代码
- 不修改路由、存储、用户系统
- 可通过 git merge upstream/master 合并更新
