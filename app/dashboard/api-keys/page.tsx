import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="API Keys"
      why="Self-serve API keys aren’t working yet. They will be turned on once key storage is fixed in the backend."
    />
  )
}
