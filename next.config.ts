import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone build (server + only the node_modules it
  // actually needs) — required for the slim multi-stage Dockerfile in ./Dockerfile. Without
  // this, the runtime image would need the full node_modules tree copied in instead.
  output: "standalone",
}

export default nextConfig
