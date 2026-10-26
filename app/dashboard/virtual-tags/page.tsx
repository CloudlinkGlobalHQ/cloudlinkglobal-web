import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Virtual Tags"
      why="Virtual tags need cost history, which scans don’t record yet."
    />
  )
}
