import { plugin } from "bun"

plugin({
  name: "empty-server-only",
  setup(build) {
    build.onResolve({ filter: /^server-only$/ }, () => ({
      path: "server-only",
      namespace: "empty",
    }))
    build.onLoad({ filter: /.*/, namespace: "empty" }, () => ({
      contents: "export {}",
      loader: "js",
    }))
  },
})
