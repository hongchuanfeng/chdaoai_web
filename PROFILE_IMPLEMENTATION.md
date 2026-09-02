# 个人中心功能实现说明

## ✅ 已实现的功能

### 1. 我的订单
- ✅ 显示用户所有订阅订单记录
- ✅ 显示订单日期、金额、积分、状态
- ✅ 按时间倒序排列（最新的在前）
- ✅ 表格形式展示，清晰易读
- ✅ 无订单时显示提示信息

**订单信息包括：**
- 日期：订单创建时间
- 金额：支付金额（美元）
- 积分：获得的积分数量
- 状态：订单状态（completed/pending）

### 2. 我的转换记录
- ✅ 显示用户所有图片去水印转换记录
- ✅ 显示转换时间
- ✅ 提供原始图片和结果图片的查看链接
- ✅ 按时间倒序排列
- ✅ 无记录时显示提示信息

**转换记录包括：**
- 时间：转换创建时间
- 原始图片：查看上传的原始图片
- 结果图片：查看处理后的图片

### 3. 我的积分
- ✅ 显示当前可用积分
- ✅ 显示完整的积分历史记录
- ✅ 区分积分类型（获得/使用/初始）
- ✅ 显示积分变动时间和描述
- ✅ 表格形式展示，带颜色区分

**积分记录类型：**
- **Initial（初始）**：新用户注册获得的5个免费积分
- **Earned（获得）**：通过订阅获得的积分
- **Spent（使用）**：使用去水印功能消耗的积分

**积分记录信息包括：**
- 日期：积分变动时间
- 类型：积分变动类型（带颜色标签）
- 数量：积分变动数量（+表示增加，-表示减少）
- 描述：积分变动原因

### 4. 账户信息
- ✅ 显示用户邮箱
- ✅ 显示当前可用积分
- ✅ 提供快速订阅按钮

## 🗄️ 数据库设计

### Credit History 表
```sql
CREATE TABLE credit_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'earned', 'spent', 'initial'
  description TEXT,
  related_order_id UUID REFERENCES subscription_orders(id),
  related_conversion_id UUID REFERENCES conversions(id),
  created_at TIMESTAMP WITH TIME ZONE
);
```

**字段说明：**
- `id`: 主键
- `user_id`: 用户ID
- `amount`: 积分数量
- `type`: 类型（earned/spent/initial）
- `description`: 描述信息
- `related_order_id`: 关联的订单ID（如果是订阅获得）
- `related_conversion_id`: 关联的转换ID（如果是使用消耗）
- `created_at`: 创建时间

## 🔄 积分记录自动生成

### 1. 新用户注册
- 自动创建用户记录，初始积分5
- 自动记录积分历史：type='initial', amount=5

### 2. 订阅成功
- Webhook回调处理支付成功
- 更新用户积分
- 自动记录积分历史：type='earned', amount=订阅积分数

### 3. 使用去水印功能
- 扣除1个积分
- 自动记录积分历史：type='spent', amount=1

## 📋 页面布局

个人中心页面采用响应式布局：

```
┌─────────────────────────────────────┐
│  账户信息（左侧）                     │
│  - 邮箱                              │
│  - 当前积分                          │
│  - 订阅按钮                          │
├─────────────────────────────────────┤
│  我的订单（右侧）                     │
│  - 订单列表表格                      │
├─────────────────────────────────────┤
│  我的转换记录（右侧）                 │
│  - 转换记录列表                      │
├─────────────────────────────────────┤
│  我的积分（右侧）                     │
│  - 积分历史表格                      │
└─────────────────────────────────────┘
```

## 🎨 UI特性

### 积分类型颜色标识
- **绿色**：获得/初始积分（+）
- **红色**：使用积分（-）

### 响应式设计
- 桌面端：左侧账户信息，右侧三个功能模块
- 移动端：垂直堆叠布局

### 数据展示
- 表格形式展示订单和积分历史
- 列表形式展示转换记录
- 空状态提示

## 🔒 安全特性

- ✅ Row Level Security (RLS) 保护
- ✅ 用户只能查看自己的数据
- ✅ 自动认证检查
- ✅ 未登录用户自动跳转到登录页

## 📝 相关文件

- `app/profile/page.tsx` - 个人中心页面
- `app/api/creem/webhook/route.ts` - 订阅webhook（记录积分获得）
- `app/api/remove-watermark/route.ts` - 去水印API（记录积分使用）
- `supabase_schema.sql` - 数据库schema（包含credit_history表）

## 🚀 使用说明

1. **访问个人中心**
   - 登录后点击导航栏的"个人中心"或"Profile"
   - 或直接访问 `/profile`

2. **查看订单**
   - 在"我的订单"部分查看所有订阅订单
   - 可以看到每次订阅的详细信息

3. **查看转换记录**
   - 在"我的转换记录"部分查看所有去水印操作
   - 可以点击链接查看原始图片和结果图片

4. **查看积分历史**
   - 在"我的积分"部分查看完整的积分变动记录
   - 可以看到每次积分增加或减少的详细信息

## 🔧 数据库迁移

如果数据库还没有credit_history表，需要运行以下SQL：

```sql
-- 创建积分历史表
CREATE TABLE IF NOT EXISTS credit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  related_order_id UUID REFERENCES subscription_orders(id) ON DELETE SET NULL,
  related_conversion_id UUID REFERENCES conversions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_history_user_id ON credit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at ON credit_history(created_at);

-- 启用RLS
ALTER TABLE credit_history ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "Users can view their own credit history" ON credit_history
  FOR SELECT USING (auth.uid() = user_id);
```
