import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Unit Economics"
      why="Unit economics needs cost history, which scans don’t record yet."
    />
  )
}
