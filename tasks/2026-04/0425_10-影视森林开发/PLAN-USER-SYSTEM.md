# PLAN -- 用户系统 + 片单功能

## 任务信息
- 任务名: 用户系统 + 片单功能
- 启动日期: 2026-05-08
- 关联项目: projects/film-forest/
- 状态: 规划中

## 目标
实现完整的用户注册登录系统 + 影视收藏片单功能，参考豆瓣设计，支持"想看/在看/看过"三个默认片单 + 自定义片单。

## 范围
- **包含**:
  - 用户注册/登录（手机号 or 邮箱 + 密码）
  - JWT 认证
  - 三个默认片单：想看、在看、看过
  - 自定义片单（创建/删除/编辑）
  - 影视收藏（加入片单/移除）
  - 片单列表页（参考豆瓣横向布局）
  - 详情页"想看"/"收藏"按钮
  - 搜索结果页收藏功能
  - 移动端"我的"底部Tab
  - PC端右上角用户菜单
- **不包含**:
  - 第三方登录（微信/GitHub等）
  - 用户头像上传
  - 评论/打分系统
  - 社交功能（关注/动态）

## 技术选型
| 层级 | 选型 | 理由 |
|------|------|------|
| 认证 | JWT (jjwt) | 无状态，前后端分离友好 |
| 密码 | BCrypt | Spring Security 内置，安全 |
| 前端状态 | Zustand | 轻量，已有项目使用 |
| 前端请求 | fetch + 拦截器 | 统一处理 401 跳转 |

## 数据库设计

### 新增表

#### user 表
```sql
CREATE TABLE `user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `phone` VARCHAR(20) UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `nickname` VARCHAR(50),
  `avatar_url` VARCHAR(500),
  `status` TINYINT DEFAULT 1 COMMENT '0=禁用 1=正常',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### user_movie_list 表（片单）
```sql
CREATE TABLE `user_movie_list` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL COMMENT '片单名称',
  `type` VARCHAR(20) NOT NULL COMMENT 'want_to_watch/watching/watched/custom',
  `description` VARCHAR(500),
  `is_default` TINYINT DEFAULT 0 COMMENT '默认片单不可删除',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
```

#### user_movie_list_item 表（片单条目）
```sql
CREATE TABLE `user_movie_list_item` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `list_id` BIGINT NOT NULL,
  `movie_id` BIGINT NOT NULL COMMENT '关联 movie/drama/variety/anime/short_drama 的 id',
  `content_type` VARCHAR(20) NOT NULL COMMENT 'movie/drama/variety/anime/short_drama',
  `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`list_id`) REFERENCES `user_movie_list`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_list_movie` (`list_id`, `movie_id`, `content_type`)
);
```

## API 设计

### 认证相关
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录，返回 JWT |
| GET | /api/auth/me | 获取当前用户信息 |
| POST | /api/auth/logout | 登出（客户端清除 token） |

### 片单相关
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/user/lists | 获取用户所有片单 |
| POST | /api/user/lists | 创建片单 |
| PUT | /api/user/lists/{id} | 编辑片单 |
| DELETE | /api/user/lists/{id} | 删除片单（仅自定义） |
| POST | /api/user/lists/{id}/items | 添加影视到片单 |
| DELETE | /api/user/lists/{id}/items/{itemId} | 从片单移除 |
| GET | /api/user/lists/{id}/items | 获取片单内容（分页） |
| GET | /api/user/movie-status?movieId=X&contentType=Y | 查询某影视在哪些片单中 |

## 阶段规划
| 阶段 | 内容 | 预计时间 | 状态 |
|------|------|----------|------|
| P1 | 数据库设计 + 建表 | 0.5h | 待开始 |
| P2 | 后端：用户注册登录 + JWT | 2h | 待开始 |
| P3 | 后端：片单 CRUD API | 2h | 待开始 |
| P4 | 前端：登录注册页面 | 2h | 待开始 |
| P5 | 前端：片单列表页 + 收藏交互 | 3h | 待开始 |
| P6 | 前端：详情页/搜索页收藏按钮 | 1h | 待开始 |
| P7 | 前端：移动端"我的"Tab + PC端用户菜单 | 1h | 待开始 |
| P8 | 联调测试 + 部署 | 1h | 待开始 |

## 里程碑
- [ ] 数据库表创建完成
- [ ] 后端注册登录 API 完成
- [ ] 后端片单 API 完成
- [ ] 前端登录注册页面完成
- [ ] 前端片单功能完成
- [ ] 全端部署验证通过

## 风险与依赖
- 需要新增 jjwt 依赖（后端）
- JWT secret 需要配置到 application.yml
- 前端需要处理 token 存储（localStorage/httpOnly cookie）
- 需要考虑并发收藏的唯一性约束

## 当前状态
规划阶段，正在编写设计文档。同时前7个UX问题正在并行修复中。
