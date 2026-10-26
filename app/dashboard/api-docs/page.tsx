import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="API Documentation"
      why="A public API isn’t available yet. Self-serve API keys aren’t working, so there is no supported way to call Cloudlink from outside the dashboard."
    />
  )
}
