import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Actions"
      why="Approving or rejecting fixes isn’t available: Cloudlink is read-only and never changes resources in your AWS account. Findings and their estimated monthly savings are on the Resources and Rightsizing pages."
    />
  )
}
