import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Savings Plans"
      why="Savings Plans analysis needs daily cost history, which scans don’t record yet."
    />
  )
}
