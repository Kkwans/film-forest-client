# 七味网接口梳理文档

> 创建时间: 2026-05-11 02:24
> 最后更新: 2026-05-11 02:30
> 状态: 完成

---

## 一、站点概况

- **域名**: pkmp4.xyz（备用: qn63.com）
- **CMS**: MACCMS（PHP 影视管理系统）
- **编码**: UTF-8
- **渲染**: 服务端渲染（SSR），无 SPA/JS 动态加载
- **HTTPS**: 支持
- **UA**: 标准浏览器 UA 即可（`Mozilla/5.0 ... Chrome/120`）

---

## 二、URL 规则

### 2.1 首页
- **URL**: `https://www.pkmp4.xyz/`
- **内容**: 各分类推荐（电影/剧集/综艺/动漫），每类约 20 条
- **数据字段**: 标题、海报、年份、地区、类型、语言、评分

### 2.2 列表页（分类）
| 分类 | URL | type ID |
|------|-----|---------|
| 电影 | `/vt/1.html` | 1 |
| 剧集 | `/vt/2.html` | 2 |
| 综艺 | `/vt/3.html` | 3 |
| 动漫 | `/vt/4.html` | 4 |
| 短剧 | `/vt/30.html` | 30 |

**分页规则**: `/vt/{type}-{page}.html`（第2页起）
- 例: `/vt/1-2.html`（电影第2页）

**列表页数据字段**:
- 标题（`<a>` 文本）
- 详情链接（`/mv/{id}.html`）
- 年份、地区、类型、语言、评分（从文本解析）
- 海报图（部分页面有）

### 2.3 详情页
- **URL**: `/mv/{id}.html`
- **ID**: 纯数字，站点全局唯一
- **示例**: `/mv/490613.html`（挽救计划）

**详情页 HTML 结构**（核心选择器）:

| 字段 | CSS 选择器 | 说明 |
|------|-----------|------|
| 标题 | `h1` | 文本，可能包含 `(年份)` 后缀 |
| 海报 | `div.img img` | `src` 属性 |
| 年份 | `h1` 内 `span.year` 或文本中的 `(YYYY)` | 正则提取 |
| 导演 | `span:contains(导演：)` 后续 `<a>` | 跨 div 提取 |
| 主演 | `span:contains(主演：)` 后续 `<a>` | 跨 div 提取，可能跨多个 div |
| 类型 | `a[href^='/ms/1---']` | 从分类链接提取文本 |
| 地区 | `a[href^='/ms/1-{region}']` | 已知地区集合匹配 |
| 语言 | `a[href^='/ms/1----']` | 从分类链接提取 |
| 评分 | `a[href*=douban]` / `a[href*=imdb]` / `a[href*=rottentomatoes]` | 文本中提取数字 |
| 剧情 | `.movie-introduce p` | `.zkjj_a` (折叠) / `.sqjj_a` (展开) |
| 上映日期 | 文本匹配 `上映：` | 非结构化文本 |
| 片长 | 文本匹配 `片长：` | 如 `156分钟` |
| 又名 | 文本匹配 `又名：` | 斜杠分隔 |

**播放源结构**:
- 容器: `#url` 内的 `div.sBox`
- 源标签: `ul.py-tabs li`（天堂/非凡/如意/量子等）
- 播放链接: `a[href^=/py/]`
  - URL 格式: `/py/{contentId}-{sourceId}-{episodeNum}.html`
  - 文本: `第01集`、`第02集` 等

**资源链接**:
- 磁力链接: `a[href^=magnet:]`
- 网盘链接: `a[href*=pan.baidu]` / `a[href*=quark]` / `a[href*=lanzou]`

### 2.4 搜索页
- **URL**: `/vs/-------------.html?wd={关键词}`
- **⚠️ 反爬**: 搜索页有**验证码**拦截（`安全验证...请输入验证码`）
- **结论**: 搜索功能**不适合自动化爬取**，建议通过列表页遍历

### 2.5 分类筛选页
- **URL**: `/ms/{typeId}---{genre}--------.html`
- **示例**: `/ms/1---剧情--------.html`（电影-剧情）
- **类型 ID**: 1=电影, 2=剧集, 3=综艺, 4=动漫

---

## 三、数据字段映射（pkmp4 → film_forest DB）

### 3.1 Movie 表
| DB 字段 | pkmp4 来源 | 提取方式 |
|---------|-----------|---------|
| id | URL `/mv/{id}.html` | 正则 `(\d+)` |
| title | `<h1>` 文本 | 去除年份后缀 |
| poster_url | `div.img img[src]` | 属性值 |
| year | h1 或 `.year` span | 正则 `(19\|20)\d{2}` |
| storyline | `.movie-introduce p` | textContent，去除展开/收起 |
| actor | 主演区域 `<a>` | 跨 div 提取 |
| director | 导演区域 `<a>` | 跨 div 提取 |
| genre | `/ms/1---{genre}` 链接 | 文本提取 |
| region | `/ms/1-{region}` 链接 | 已知地区匹配 |
| score_douban | `a[href*=douban]` 文本 | 正则数字 |
| status | 固定 1 | 新入库默认上线 |

### 3.2 Drama / Variety / Anime / ShortDrama 表
同 Movie 结构，额外字段：
| DB 字段 | pkmp4 来源 |
|---------|-----------|
| total_episode | 从播放链接数量推断 |

### 3.3 Episode 表
| DB 字段 | pkmp4 来源 |
|---------|-----------|
| content_type | 来源类型 |
| content_id | 关联内容 ID |
| season | 固定 1 |
| episode_number | 从 `/py/{id}-{src}-{ep}.html` 提取 |
| title | `第{N}集` 文本 |

### 3.4 ResourceMagnet 表
| DB 字段 | pkmp4 来源 |
|---------|-----------|
| magnet_url | `a[href^=magnet:][href]` |
| title | 链接文本 |
| resolution | 从文本匹配 4K/1080P/720P |

### 3.5 ResourceOnline 表
| DB 字段 | pkmp4 来源 |
|---------|-----------|
| source_url | `a[href*=player]` 或 `/play/` 链接 |
| source_name | 链接文本 |

---

## 四、反爬机制分析

### 4.1 已确认的反爬措施

| 机制 | 严重程度 | 影响范围 | 应对方案 |
|------|---------|---------|---------|
| **搜索验证码** | 🔴 高 | `/vs/` 搜索页 | 不使用搜索接口，通过列表页遍历 |
| **JS 统计脚本** | 🟢 低 | 全站 | 不影响爬取 |
| **无 CloudFlare** | ✅ 无 | - | 直连即可 |
| **无频率限制（观察）** | ✅ 低 | - | 建议保持 1-2s 间隔 |

### 4.2 代理配置
- CrawlerCore 已配置代理 `127.0.0.1:7890`（可选）
- 代理不可用时自动降级为直连
- 建议：直连即可，代理作为备用

### 4.3 建议爬取策略
1. **列表页遍历**：通过 `/vt/{type}-{page}.html` 逐页抓取，不使用搜索
2. **请求间隔**：1000-2000ms（已配置 `rateLimitMs`）
3. **User-Agent**：使用标准浏览器 UA（已配置）
4. **增量更新**：通过 contentId 判断新增/更新
5. **详情页去重**：同一列表页中可能有重复链接，需 Set 去重

---

## 五、当前 CrawlerCore 代码与实际页面结构对比

### 5.1 ✅ 已正确适配的部分
- URL 规则（`/vt/`, `/mv/`, 分页）
- 标题提取（`h1`）
- 内容 ID 提取（正则）
- 磁力链接提取（`a[href^=magnet:]`）
- 剧集提取（`a[href^=/py/]`）
- 代理自动降级

### 5.2 ⚠️ 需要注意的部分
- **海报选择器**: 代码用 `div.li-img img`，实际页面是 `div.img img`（首页详情页）— 但 `div.img img` 在首页 HTML 中确认存在
- **评分提取**: 当前 `extractScore()` 使用 `.score` 选择器，实际页面评分在 `a[href*=douban]` 内 — `extractScoreFromDescription()` 是正确的 fallback
- **类型提取**: `extractGenresFromTags()` 使用 `a[href^='/ms/1--']`，实际链接格式是 `/ms/1---剧情--------.html`，选择器需要匹配 `/ms/1---`
- **播放源 tab**: 页面有多个播放源（天堂/非凡/如意/量子），当前代码只提取了部分

### 5.3 ❌ 可能有问题的部分
- **剧集详情页**: `web_fetch` 返回的剧集详情页（如 `/mv/477049.html`）被 readability 提取为侧边栏内容，而非主体内容 — 说明详情页的 HTML 结构可能有干扰内容，需要用 raw HTML 解析
- **短剧列表页**: `web_fetch` 返回了导航栏内容而非列表，说明短剧页面结构可能有差异

---

## 六、爬取范围建议

### 优先级排序
1. **电影** (type=1): 数据量最大，优先覆盖
2. **剧集** (type=2): 有剧集/分集结构
3. **动漫** (type=4): 类似剧集
4. **综艺** (type=3): 类似剧集
5. **短剧** (type=30): 新增分类，数据量较小

### 预估数据量
- 电影: 数千部
- 剧集: 数千部
- 动漫: 数百部
- 综艺: 数百部
- 短剧: 数十部

---

## 七、关键 URL 速查表

```
首页:     https://www.pkmp4.xyz/
电影列表: https://www.pkmp4.xyz/vt/1.html       分页: /vt/1-{n}.html
剧集列表: https://www.pkmp4.xyz/vt/2.html       分页: /vt/2-{n}.html
综艺列表: https://www.pkmp4.xyz/vt/3.html       分页: /vt/3-{n}.html
动漫列表: https://www.pkmp4.xyz/vt/4.html       分页: /vt/4-{n}.html
短剧列表: https://www.pkmp4.xyz/vt/30.html      分页: /vt/30-{n}.html
详情页:   https://www.pkmp4.xyz/mv/{id}.html
搜索:     https://www.pkmp4.xyz/vs/-------------.html?wd={kw}  ⚠️有验证码
分类:     https://www.pkmp4.xyz/ms/{type}---{genre}--------.html
```

---

## 八、详情页原始 HTML 结构验证（第三轮）

## 九、短剧详情页结构验证（第四轮）

> 使用 curl 抓取 `/mv/499148.html`（极品神瞳）验证短剧页面结构

### 9.1 类型/地区/语言链接（⚠️ 与电影/剧集不同！）
```html
<!-- 类型: type ID = 30（非 1） -->
<a href="/ms/30---现代都市--------.html">现代都市</a>

<!-- 地区: type ID = 30 -->
<a href="/ms/30-中国大陆----------.html">中国大陆</a>

<!-- 语言: 空 -->
<a href="/ms/30-----------.html"></a>
```
- ⚠️ **关键发现**: 短剧的 type ID 是 30，不是 1
- CrawlerCore 的 `a[href^='/ms/1--']` 选择器**无法匹配**短剧类型链接
- 短剧类型标签使用 MACCMS 特有分类: "现代都市" / "女频恋爱" / "古装仙侠" 等
- 短剧无评分信息

### 9.2 列表页数据格式
短剧列表页每条数据:
- 标题 + 详情链接
- 年份 + 地区 + 类型（无语言、无评分）
- 类型标签: "现代都市" / "女频恋爱" / "古装仙侠"（非标准电影类型）
- 当前数据量: 约 6 条

---

## 八、详情页原始 HTML 结构验证（第三轮）

> 使用 curl 抓取 `/mv/490613.html`（挽救计划）原始 HTML 验证

### 8.1 海报
```html
<div class="img">
  <img src="https://i1.vvmp4.com/upload/vod/20260323-1/6f4863d8f9cea37641c716131d6511d2.jpg" width="100%" alt="挽救计划" height="360px">
</div>
```
- ✅ 选择器 `div.img img` 正确
- 图片 CDN: `i1.vvmp4.com`

### 8.2 标题 + 年份
```html
<h1>挽救计划<span class="year">(2026)</span></h1>
```
- ✅ `h1` 文本含年份括号
- ✅ `span.year` 可单独提取年份

### 8.3 导演/主演/类型/地区/语言
```html
<div><span>导演：</span><a href="/vs/-----菲尔·罗德--------.html">菲尔·罗德</a> / <a ...>克里斯托弗·米勒</a></div>
<div class="text-overflow"><span>主演：</span><a href="/vs/-瑞恩·高斯林------------.html">瑞恩·高斯林</a> / <a ...>桑德拉·惠勒</a> / ...
<div><span>类型：</span><a href="/ms/1---剧情--------.html">剧情</a> / <a href="/ms/1---科幻--------.html">科幻</a> / ...
<div><span>地区：</span><a href="/ms/1-美国----------.html">美国</a></div>
<div><span>语言：</span><a href="/ms/1----英语-------.html">英语</a></div>
```
- ✅ 导演/主演用 ` / ` 分隔的 `<a>` 标签
- ✅ 类型链接格式 `/ms/1---{genre}--------.html`
- ✅ 地区链接格式 `/ms/1-{region}----------.html`
- ✅ 语言链接格式 `/ms/1----{lang}-------.html`

### 8.4 评分
```html
<div><span>评分：</span>
  <a href="https://movie.douban.com/subject/35010610" target="_blank">
    <span style="color: green;">豆瓣 8.6</span>
  </a> /
  <a href="https://www.imdb.com/title/tt12042730/" target="_blank">
    <span style="color: #dba400;">IMDB 8.3</span>
  </a> /
  <a href="https://www.rottentomatoes.com/m/project_hail_mary/" target="_blank">
    <span style="color: #ff5b5b;">烂番茄 94%</span>
  </a>
</div>
```
- ✅ 评分在 `a[href*=douban/imdb/rottentomatoes]` 内
- ⚠️ 旧代码 `.score` 选择器完全失效，已修复

### 8.5 剧情简介
```html
<div class="movie-introduce">
  <p class="zkjj_a">太阳正在被"吃"掉...<span class="zk_jj">[展开全部]</span></p>
  <p class="sqjj_a" style="display: none;">完整剧情...<span class="sq_jj">[收起部分]</span></p>
</div>
```
- ✅ `.zkjj_a` 为折叠版（截断），`.sqjj_a` 为展开版（完整）
- 建议优先取 `.sqjj_a`，fallback 到 `.zkjj_a`

### 8.6 播放源
```html
<ul class="py-tabs">
  <li class="on">天堂<div>2</div></li>
  <li>非凡<div>2</div></li>
  <li>如意<div>1</div></li>
  <li>量子<div>1</div></li>
  <li>牛牛<div>2</div></li>
  <li>无尽<div>1</div></li>
  <li>光速<div>2</div></li>
  <li>红牛<div>1</div></li>
</ul>
```
- 8 个播放源（比之前发现的 4 个多）
- 每个源下有 N 个播放链接

### 8.7 播放链接
```html
<ul class="player ckp gdt bf-w">
  <li><a href="/py/490613-3-1.html" target="_blank">HD中字</a></li>
  <li><a href="/py/490613-3-2.html" target="_blank">HD国语</a></li>
</ul>
```
- URL 格式: `/py/{contentId}-{sourceId}-{episodeNum}.html`
- 文本: `HD中字`、`HD国语`、`HC中字`、`TC`、`HD`、`正片`、`正片[国语]`

### 8.8 磁力下载
```html
<div class="down-link">
  <ul class="nav-tabs tab-title">
    <li class="title" id="tab-1">1080P</li>
    <li class="title" id="tab-2">中字1080P</li>
    <li class="title" id="tab-3">中字4K</li>
  </ul>
  <ul class="gdt content">
    <li class="down-list2">
      <a href="magnet:?xt=urn:btih:...&dn=...mkv" title="...mkv[18.68G]">...mkv[18.68G]</a>
      <a href="magnet:?xt=..." class="url-1">磁力下载</a>
    </li>
  </ul>
</div>
```
- 磁力链接分组: 1080P / 中字1080P / 中字4K
- 文件名含分辨率和大小信息

### 8.9 网盘下载
```html
<ul class="nav-tabs tab-title">
  <li>百度网盘</li>
  <li>夸克网盘</li>
  <li>迅雷网盘</li>
  <li>阿里网盘</li>
  <li>UC网盘</li>
  <li>123网盘</li>
</ul>
```
- 6 种网盘类型
- 链接格式: `https://pan.baidu.com/s/...?pwd=...`

### 8.10 其他字段
```html
<div><span>上映：</span>2026-03-20(美国/中国大陆) / 2026-03-18(中国台湾)</div>
<div><span>片长：</span>156分钟</div>
<div><span>又名：</span>极限返航(台) / 末日圣母号(港) / 孤注一掷 / 万福玛利亚计划</div>
```
- 上映日期、片长、又名均为非结构化文本

### 8.11 ⚠️ web_fetch 与 raw HTML 差异
- `web_fetch` 使用 readability 提取器，会提取侧边栏"热门剧情片"而非主体内容
- **结论**: 爬虫必须用 Jsoup 直接解析 raw HTML，不能依赖 readability


## 十、分类列表页数据格式对比（第五轮验证）

> 使用 web_fetch 抓取全部 5 个分类列表页确认数据格式

### 10.1 各分类每条数据的字段

| 分类 | 标题 | 评分 | 年份 | 地区 | 类型 | 语言 | 每页条数 |
|------|------|------|------|------|------|------|---------|
| 电影 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~32 |
| 剧集 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~22 |
| 综艺 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~21 |
| 动漫 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ~19 |
| 短剧 | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ~6 |

### 10.2 综艺类型标签特殊分类

综艺列表中的类型标签除了标准分类外，还有 MACCMS 特有的地域前缀分类：
- "大陆综艺" — 非标准类型，实为中国大陆出品的综艺
- "日韩综艺" — 日本/韩国综艺
- "港台综艺" — 香港/台湾综艺
- 标准类型仍然存在: "真人秀"、"纪录"、"美食"

这些标签会被 `extractGenresFromTags()` 正常提取，作为类型字段的一部分。语义上 "大陆综艺" 既是类型也是地区暗示，但在 MACCMS 体系中它被当作分类标签处理。

### 10.3 动漫类型标签特殊分类

动漫列表中类似：
- "国产动漫" — 中国大陆动漫
- "日韩动漫" — 日本/韩国动漫
- 标准类型: "战斗"、"热血"、"奇幻"、"冒险"、"搞笑"

### 10.4 短剧数据特点

短剧（type=30）是 MACCMS 较新的分类：
- 数据量极少（当前仅 6 条）
- 类型标签使用 MACCMS 短剧特有分类: "现代都市"、"女频恋爱"、"古装仙侠"
- **无评分信息**（站点不提供短剧评分）
- **无语言信息**
- 分类链接格式: `/ms/30---{类型}--------.html`

### 10.5 结论

- 七味网接口梳理**已完成**，所有页面结构和数据字段已确认
- 反爬机制已确认：仅搜索页有验证码，其他页面可直接爬取
- 现有 CrawlerCore 选择器经过 4 轮修复已能正确处理所有 5 种内容类型
- 建议后续新增爬取源时参照此文档的 URL 规则和选择器
