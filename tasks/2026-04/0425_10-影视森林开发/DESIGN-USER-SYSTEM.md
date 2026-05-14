# DESIGN -- 用户系统 + 片单功能 详细设计

## 1. 认证流程

### 注册流程
1. 用户输入用户名 + 邮箱/手机号 + 密码
2. 后端校验：用户名唯一、邮箱/手机号格式、密码强度
3. BCrypt 加密密码存储
4. 注册成功后自动登录，返回 JWT

### 登录流程
1. 用户输入用户名 + 密码
2. 后端校验密码（BCrypt.matches）
3. 生成 JWT（有效期 7 天）
4. 返回 token + 用户信息

### 认证中间件
- 请求头：`Authorization: Bearer <token>`
- JWT Filter 拦截 `/api/user/**` 路径
- 401 时前端跳转登录页
- token 过期前 24h 自动续期

## 2. 片单设计

### 默认片单
用户注册时自动创建三个默认片单：
- **想看** (want_to_watch) — 标签色：蓝色
- **在看** (watching) — 标签色：绿色  
- **看过** (watched) — 标签色：灰色

### 自定义片单
- 用户可创建自定义片单（如"周末看"、"推荐给朋友"等）
- 自定义片单可编辑名称/描述、可删除
- 默认片单不可删除

### 收藏交互
**单按钮方案**（推荐）：
- 详情页/搜索结果页显示一个"收藏"按钮
- 点击按钮 → 弹出片单选择弹窗
- 弹窗中显示所有片单（默认3个 + 自定义）
- 快捷操作：点击片单名直接添加
- 已收藏的片单显示勾选标记
- 可从弹窗中直接移除

## 3. 前端页面设计

### 登录/注册页
- 路由：`/login`, `/register`
- 移动端全屏，PC端居中卡片
- 表单验证：用户名长度、密码强度、邮箱格式
- 登录成功后跳转到来源页

### "我的"页面（移动端）
- 路由：`/profile` 或 `/user`
- 底部Tab新增"我的"
- 页面内容：
  - 用户头像 + 昵称
  - 三个默认片单入口（横向卡片布局，参考豆瓣）
  - 自定义片单列表
  - 设置/退出登录

### PC端用户菜单
- 右上角显示用户头像/昵称
- 下拉菜单：我的片单、收藏、设置、退出登录

### 片单详情页
- 路由：`/user/lists/[id]`
- 横向卡片布局（参考豆瓣）
- 每个片单显示：名称、描述、影视数量
- 影视卡片可点击进入详情
- 支持从片单移除

### 收藏弹窗
- 模态弹窗
- 显示所有片单列表
- 每个片单显示：名称、已有标记
- 点击片单 = 添加/移除
- 底部"新建片单"入口

## 4. 后端设计

### 新增依赖
```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

### 新增类
- `User` — 实体类
- `UserMovieList` — 片单实体类
- `UserMovieListItem` — 片单条目实体类
- `UserMapper` — MyBatis Mapper
- `UserMovieListMapper` — 片单 Mapper
- `UserMovieListItemMapper` — 条目 Mapper
- `UserService` / `UserServiceImpl` — 用户服务
- `UserMovieListService` / `UserMovieListServiceImpl` — 片单服务
- `AuthController` — 认证控制器
- `UserMovieListController` — 片单控制器
- `JwtUtil` — JWT 工具类
- `JwtAuthenticationFilter` — JWT 过滤器
- `SecurityConfig` — 安全配置
- `PasswordEncoder` — 密码加密

### application.yml 新增配置
```yaml
jwt:
  secret: <随机生成的密钥>
  expiration: 604800000  # 7天
```

## 5. 交互流程

### 收藏影视流程
1. 用户在详情页/搜索页点击"收藏"按钮
2. 前端弹出片单选择弹窗
3. 前端调用 `GET /api/user/movie-status?movieId=X&contentType=Y`
4. 弹窗显示所有片单，已收藏的显示勾选
5. 用户点击某个片单
6. 前端调用 `POST /api/user/lists/{listId}/items` 或 `DELETE`
7. 弹窗实时更新状态
8. 按钮状态同步更新（已收藏时变色）

### 登录状态管理
- 前端 Zustand store 存储 user + token
- localStorage 持久化 token
- 请求拦截器自动添加 Authorization header
- 401 响应时清除状态，跳转登录页
- 页面刷新时用 token 重新获取用户信息
