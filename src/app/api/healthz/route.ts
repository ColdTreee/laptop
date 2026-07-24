import { NextResponse } from 'next/server'
import { checkDatabaseConnection, isDatabaseConfigured } from '../../../lib/db'

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ status: 'ok', database: 'demo-data' })
  }
  try {
    await checkDatabaseConnection()
    return NextResponse.json({ status: 'ok', database: 'connected' })
  } catch {
    return NextResponse.json({ status: 'error', database: 'unavailable' }, { status: 503 })
  }
}
