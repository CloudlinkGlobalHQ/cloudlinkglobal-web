import { ComingSoon } from '../../components/dashboard/states'

export default function Page() {
  return (
    <ComingSoon
      title="Deploys"
      what="Track deploys so cost changes can be linked to them."
      why="Sending deploy events from CI needs an API key, and self-serve API keys aren’t working yet."
    />
  )
}
