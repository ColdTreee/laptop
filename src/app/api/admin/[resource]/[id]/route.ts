import { NextResponse } from 'next/server'
import { getAdminResource } from '../../../../../lib/admin-resources'
import { isDatabaseConfigured } from '../../../../../lib/db'
import { deleteAdminRow, updateAdminRow } from '../../../../../server/repositories/admin-repository'

function validateId(id: string) {
  return /^\d+$/.test(id) && Number(id) > 0
}

function errorResponse(error: unknown) {
  console.error('[admin api]', error)
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : ''
  const message = code === 'ER_ROW_IS_REFERENCED_2' ? '该记录仍被其他数据引用，暂时无法删除' : error instanceof Error ? error.message : '操作失败'
  return NextResponse.json({ error: message }, { status: code === 'ER_ROW_IS_REFERENCED_2' ? 409 : 400 })
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: key, id } = await context.params
  const resource = getAdminResource(key)
  if (!resource) return NextResponse.json({ error: '未知资源' }, { status: 404 })
  if (!validateId(id)) return NextResponse.json({ error: '主键无效' }, { status: 400 })
  if (!isDatabaseConfigured()) return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  const payload = await request.json().catch(() => null)
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return NextResponse.json({ error: '请求内容无效' }, { status: 400 })
  try {
    const affected = await updateAdminRow(resource, id, payload)
    if (!affected) return NextResponse.json({ error: '记录不存在或内容未变化' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  const { resource: key, id } = await context.params
  const resource = getAdminResource(key)
  if (!resource) return NextResponse.json({ error: '未知资源' }, { status: 404 })
  if (!validateId(id)) return NextResponse.json({ error: '主键无效' }, { status: 400 })
  if (!isDatabaseConfigured()) return NextResponse.json({ error: '数据库未配置' }, { status: 503 })
  try {
    const affected = await deleteAdminRow(resource, id)
    if (!affected) return NextResponse.json({ error: '记录不存在' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
