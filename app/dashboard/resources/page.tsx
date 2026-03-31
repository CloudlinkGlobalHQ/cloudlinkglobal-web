import { Suspense } from 'react'
import ResourcesTable from '../../components/dashboard/ResourcesTable'

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-10 text-sm text-slate-400">Loading resources…</div>}>
      <ResourcesTable />
    </Suspense>
  )
}
