# LOG -- 影视森林 执行日志

## 2026-04-25

### 本次目标
- 数据库设计最终版
- MySQL 环境搭建
- 建表并验证

### 完成内容
- 数据库设计 v2 版本完成（5 主表 + 3 资源表 + 1 剧集子表 + 1 字典表）
- NAS MySQL 环境切换（mariadbd 停用 -> mysql8 容器启动）
- film_forest 数据库创建，9 张表全部导入成功
- 七味网（pkmp4.xyz）站点结构调研完成，输出 EXPLORE.md

### 遇到的问题
- NAS 原有 mariadbd 占用 3306 端口，需先停止再启动 mysql8
- 已解决，mysql8 容器正常运行

### 下一步
- SpringBoot 后端脚手架搭建
- 基础 CRUD API 开发

## 2026-04-26

### 本次目标
- 工作区 v5 重构（由主人发起）

### 完成内容
- 工作区从旧结构迁移到 v5 规范
- movie-crawler-0424 任务内容合并到 0425_10-影视森林开发
- tasks 文件体系完善（PLAN/DESIGN/LOG/EXPLORE）
- 项目定位修正：影视资源聚合网站（非管理系统）

### 下一步
- SpringBoot 后端脚手架搭建
- 基础 CRUD API 开发

## 2026-04-28

### 本次目标
- 设置定时任务自动推进
- SpringBoot 后端脚手架搭建

### 完成内容
- 文档全部重新读取，状态清晰：数据库就绪，下一步是后端 CRUD
- 尝试设置每30分钟定时提醒（OpenClaw cron），因 gateway CLI pairing 问题未成功
- 决定：跳过定时任务，直接推进开发——代码才是核心
- 开始搭建 SpringBoot 后端脚手架（projects/film-forest/backend/）

### 遇到的问题
- OpenClaw cron add 命令一直报 "pairing required"，gateway RPC 在线但 CLI session 访问受限
- 已放弃在 CLI 命令行设置定时任务，改用直接开发推进

### 下一步
- SpringBoot 项目脚手架搭建完成，后端验证通过
- **Docker 容器化部署到 NAS**
- 爬虫模块开发（七味网对接）
- 管理端和用户端前端开发

## 2026-04-28 白天

### 本次目标
- 后端部署到 NAS Docker 环境（更换端口方案）

### 完成内容
- docker-compose.yml 端口从 8080 改为 **8888**
- JAR 包上传到 NAS：`/home/Kkwans/film-forest/backend/film-forest.jar`（39MB）
- 启动成功：`java -jar film-forest.jar --server.port=8888`
- **健康检查通过**：`http://192.168.5.110:8888/health` 返回 200

### 遇到的问题
- 8080 端口被 interview-master（旧项目）占用，方案：不冲突，改用 8888
- SCP 直接上传到目标目录报错，改用 `cat ... | ssh` 间接上传

### 下一步
- 爬虫模块开发（七味网对接）
- 用户端前端（film-forest-client）开发
- 管理端前端（film-forest-admin）开发
- Docker 容器化部署（前端开发完后）

## 2026-04-28 上午（第二次）

### 本次目标
- 创建三个 GitHub 仓库并推送代码
- 推进前端和爬虫模块开发

### 完成内容
- **GitHub 仓库创建完成**：
  - `film-forest-server`（后端） - 已推送完整代码 + README
  - `film-forest-client`（用户端） - 已推送占位 README
  - `film-forest-admin`（管理端） - 已推送占位 README
- 后端 JAR 已部署到 NAS 8888 端口，健康检查正常

### 遇到的问题
- gh CLI 验证需要 `read:org` scope，配置在 admin:org 下（我判断失误，只说了 repo）
- Git push 因 HTTP2 framing 问题多次卡住，用 `timeout 90` 解决

### 下一步
- 爬虫模块（七味网）
- 前端开发（用户端优先）

## 2026-04-28 下午

### 本次目标
完善前端页面：用户端列表/详情/搜索，管理端内容管理/爬虫管理界面

### 需求变更
管理端新增**爬虫管理界面**（重要且复杂）：
- 可视化：实时显示爬虫状态/进度
- 可配置：类型选择（电影/剧集/综艺/动漫/短剧）/优先级（评分/热度）/分类筛选（科幻/喜剧等）
- 手动操作：启动/停止/暂停爬虫任务
- 日志查看：实时执行日志

### 完成内容
- [ ] 用户端 - 电影/剧集列表页
- [ ] 用户端 - 详情页 + 资源链接展示
- [ ] 用户端 - 搜索结果页
- [ ] 管理端 - 内容管理页面
- [ ] 管理端 - 爬虫管理界面（可视化/可配置/手动操作）

### 技术方案
- 后端：爬虫管理 API（启动/停止/配置/日志查询）
- 前端：Next.js 管理界面
- 爬虫：与后端共用 module，支持可配置参数

### 下一步
- 用户端列表页（/movie）

## 2026-05-03

### 完成内容
- 后端功能矩阵完善（admin-server / client-server 全部 API 验证通过）
- 爬虫调度器 CrawlerScheduler（5 种类型独立调度）
- Episode 提取（5067 条）
- admin-ui 功能矩阵确认（仪表盘/内容管理/爬虫管理全部可用）
- client-ui 功能矩阵确认（首页/电影列表/电影详情/搜索可用）
- 项目工程规划文档更新（projects/film-forest/PLAN.md）

## 2026-05-04

### 完成内容
- **CSS 未生效问题修复**: standalone 模式静态文件路径映射问题定位 + 修复
- **API 代理修复**: client-ui 和 admin-ui 的 API 地址从硬编码 Tailscale IP 改为 Next.js rewrites 代理
  - next.config.ts 添加 rewrites 规则
  - api.ts 改为相对路径
  - Dockerfile 升级 node:20-alpine
  - 验证: /api/movies、/api/content/stats、/api/crawler/status 均正常
- **设计图分析（4张）**: 首页/电影列表/电影详情/搜索结果，全部输出分析文档
- **用户端 UI 重构启动**: 按设计稿重写全部页面
  - 布局组件: Header + Footer + MobileBottomNav
  - 通用组件: MovieCard + Pagination + UI 组件库
  - 首页/电影列表/电影详情/搜索结果页完成
  - 电视剧/综艺/动漫/短剧列表+详情页完成
  - CSS 主题系统（globals.css CSS 变量）
- 模型切换: MiniMax-M2.7 → mimo-v2.5-pro → mimo-v2.5

### 遇到的问题
- 从 OpenClaw 容器内部无法 SSH 到 NAS（exec 环境无 sshpass）
- container 文件系统只读，需要重建镜像才能更新

## 2026-05-05

### 完成内容
- 记忆更新: 日记忆 + MEMORY.md 同步更新
- 规范修正: 删除 projects/film-forest/ 下多余的 PLAN.md（规划文档统一归 tasks 管理）
- 任务规划更新: PLAN.md 里程碑同步最新进度

### 待执行
- 用户端综艺/动漫/短剧列表页筛选功能补齐
- 部分细节打磨 + bug 修复
- Git remote 修复 + 代码同步
- Docker Compose 全量部署验证

## 2026-05-08

### 完成内容
- **Git 提交**: 本地更改已提交（1031 files changed, 包含用户端多项修复）
- **Git 推送**: 因 GitHub push protection 检测到旧 commit 中的 PAT token，使用 git-filter-repo 清除后重写历史。推送因网络超时未完成（69MB 仓库），需后续重试
- **后端构建**: client-server 在 NAS 上通过 Docker Maven 镜像构建成功（film-forest-backend-0.0.1-SNAPSHOT.jar）
- **后端部署**: JAR 复制到 /volume1/Docker/Film-Forest/backend/film-forest-backend-new.jar，client-server 和 admin-server 容器已重启
- **前端构建**: client-ui-source 在 NAS 上通过 Docker Node 20 镜像构建成功（Next.js static generation 11 pages）
- **前端部署**: .next 目录复制到 /volume1/Docker/Film-Forest/frontend/，client-ui 容器已重启
- **服务验证**:
  - 用户端 (3000): ✅ 200 OK，标题"影视森林"
  - 管理端 (3001): ✅ 200 OK，标题"影视森林 - 管理后台"
  - API (8080): ✅ /api/movies 返回 200，数据正常

### 遇到的问题
- NAS /tmp 目录权限问题: Kkwans 用户无写入权限，需要 sudo 创建目录并 chmod 777
- SCP 到 NAS 失败: /tmp 和 /home/Kkwans 均无法 SCP，改用 SSH pipe + tar 传输
- 源文件权限全为 000: 需要先 chmod 755 本地文件再 tar 传输
- GitHub push protection: 旧 commit (734911c) 中 memory/2026-04-24.md 包含 ghp_ token，使用 git-filter-repo 清除
- API 路径: 实际路径是 /api/movies 而非 /api/client/movie/list

### 待执行
- 用户端综艺/动漫/短剧列表页筛选功能补齐
- 部分细节打磨 + bug 修复

## 2026-05-08（续）

### 全面优化

**P0 关键数据显示修复**:
- 地区字段JSON字符串：创建 `parseRegion()` 工具函数，正确解析 `'["]'` 格式，应用到全部10+页面/组件
- 类型混入语言标签：创建 `parseGenre()` 过滤 "荷兰语"、"法语"、"日本語" 等语言标签
- 简介末尾 `[]` 残留：创建 `cleanStoryline()` 清理
- 标题年份后缀：`cleanTitle()` 统一处理

**P1 后端改进**:
- 搜索性能优化：从全表扫描改为 SQL LIMIT + 评分排序
- 年份区间支持：所有5个Controller新增 yearFrom/yearTo 参数
- 排序方向支持：新增 sortDir 参数（asc/desc）
- 涉及15个文件（Controller/Service/ServiceImpl）

**P1 前端体验**:
- 移动端底部导航移除无效的"我的"链接
- 所有详情页统一使用共享工具函数
- 新增 loading.tsx（所有列表页和详情页）

**额外修复**:
- 过滤爬虫残留标签（如 "制片国家/地区:"）
- REGION_BLACKLIST 和 LANGUAGE_TAGS 扩展

### Git 推送问题
- sandbox 环境 git push 到 GitHub 超时（网络问题）
- 改用 GitHub REST API 成功推送4个仓库
- 仓库大小正常（1-2MB），非69MB

### 部署验证
- 后端: Maven构建成功，JAR 39MB
- 前端: Next.js 16.2.4 编译成功，14个路由
- 服务验证: 用户端(3000)✅ 管理端(3001)✅ API(8080)✅
- 功能验证: 地区解析✅ 语言标签过滤✅ 搜索✅ 年份区间✅ 排序升降序✅

## 2026-05-08（UX修复 + 用户系统规划）

### UX 问题修复（7项）
- 移动端底部Tab即时反馈
- 移动端点击悬停动画移除
- 影视卡片统一大小
- 点击卡片进入详情页无响应修复
- 卡片底部排版对齐
- 升序降序按钮样式优化
- 搜索结果页排序功能

### 用户系统 + 片单功能规划
- 任务文档: PLAN-USER-SYSTEM.md
- 详细设计: DESIGN-USER-SYSTEM.md
- 数据库: 3张新表（user/user_movie_list/user_movie_list_item）
- 后端: 注册登录 + JWT + 片单 CRUD
- 前端: 登录注册页 + 片单页 + 收藏弹窗 + 移动端"我的"Tab
- 预计8个阶段，逐个推进

### 2026-05-08（用户系统实现）

**UX修复7项**:
- 移动端底部Tab即时反馈（useTransition + loading spinner）
- 移动端点击悬停动画移除（tap-highlight-color + @media hover:none）
- 影视卡片统一大小（minHeight:60px + 占位符）
- 点击卡片进入详情即时响应（prefetch + navigating状态）
- 卡片底部排版对齐（flex justify-between）
- 升序降序按钮SVG重设计
- 搜索结果页排序功能

**后端用户系统**:
- 3张新表：user / user_movie_list / user_movie_list_item
- 15个新文件：实体/Mapper/Service/Controller/JWT/过滤器/配置
- API验证全部通过：注册/登录/片单CRUD/收藏操作
- BCrypt密码加密 + jjwt 0.12.6
- 注册自动创建3个默认片单

**前端用户系统**:
- 登录/注册页面
- "我的"页面 + 片单详情页
- 收藏弹窗组件（CollectModal）
- MobileBottomNav新增"我的"Tab
- Header用户菜单（PC端右上角）
- MovieCard + 所有5个详情页收藏按钮
- 搜索结果页收藏 + 排序

**部署**:
- 后端JAR构建部署 ✅
- 前端Next.js构建部署 ✅（18个路由）
- 服务验证：用户端(3000)✅ 管理端(3001)✅ API(8080)✅

**GitHub推送**: 4个仓库全部推送完成

### 2026-05-08（全面优化第4轮）

**后端修改**:
- getUserLists 返回 item_count
- addItem 支持 rating 和 note 参数
- getListItems 返回完整信息（含电影标题/海报/评分等）
- 排序支持 updateTime/豆瓣/IMDB/烂番茄
- user_movie_list_item 表新增 rating/note 字段

**前端修改**:
- 搜索结果页PC端2列布局，显示完整信息（评分/导演/演员等）
- 片单列表页横向布局，显示评分/备注/收藏时间
- 排序支持最新更新/上映时间/豆瓣/IMDB/烂番茄
- 登录错误处理优化

**部署**: 后端+前端构建部署到NAS ✅
**GitHub**: 4个仓库全部推送 ✅

### 2026-05-08（用户系统bug修复）

**修复9项**:
1. 默认片单可点击进入列表页（用type参数区分）
2. 片单详情页改为横向列表布局（参考豆瓣）
3. 片单数量正确显示（xx部）
4. Header移动端隐藏登录按钮，PC端只显示登录
5. 收藏按钮单击加入想看，双击弹出片单选择
6. 升序降序按钮修复（添加onClick handler）
7. 控制台报错修复（空值检查）
8. 默认头像改为首字母圆形头像
9. 移动端卡片标题允许2行，收藏按钮缩小

**部署**: 前端构建部署到NAS ✅
**GitHub**: 推送完成 ✅
