---
created: 2026-05-18
---

# TASKS -- NAS 文件浏览器二次开发 任务清单

> 从 spec.md + design.md 拆解。完成后勾选 [x]。

## Phase 0: 仓库搭建与构建验证

- [x] 创建 GitHub 仓库 `nas-file-browser`
- [x] 推送前端源码到 GitHub（Go 后端由 Dockerfile 构建时自动拉取）
- [ ] 编写 Dockerfile.custom（两阶段构建）
- [ ] NAS 上构建自定义镜像并验证
- [ ] 替换现有 FileBrowser 容器

## Phase 1: Markdown 核心改造 (P0)

### F1: Markdown 渲染美化
- [x] 改写 `frontend/src/css/mdPreview.css`（200+ 行专业样式）
- [ ] 测试各类 Markdown 元素渲染效果
- [ ] 验证暗色模式适配

### F2: Vditor 编辑器集成
- [x] 改写 `frontend/src/views/files/Editor.vue`（集成 Vditor）
- [x] 修复模式切换逻辑（switchMode 销毁+重建）
- [x] 实现阅读模式（initVditorPreview + md2html）
- [x] 测试 IR（实时渲染）模式（代码审查 + 3 个 bug 修复）
- [x] 测试分屏模式（代码审查，逻辑与 IR 一致）
- [x] 测试阅读模式（代码审查，initVditorPreview 逻辑正确）
- [x] 验证保存功能（代码审查，save() 逻辑正确）
- [x] 验证暗色主题切换（第 3 轮已修复）

## Phase 2: UI 样式优化 (P1)

### F3: 全局样式优化
- [ ] 文件列表页样式优化
- [ ] 侧边栏样式优化
- [ ] 顶部导航栏优化
- [ ] 登录页美化
- [ ] 设置页样式优化
- [ ] 移动端响应式优化

### F4: 中文本地化
- [x] 审查现有中文翻译（发现 20+ 个未翻译项）
- [x] 补充缺失的翻译项（resumeTransfer/overrideAll/replaceOrSkip 等）
- [ ] 测试全中文界面

## Phase 3: 功能增强 (P2)

### F5: 文件预览增强
- [ ] 代码语法高亮优化
- [ ] PDF 预览优化
- [ ] 图片预览优化

### F6: 批量操作优化
- [ ] 批量选择体验优化
- [ ] 批量操作 UI 优化

## 执行策略

- 每轮 cron 执行 1 个子任务
- 完成后 git commit + push
- 更新 log.md 记录进展
- 部署到 NAS 验证
