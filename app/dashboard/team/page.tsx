import { ComingSoon } from '../../components/dashboard/states'

export default function Page() {
  return (
    <ComingSoon
      title="Team"
      what="Share one Cloudlink workspace with teammates."
      why="Each sign-in currently gets its own workspace. Inviting someone would not give them access to your AWS findings, so invitations are turned off until shared workspaces are built."
    />
  )
}
