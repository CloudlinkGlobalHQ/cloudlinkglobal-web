import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="TTL Auto-Destroy"
      why="Deleting environments on a timer would change your AWS account. Cloudlink is read-only, so this isn’t available."
    />
  )
}
