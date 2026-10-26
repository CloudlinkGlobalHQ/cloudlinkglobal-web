import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="AutoStopping"
      why="AutoStop would stop and start resources in your AWS account. Cloudlink is read-only, so this isn’t available."
    />
  )
}
