import { NotAvailable } from '../../components/dashboard/states'

export default function Page() {
  return (
    <NotAvailable
      title="Cost Forecast"
      why="Forecasts need daily cost history, which scans don’t record yet. Month-to-date spend is on Cost Explorer."
    />
  )
}
