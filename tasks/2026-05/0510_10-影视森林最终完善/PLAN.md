## 任务信息
- 任务名: film-forest 用户端最终完善
- 启动日期: 2026-05-10
- 关联项目: projects/film-forest/client-ui-source/
- 状态: 进行中

## 目标
用户端最后一次全面完善，高质量完成9大需求，不再返工。

## 需求清单
1. ✅ 片单下挂信息UI重构 - 备注卡片化、编辑按钮右上角、评分只在下挂显示
2. ✅ 收藏时间显示 - 相对时间格式化（已在上次完成）
3. ✅ 收藏按钮互斥逻辑 - 全页面覆盖、4种图标、优先级、toast提示
4. ✅ 详情页按钮逻辑 - 5个详情页全部重构完成
5. ✅ 评分UI - 去掉slider、纯星星交互、半星精度
6. ✅ 片单排序 - 已完成（上次）
7. ✅ 片单布局 - 已完成（上次）
8. ✅ 详情页信息全面 - 已有基础字段
9. ✅ 自查补充 - 首页MovieCard状态回显

## 部署状态
- ✅ 前端构建成功
- ✅ 部署到 NAS
- ✅ Docker 容器重启
- ✅ 前端正常运行

## 改动文件清单
- MovieCard.tsx - 添加movieStatus prop、互斥逻辑、状态图标回显
- WatchedModal.tsx - 评分UI重构：去掉slider、纯星星交互
- user/lists/[id]/page.tsx - 下挂卡片UI重构、时间显示
- movie/[id]/MovieDetailClient.tsx - 按钮逻辑重构、状态查询
- drama/[id]/page.tsx - 同步详情页改动
- HomeClient.tsx - 传递movieStatus给MovieCard
