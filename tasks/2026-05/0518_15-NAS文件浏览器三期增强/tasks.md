---
created: 2026-05-18
priority: highest
source: spec.md, design.md
---

# TASKS -- NAS 文件浏览器三期增强

> 从 spec.md + design.md 拆解。完成后勾选 [x]。

## Phase 1: 核心修复（P0）

### F1: Fork filebrowser 源码
- [ ] 克隆 filebrowser 官方仓库到 GitHub
- [ ] 创建自定义分支 `custom-nas`
- [ ] 验证本地构建成功

### F2: 密码策略修改
- [x] 定位密码验证逻辑（`users/password.go` + `errors/errors.go`）
- [x] 修改最小长度限制为 6 位（`settings/settings.go`）
- [x] 移除密码强度检查（`commonPasswords` 检查）
- [x] 错误信息改为中文（`errors/errors.go` 全部 18 个 + `ErrShortPassword`）
- [x] HTTP 错误响应优化（`http/data.go` 直接返回中文错误）

### F3: 错误信息汉化
- [x] 定位所有用户可见的错误信息
- [x] 修改为中文（后端 Go 代码，已在 F2 中完成）
- [x] 前端 i18n 配置更新（zh-cn.json 已有完整翻译）
- [ ] 测试验证所有错误信息为中文（需要部署后验证）

### F4: 存储卷挂载
- [x] 分析 NAS 存储卷结构（volume1: 7.3T, volume2: 7.3T, 无USB/网络存储）
- [x] 修改 docker-compose.yml 挂载 volume1 + volume2（只读）
- [x] FB_ROOT 改为 /，settings.json 同步更新
- [ ] 测试存储卷访问权限（需部署后验证）
- [ ] 验证文件浏览功能（需部署后验证）

### F5: 重新构建镜像
- [ ] 更新 Dockerfile 使用 fork 后的源码
- [ ] 构建 Docker 镜像
- [ ] 推送到阿里云 ACR
- [ ] NAS 上拉取并部署

## Phase 2: 目录分类 + 风险等级（P1）

### F6: 存储卷发现 API
- [ ] 实现存储卷自动发现逻辑
- [ ] 新增 `/api/volumes` 接口
- [ ] 返回存储卷列表（路径、名称、类型、容量）
- [ ] 前端调用并显示

### F7: 目录分类系统
- [ ] 创建 `categories.json` 配置文件
- [ ] 实现分类匹配逻辑
- [ ] 前端侧边栏分组显示
- [ ] 不同分类使用不同图标和颜色

### F8: 风险等级系统
- [ ] 创建 `risk-levels.json` 配置文件
- [ ] 实现风险等级匹配逻辑
- [ ] 前端风险等级标识显示
- [ ] 高危操作确认对话框

### F9: UI 优化
- [ ] 登录卡片居中
- [ ] 搜索框与 logo 对齐
- [ ] 整体设计语言现代化
- [ ] 响应式布局优化

## Phase 3: 收藏 + 标签（P2）

### F10: 目录收藏功能
- [ ] 实现收藏数据结构
- [ ] localStorage 持久化
- [ ] 收藏/取消收藏操作
- [ ] 侧边栏收藏列表
- [ ] 拖拽排序

### F11: 目录标签功能
- [ ] 实现标签数据结构
- [ ] localStorage 持久化
- [ ] 创建/编辑/删除标签
- [ ] 给目录分配标签
- [ ] 按标签筛选目录

## 任务依赖关系

```
F1 (Fork 源码)
├── F2 (密码策略) ──┐
├── F3 (错误汉化) ──┤
└── F5 (构建镜像) ◄─┘
        │
        ▼
F4 (存储卷挂载)
        │
        ▼
F6 (存储卷 API)
        │
        ├── F7 (目录分类)
        └── F8 (风险等级)
                │
                ▼
        F9 (UI 优化)
                │
                ▼
        F10 (收藏功能)
        F11 (标签功能)
```

## 预计时间

| 阶段 | 预计时间 | 优先级 |
|------|---------|-------|
| Phase 1 | 2-3 小时 | P0 |
| Phase 2 | 4-6 小时 | P1 |
| Phase 3 | 3-4 小时 | P2 |
| **总计** | **9-13 小时** | - |
