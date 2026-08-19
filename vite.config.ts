// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    // Pin explicitly instead of relying on Nitro's VERCEL env-var autodetection
    // overriding the cloudflare-module default from @lovable.dev/vite-tanstack-config.
    preset: "vercel",
    // Works around a known Rolldown bug (rolldown/rolldown#8809): circular
    // "__exportAll" runtime-helper dependency between the entry chunk and a
    // common chunk during code-splitting causes "Export '..._exports' is not
    // defined in module" at runtime. Bundling to a single file sidesteps it.
    inlineDynamicImports: true,
  },
  vite: {
    optimizeDeps: {
      // The client-side dep scan (esbuild) crawls into this server-only
      // package's createStartHandler.js, which does `import("#tanstack-*-entry")` —
      // subpath imports that only resolve when the TanStack Start Vite plugin
      // handles them, not during a raw esbuild pre-bundle. That failure hangs
      // the whole optimize batch (react/react-dom included) forever in dev.
      // Excluding it keeps the client scan from ever crossing into it.
      exclude: ["@tanstack/start-server-core"],
    },
  },
});
