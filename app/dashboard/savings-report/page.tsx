import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Savings Report"
      why="The monthly savings report needs cost history, which scans don’t record yet."
    />
  )
}
