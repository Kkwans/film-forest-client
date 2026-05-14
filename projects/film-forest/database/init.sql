-- =====================================================
-- 影视森林 (film-forest) 数据库建表脚本 v3
-- 更新: 2026-05-12
-- 变更: episode合并入resource_online, 全表统一created_at/updated_at/is_deleted
-- MySQL 8.0
-- =====================================================

CREATE DATABASE IF NOT EXISTS film_forest DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE film_forest;

-- -------------------------------------------------------
-- 字典表：内容类型（仅供参考，不做外键约束）
-- -------------------------------------------------------
CREATE TABLE content_type (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(20) NOT NULL COMMENT '类型名称',
    code    VARCHAR(20) NOT NULL UNIQUE COMMENT '类型代码',
    sort    INT NOT NULL DEFAULT 0 COMMENT '排序'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='内容类型字典';

INSERT INTO content_type (name, code, sort) VALUES
('电影',   'movie',   1),
('剧集',   'drama',   2),
('综艺',   'variety', 3),
('动漫',   'anime',   4),
('短剧',   'short',   5);

-- -------------------------------------------------------
-- 1. 电影表 (movie)
-- -------------------------------------------------------
CREATE TABLE movie (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL COMMENT '中文名/标题',
    alias           JSON COMMENT '别名数组',
    poster_url      VARCHAR(500) COMMENT '封面URL',
    year            INT COMMENT '年份',
    director        JSON COMMENT '导演数组',
    writer          JSON COMMENT '编剧数组',
    actor           JSON COMMENT '主演数组',
    genre           JSON COMMENT '类型数组（有顺序）',
    region          JSON COMMENT '地区数组',
    language        JSON COMMENT '语言数组',
    release_date    VARCHAR(100) COMMENT '上映日期',
    duration        INT COMMENT '片长（分钟）',
    storyline       TEXT COMMENT '简介',
    score_douban    DECIMAL(3,1) COMMENT '豆瓣评分',
    score_imdb      DECIMAL(3,1) COMMENT 'IMDB评分',
    score_rt        DECIMAL(3,1) COMMENT '烂番茄评分(%)',
    series_name     VARCHAR(200) COMMENT '系列名称',
    series_order    INT COMMENT '系列序号',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-可播放',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_title (title(100)),
    INDEX idx_series (series_name),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电影表';

-- -------------------------------------------------------
-- 2. 电视剧表 (drama)
-- -------------------------------------------------------
CREATE TABLE drama (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL COMMENT '中文名/标题',
    alias           JSON COMMENT '别名数组',
    poster_url      VARCHAR(500) COMMENT '封面URL',
    year            INT COMMENT '年份',
    director        JSON COMMENT '导演数组',
    writer          JSON COMMENT '编剧数组',
    actor           JSON COMMENT '主演数组',
    genre           JSON COMMENT '类型数组',
    region          JSON COMMENT '地区数组',
    language        JSON COMMENT '语言数组',
    release_date    VARCHAR(100) COMMENT '首播日期',
    duration        INT COMMENT '单集片长（分钟）',
    total_episode   INT COMMENT '总集数',
    storyline       TEXT COMMENT '简介',
    score_douban    DECIMAL(3,1) COMMENT '豆瓣评分',
    score_imdb      DECIMAL(3,1) COMMENT 'IMDB评分',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态：1-更新中 2-已完结',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_title (title(100)),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电视剧表';

-- -------------------------------------------------------
-- 3. 综艺表 (variety)
-- -------------------------------------------------------
CREATE TABLE variety (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL COMMENT '中文名/标题',
    alias           JSON COMMENT '别名数组',
    poster_url      VARCHAR(500) COMMENT '封面URL',
    year            INT COMMENT '年份',
    director        JSON COMMENT '导演/制作人数组',
    writer          JSON COMMENT '编剧数组',
    actor           JSON COMMENT '嘉宾/主持数组',
    genre           JSON COMMENT '类型数组',
    region          JSON COMMENT '地区数组',
    language        JSON COMMENT '语言数组',
    release_date    VARCHAR(100) COMMENT '首播日期',
    duration        INT COMMENT '单期时长（分钟）',
    total_episode   INT COMMENT '总期数',
    storyline       TEXT COMMENT '简介',
    score_douban    DECIMAL(3,1) COMMENT '豆瓣评分',
    score_imdb      DECIMAL(3,1) COMMENT 'IMDB评分',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_title (title(100)),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='综艺表';

-- -------------------------------------------------------
-- 4. 动漫表 (anime)
-- -------------------------------------------------------
CREATE TABLE anime (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL COMMENT '中文名/标题',
    alias           JSON COMMENT '别名数组',
    poster_url      VARCHAR(500) COMMENT '封面URL',
    year            INT COMMENT '年份',
    director        JSON COMMENT '导演数组',
    writer          JSON COMMENT '编剧数组',
    actor           JSON COMMENT '配音演员数组',
    genre           JSON COMMENT '类型数组',
    region          JSON COMMENT '地区数组',
    language        JSON COMMENT '语言数组',
    release_date    VARCHAR(100) COMMENT '首播日期',
    duration        INT COMMENT '单集片长（分钟）',
    total_episode   INT COMMENT '总集数',
    storyline       TEXT COMMENT '简介',
    score_douban    DECIMAL(3,1) COMMENT '豆瓣评分',
    score_imdb      DECIMAL(3,1) COMMENT 'IMDB评分',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_title (title(100)),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='动漫表';

-- -------------------------------------------------------
-- 5. 短剧表 (short_drama)
-- -------------------------------------------------------
CREATE TABLE short_drama (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(200) NOT NULL COMMENT '中文名/标题',
    alias           JSON COMMENT '别名数组',
    poster_url      VARCHAR(500) COMMENT '封面URL',
    year            INT COMMENT '年份',
    director        JSON COMMENT '导演数组',
    actor           JSON COMMENT '主演数组',
    genre           JSON COMMENT '类型数组',
    region          JSON COMMENT '地区数组',
    language        JSON COMMENT '语言数组',
    release_date    VARCHAR(100) COMMENT '上映日期',
    total_episode   INT COMMENT '总集数',
    duration        INT COMMENT '单集片长（分钟）',
    storyline       TEXT COMMENT '简介',
    score_douban    DECIMAL(3,1) COMMENT '豆瓣评分',
    score_imdb      DECIMAL(3,1) COMMENT 'IMDB评分',
    status          TINYINT NOT NULL DEFAULT 1 COMMENT '状态',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_year (year),
    INDEX idx_title (title(100)),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='短剧表';

-- -------------------------------------------------------
-- 6. 在线播放资源表 (resource_online) — 含剧集信息
-- -------------------------------------------------------
CREATE TABLE resource_online (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content_type    VARCHAR(20) NOT NULL COMMENT '内容类型',
    content_id      BIGINT UNSIGNED NOT NULL COMMENT '关联主表ID',
    season          INT DEFAULT 1 COMMENT '季',
    episode_number  INT COMMENT '集号/期号',
    episode_title   VARCHAR(200) COMMENT '集标题',
    source_name     VARCHAR(50) NOT NULL COMMENT '播放源名称',
    source_url      TEXT NOT NULL COMMENT '第三方播放链接',
    sort            INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_content (content_type, content_id),
    INDEX idx_episode (season, episode_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='在线播放资源表';

-- -------------------------------------------------------
-- 7. 磁力链接表 (resource_magnet)
-- -------------------------------------------------------
CREATE TABLE resource_magnet (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content_type    VARCHAR(20) NOT NULL COMMENT '内容类型',
    content_id      BIGINT UNSIGNED NOT NULL COMMENT '关联主表ID',
    title           VARCHAR(200) COMMENT '显示标题',
    magnet_url      TEXT NOT NULL COMMENT '磁力链接',
    resolution      VARCHAR(20) COMMENT '清晰度：4K/1080P/720P/480P',
    has_subtitle    TINYINT NOT NULL DEFAULT 0 COMMENT '是否有中字：0-无 1-有',
    is_special_sub  TINYINT NOT NULL DEFAULT 0 COMMENT '是否特效字幕：0-否 1-是',
    sort            INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_content (content_type, content_id),
    INDEX idx_resolution (resolution),
    INDEX idx_subtitle (has_subtitle),
    INDEX idx_special_sub (is_special_sub)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='磁力链接表';

-- -------------------------------------------------------
-- 8. 网盘链接表 (resource_cloud)
-- -------------------------------------------------------
CREATE TABLE resource_cloud (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content_type    VARCHAR(20) NOT NULL COMMENT '内容类型',
    content_id      BIGINT UNSIGNED NOT NULL COMMENT '关联主表ID',
    disk_type       VARCHAR(20) NOT NULL COMMENT '网盘类型：baidu/ali/xunlei/uc/quark/123',
    title           VARCHAR(200) COMMENT '显示标题',
    url             TEXT NOT NULL COMMENT '网盘链接',
    password        VARCHAR(50) COMMENT '提取码',
    sort            INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    INDEX idx_content (content_type, content_id),
    INDEX idx_disk_type (disk_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='网盘链接表';

-- -------------------------------------------------------
-- 9. 用户表 (user)
-- -------------------------------------------------------
CREATE TABLE user (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    email           VARCHAR(100) UNIQUE COMMENT '邮箱',
    phone           VARCHAR(20) UNIQUE COMMENT '手机号',
    password_hash   VARCHAR(255) NOT NULL COMMENT '密码哈希（BCrypt）',
    nickname        VARCHAR(50) COMMENT '昵称',
    avatar_url      VARCHAR(500) COMMENT '头像URL',
    status          TINYINT DEFAULT 1 COMMENT '状态：0=禁用 1=正常',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- -------------------------------------------------------
-- 10. 用户片单表 (user_movie_list)
-- -------------------------------------------------------
CREATE TABLE user_movie_list (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL COMMENT '用户ID',
    name            VARCHAR(100) NOT NULL COMMENT '片单名称',
    type            VARCHAR(20) COMMENT '类型：want_to_watch/watching/watched/custom',
    description     VARCHAR(500) COMMENT '描述',
    is_default      TINYINT DEFAULT 0 COMMENT '是否默认片单：0=否 1=是',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户片单表';

-- -------------------------------------------------------
-- 11. 片单明细表 (user_movie_list_item)
-- -------------------------------------------------------
CREATE TABLE user_movie_list_item (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id         BIGINT NOT NULL COMMENT '片单ID',
    movie_id        BIGINT NOT NULL COMMENT '影视ID',
    content_type    VARCHAR(20) COMMENT '内容类型：movie/drama/variety/anime/short_drama',
    rating          DECIMAL(3,1) COMMENT '评分(10分制)',
    note            VARCHAR(500) COMMENT '备注/感受',
    added_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_list (list_id),
    INDEX idx_movie (movie_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='片单明细表';

-- -------------------------------------------------------
-- 12. 系统设置表 (system_setting)
-- -------------------------------------------------------
CREATE TABLE system_setting (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key     VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键名',
    setting_value   TEXT COMMENT '设置值',
    description     VARCHAR(200) COMMENT '设置说明',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

INSERT INTO system_setting (setting_key, setting_value, description) VALUES
('site_name', '影视森林', '站点名称'),
('site_desc', '影视资源聚合平台', '站点描述'),
('copyright', '© 2026 影视森林. 仅供学习交流.', '版权信息'),
('notify_on_complete', 'true', '爬取完成通知'),
('notify_on_error', 'false', '错误告警通知');

-- -------------------------------------------------------
-- 13. 资源来源配置表 (resource_source)
-- -------------------------------------------------------
CREATE TABLE resource_source (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '来源名称',
    url             VARCHAR(500) COMMENT '来源链接',
    enabled         TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：0-禁用 1-启用',
    sort            INT NOT NULL DEFAULT 0 COMMENT '排序',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源来源配置表';

INSERT INTO resource_source (name, url, enabled, sort) VALUES
('七味网', 'https://pkmp4.xyz', 1, 1),
('天堂资源', '#', 0, 2),
('非凡资源', '#', 0, 3);

-- -------------------------------------------------------
-- 14. 爬虫定时配置表 (crawler_schedule)
-- -------------------------------------------------------
CREATE TABLE crawler_schedule (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '配置名称',
    content_type    VARCHAR(20) NOT NULL COMMENT '爬取类型：movie/drama/variety/anime/short',
    source_site     VARCHAR(50) NOT NULL DEFAULT '七味网' COMMENT '来源站点',
    enabled         TINYINT NOT NULL DEFAULT 1 COMMENT '是否启用：0-禁用 1-启用',
    cron_expression  VARCHAR(50) NOT NULL DEFAULT '0 */5 * * * *' COMMENT 'Cron表达式',
    batch_size      INT NOT NULL DEFAULT 20 COMMENT '每次爬取数量',
    rate_limit_ms   INT NOT NULL DEFAULT 2000 COMMENT '请求间隔（毫秒）',
    priority        VARCHAR(20) NOT NULL DEFAULT 'by_score' COMMENT '优先级：by_score/by_hot',
    genre_filter    JSON COMMENT '类型筛选',
    status          VARCHAR(20) NOT NULL DEFAULT 'idle' COMMENT '状态：idle/running/paused/error',
    last_run_time   DATETIME COMMENT '上次执行时间',
    next_run_time   DATETIME COMMENT '下次执行时间',
    total_runs      INT NOT NULL DEFAULT 0 COMMENT '累计执行次数',
    total_items     INT NOT NULL DEFAULT 0 COMMENT '累计爬取条目数',
    is_deleted      TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_enabled (enabled),
    INDEX idx_content_type (content_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='爬虫定时配置表';

-- -------------------------------------------------------
-- 15. 爬虫任务日志表 (crawler_task_log)
-- -------------------------------------------------------
CREATE TABLE crawler_task_log (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    schedule_id     BIGINT UNSIGNED COMMENT '关联定时配置ID',
    schedule_name   VARCHAR(100) COMMENT '配置名称（冗余）',
    content_type    VARCHAR(20) COMMENT '爬取类型',
    status          VARCHAR(20) NOT NULL COMMENT '状态：running/success/failed/stopped',
    items_crawled   INT NOT NULL DEFAULT 0 COMMENT '本次爬取数量',
    items_added     INT NOT NULL DEFAULT 0 COMMENT '新增数量',
    items_updated   INT NOT NULL DEFAULT 0 COMMENT '更新数量',
    error_message   TEXT COMMENT '错误信息',
    duration_ms     INT COMMENT '执行时长（毫秒）',
    started_at      DATETIME NOT NULL COMMENT '开始时间',
    finished_at     DATETIME COMMENT '完成时间',
    INDEX idx_schedule (schedule_id),
    INDEX idx_status (status),
    INDEX idx_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='爬虫任务日志表';
