# Docker 镜像与容器规范

> 加载时机: 构建自定义镜像 / 编写 Dockerfile / 编写 docker-compose.yaml 时

## 一、镜像版本规范

### 1.1 自建镜像命名

格式: `<项目名>-<模块名>:<版本号>`

```
示例:
  film-forest-client-ui:1.0.0
  film-forest-admin-server:1.2.3
  my-tool:latest          (仅用于开发/测试)
```

### 1.2 版本号规则

采用 **语义化版本 (SemVer)**: `MAJOR.MINOR.PATCH`

| 递增场景 | 示例 | 说明 |
|----------|------|------|
| MAJOR | 1.0.0 -> 2.0.0 | 不兼容的重大变更（架构重构、API 不兼容） |
| MINOR | 1.0.0 -> 1.1.0 | 新增功能（向后兼容） |
| PATCH | 1.0.0 -> 1.0.1 | Bug 修复、小改动 |

- **禁止使用 `latest` 作为生产标签**（无法追溯、无法回滚）
- 开发/调试阶段可用 `dev` 或 `test` 标签
- CI/CD 自动构建可用 `git commit hash` 前 7 位作为标签（如 `a1b2c3d`）

### 1.3 基础镜像选择（ARM64 优先）

NAS 设备: 绿联 DH4300Plus（ARM64/aarch64）

| 用途 | 推荐镜像 | 不推荐 | 原因 |
|------|----------|--------|------|
| JDK 17 | `amazoncorretto:17-alpine` | `openjdk:17-slim` | Corretto 对 ARM64 优化更好，体积小 25% |
| JDK 21 | `amazoncorretto:21-alpine` | `eclipse-temurin:21` | 同上 |
| Node.js | `node:20-alpine` | `node:18-alpine` | 18 已 EOL，20 为 LTS |
| Python | `python:3.12-slim` | `python:3.12` | slim 体积小 10x |
| Nginx | `nginx:alpine` | `nginx:latest` | alpine ARM64 友好 |
| MySQL | `mysql:8` | `mysql:5.7` | 8.x 支持 ARM64 原生 |

**原则**: 优先选 `alpine` 变体，优先选对 ARM64 有官方优化的发行版。

## 二、Docker Compose 规范

### 2.1 目录结构

所有 compose 项目统一放在 `/volume1/Docker/` 下，每个项目一个文件夹:

```
/volume1/Docker/
+-- Tailscale/
|   +-- docker-compose.yaml
|   +-- lib/                 (Tailscale 状态数据)
|   +-- tun/                 (TUN 设备)
+-- MySQL/
|   +-- docker-compose.yaml
|   +-- data/                (MySQL 数据卷)
+-- Film-Forest/
    +-- docker-compose.yaml
    +-- backend/             (JAR 包)
    +-- admin/               (管理端前端)
    +-- frontend/            (用户端前端)
```

### 2.2 docker-compose.yaml 编写规范

```yaml
services:
  service-name:
    image: amazoncorretto:17-alpine     # 必须指定明确版本标签
    container_name: project-service      # 有意义的容器名
    restart: unless-stopped              # 生产环境统一用 unless-stopped
    network_mode: host                   # NAS 环境推荐 host 网络
    environment:
      - KEY=value
    volumes:
      - ./data:/app/data                 # 相对路径，数据在项目目录内
    # ports 不需要写（host 模式下直接用宿主机端口）
```

### 2.3 重启策略

| 策略 | 行为 | 适用场景 |
|------|------|----------|
| `unless-stopped` | 开机自启 + 异常重启，手动停止后不自动重启 | **生产环境统一使用** |
| `always` | 始终重启，包括手动停止后 | 仅用于必须 7x24 的服务（如 Tailscale） |
| `no` | 不自动重启 | 一次性任务 |

### 2.4 数据持久化

- **数据库**: 必须挂载数据卷到项目目录（如 `./data:/var/lib/mysql`）
- **配置文件**: 挂载到项目目录（如 `./config:/app/config`）
- **JAR 包/前端代码**: 只读挂载（`:ro`）
- **禁止使用匿名卷**（`volume:` 不指定 host 路径），否则数据无法在 compose 外管理

## 三、镜像清理规范

### 3.1 清理原则

**只清理重复/冗余镜像，不清理「未使用但可能有用」的镜像。**

- 同类镜像保留最优版本（如 JDK 只保留 amazoncorretto，删除 openjdk）
- 已确认不再使用的项目镜像（如已废弃的 Clash）：**立即删除**
- 未运行但可能需要的镜像（如 nginx、工具镜像）：**保留**

### 3.2 清理命令

```bash
# 清理悬空镜像（dangling images，安全）
sudo docker image prune -f

# 清理所有未使用的镜像（谨慎！只在确认不需要时执行）
sudo docker image prune -a -f
```

### 3.3 清理时机

- 每次 `docker compose up --force-recreate` 后检查是否有旧镜像残留
- 升级基础镜像版本后（如 node:18 -> node:20），删除旧版本镜像
- 每季度检查一次镜像列表，清理重复/过时镜像

## 四、云端镜像仓库（阿里云 ACR）

### 4.1 仓库信息

- **Registry 地址**: `crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com`
- **命名空间**: `dh4300plus`
- **用户名**: `Kkwans`
- **VPC 内网地址**: `crpi-33qulxhgw5nadzni-vpc.cn-beijing.personal.cr.aliyuncs.com`

### 4.2 镜像命名规范

格式: `crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com/dh4300plus/<项目名>-<模块名>:<版本号>`

```
示例:
  .../dh4300plus/film-forest-client-ui:1.0.0
  .../dh4300plus/film-forest-admin-server:1.2.3
```

### 4.3 推送流程

每个稳定版本必须推送到云端仓库，流程如下：

```bash
# 1. 登录阿里云 ACR
docker login --username=Kkwans crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com

# 2. 构建镜像（本地标签）
docker build -t film-forest-client-ui:1.0.0 .

# 3. 打标签（云端标签）
docker tag film-forest-client-ui:1.0.0 \
  crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com/dh4300plus/film-forest-client-ui:1.0.0

# 4. 推送
docker push \
  crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com/dh4300plus/film-forest-client-ui:1.0.0
```

### 4.4 拉取流程

```bash
# 登录（如果未登录）
docker login --username=Kkwans crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com

# 拉取指定版本
docker pull crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com/dh4300plus/film-forest-client-ui:1.0.0
```

### 4.5 版本管理策略

- 云端仓库 = Docker 镜像的「GitHub」
- 每个功能点完成后、每个稳定版本必须 push 到云端
- 本地镜像丢失时可从云端拉取
- 镜像有问题时可回滚到云端的旧版本
- compose 文件中 `image:` 可直接引用云端镜像地址

### 4.6 NAS Docker 面板注册规范

UGOS Docker 面板通过 SQLite 数据库管理 compose 项目：
- **数据库路径**: `/volume1/@appstore/com.ugreen.docker/db/docker_info_log.db`
- **表名**: `compose`
- **关键字段**: `name`（项目名）、`path`（compose文件路径）、`state`（1=运行中）、`container_num`（容器数量）

CLI 创建的 compose 项目**不会自动注册**到面板，需要手动插入记录。

#### 注册命令模板

部署新 compose 项目后，必须执行以下命令注册到面板：

```bash
# 注册 compose 项目到 UGOS Docker 面板
sudo sqlite3 /volume1/@appstore/com.ugreen.docker/db/docker_info_log.db \
  "INSERT INTO compose (created_at, updated_at, name, state, path, content, app_id, container_num) \
   VALUES (datetime('now'), datetime('now'), '<项目名>', 1, '<compose文件完整路径>', '', '', <容器数量>);"
```

#### 字段说明

| 字段 | 说明 | 示例 |
|------|------|------|
| `name` | 项目名（小写，用连字符） | `film-forest` |
| `state` | 状态：1=运行中，3=已停止 | `1` |
| `path` | docker-compose.yaml 完整路径 | `/volume1/Docker/Film-Forest/docker-compose.yaml` |
| `content` | 留空即可 | `''` |
| `app_id` | 应用商店项目填 `com.ugreen.docker.<name>`，CLI项目留空 | `''` |
| `container_num` | 该 compose 包含的容器数 | `4` |

#### 已注册项目

| 项目 | 面板显示 | 注册方式 |
|------|----------|----------|
| Tailscale | ✅ | 面板UI创建，自动注册 |
| OpenClaw | ✅ | 应用商店安装，自动注册 |
| Hermes | ✅ | 应用商店安装，自动注册 |
| MySQL | ✅ | CLI创建 + 手动注册 |
| Film-Forest | ✅ | CLI创建 + 手动注册 |

#### 重要提示

- 面板 UI 操作（启动/停止/删除）会自动更新数据库
- CLI 操作（`docker compose up/down`）**不会同步更新数据库**
- 面板显示的状态可能与实际不一致，以 CLI `docker compose ps` 为准
- 面板删除项目时会同时清理数据库记录，但不会删除 `/volume1/Docker/` 下的文件

## 五、安全规范

- 生产环境不使用 `privileged: true`（除非必须，如 Tailscale）
- 敏感信息（密码、密钥）通过环境变量传入，**不硬编码在 compose 文件中**
  - 推荐: 使用 `.env` 文件 + `.gitignore` 排除
- 容器内不暴露不必要的端口
- 只读挂载不需要写入的文件（`:ro`）

---

_此规范适用于 NAS（绿联 DH4300Plus ARM64）上的所有 Docker 部署。_
