---
created: 2026-05-18
status: 进行中
---

# PROPOSAL -- NAS 文件浏览器二次开发

## 1. 背景与动机

当前 NAS 使用 FileBrowser（开源项目 `filebrowser/filebrowser`）作为文件管理工具，通过 Docker 部署在 8888 端口。FileBrowser 整体功能完善（文件浏览、上传下载、编辑、搜索、分享等），但存在以下问题：

- **Markdown 渲染样式极差**：仅 5 行 CSS，黑色边框、无排版
- **编辑器体验原始**：Ace 编辑器 + 简单预览按钮，无实时渲染
- **UI 样式一般**：整体视觉不够精致，缺乏现代感
- **中文体验不足**：虽有 i18n 但本地化不彻底

主人明确要求：**基于 FileBrowser 源码二次开发，不重复造轮子。**

## 2. 项目概述

从 GitHub clone FileBrowser 源码，创建独立仓库 `nas-file-browser`，进行二次开发。保留 FileBrowser 的核心功能和架构，重点优化：

- Markdown 编辑与渲染体验（集成 Vditor）
- 整体 UI 样式现代化
- 中文本地化完善
- 功能增强（批量操作、文件预览等）

## 3. 技术选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | 与上游一致，方便合并更新 |
| 构建工具 | Vite | 与上游一致 |
| Markdown 编辑 | Vditor | 国产开源，原生支持 IR/分屏/源码/阅读模式 |
| 后端 | Go | 与上游一致 |
| 容器化 | Docker + Dockerfile.custom | 自定义构建 |
| 代码托管 | GitHub (Kkwans/nas-file-browser) | 与现有项目一致 |

## 4. 里程碑

| 阶段 | 目标 | 预计周期 |
|------|------|---------|
| M0 | 仓库搭建 + 源码同步 + 构建验证 | 第 1 轮 |
| M1 | Markdown 渲染美化 + Vditor 集成 | 第 2-3 轮 |
| M2 | UI 全局样式优化 | 第 4-6 轮 |
| M3 | 功能增强（批量操作、文件预览等） | 第 7-10 轮 |
| M4 | 中文本地化 + 细节打磨 | 第 11-15 轮 |

## 5. 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| 上游更新合并困难 | 中 | 改动集中在前端 CSS 和 Editor.vue，冲突面小 |
| Go 交叉编译 ARM64 慢 | 低 | NAS 原生构建或 GitHub Actions |
| Vditor CDN 依赖 | 低 | 可打包到本地 |
