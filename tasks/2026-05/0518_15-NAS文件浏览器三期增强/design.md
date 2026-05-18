---
created: 2026-05-18
priority: highest
source: spec.md
---

# DESIGN -- NAS 文件浏览器三期增强

## 1. 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Vue 3 前端                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │   │
│  │  │ 存储卷  │ │ 目录    │ │ 风险    │ │ 收藏    │  │   │
│  │  │ 选择器  │ │ 分类    │ │ 标识    │ │ 管理    │  │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx 反向代理                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Go 后端 (filebrowser fork)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ 存储卷  │ │ 目录    │ │ 密码    │ │ 错误    │         │
│  │ 管理器  │ │ 分类    │ │ 策略    │ │ 汉化    │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      文件系统                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │/volume1 │ │/volume2 │ │ USB存储 │ │ 网络存储│         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 2. 存储卷管理设计

### 2.1 存储卷发现机制

**后端实现：**
```go
// storage/volumes.go
type Volume struct {
    Path       string `json:"path"`
    Name       string `json:"name"`
    Type       string `json:"type"`       // system, usb, network
    TotalSpace uint64 `json:"totalSpace"`
    UsedSpace  uint64 `json:"usedSpace"`
    MountPoint string `json:"mountPoint"`
}

// 自动发现存储卷
func DiscoverVolumes() []Volume {
    volumes := []Volume{}
    
    // 系统存储卷
    for i := 1; i <= 10; i++ {
        path := fmt.Sprintf("/volume%d", i)
        if _, err := os.Stat(path); err == nil {
            volumes = append(volumes, Volume{
                Path: path,
                Name: fmt.Sprintf("存储卷 %d", i),
                Type: "system",
            })
        }
    }
    
    // USB 外置存储
    for i := 1; i <= 5; i++ {
        path := fmt.Sprintf("/volumeUSB%d", i)
        if _, err := os.Stat(path); err == nil {
            volumes = append(volumes, Volume{
                Path: path,
                Name: fmt.Sprintf("USB 存储 %d", i),
                Type: "usb",
            })
        }
    }
    
    return volumes
}
```

**前端实现：**
```typescript
// stores/volumes.ts
interface Volume {
  path: string
  name: string
  type: 'system' | 'usb' | 'network'
  totalSpace: number
  usedSpace: number
}

export const useVolumesStore = defineStore('volumes', () => {
  const volumes = ref<Volume[]>([])
  
  async function fetchVolumes() {
    const res = await fetchURL('/api/volumes')
    volumes.value = await res.json()
  }
  
  return { volumes, fetchVolumes }
})
```

### 2.2 Docker 挂载配置

```yaml
# docker-compose.custom.yml
services:
  filebrowser:
    volumes:
      - /volume1:/volume1:ro
      - /volume2:/volume2:ro          # 如有 volume2
      - /volumeUSB1:/volumeUSB1:ro    # 如有 USB 存储
      - /volumeSATA:/volumeSATA:ro    # 如有 SATA 存储
      - ./config:/config
      - ./database:/database
```

## 3. 目录分类系统设计

### 3.1 分类配置文件

```json
// config/categories.json
{
  "categories": [
    {
      "id": "personal",
      "name": "个人文件夹",
      "icon": "person",
      "color": "#4CAF50",
      "paths": [
        "/volume1/@home/*/HOME",
        "/volume1/@home/*/Desktop",
        "/volume1/@home/*/Documents",
        "/volume1/@home/*/Downloads",
        "/volume1/@home/*/Music",
        "/volume1/@home/*/Photos",
        "/volume1/@home/*/Videos"
      ]
    },
    {
      "id": "shared",
      "name": "共享文件夹",
      "icon": "group",
      "color": "#2196F3",
      "paths": [
        "/volume1/Download",
        "/volume1/Movie",
        "/volume1/Music",
        "/volume1/Photos",
        "/volume1/TV"
      ]
    },
    {
      "id": "system",
      "name": "系统文件夹",
      "icon": "settings",
      "color": "#FF9800",
      "paths": [
        "/volume1/@appstore",
        "/volume1/@docker",
        "/volume1/@home",
        "/volume1/@tmp",
        "/volume1/@upload"
      ]
    }
  ]
}
```

### 3.2 前端分类组件

```vue
<!-- components/VolumeSidebar.vue -->
<template>
  <div class="volume-sidebar">
    <div v-for="category in categories" :key="category.id" class="category-group">
      <div class="category-header" :style="{ color: category.color }">
        <v-icon>{{ category.icon }}</v-icon>
        <span>{{ category.name }}</span>
      </div>
      <div v-for="volume in getCategoryVolumes(category)" :key="volume.path" 
           class="volume-item" @click="navigateTo(volume.path)">
        <v-icon :color="category.color">folder</v-icon>
        <span>{{ volume.name }}</span>
        <span class="volume-size">{{ formatSize(volume.usedSpace) }} / {{ formatSize(volume.totalSpace) }}</span>
      </div>
    </div>
  </div>
</template>
```

## 4. 风险等级系统设计

### 4.1 风险等级配置

```json
// config/risk-levels.json
{
  "levels": [
    {
      "id": "high",
      "name": "高危",
      "color": "#F44336",
      "icon": "warning",
      "requireConfirmation": true,
      "paths": [
        "/volume1/@docker",
        "/volume1/@appstore",
        "/volume1/@home",
        "/volume1/@tmp",
        "/volume1/@upload",
        "/etc",
        "/usr",
        "/var"
      ]
    },
    {
      "id": "medium",
      "name": "中危",
      "color": "#FF9800",
      "icon": "info",
      "requireConfirmation": true,
      "paths": [
        "/volume1/Docker",
        "/volume1/@home/Kkwans",
        "/volume1/@search",
        "/volume1/@thumbnail"
      ]
    },
    {
      "id": "low",
      "name": "低危",
      "color": "#4CAF50",
      "icon": "check_circle",
      "requireConfirmation": false,
      "paths": [
        "/volume1/Download",
        "/volume1/Movie",
        "/volume1/Music",
        "/volume1/Photos",
        "/volume1/TV"
      ]
    }
  ]
}
```

### 4.2 前端风险标识

```vue
<!-- components/RiskBadge.vue -->
<template>
  <v-chip :color="riskLevel.color" size="small" variant="outlined">
    <v-icon left size="small">{{ riskLevel.icon }}</v-icon>
    {{ riskLevel.name }}
  </v-chip>
</template>

<script setup lang="ts">
const props = defineProps<{
  path: string
}>()

const riskLevel = computed(() => {
  return getRiskLevel(props.path)
})
</script>
```

### 4.3 高危操作确认对话框

```vue
<!-- components/ConfirmDialog.vue -->
<template>
  <v-dialog v-model="show" max-width="400">
    <v-card>
      <v-card-title class="headline">
        <v-icon color="warning">warning</v-icon>
        确认操作
      </v-card-title>
      <v-card-text>
        <p>您正在对<strong>高危目录</strong>执行操作：</p>
        <p class="file-path">{{ filePath }}</p>
        <p>此操作可能导致系统不稳定，请确认您了解后果。</p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn @click="cancel">取消</v-btn>
        <v-btn color="warning" @click="confirm">确认执行</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
```

## 5. 密码策略修改设计

### 5.1 Go 后端修改

**定位文件：** `users/users.go` 或 `auth/auth.go`

**修改方案：**
```go
// 修改前
func validatePassword(password string) error {
    if len(password) < 12 {
        return errors.New("password is too short, minimum length is 12")
    }
    if isTooEasy(password) {
        return errors.New("password is too easy")
    }
    return nil
}

// 修改后
func validatePassword(password string) error {
    if len(password) < 6 {
        return errors.New("密码太短，最少需要 6 位")
    }
    // 移除密码强度检查
    return nil
}
```

### 5.2 前端错误处理

```typescript
// utils/errors.ts
export function handleApiError(error: any) {
  if (error.status === 400) {
    if (error.message.includes('password')) {
      showError('密码不符合要求：' + error.message)
    }
  } else if (error.status === 401) {
    showError('未授权，请重新登录')
  } else if (error.status === 403) {
    showError('没有权限执行此操作')
  } else if (error.status === 404) {
    showError('请求的资源不存在')
  } else if (error.status === 500) {
    showError('服务器内部错误')
  }
}
```

## 6. 目录收藏功能设计

### 6.1 数据模型（后端数据库）

```go
// users/user.go - 扩展 User 结构体
type Favorite struct {
    ID        uint   `storm:"id,increment" json:"id"
    UserID    uint   `storm:"index" json:"userId"
    Path      string `storm:"unique" json:"path"
    Name      string `json:"name"
    Order     int    `json:"order"
    CreatedAt int64  `json:"createdAt"
}
```

### 6.2 存储方案（后端数据库 - BoltDB）

```go
// storage/favorites.go
type FavoriteStore interface {
    Get(userID uint) ([]*Favorite, error)
    GetByID(userID uint, favoriteID uint) (*Favorite, error)
    GetByPath(userID uint, path string) (*Favorite, error)
    Save(userID uint, favorite *Favorite) error
    Delete(userID uint, favoriteID uint) error
    DeleteByPath(userID uint, path string) error
    Reorder(userID uint, favorites []*Favorite) error
}

// 实现：使用 BoltDB 存储，与用户账号关联
type boltFavoriteStore struct {
    db *storm.DB
}

func (s *boltFavoriteStore) Get(userID uint) ([]*Favorite, error) {
    var favorites []*Favorite
    err := s.db.Find("UserID", userID, &favorites)
    if err != nil {
        return nil, err
    }
    // 按 Order 排序
    sort.Slice(favorites, func(i, j int) bool {
        return favorites[i].Order < favorites[j].Order
    })
    return favorites, nil
}

func (s *boltFavoriteStore) Save(userID uint, favorite *Favorite) error {
    favorite.UserID = userID
    if favorite.CreatedAt == 0 {
        favorite.CreatedAt = time.Now().Unix()
    }
    return s.db.Save(favorite)
}

func (s *boltFavoriteStore) Delete(userID uint, favoriteID uint) error {
    return s.db.DeleteStruct(&Favorite{ID: favoriteID, UserID: userID})
}
```

### 6.3 API 接口

```
GET    /api/favorites          # 获取当前用户的所有收藏
POST   /api/favorites          # 添加收藏（path, name）
DELETE /api/favorites/{id}     # 删除收藏
PUT    /api/favorites/reorder  # 重新排序（传入有序的 ID 列表）
```

### 6.4 前端实现

```typescript
// stores/favorites.ts
export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)
  
  // 从后端 API 加载（登录后自动调用）
  async function loadFavorites() {
    loading.value = true
    try {
      const res = await fetchURL('/api/favorites')
      favorites.value = await res.json()
    } finally {
      loading.value = false
    }
  }
  
  // 添加收藏（调用后端 API，数据持久化到数据库）
  async function addFavorite(path: string, name: string) {
    const res = await fetchURL('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ path, name })
    })
    const newFavorite = await res.json()
    favorites.value.push(newFavorite)
  }
  
  // 删除收藏（调用后端 API，从数据库删除）
  async function removeFavorite(id: number) {
    await fetchURL(`/api/favorites/${id}`, { method: 'DELETE' })
    favorites.value = favorites.value.filter(f => f.id !== id)
  }
  
  // 重新排序（调用后端 API，更新数据库）
  async function reorderFavorites(orderedIds: number[]) {
    await fetchURL('/api/favorites/reorder', {
      method: 'PUT',
      body: JSON.stringify({ order: orderedIds })
    })
    // 本地更新排序
    const map = new Map(favorites.value.map(f => [f.id, f]))
    favorites.value = orderedIds.map(id => map.get(id)!).filter(Boolean)
  }
  
  return { favorites, loading, loadFavorites, addFavorite, removeFavorite, reorderFavorites }
})
```

### 6.5 与账号关联

- 收藏数据存储在后端 BoltDB 数据库中
- 每条收藏记录关联 UserID
- 用户登录后自动加载其收藏数据
- 换浏览器、换设备，只要用同一账号登录，收藏数据都在

## 7. 目录标签功能设计

### 7.1 数据模型（后端数据库）

```go
// users/user.go - 扩展 User 结构体
type Tag struct {
    ID        uint     `storm:"id,increment" json:"id"
    UserID    uint     `storm:"index" json:"userId"
    Name      string   `json:"name"
    Color     string   `json:"color"
    Paths     []string `json:"paths"`  // 关联的路径列表
    CreatedAt int64    `json:"createdAt"
}
```

### 7.2 存储方案（后端数据库 - BoltDB）

```go
// storage/tags.go
type TagStore interface {
    Get(userID uint) ([]*Tag, error)
    GetByID(userID uint, tagID uint) (*Tag, error)
    GetByPath(userID uint, path string) ([]*Tag, error)
    Save(userID uint, tag *Tag) error
    Delete(userID uint, tagID uint) error
    AddPath(userID uint, tagID uint, path string) error
    RemovePath(userID uint, tagID uint, path string) error
}

// 实现：使用 BoltDB 存储，与用户账号关联
type boltTagStore struct {
    db *storm.DB
}

func (s *boltTagStore) Get(userID uint) ([]*Tag, error) {
    var tags []*Tag
    err := s.db.Find("UserID", userID, &tags)
    return tags, err
}

func (s *boltTagStore) Save(userID uint, tag *Tag) error {
    tag.UserID = userID
    if tag.CreatedAt == 0 {
        tag.CreatedAt = time.Now().Unix()
    }
    return s.db.Save(tag)
}

func (s *boltTagStore) GetByPath(userID uint, path string) ([]*Tag, error) {
    var allTags []*Tag
    err := s.db.Find("UserID", userID, &allTags)
    if err != nil {
        return nil, err
    }
    // 过滤出包含该路径的标签
    var result []*Tag
    for _, tag := range allTags {
        for _, p := range tag.Paths {
            if p == path {
                result = append(result, tag)
                break
            }
        }
    }
    return result, nil
}
```

### 7.3 API 接口

```
GET    /api/tags              # 获取当前用户的所有标签
POST   /api/tags              # 创建标签（name, color）
PUT    /api/tags/{id}         # 更新标签（name, color）
DELETE /api/tags/{id}         # 删除标签
POST   /api/tags/{id}/paths   # 给标签添加路径
DELETE /api/tags/{id}/paths   # 从标签移除路径
GET    /api/tags/path/{path}  # 获取指定路径的所有标签
```

### 7.4 前端实现

```typescript
// stores/tags.ts
export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)
  
  // 从后端 API 加载（登录后自动调用）
  async function loadTags() {
    loading.value = true
    try {
      const res = await fetchURL('/api/tags')
      tags.value = await res.json()
    } finally {
      loading.value = false
    }
  }
  
  // 创建标签（调用后端 API，数据持久化到数据库）
  async function createTag(name: string, color: string) {
    const res = await fetchURL('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name, color })
    })
    const newTag = await res.json()
    tags.value.push(newTag)
  }
  
  // 删除标签（调用后端 API，从数据库删除）
  async function deleteTag(id: number) {
    await fetchURL(`/api/tags/${id}`, { method: 'DELETE' })
    tags.value = tags.value.filter(t => t.id !== id)
  }
  
  // 给标签添加路径（调用后端 API，更新数据库）
  async function addPathToTag(tagId: number, path: string) {
    await fetchURL(`/api/tags/${tagId}/paths`, {
      method: 'POST',
      body: JSON.stringify({ path })
    })
    const tag = tags.value.find(t => t.id === tagId)
    if (tag && !tag.paths.includes(path)) {
      tag.paths.push(path)
    }
  }
  
  // 从标签移除路径（调用后端 API，更新数据库）
  async function removePathFromTag(tagId: number, path: string) {
    await fetchURL(`/api/tags/${tagId}/paths`, {
      method: 'DELETE',
      body: JSON.stringify({ path })
    })
    const tag = tags.value.find(t => t.id === tagId)
    if (tag) {
      tag.paths = tag.paths.filter(p => p !== path)
    }
  }
  
  return { tags, loading, loadTags, createTag, deleteTag, addPathToTag, removePathFromTag }
})
```

### 7.5 与账号关联

- 标签数据存储在后端 BoltDB 数据库中
- 每条标签记录关联 UserID
- 用户登录后自动加载其标签数据
- 换浏览器、换设备，只要用同一账号登录，标签数据都在

## 8. 实施计划

### Phase 1: 核心修复（2-3 小时）
1. Fork filebrowser 源码
2. 修改密码策略（Go 后端）
3. 错误信息汉化
4. 存储卷挂载配置
5. 重新构建镜像

### Phase 2: 目录分类 + 风险等级（4-6 小时）
1. 存储卷发现 API
2. 目录分类配置
3. 风险等级配置
4. 前端分类组件
5. 风险标识组件
6. 确认对话框

### Phase 3: 收藏 + 标签（3-4 小时）
1. 收藏功能实现
2. 标签功能实现
3. UI 集成
4. 测试验证
