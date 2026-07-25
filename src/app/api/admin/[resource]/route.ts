import { NextResponse } from 'next/server'
import { getAdminResource } from '../../../../lib/admin-resources'
import { isDatabaseConfigured } from '../../../../lib/db'
import { createAdminRow, listAdminRows } from '../../../../server/repositories/admin-repository'

function errorResponse(error: unknown) {
  console.error('[admin api]', error)
  const message = error instanceof Error ? error.message : '操作失败'
  const conflict = typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY'
  return NextResponse.json({ error: conflict ? '数据已存在，请检查唯一字段' : message }, { status: conflict ? 409 : 400 })
}

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const resource = getAdminResource((await context.params).resource)
  if (!resource) return NextResponse.json({ error: '未知资源' }, { status: 404 })
  if (!isDatabaseConfigured()) return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  const params = new URL(request.url).searchParams
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1)
  const pageSize = Math.min(50, Math.max(5, Number(params.get('pageSize') ?? 10) || 10))
  try {
    return NextResponse.json(await listAdminRows(resource, page, pageSize, (params.get('search') ?? '').trim().slice(0, 100)))
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  const resource = getAdminResource((await context.params).resource)
  if (!resource) return NextResponse.json({ error: '未知资源' }, { status: 404 })
  if (!isDatabaseConfigured()) return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ error: '请求内容无效' }, { status: 400 })
  try {
    const id = await createAdminRow(resource, payload)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
