import { notFound } from 'next/navigation'
import { AdminDataManager } from '../../../components/admin/AdminDataManager'
import { getAdminResource } from '../../../lib/admin-resources'

export default async function AdminResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  const resource = getAdminResource((await params).resource)
  if (!resource) notFound()
  return <AdminDataManager resource={resource} />
}
