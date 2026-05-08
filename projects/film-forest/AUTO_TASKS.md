# AUTO_TASKS.md -- 影视森林 持续开发任务

> 最后更新: 2026-05-04 14:50
> 定时任务: film-forest-continuous-dev
> 间隔: 30 分钟 | 超时: 30 分钟
> 工作目录: /root/.openclaw/workspace/projects/film-forest/

## 一、执行原则

1. **每次只执行一个任务**，完成后更新本文件状态
2. **不编译不部署**，除非任务明确要求
3. **遇到阻塞问题**记录到「阻塞清单」，不要跳过继续下一个
4. **完成后汇报**：简要说明做了什么、结果如何
5. **所有操作通过 SSH 执行**，NAS 信息：sshpass -p 'Ncu8117_' ssh Kkwans@192.168.5.110
6. **部署目录红线**: `/volume1/docker/<项目名>/`，绝对不能放 `/home/Kkwans/`

## 二、待执行任务（按优先级排序）

### P0 - 必须完成

- [x] **P0-4: 前端 API 代理修复** ✅ 2026-05-04 14:50
  - 原因：client-ui 和 admin-ui 的 API 地址硬编码 Tailscale IP (100.106.29.60:8080/8081)，用户手机不在 Tailscale 网络时 API 请求全部失败
  - 症状：用户端电影列表无数据、详情页显示“电影不存在”、管理端仪表盘加载中
  - 修复：
    1. next.config.ts 添加 rewrites 代理 `/api/*` 到后端
    2. api.ts 改为空字符串（相对路径），通过 Next.js server 代理转发
    3. Dockerfile 升级 node:20-alpine（Next.js 16 要求 >=20.9.0）
    4. 使用 standalone 模式部署（node server.js）
  - 验证：client-ui 3000 / admin-ui 3001 的 API 代理均返回 HTTP 200 + 正确数据

- [x] **P0-1: client-ui CSS 404 修复** ✅ 2026-05-03 21:15
  - 原因：子任务破坏了 .next 目录，重建后 tar 提取权限问题
  - 修复：从源码重新 npm build → standalone 模式 → tar 打包上传 → 修复权限 755 → 重启容器
  - 验证：CSS 111KB HTTP 200，JS 44KB HTTP 200，页面 50KB 完整渲染
  - 注意：服务器绑定 Tailscale IP (100.106.29.60:3000)，非 0.0.0.0，localhost 无法访问

- [x] **P0-2: admin-ui 主题切换** ✅ 2026-05-03 22:05
  - 修复：layout.tsx 移除 dark 强制 + ThemeToggle 组件（☀️/🌙/💻跟随系统） + localStorage 持久化
  - 组件颜色：AdminSidebar / AdminHeader / ThemeToggle 全部改用 CSS 变量（bg-sidebar / text-foreground / bg-background）
  - 构建部署：npm build → standalone → tar → NAS → chmod 755 → docker restart
  - 验证：html class="h-full"（无 dark）、bg-background、bg-sidebar、切换主题按钮均正常
  - 注意：各页面（stats/settings/crawler）内仍有少量硬编码 zinc 颜色，后续清理

- [x] **P0-3: Git Remote 修复** ✅ 2026-05-03 22:10
  - 问题：client-server 和 client-ui-source 的 git remote 全指向 admin-server 仓库
  - 修复：为 admin-server / client-server / client-ui-source 初始化独立 git 仓库
  - 仓库映射：admin-server→film-forest-admin-server | admin-ui→film-forest-admin-ui | client-server→film-forest-client-server | client-ui-source→film-forest-client-ui
  - 验证：四个仓库全部 git push 完成

### P1 - 应该完成

- [x] **P1-1: 代码同步到 GitHub** ✅ 2026-05-03 22:10（随 P0-3 一起完成）
  - admin-server 最新代码（含 episode 提取）已推送
  - admin-ui 代码已推送
  - client-server/client-ui remote 已修复并推送
  - 状态：✅

- [x] **P1-2: EpisodeService 补全** ✅ 2026-05-03 22:12
  - 创建 EpisodeService 接口 + EpisodeServiceImpl 实现
  - 方法：pageList（分页）、listByContentId（按内容查）、saveBatchDistinct（去重批量保存）
  - 编译通过，未部署（待下次统一构建）

- [x] **P1-3: client-server 冗余代码清理** ✅ 2026-05-03 22:15
  - 删除整个 crawler 包（8个文件，1048行），client-server 不需要爬虫
  - 编译通过，已推送到 GitHub

### P2 - 后续优化

- [x] **P2-1: CloudFlare 列表页绕过** ✅ 2026-05-03 22:40
  - 原因：Jsoup 直连被 CloudFlare JS challenge 拦截（列表页 138 bytes）
  - 修复：fetchWithRetry 添加 Clash HTTP 代理（127.0.0.1:7890）
  - 验证：列表页 58673 bytes（之前 138 bytes），admin-server 已部署重启
  - 代码已部署，GitHub push 待网络改善（初始提交含大文件超时）

- [x] **P2-2: Docker Compose 全量验证** ✅ 2026-05-03 23:10
  - 6 个容器全部运行：admin-server ✅ | client-server ✅ | admin-ui ✅ | client-ui ✅ | mysql8 ✅ | clash ✅
  - 修复：admin-ui HOSTNAME=0.0.0.0（docker-compose.yml + 重建容器），localhost:3001 HTTP 200
  - 数据库：movie 89 / drama 60 / episode 5171
  - docker-compose.yml 已更新并同步到 NAS

- [x] **P2-3: 前后端联调** ✅ 2026-05-03 23:40
  - client-server API：10 个端点全部 HTTP 200（movies/dramas/varieties/animes/short-dramas/search/resources）
  - admin-server API：4 个端点全部 HTTP 200（content/crawler）
  - 修复：admin-ui crawlerApi 从 client(8080) 改为 adminClient(8081)
  - admin-ui 6 个页面全部 HTTP 200（首页/内容/爬虫/统计/资源/设置）
  - 重建部署完成

## 三、阻塞清单

> 记录当前阻塞开发进度的问题

| # | 阻塞项 | 影响范围 | 发现日期 | 状态 |
|---|---|---|---|---|
| 1 | ~~client-ui CSS 404~~ | ~~用户端全部页面~~ | 05-03 | ✅ 已修复 |
| 2 | ~~admin-ui 强制 dark 模式~~ | ~~管理端 UI~~ | 05-03 | ✅ 已修复 |
| 3 | ~~Git Remote 指向错误~~ | ~~4 个仓库~~ | 05-03 | ✅ 已修复 |
| 4 | ~~列表页 CloudFlare 拦截~~ | ~~爬虫抓取~~ | 05-03 | ✅ 已修复 |

## 四、已完成任务日志

> 最近完成的任务记录（新任务完成后在此追加）

| 日期 | 任务 | 结果 |
|---|---|---|
| 05-03 19:22 | Episode 全量提取 | ✅ 5067 条入库（anime 1863 + variety 840 + short_drama 2149 + drama 215） |
| 05-03 22:05 | admin-ui 主题切换修复 | ✅ 移除 dark 强制 + ThemeToggle + CSS 变量重构 |
| 05-03 22:10 | Git Remote 修复 | ✅ 四仓库独立初始化 + 正确 remote + 全部推送 |
| 05-03 22:12 | EpisodeService 补全 | ✅ 接口 + 实现 + 编译通过 |
| 05-03 22:15 | client-server 冗余清理 | ✅ 删除 crawler 包（8文件 1048行） |
| 05-03 22:40 | CloudFlare 列表页绕过 | ✅ Jsoup 加 Clash 代理（138→58673 bytes） |
| 05-03 23:10 | Docker Compose 全量验证 | ✅ 6 容器全部正常 + admin-ui HOSTNAME 修复 |
| 05-03 23:40 | 前后端联调 | ✅ 全部 API 端点 HTTP 200 + crawlerApi 路由修复 |
| 05-03 19:15 | 新模型 mimo-v2.5 添加 | ✅ OpenClaw config 已更新 |
| 05-03 19:00 | 飞书 ack 表情修复 | ✅ ackReactionScope=all + actions.reactions=true |
| 05-03 18:32 | 系统稳定运行验证 | ✅ 全部 P0-P3 任务完成 |
| 05-03 17:50 | 爬虫定时任务优化 | ✅ CrawlerScheduler 每 30 分钟自动调度 |
| 05-03 16:25 | 爬虫僵尸状态修复 | ✅ 处理中的任务自动重置 |
| 05-03 16:20 | 资源提取 Bug 修复 | ✅ 在线/磁力/网盘资源正常提取 |
| 05-03 14:13 | region 提取修复 | ✅ extractTextByLabel 正确提取地区 |
| 05-03 13:40 | actor 提取修复 | ✅ extractTextByLabel 正确提取演员 |

## 五、当前系统状态

```
NAS Docker 服务:
├── mysql8              → 3306  ✅ 运行中
├── film-forest-admin   → 8081  ✅ 运行中 (admin-server)
├── admin-frontend      → 3001  ✅ 运行中 (admin-ui)
├── film-forest-client  → 8080  ✅ 运行中 (client-server)
├── client-frontend     → 3000  ✅ 运行中 (client-ui, CSS 404)
└── clash               → 7890  ✅ 运行中 (Google 可访问)

数据库状态 (film_forest):
├── movie: 89
├── drama: 49
├── variety: 37
├── anime: 40
├── short_drama: 54
├── episode: 5,067
├── resource_online: 有数据
├── resource_magnet: 有数据
└── resource_cloud: 有数据
```

## 六、运行记录

### 2026-05-03 21:00 - 文档重写
- 重写 AUTO_TASKS.md（30 分钟间隔，优化提示词）
- 重写 PLAN.md（全面梳理四个仓库现状）
- 修复 Clash（allow-lan: true）
- 启动前端修复子任务（CSS 404 + admin-ui 主题）
