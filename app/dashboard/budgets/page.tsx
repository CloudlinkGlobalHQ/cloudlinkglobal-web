import { ComingSoon } from '../../components/dashboard/states'

export default function Page() {
  return (
    <ComingSoon
      title="Budgets"
      what="Monthly spend limits with alerts."
      why="Budgets need hourly cost history to measure spend, and scans don’t record it yet. Until they do, every budget would show $0 spent. Your month-to-date spend is on Cost Explorer."
    />
  )
}
