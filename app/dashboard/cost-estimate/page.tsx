import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Cost Estimate"
      why="Pre-deploy cost estimates need hourly cost history, which scans don’t record yet."
    />
  )
}
