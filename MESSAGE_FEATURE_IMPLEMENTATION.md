# 留言功能实现说明

## ✅ 已实现的功能

### 1. 留言表单
- ✅ 在"联系我们"页面（`/contact`）提供留言表单
- ✅ 包含三个必填字段：
  - **姓名** (Name)
  - **邮箱** (Email)
  - **留言内容** (Message)
- ✅ 表单验证（必填项、邮箱格式、字符长度限制）
- ✅ 实时字符计数（10-1000字符）

### 2. 数据存储
- ✅ 留言数据保存到 Supabase 数据库
- ✅ 表名：`messages`
- ✅ 自动记录创建时间

### 3. 用户体验
- ✅ 提交成功后显示确认消息
- ✅ 提交后自动清空表单
- ✅ 错误处理和提示
- ✅ 提交状态显示（Sending...）
- ✅ 可以发送多条留言

### 4. 数据库设计

#### Messages 表结构
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**字段说明：**
- `id`: 主键（UUID）
- `name`: 留言者姓名（必填）
- `email`: 留言者邮箱（必填）
- `message`: 留言内容（必填，10-1000字符）
- `created_at`: 创建时间（自动记录）

### 5. 安全特性
- ✅ Row Level Security (RLS) 保护
- ✅ 允许任何人插入留言（公开留言功能）
- ✅ 表单数据验证和清理（trim空格）
- ✅ 字符长度限制防止过长内容

## 📋 功能特性

### 表单验证
- **姓名**：必填，自动去除首尾空格
- **邮箱**：必填，邮箱格式验证，自动去除首尾空格
- **留言内容**：必填，10-1000字符限制，自动去除首尾空格

### 用户反馈
- **成功提示**：绿色背景，带成功图标
- **错误提示**：红色背景，带错误图标
- **提交状态**：按钮显示"Sending..."，禁用表单

### 响应式设计
- 桌面端：左右两栏布局（联系信息 + 留言表单）
- 移动端：垂直堆叠布局

## 🎨 UI设计

### 留言表单
- 白色卡片背景，带阴影
- 清晰的标签和输入框
- 实时字符计数显示
- 主要按钮样式（蓝色背景）

### 成功提示
- 绿色背景
- 成功图标
- 友好的提示文字
- "Send another message" 链接

### 错误提示
- 红色背景
- 错误图标
- 清晰的错误信息

## 🔒 安全考虑

1. **数据验证**
   - 前端表单验证
   - 后端数据清理（trim空格）
   - 字符长度限制

2. **数据库安全**
   - RLS策略保护
   - 只允许插入，不允许查看（需要管理员权限）

3. **防止滥用**
   - 字符长度限制
   - 必填字段验证
   - 邮箱格式验证

## 📝 使用说明

### 用户使用流程
1. 访问 `/contact` 页面
2. 填写留言表单：
   - 输入姓名
   - 输入邮箱
   - 输入留言内容（10-1000字符）
3. 点击"Send Message"按钮
4. 等待提交完成
5. 查看成功提示

### 管理员查看留言
需要在 Supabase Dashboard 中：
1. 进入 Table Editor
2. 选择 `messages` 表
3. 查看所有留言记录

或者创建管理员API来查看留言（需要额外实现）。

## 🗄️ 数据库查询示例

### 查看所有留言
```sql
SELECT * FROM messages 
ORDER BY created_at DESC;
```

### 按日期统计
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM messages
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 查看最近的留言
```sql
SELECT * FROM messages 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🔧 数据库迁移

如果数据库还没有messages表，需要运行以下SQL（已在 `supabase_schema.sql` 中）：

```sql
-- 创建留言表
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- 启用RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（允许任何人插入）
CREATE POLICY "Anyone can insert messages" ON messages
  FOR INSERT WITH CHECK (true);
```

## 📝 相关文件

- `app/contact/page.tsx` - 联系我们页面（包含留言表单）
- `supabase_schema.sql` - 数据库schema（包含messages表定义）

## 🚀 未来改进建议

1. **邮件通知**
   - 留言提交后发送邮件通知管理员
   - 使用 Supabase Edge Functions 或第三方服务

2. **管理员后台**
   - 创建管理员页面查看留言
   - 添加回复功能

3. **留言状态**
   - 添加状态字段（未读/已读/已回复）
   - 添加回复内容字段

4. **用户关联**
   - 如果用户已登录，自动填充邮箱
   - 关联用户ID（可选）

5. **验证码**
   - 添加验证码防止垃圾留言
   - 使用 reCAPTCHA 或其他服务

## ✅ 功能检查清单

- [x] 留言表单UI
- [x] 表单验证
- [x] 数据提交到数据库
- [x] 成功/错误提示
- [x] 字符计数
- [x] 响应式设计
- [x] 数据库表创建
- [x] RLS策略配置
- [x] 错误处理
