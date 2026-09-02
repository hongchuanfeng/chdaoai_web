# 保活功能实现说明

## ✅ 已实现的功能

### 1. 数据库表结构
在 `supabase_schema.sql` 中添加了 `keep_alive_logs` 表：

```sql
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log TEXT NOT NULL
);
```

**字段说明：**
- `id`: SERIAL 自增主键
- `timestamp`: 时间戳，记录请求时间
- `log`: 日志内容，记录操作数据时间节点

### 2. API 接口
创建了 `/api/keep-alive` 接口：

- **请求方法**: GET
- **请求参数**: 无
- **返回格式**: JSON
  ```json
  {
    "success": "success"
  }
  ```

### 3. 功能特性
- ✅ 每次请求都直接写入数据库，不缓存
- ✅ 自动添加时间戳参数
- ✅ 记录操作数据时间节点
- ✅ 包含索引优化（timestamp字段）
- ✅ 包含RLS策略（允许插入）

## 📋 使用方法

### 调用接口
```bash
# 使用 curl
curl http://localhost:3000/api/keep-alive

# 使用 fetch (JavaScript)
fetch('/api/keep-alive')
  .then(res => res.json())
  .then(data => console.log(data))
```

### 响应示例
```json
{
  "success": "success"
}
```

## 🗄️ 数据库操作

### 查看日志记录
```sql
SELECT * FROM keep_alive_logs 
ORDER BY timestamp DESC 
LIMIT 100;
```

### 统计请求次数
```sql
SELECT COUNT(*) as total_requests 
FROM keep_alive_logs;
```

### 按日期统计
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as requests
FROM keep_alive_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

## 🔧 部署步骤

1. **运行数据库脚本**
   ```sql
   -- 在 Supabase SQL Editor 中执行 supabase_schema.sql
   -- 或者只执行 keep_alive_logs 相关的部分
   ```

2. **验证接口**
   ```bash
   # 测试接口是否正常工作
   curl https://yourdomain.com/api/keep-alive
   ```

3. **设置定时任务（可选）**
   如果需要定期调用保活接口，可以设置 cron job 或使用外部服务：
   ```bash
   # 每5分钟调用一次
   */5 * * * * curl https://yourdomain.com/api/keep-alive
   ```

## 📊 监控建议

1. **定期检查日志表**
   - 确保日志正常写入
   - 监控请求频率

2. **性能监控**
   - 检查数据库写入性能
   - 监控API响应时间

3. **清理旧日志（可选）**
   ```sql
   -- 删除30天前的日志
   DELETE FROM keep_alive_logs 
   WHERE timestamp < NOW() - INTERVAL '30 days';
   ```

## ⚠️ 注意事项

1. **数据库连接**
   - 确保 Supabase 连接正常
   - 检查环境变量配置

2. **RLS策略**
   - 表已启用 Row Level Security
   - 已创建允许插入的策略

3. **性能考虑**
   - 每次请求都写入数据库
   - 如果请求频率很高，考虑批量写入或使用队列

4. **错误处理**
   - 接口包含完整的错误处理
   - 失败时会返回错误信息
