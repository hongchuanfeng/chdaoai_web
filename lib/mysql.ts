import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

// MySQL 连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'chdaoai_web',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key'

// Types
export interface User extends RowDataPacket {
  id: string
  email: string
  password?: string
  credits: number
  created_at: Date
  updated_at: Date
}

export interface CreditHistory extends RowDataPacket {
  id: number
  user_id: string
  amount: number
  type: 'earned' | 'spent' | 'initial'
  description?: string
  related_order_id?: string
  created_at: Date
}

export interface Conversion extends RowDataPacket {
  id: number
  user_id: string
  original_url: string
  result_url: string
  created_at: Date
}

export interface KeepAliveLog {
  id: number
  timestamp: Date
  log: string
}

// Database helper functions
export async function query<T extends RowDataPacket[]>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute<T>(sql, params)
  return rows
}

export async function execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params)
  return result
}

export async function getUserById(userId: string): Promise<User | null> {
  const users = await query<User[]>(
    'SELECT * FROM users WHERE id = ?',
    [userId]
  )
  return users[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await query<User[]>(
    'SELECT * FROM users WHERE email = ?',
    [email]
  )
  return users[0] || null
}

export async function createUser(id: string, email: string, hashedPassword: string, credits: number = 5): Promise<void> {
  await execute(
    'INSERT INTO users (id, email, password, credits) VALUES (?, ?, ?, ?)',
    [id, email, hashedPassword, credits]
  )
}

export async function updateUserCredits(userId: string, credits: number): Promise<void> {
  await execute(
    'UPDATE users SET credits = ? WHERE id = ?',
    [credits, userId]
  )
}

export async function deductCredits(userId: string, amount: number): Promise<void> {
  await execute(
    'UPDATE users SET credits = credits - ? WHERE id = ?',
    [amount, userId]
  )
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  await execute(
    'UPDATE users SET credits = credits + ? WHERE id = ?',
    [amount, userId]
  )
}

export async function addCreditHistory(
  userId: string,
  amount: number,
  type: 'earned' | 'spent' | 'initial',
  description?: string,
  relatedOrderId?: string
): Promise<void> {
  await execute(
    'INSERT INTO credit_history (user_id, amount, type, description, related_order_id) VALUES (?, ?, ?, ?, ?)',
    [userId, amount, type, description || null, relatedOrderId || null]
  )
}

export async function getCreditHistory(userId: string): Promise<CreditHistory[]> {
  return query<CreditHistory[]>(
    'SELECT * FROM credit_history WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
}

export async function createConversion(userId: string, originalUrl: string, resultUrl: string): Promise<number> {
  const result = await execute(
    'INSERT INTO conversions (user_id, original_url, result_url) VALUES (?, ?, ?)',
    [userId, originalUrl, resultUrl]
  )
  return result.insertId
}

export async function getConversions(userId: string): Promise<Conversion[]> {
  return query<Conversion[]>(
    'SELECT * FROM conversions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  )
}

export async function addKeepAliveLog(log: string): Promise<void> {
  await execute(
    'INSERT INTO keep_alive_logs (timestamp, log) VALUES (NOW(), ?)',
    [log]
  )
}

// JWT token helper
export function createToken(userId: string, email: string): string {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }
    return decoded
  } catch {
    return null
  }
}

// Get user from request cookies (for server components)
export async function getUserFromCookies(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    
    if (!token) {
      return null
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }
    
    return getUserById(decoded.id)
  } catch {
    return null
  }
}

// Initialize database tables
export async function initDatabase(): Promise<void> {
  try {
    // Users table
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        credits INT DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Credit history table
    await execute(`
      CREATE TABLE IF NOT EXISTS credit_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        amount INT NOT NULL,
        type ENUM('earned', 'spent', 'initial') NOT NULL,
        description TEXT,
        related_order_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Conversions table
    await execute(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        original_url TEXT NOT NULL,
        result_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Subscription orders table
    await execute(`
      CREATE TABLE IF NOT EXISTS subscription_orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(255),
        amount DECIMAL(10, 2) DEFAULT 0,
        credits INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_transaction_id (transaction_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Keep alive logs table
    await execute(`
      CREATE TABLE IF NOT EXISTS keep_alive_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        log TEXT,
        INDEX idx_timestamp (timestamp)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    console.log('MySQL database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize MySQL database:', error)
    throw error
  }
}

export default pool
