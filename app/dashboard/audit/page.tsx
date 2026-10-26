import { ComingSoon } from '../../components/dashboard/states'

export default function Page() {
  return (
    <ComingSoon
      title="Activity Log"
      what="A record of changes Cloudlink makes in your account."
      why="Cloudlink is read-only and never changes your AWS account, so there is nothing to log yet. Your scan history is on the Scans page."
    />
  )
}
