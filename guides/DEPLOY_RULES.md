## NAS Docker 部署规范

> 加载时机: 任何涉及 NAS Docker 部署的操作

### 一、目录规范

**统一原则**: 所有 Docker 项目的运行时文件（compose、挂载源、数据卷）统一放在 `/volume1/Docker/`（大写D）。
**命名原则**: 与 GitHub 仓库名保持一致：`client-ui`、`client-server`、`admin-ui`、`admin-server`。

```
/volume1/Docker/
+-- Film-Forest/               # 影视森林项目
|   +-- docker-compose.yml     # compose 文件
|   +-- client-ui/             # 用户端前端（standalone build）
|   +-- admin-ui/              # 管理端前端（standalone build）
|   +-- backend/               # 后端 JAR + 日志
|   |   +-- film-forest.jar           # 用户端后端 (client-server)
|   |   +-- film-forest-admin.jar     # 管理端后端 (admin-server)
|   |   +-- backup/                   # 旧版本备份（最多保留2个）
|   |   +-- logs/                     # 日志文件
+-- MySQL/
|   +-- data/                  # MySQL 数据卷
+-- Tailscale/
```

### 二、命名对照表

| 仓库名 | NAS目录 | Docker容器名 | 端口 |
|--------|---------|-------------|------|
| film-forest-client-ui | client-ui/ | film-forest-client-ui | 3000 |
| film-forest-client-server | backend/film-forest.jar | film-forest-client-server | 8080 |
| film-forest-admin-ui | admin-ui/ | film-forest-admin-ui | 3001 |
| film-forest-admin-server | backend/film-forest-admin.jar | film-forest-admin-server | 8081 |

### 三、禁止事项

- ❌ 不要用 `frontend` 或 `admin` 作为目录名（用 `client-ui`、`admin-ui`）
- ❌ 后端 JAR 不要放在项目根目录（放 `backend/` 下）
- ❌ 日志文件不要和 JAR 混在一起（放 `backend/logs/`）
- ❌ 不要保留超过 2 个旧版本 JAR（旧的删掉或移入 backup/）
- ❌ 不要保留 `-old`, `-broken`, `-new` 等临时命名的文件
- ❌ 前端 backup 目录不要超过 1 个（用完及时清理）
- ❌ 临时文件（tmp-*.tar.gz）用完立即删除
- ❌ 不要在 `/volume1/docker/`（小写）放运行时文件（只用于 UGOS 面板注册）

### 四、路径红线

NAS Linux 文件系统大小写敏感，以下路径是**完全不同的目录**：

| 路径 | 大小写 | 用途 |
|------|--------|------|
| `/volume1/Docker/` | **大写 D** | Docker 项目运行时根目录 |
| `/volume1/Docker/Film-Forest/` | **大写 D, 大写 F** | 影视森林项目（compose + 挂载源） |
| `/volume1/docker/` | **小写 d** | 旧目录，仅用于 UGOS 面板注册 |

### 五、GitHub推送规范

**根因**: sandbox到github.com:443的TCP连接不稳定，经常超时30-120秒。
**解决方案**: 用background异步推送+长超时，失败就重试（通常2-3次中有1次成功）。

```bash
cd projects/film-forest/client-ui
git push origin main  # 如果超时，直接再试一次，不要分析原因
```

- 不要报错就停下来分析，直接重试
- 通常2-3次中有1次成功
- 不要改git配置（http.sslBackend等），保持默认

### 六、前端部署流程

```bash
# 1. 构建（在 sandbox 中）
cd projects/film-forest/client-ui && npm run build
cp -r .next/static .next/standalone/.next/static
cd .next/standalone && tar czf /tmp/client-ui-build.tar.gz --exclude='node_modules' .

# 2. 上传（确认目标路径：大写 D/F，目录名 client-ui！）
cat /tmp/client-ui-build.tar.gz | sshpass -p 'xxx' ssh Kkwans@192.168.5.110 \
  "cat > /volume1/Docker/Film-Forest/tmp-client-ui.tar.gz"

# 3. 部署
sshpass -p 'xxx' ssh Kkwans@192.168.5.110 "
  echo '密码' | sudo -S rm -rf /volume1/Docker/Film-Forest/client-ui/.next
  echo '密码' | sudo -S tar xzf /volume1/Docker/Film-Forest/tmp-client-ui.tar.gz \
    -C /volume1/Docker/Film-Forest/client-ui/
  echo '密码' | sudo -S rm -f /volume1/Docker/Film-Forest/tmp-client-ui.tar.gz
  echo '密码' | sudo -S docker restart film-forest-client-ui
"

# 4. 验证
curl -sf http://localhost:3000/ > /dev/null && echo 'OK'
```

### 六、部署检查清单

- [ ] 确认目标路径：`/volume1/Docker/Film-Forest/client-ui`（大写 D/F，client-ui）
- [ ] 上传后检查文件时间戳是否更新
- [ ] 重启 Docker 容器
- [ ] curl 验证页面加载新代码（检查 BUILD_ID）
- [ ] 删除临时文件
- [ ] Git commit + push

### 七、后端部署流程

后端 JAR 路径：`/volume1/Docker/Film-Forest/backend/`（大写 D/F）
- compose 文件中 volume 挂载：`./backend/film-forest.jar:/app.jar:ro`
