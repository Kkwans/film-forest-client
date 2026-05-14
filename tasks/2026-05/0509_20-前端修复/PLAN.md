# 影视森林前端问题修复 - 2026-05-09

## 问题清单（10项）- 全部完成 ✅

### 1. 登录失败提示问题 ✅
- 登录失败停留在登录界面，保留表单信息
- 登录框抖动动画 + 红色边框
- 错误提示带图标，更醒目
- userStore 检查 API code 字段（之前直接信任 HTTP 200）

### 2. PC端/移动端用户信息显示 ✅
- PC端登录后右上角只显示头像（去掉了用户名文字）
- 移动端右上角去掉了用户头像（由底部"我的"tab处理）

### 3. 片单列表布局 ✅
- 改为和搜索结果页一致的卡片布局
- PC端一行两个，移动端一行一个
- 显示：类型标签、年份、豆瓣评分、我的评分（看过才显示）、备注（特殊样式）、收藏时间
- 去掉了简介

### 4. 卡片大小统一 ✅
- MovieCard 使用 flex-col 布局，统一高度
- 移动端标题改为一行 truncate
- 移动端列表改为 grid-cols-2（一行两个卡片）
- Info 区域设置 minHeight 确保一致

### 5. 卡片样式和底部信息 ✅
- Genre 标签：flex-wrap + overflow-hidden，尽可能多展示
- 标签缩小到 text-[9px] md:text-[10px]
- Region 也尽可能展示

### 6. 排序功能 ✅
- 列表页和搜索结果页都加了烂番茄评分排序
- 搜索结果页排序选项和列表页统一
- "最新更新"按 updatedAt 排序
- 自定义下拉组件 CustomSelect 替代原生 select
- SortDirButton 重新设计（上下箭头图标）

### 7. 去掉丑陋的箭头 ✅
- category 页面 → 改为 SVG chevron 图标
- profile 页面 → 改为 SVG chevron 图标
- 所有页面检查，统一使用 SVG

### 8. 自定义排序下拉列表 ✅
- 新建 CustomSelect 组件
- 自定义样式，支持点击外部关闭
- 高亮当前选中项

### 9. 片单移除按钮确认弹窗 ✅
- 自定义确认弹窗（不用浏览器自带 confirm）
- 移动端：左滑卡片显示"备注"和"移除"按钮
- PC端：hover 显示操作按钮

### 10. 片单备注信息编辑功能 ✅
- 后端新增 PUT /api/user/lists/{id}/items 接口
- NoteEditModal 组件：支持编辑备注和评分
- 想看/在看：显示备注输入框
- 看过：显示评分（5星）+ 备注
- 所有编辑操作入库记录

## 技术变更清单

### 后端（client-server）
- UserMovieListService: 新增 updateItem 方法
- UserMovieListServiceImpl: 实现 updateItem
- UserMovieListController: 新增 PUT /api/user/lists/{id}/items

### 前端（client-ui-source）
- 新增组件：CustomSelect、SortDirButton、NoteEditModal
- 修改组件：Header、MovieCard、Pagination（未改）
- 修改页面：login、search、category、profile、user/lists/[id]、movie/MovieListClient
- 修改文件：userStore.ts、userApi.ts、globals.css

## 部署状态
- 前端：已部署到 NAS（film-forest-client-ui 容器已重启）✅
- 后端：已部署到 NAS（film-forest-client-server 容器已重启）✅
- GitHub：sandbox 环境 push 超时，待主人手动推送

## 第二轮修复（17:47）
1. ✅ 搜索结果页恢复简介显示
2. ✅ 片单列表展示更多信息（和搜索结果一致）
3. ✅ 评分改为10分制+0.5步长+滑块
4. ✅ 收藏按钮缓存wantList ID + CollectModal预置默认片单
5. ✅ 排序修复：前端传sort=latest，后端支持sortDir
6. ✅ CustomSelect下拉宽度对齐触发器
7. ✅ 后端所有内容类型排序支持sortDir

## 部署状态
- 前端：已部署 ✅
- 后端：已部署 ✅
- GitHub：前后端都已推送 ✅

## 完成时间
2026-05-09 18:05
