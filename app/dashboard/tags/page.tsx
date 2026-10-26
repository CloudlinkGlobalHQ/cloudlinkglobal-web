import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Cost by Tag"
      why="Cost by tag isn’t available yet: scans record cost per AWS service, not per resource."
    />
  )
}
