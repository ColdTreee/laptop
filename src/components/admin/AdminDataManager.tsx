'use client'

import { ChevronLeft, ChevronRight, Database, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AdminField, AdminResource } from '../../lib/admin-resources'

type Row = Record<string, unknown>
interface ListResponse { rows: Row[]; total: number; page: number; pageSize: number }

function displayValue(field: AdminField, value: unknown) {
  if (value === null || value === undefined || value === '') return <span className="admin-null">--</span>
  if (field.type === 'datetime-local') return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date(String(value)))
  if (field.type === 'json') return typeof value === 'string' ? value : JSON.stringify(value)
  if (field.key === 'status' || field.key === 'severity' || field.key === 'fatigue_level') return <span className={`admin-badge ${String(value)}`}>{String(value)}</span>
  return String(value)
}

function inputValue(field: AdminField, value: unknown) {
  if (value === null || value === undefined) return ''
  if (field.type === 'datetime-local') {
    const date = new Date(String(value))
    return Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  if (field.type === 'date') return String(value).slice(0, 10)
  if (field.type === 'json' && typeof value !== 'string') return JSON.stringify(value, null, 2)
  return String(value)
}

export function AdminDataManager({ resource }: { resource: AdminResource }) {
  const [data, setData] = useState<ListResponse>({ rows: [], total: 0, page: 1, pageSize: 10 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Row | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [saving, setSaving] = useState(false)
  const visibleFields = useMemo(() => resource.fields.filter((field) => !field.hidden).slice(0, 8), [resource])
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize))

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/admin/${resource.key}?page=${page}&pageSize=10&search=${encodeURIComponent(query)}`, { cache: 'no-store' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? '读取失败')
      setData(result)
    } catch (err) { setError(err instanceof Error ? err.message : '读取失败') }
    finally { setLoading(false) }
  }, [page, query, resource.key])

  useEffect(() => { void load() }, [load])
  useEffect(() => { setPage(1); setSearch(''); setQuery(''); setEditing(undefined) }, [resource.key])

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError('')
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(resource.fields.filter((field) => !field.readOnly).map((field) => [field.key, form.get(field.key)]))
    const id = editing?.[resource.primaryKey]
    try {
      const response = await fetch(id ? `/api/admin/${resource.key}/${id}` : `/api/admin/${resource.key}`, { method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? '保存失败')
      setEditing(undefined); await load()
    } catch (err) { setError(err instanceof Error ? err.message : '保存失败') }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!deleting) return
    setSaving(true); setError('')
    try {
      const response = await fetch(`/api/admin/${resource.key}/${deleting[resource.primaryKey]}`, { method: 'DELETE' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? '删除失败')
      setDeleting(null); if (data.rows.length === 1 && page > 1) setPage(page - 1); else await load()
    } catch (err) { setError(err instanceof Error ? err.message : '删除失败'); setDeleting(null) }
    finally { setSaving(false) }
  }

  return <section className="admin-page">
    <div className="admin-page-heading admin-resource-heading"><div><p>数据管理</p><h1>{resource.label}</h1><span>{resource.description}</span></div><button className="admin-primary-button" onClick={() => setEditing(null)}><Plus size={17} />新增{resource.singular}</button></div>
    {error && <div className="admin-alert"><span>{error}</span><button onClick={() => setError('')} aria-label="关闭提示"><X size={16} /></button></div>}
    <section className="admin-data-panel">
      <div className="admin-data-toolbar"><form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search) }}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={resource.searchFields.length ? '搜索当前数据...' : '此数据表暂无文本检索字段'} disabled={!resource.searchFields.length} /><button type="submit" aria-label="搜索">搜索</button></form><div><span>共 <strong>{data.total}</strong> 条</span><button className="admin-icon-button" onClick={() => void load()} title="刷新" aria-label="刷新"><RefreshCw size={17} /></button></div></div>
      <div className="admin-table-wrap admin-resource-table"><table><thead><tr>{visibleFields.map((field) => <th key={field.key}>{field.label}</th>)}<th className="admin-actions-head">操作</th></tr></thead><tbody>{!loading && data.rows.map((row) => <tr key={String(row[resource.primaryKey])}>{visibleFields.map((field) => <td key={field.key} title={typeof row[field.key] === 'string' ? String(row[field.key]) : undefined}>{displayValue(field, row[field.key])}</td>)}<td className="admin-actions"><button onClick={() => setEditing(row)} title="编辑" aria-label="编辑"><Pencil size={16} /></button><button className="danger" onClick={() => setDeleting(row)} title="删除" aria-label="删除"><Trash2 size={16} /></button></td></tr>)}</tbody></table>{loading && <div className="admin-loading"><LoaderCircle size={22} className="spin" />正在读取数据</div>}{!loading && !data.rows.length && <div className="admin-empty-row"><Database size={24} /><span>暂无数据</span></div>}</div>
      <div className="admin-pagination"><span>第 {page} / {totalPages} 页</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="上一页"><ChevronLeft size={17} /></button><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="下一页"><ChevronRight size={17} /></button></div></div>
    </section>
    {editing !== undefined && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(undefined) }}><div className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="admin-form-title"><div className="admin-drawer-heading"><div><p>{editing ? '编辑记录' : '新增记录'}</p><h2 id="admin-form-title">{resource.singular}</h2></div><button className="admin-icon-button" onClick={() => setEditing(undefined)} aria-label="关闭"><X size={19} /></button></div><form onSubmit={save}><div className="admin-form-grid">{resource.fields.filter((field) => !field.readOnly).map((field) => <label key={field.key} className={field.type === 'textarea' || field.type === 'json' ? 'wide' : ''}><span>{field.label}{field.required && <b>*</b>}</span>{field.type === 'select' ? <select name={field.key} required={field.required} defaultValue={inputValue(field, editing?.[field.key])}><option value="">请选择</option>{field.options?.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select> : field.type === 'textarea' || field.type === 'json' ? <textarea name={field.key} required={field.required} rows={field.type === 'json' ? 6 : 4} defaultValue={inputValue(field, editing?.[field.key])} /> : <input name={field.key} type={field.type} required={field.required} step={field.type === 'number' ? 'any' : undefined} defaultValue={inputValue(field, editing?.[field.key])} />}</label>)}</div><div className="admin-form-actions"><button type="button" onClick={() => setEditing(undefined)}>取消</button><button className="admin-primary-button" disabled={saving}>{saving && <LoaderCircle size={16} className="spin" />}保存</button></div></form></div></div>}
    {deleting && <div className="admin-modal-backdrop"><div className="admin-confirm" role="alertdialog" aria-modal="true"><span className="admin-confirm-icon"><Trash2 size={21} /></span><h2>确认删除这条记录？</h2><p>删除后无法恢复，关联数据可能会阻止本次操作。</p><div><button onClick={() => setDeleting(null)}>取消</button><button className="admin-danger-button" disabled={saving} onClick={() => void remove()}>确认删除</button></div></div></div>}
  </section>
}
