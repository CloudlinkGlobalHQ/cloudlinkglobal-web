import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Kubernetes"
      why="Cloudlink monitors AWS accounts and doesn’t collect Kubernetes cost data."
    />
  )
}
