import { ComingSoon } from '../../components/dashboard/states'

export default function Page() {
  return (
    <ComingSoon
      title="Regressions"
      what="Spot cost spikes that start right after a deploy."
      why="This compares hourly cost before and after each deploy. Scans don’t record hourly cost history yet and deploy tracking isn’t connected, so there is nothing to compare."
    />
  )
}
