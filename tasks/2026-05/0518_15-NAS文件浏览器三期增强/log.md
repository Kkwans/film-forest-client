---
created: 2026-05-18
priority: highest
---

# LOG -- NAS 文件浏览器三期增强

## 2026-05-18 15:10 - 任务创建

**状态：** 任务创建完成，准备开始执行

**完成项：**
- [x] proposal.md - 高层次提案
- [x] spec.md - 详细需求规格
- [x] design.md - 技术设计方案
- [x] tasks.md - 任务拆解

**下一步：**
- 开始执行 Phase 1 核心修复
- 创建定时任务（每 30 分钟执行一次）

**问题：**
- 无

**决策：**
- 采用最高规格 SDD 流程
- 分三个 Phase 实施
- 核心功能优先于 UI 优化

---

## 2026-05-18 15:55 - F2 密码策略修改 + 错误信息汉化

**状态：** 已完成

**完成项：**
- [x] F1: Fork filebrowser 源码（之前已完成）
- [x] F2: 密码策略修改
  - `settings/settings.go`: 默认最小密码长度 12→6
  - `users/password.go`: 移除 commonPasswords 密码强度检查
  - `errors/errors.go`: 全部 18 个错误信息改为中文
  - `http/data.go`: 优化错误响应，4xx/5xx 直接返回中文错误信息
- [x] Git commit + push 到 GitHub (push051810b 分支)

**技术细节：**
- 密码验证流程：`ValidateAndHashPwd` → 检查长度 → `HashPwd`（跳过强度检查）
- 错误响应优化：`handle` 函数现在对所有 4xx/5xx 错误直接返回 `err.Error()`，不再拼接英文 HTTP 状态文本
- 前端 `fetchURL` 会读取响应体作为 `StatusError.message`，toast 直接显示中文

**下一步：**
- F3: 错误信息汉化（前端 i18n 部分）
- F4: 存储卷挂载配置
- F5: 重新构建 Docker 镜像

**问题：**
- 无

**决策：**
- F2 和 F3 合并执行（后端错误信息已汉化，前端 i18n 已有中文翻译）
- 保留 commonPasswords 变量和 assets 文件（不影响编译，后续可选清理）

---

## 2026-05-18 16:25 - F4 存储卷挂载配置

**状态：** 已完成

**完成项：**
- [x] F4: 存储卷挂载配置
  - NAS 存储卷结构分析：volume1 (7.3T, 27%) + volume2 (7.3T, 1%)
  - `docker-compose.custom.yml`: 挂载 /volume1 和 /volume2（只读）
  - `docker-compose.custom.yml`: FB_ROOT 改为 / 以支持完整文件系统浏览
  - `docker/common/defaults/settings.json`: 默认 root 改为 /
  - `Dockerfile.custom`: 移除 /srv volume 声明
- [x] Git commit + push 到 GitHub (push051815 分支)

**NAS 存储卷详情：**
- volume1: 7.3T, 1.9T 已用 — Docker, Download, @home, @docker, 迅雷下载等
- volume2: 7.3T, 28G 已用 — Hermes, OpenClaw, Common, VIEDO 等
- 无 USB/网络存储

**技术细节：**
- FB_ROOT=/ 让 filebrowser 以容器根目录为起点，用户可直接看到 /volume1、/volume2
- 存储卷以只读模式挂载，防止误操作
- 后续 F6（存储卷发现 API）将实现自动发现和容量展示

**下一步：**
- F5: 重新构建 Docker 镜像（需要 NAS SSH 构建环境）
- F6: 存储卷发现 API（Go 后端）
- F7: 目录分类系统

**问题：**
- 无

**决策：**
- FB_ROOT=/ 而非 /srv，让路径更自然（/volume1 而非 /srv/volume1）
- 只读挂载保护存储卷安全
- 移除 /srv volume 声明，与新 root 配置保持一致
