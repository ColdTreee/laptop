import 'server-only'
import mysql from 'mysql2/promise'
import type { Pool } from 'mysql2/promise'

declare global {
  var lightTraceDbPool: Pool | undefined
}

export function isDatabaseConfigured() {
  return Boolean(
    process.env.DATABASE_URL
    || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME),
  )
}

function createDatabasePool() {
  if (process.env.DATABASE_URL) {
    return mysql.createPool(process.env.DATABASE_URL)
  }

  return mysql.createPool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'light_trace',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
    queueLimit: 0,
    enableKeepAlive: true,
  })
}

export function getDatabase(): Pool {
  if (!isDatabaseConfigured()) {
    throw new Error('数据库尚未配置，请设置 DATABASE_URL 或 DB_HOST/DB_USER/DB_NAME。')
  }

  if (!globalThis.lightTraceDbPool) {
    globalThis.lightTraceDbPool = createDatabasePool()
  }

  return globalThis.lightTraceDbPool
}

export async function checkDatabaseConnection() {
  const [rows] = await getDatabase().query('SELECT 1 AS connected')
  return rows
}
