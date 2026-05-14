# DB-DESIGN -- 影视森林数据库设计文档

> 基于 https://www.pkmp4.xyz/ 七味网调研后重新设计
> 修订时间：2026-05-12

## 一、设计原则

1. 按类型分表：电影/剧集/综艺/动漫/短剧各一张主表，字段按需定制
2. 字典表只做参考：content_type 不做外键约束，仅供下拉选择
3. **全表统一基础字段**：created_at / updated_at / is_deleted（通过 AOP 自动填充）
4. 在线播放资源：第三方网站嵌入播放源
5. 资源统一管理：磁力表、网盘表、在线源表统一通过 content_id 关联
6. **episode 表已废弃**（2026-05-12）：剧集信息合并入 resource_online 表

## 二、字典表（仅供参考，不做外键）

content_type -- 内容类型字典
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 主键 |
| name | VARCHAR(20) | 类型名称 |
| code | VARCHAR(20) | 类型代码 |
| sort | INT | 排序 |

code: movie=电影, drama=剧集, variety=综艺, anime=动漫, short=短剧

## 三、主表设计

### movie -- 电影表
id / title / alias(JSON) / poster_url / year / director(JSON) / writer(JSON) / actor(JSON) / genre(JSON) / region(JSON) / language(JSON) / release_date / duration / storyline / score_douban / score_imdb / score_rt / series_name / series_order / status / is_deleted / created_at / updated_at

### drama -- 电视剧表
id / title / alias(JSON) / poster_url / year / director(JSON) / writer(JSON) / actor(JSON) / genre(JSON) / region(JSON) / language(JSON) / release_date / **duration** / total_episode / storyline / score_douban / score_imdb / status / is_deleted / created_at / updated_at

### variety -- 综艺表
id / title / alias(JSON) / poster_url / year / director(JSON) / **writer(JSON)** / actor(JSON) / genre(JSON) / region(JSON) / language(JSON) / release_date / **duration** / total_episode / storyline / score_douban / **score_imdb** / status / is_deleted / created_at / updated_at

### anime -- 动漫表
id / title / alias(JSON) / poster_url / year / director(JSON) / writer(JSON) / actor(JSON) / genre(JSON) / region(JSON) / language(JSON) / release_date / **duration** / total_episode / storyline / score_douban / **score_imdb** / status / is_deleted / created_at / updated_at

### short_drama -- 短剧表
id / title / alias(JSON) / poster_url / year / director(JSON) / actor(JSON) / genre(JSON) / region(JSON) / language(JSON) / release_date / total_episode / duration / storyline / **score_douban** / **score_imdb** / status / is_deleted / created_at / updated_at

## 四、资源表设计

### resource_online -- 在线播放资源表（含剧集信息）
id / content_type / content_id / **season** / **episode_number** / **episode_title** / source_name / source_url / sort / created_at / **updated_at** / **is_deleted**

> 原 episode 表已合并入此表，播放链接直接关联集信息

### resource_magnet -- 磁力链接表
id / content_type / content_id / title / magnet_url / resolution / has_subtitle / is_special_sub / sort / created_at / **updated_at** / **is_deleted**

> 已移除 episode_id（磁力按内容级别存储，不按集）

### resource_cloud -- 网盘链接表
id / content_type / content_id / disk_type / title / url / password / sort / created_at / **updated_at** / **is_deleted**

> 已移除 episode_id（网盘按内容级别存储，不按集）

## 五、系统表设计

### system_setting -- 系统设置表
id / setting_key / setting_value / description / created_at / updated_at

### resource_source -- 资源来源配置表
id / name / url / enabled / sort / created_at / updated_at

### crawler_schedule -- 爬虫定时配置表
id / name / content_type / source_site / enabled / cron_expression / batch_size / rate_limit_ms / priority / genre_filter / status / last_run_time / next_run_time / total_runs / total_items / **is_deleted** / created_at / updated_at

### crawler_task_log -- 爬虫任务日志表（不需要 is_deleted）
id / schedule_id / schedule_name / content_type / status / items_crawled / items_added / items_updated / error_message / duration_ms / started_at / finished_at

## 六、用户表设计

### user -- 用户表
id / username / email / phone / password_hash / nickname / avatar_url / status / **is_deleted** / created_at / updated_at

### user_movie_list -- 用户片单表
id / user_id / name / type / description / is_default / created_at / updated_at

### user_movie_list_item -- 片单明细表
id / list_id / movie_id / content_type / rating / note / added_at / updated_at

## 七、v2 -> v3 变更记录 (2026-05-12)

| 变更 | 说明 |
|------|------|
| episode 表废弃 | 剧集信息合并入 resource_online，原数据备份到 episode_backup |
| resource_online +season/episode_number/episode_title | 替代 episode 表功能 |
| resource_magnet/cloud -episode_id | 磁力/网盘按内容级别存储，不按集 |
| drama +duration | 七味网有片长数据 |
| variety +writer/score_imdb/duration | 补全缺失字段 |
| anime +score_imdb/duration | 补全缺失字段 |
| short_drama +score_douban/score_imdb | 补全缺失字段 |
| 全资源表 +updated_at +is_deleted | 统一基础字段 |
| user +is_deleted | 逻辑删除支持 |
| crawler_schedule +is_deleted | 逻辑删除支持 |
| 新增 system_setting | 系统配置表 |
| 新增 resource_source | 资源来源配置表 |

## 八、当前状态

- [x] 数据库设计 v3 完成
- [x] 建表 SQL 导入（15 张表 + 1 备份表）
- [x] Java 实体类同步更新（client-server + admin-server）
- [x] CrawlerCore 改用 resource_online 存储剧集播放链接
- [x] 资源服务层去掉 episodeId，改用 season/episodeNumber
- [x] 七味网(pkmp4.xyz)调研完成
- [ ] SpringBoot 后端脚手架 + 基础 CRUD API（部分完成）
- [ ] 前端子系统（管理端 + 用户端）
- [ ] 爬虫开发（对接外部资源站）
