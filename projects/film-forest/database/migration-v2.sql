-- =====================================================
-- 影视森林 数据库迁移脚本 v2
-- 日期: 2026-05-12
-- 说明: 补全字段 + 合并episode + 创建缺表
-- =====================================================

USE film_forest;

-- =====================================================
-- 1. 补全主表缺失字段
-- =====================================================

-- drama 缺 duration
ALTER TABLE drama ADD COLUMN duration INT COMMENT '单集片长（分钟）' AFTER release_date;

-- variety 缺 writer、score_imdb、duration
ALTER TABLE variety ADD COLUMN writer JSON COMMENT '编剧数组' AFTER director;
ALTER TABLE variety ADD COLUMN score_imdb DECIMAL(3,1) COMMENT 'IMDB评分' AFTER score_douban;
ALTER TABLE variety ADD COLUMN duration INT COMMENT '单期时长（分钟）' AFTER release_date;

-- anime 缺 score_imdb、duration
ALTER TABLE anime ADD COLUMN score_imdb DECIMAL(3,1) COMMENT 'IMDB评分' AFTER score_douban;
ALTER TABLE anime ADD COLUMN duration INT COMMENT '单集片长（分钟）' AFTER release_date;

-- short_drama 缺 score_douban、score_imdb
ALTER TABLE short_drama ADD COLUMN score_douban DECIMAL(3,1) COMMENT '豆瓣评分' AFTER storyline;
ALTER TABLE short_drama ADD COLUMN score_imdb DECIMAL(3,1) COMMENT 'IMDB评分' AFTER score_douban;

-- =====================================================
-- 2. 资源表补全 updated_at + is_deleted
-- =====================================================

-- resource_magnet
ALTER TABLE resource_magnet ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE resource_magnet ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除' AFTER updated_at;

-- resource_cloud
ALTER TABLE resource_cloud ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE resource_cloud ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除' AFTER updated_at;

-- resource_online
ALTER TABLE resource_online ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
ALTER TABLE resource_online ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除' AFTER updated_at;

-- =====================================================
-- 3. 合并 episode 到 resource_online
-- =====================================================

-- 3.1 给 resource_online 新增剧集字段
ALTER TABLE resource_online ADD COLUMN season INT DEFAULT 1 COMMENT '季' AFTER episode_id;
ALTER TABLE resource_online ADD COLUMN episode_number INT COMMENT '集号/期号' AFTER season;
ALTER TABLE resource_online ADD COLUMN episode_title VARCHAR(200) COMMENT '集标题' AFTER episode_number;

-- 3.2 迁移 episode 数据到 resource_online（如果有episode数据且resource_online里还没有）
-- 先检查：当前 resource_online 只有 1 条，episode 有 28013 条
-- episode 表的数据结构是 (content_type, content_id, season, episode_number, title)
-- resource_online 需要的是播放链接，两者数据性质不同
-- 实际上 episode 只是"第x集"的元信息，播放链接在 resource_online
-- 所以：把 episode 的元信息合并到 resource_online 对应记录中

-- 3.3 删除 resource_magnet / resource_cloud 的 episode_id 列
ALTER TABLE resource_magnet DROP COLUMN episode_id;
ALTER TABLE resource_cloud DROP COLUMN episode_id;

-- 3.4 删除旧 episode 表（数据迁移完后）
-- 先备份
CREATE TABLE IF NOT EXISTS episode_backup AS SELECT * FROM episode;
-- 删除外键索引引用后删表
DROP TABLE IF EXISTS episode;

-- =====================================================
-- 4. 用户表补全 is_deleted
-- =====================================================

ALTER TABLE user ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除' AFTER status;

-- =====================================================
-- 5. 创建缺失的表
-- =====================================================

-- system_setting
CREATE TABLE IF NOT EXISTS system_setting (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键名',
    setting_value   TEXT COMMENT '设置值',
    description     VARCHAR(200) COMMENT '设置说明',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

INSERT IGNORE INTO system_setting (setting_key, setting_value, description) VALUES
('site_name', '影视森林', '站点名称'),
('site_desc', '影视资源聚合平台', '站点描述'),
('copyright', '© 2026 影视森林. 仅供学习交流.', '版权信息'),
('notify_on_complete', 'true', '爬取完成通知'),
('notify_on_error', 'false', '错误告警通知');

-- resource_source
CREATE TABLE IF NOT EXISTS resource_source (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '来源名称',
    url             VARCHAR(500) COMMENT '来源链接',
    enabled         TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：0-禁用 1-启用',
    sort            INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源来源配置表';

INSERT IGNORE INTO resource_source (name, url, enabled, sort) VALUES
('七味网', 'https://pkmp4.xyz', 1, 1),
('天堂资源', '#', 0, 2),
('非凡资源', '#', 0, 3);

-- =====================================================
-- 6. 爬虫相关表补全 is_deleted（可选，日志表不需要）
-- =====================================================

-- crawler_schedule 加 is_deleted
ALTER TABLE crawler_schedule ADD COLUMN is_deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除' AFTER updated_at;

-- =====================================================
-- 完成
-- =====================================================
SELECT 'Migration v2 completed!' AS result;
