# TOOLS.md -- 环境配置笔记

Skills 定义工具怎么用，这个文件记录你的具体环境信息。

## NAS 环境

- **型号**: 绿联 DH4300Plus（ARM64）
- **内网 IP**: 192.168.5.110
- **Tailscale IP**: 100.106.29.60
- **用户**: Kkwans（admin 组，可 sudo 免密码）
- **SSH**: `sshpass -p 'Ncu8117_' ssh Kkwans@192.168.5.110`

### 已安装组件

| 组件 | 版本 | 备注 |
|------|------|------|
| Docker | 26.1.0 | |
| Docker Compose | 1.29.2 | |
| JDK | OpenJDK 17.0.18 | ARM |
| Maven | 3.8.7 | |
| MySQL 8 | Docker 容器 | 端口 3306 |
| Amazon Corretto 17 | Docker 镜像 | ARM64 优化，替代 openjdk |
| Node.js 20 | Docker 镜像 | Alpine，替代 node:18 |

### MySQL（共享实例）

- **容器名**: mysql8
- **端口**: 3306
- **root 密码**: Root2026
- **数据卷**: /volume1/Docker/MySQL/data
- **已有数据库**: film_forest（9 张表）
- **原则**: 所有项目共用此 MySQL 实例，不同项目用不同 database

### Docker Compose 项目（/volume1/Docker/）

| 项目 | 服务 | 端口 | 说明 |
|------|------|------|------|
| Tailscale | tailscale | - | 外网访问，host 网络 |
| MySQL | mysql8 | 3306 | 共享数据库 |
| Film-Forest | admin-server | 8081 | 管理端后端 |
| Film-Forest | client-server | 8080 | 用户端后端 |
| Film-Forest | admin-ui | 3001 | 管理端前端 |
| Film-Forest | client-ui | 3000 | 用户端前端 |
| OpenClaw | openclaw-gateway-1 | 18789 | J.A.R.V.I.S.（独立 compose） |

### NAS 运行时环境

- **nodejs**: v18.20.4（已安装）
- **npm**: **无**（未安装，前端用 standalone 模式 node server.js 直接运行）
- **部署目录**: `/volume1/Docker/`（**红线：不能放 /home/Kkwans/ 用户个人目录**）

### 网络

- **Tailscale**: 部署在 NAS 本机（非容器内）
- **外网访问**: 100.106.29.60:端口号
- **Docker 网络**: 项目容器使用 host 网络模式

## 交互方式

- **平台**: QQ Bot
- **部署**: Docker 容器运行在 NAS 上
- **设备**: 红米 K80 Pro（HyperOS 3.0.6.0）

## Android 编译

- ARM64 容器无法直接编译（aapt2 是 x86_64）
- 解决方案: GitHub Actions（ubuntu-latest x86_64 编译 ARM64 APK）

## GitHub

- **账号**: Kkwans
- **film-forest 仓库**: Kkwans/film-forest-server（后端）、Kkwans/film-forest-client（前端）
- **注意**: interview-master 仓库是旧的废弃项目，主人计划归档或删除

## 阿里云 Docker 镜像仓库（ACR）

- **Registry**: `crpi-33qulxhgw5nadzni.cn-beijing.personal.cr.aliyuncs.com`
- **命名空间**: `dh4300plus`
- **用户名**: `Kkwans`
- **VPC 内网**: `crpi-33qulxhgw5nadzni-vpc.cn-beijing.personal.cr.aliyuncs.com`
- **用途**: 自建镜像的云端版本管理（类似 GitHub）
- **规范**: 见 guides/DOCKER_RULES.md 第四章

---

_环境有变化就更新。这是你的速查手册。_
