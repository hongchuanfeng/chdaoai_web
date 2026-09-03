-- =========================================
-- chdaoai_web 数据库初始化脚本
-- 运行前请确保已创建数据库: CREATE DATABASE chdaoai_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- =========================================

USE chdaoai_web;

-- -----------------------------------------
-- 用户表
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY COMMENT '用户ID (UUID)',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '用户邮箱',
    password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    credits INT DEFAULT 5 COMMENT '用户积分',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------
-- 订阅订单表
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS subscription_orders (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    transaction_id VARCHAR(255) UNIQUE NOT NULL COMMENT '交易ID (Creem)',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    product_id VARCHAR(255) COMMENT '产品ID',
    amount DECIMAL(10, 2) DEFAULT 0 COMMENT '金额',
    credits INT DEFAULT 0 COMMENT '积分数量',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '订单状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅订单表';

-- -----------------------------------------
-- 积分历史表
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS credit_history (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    amount INT NOT NULL COMMENT '积分变动数量',
    type ENUM('earned', 'spent', 'initial') NOT NULL COMMENT '类型: earned=获得, spent=消耗, initial=初始',
    description TEXT COMMENT '描述',
    related_order_id VARCHAR(255) COMMENT '关联订单ID',
    related_conversion_id INT COMMENT '关联转换ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分历史表';

-- -----------------------------------------
-- 转换记录表
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS conversions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
    original_url TEXT NOT NULL COMMENT '原始文件URL',
    result_url TEXT NOT NULL COMMENT '处理结果URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='转换记录表';

-- -----------------------------------------
-- 保活日志表
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS keep_alive_logs (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '时间戳',
    log TEXT COMMENT '日志内容',
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='保活日志表';

-- -----------------------------------------
-- 测试数据 (可选，取消注释可添加)
-- -----------------------------------------
-- INSERT INTO users (id, email, password, credits) VALUES 
-- ('test-user-id-001', 'test@example.com', '$2a$10$...', 100);

-- -----------------------------------------
-- 完成提示
-- -----------------------------------------
SELECT '数据库初始化完成!' AS status;
SHOW TABLES;
