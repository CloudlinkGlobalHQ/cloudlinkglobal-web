import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Run History"
      why="Cloudlink is read-only, so it never runs remediation jobs. Your scan history is on the Scans page."
    />
  )
}
