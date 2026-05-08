# Git 版本管理规范

> 加载时机: 提交代码 / 推送代码 / 编写 commit message 时

## 一、核心原则

**每个小功能点完成 = 一次 commit + push**

- 不积攒代码，不「等做完再提交」
- commit 前确保代码可编译、可运行
- push 前确保 commit message 清晰

## 二、提交规范

### 2.1 Commit Message 格式

采用 **Conventional Commits** 格式:

```
<类型>(<范围>): <简短描述>

<可选的详细描述>
```

类型（type）:

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(user): 添加用户注册接口` |
| `fix` | Bug 修复 | `fix(crawler): 修复超时重试逻辑` |
| `refactor` | 重构（不改变功能） | `refactor(service): 抽取公共查询方法` |
| `docs` | 文档更新 | `docs: 更新 README 部署说明` |
| `style` | 代码格式调整 | `style: 统一缩进为 4 空格` |
| `test` | 测试相关 | `test(user): 添加注册接口单元测试` |
| `chore` | 构建/工具变更 | `chore: 升级 SpringBoot 到 3.2.0` |
| `fix` | 紧急修复 | `hotfix: 修复生产环境数据库连接泄漏` |

### 2.2 提交频率

- **每个独立功能点**: 必须 commit + push
- **每个 Bug 修复**: 必须 commit + push
- **每天至少一次 push**: 即使功能未完成，也要 push 中间进度
- **禁止**: 攒一大堆修改一次性提交

### 2.3 提交前检查

```bash
# 1. 查看修改了什么
git status
git diff

# 2. 确认能编译/运行
mvn clean package     # Java 项目
npm run build         # 前端项目

# 3. 提交
git add -A
git commit -m "feat(module): 描述"

# 4. 立即推送
git push origin main
```

## 三、分支规范

- `main` / `master`: 生产分支，始终保持可部署状态
- `dev`: 开发分支（可选，个人项目可直接在 main 上开发）
- `feature/xxx`: 功能分支（大型功能使用）
- `hotfix/xxx`: 紧急修复分支

**个人项目简化**: 直接在 main 分支开发，每个功能点 commit + push。

## 四、.gitignore 规范

每个项目必须有 `.gitignore`，排除:

```gitignore
# 构建产物
target/
build/
dist/
*.jar
*.class

# 依赖
node_modules/
.venv/

# 环境/密钥
.env
*.key
*.pem

# IDE
.idea/
.vscode/
*.iml

# 系统文件
.DS_Store
Thumbs.db

# Docker 数据卷
data/
```

## 五、远程仓库规范

- **GitHub 账号**: Kkwans
- **仓库命名**: `<项目名>` (如 `film-forest-server`, `film-forest-client`)
- **远程地址**: `https://github.com/Kkwans/<项目名>.git`
- **默认分支**: `main`

### 5.1 新项目初始化

```bash
# 在项目目录下
git init
git remote add origin https://github.com/Kkwans/<项目名>.git
git add -A
git commit -m "chore: 初始化项目"
git push -u origin main
```

### 5.2 SSH 推荐

建议配置 SSH key 避免每次输入密码:

```bash
# 生成密钥
ssh-keygen -t ed25519 -C "Kkwans@users.noreply.github.com"

# 添加到 GitHub: Settings -> SSH and GPG keys
cat ~/.ssh/id_ed25519.pub

# 改用 SSH 地址
git remote set-url origin git@github.com:Kkwans/<项目名>.git
```

---

_每个功能点 = commit + push。不积攒，不拖延。_
