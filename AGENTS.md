# @weburz/carousel — repository instructions

Nuxt 4 module: carousel components for YouTube, Instagram, and TikTok embeds
built on Embla. Three platform wrappers (`YouTubeCarousel`, `TikTokCarousel`,
`InstagramCarousel`) share one `BaseCarousel`/`BaseSlide` core through the
internal `EmbedCarousel` shell (prop/slot forwarding, active caption) and
`EmbedFacade` (thumbnail play button). Shared prop defaults live in
`src/runtime/utils/carouselProps.ts` — spread them, don't retype them.

## Commands (pnpm, never npm/yarn)

- `pnpm test` — Vitest suite (module `test/`, fixture `test/fixtures/basic`).
- `pnpm lint` — ESLint flat config (`eslint.config.mjs`).
- `pnpm test:types` — `vue-tsc --noEmit` on the module + playground.
- `pnpm dev:prepare` — regenerate `.nuxt`/`dist` stub types. **Run this before
  `pnpm test:types`** on a fresh checkout: the root tsconfig extends the
  generated `.nuxt/tsconfig.json`, and a stale one produces false type errors.
- `pnpm dev` — run the playground.
- `pnpm prepack && pnpm dev:build` — builds the playground against the real
  `dist/` output (not the stubbed module). Must pass before a release: it is
  the only check that catches module-builder bugs that only manifest in the
  published output (e.g. a dropped runtime helper import).

### pnpm 11 notes

- `allowBuilds:` lives in `pnpm-workspace.yaml` (esbuild, @parcel/watcher,
  unrs-resolver). Only that file is honored — not `package.json` keys.
- CI runs `pnpm install --frozen-lockfile`; a lockfile pinning packages under
  the `minimumReleaseAge` window fails with
  `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` (dependabot's aggregate PRs hit this
  when resolving brand-new transitive releases). Wait for the window or bump
  individual packages via their own dependabot PRs.

## Conventions

- **Stateless components**: no internal hardcoded state. Platform wrappers
  receive data via props and emit events; `BaseCarousel`/`BaseSlide` own the
  layout/sizing but no business state. Reuse the facade/iframe composables in
  `src/runtime/composables/` instead of re-implementing embed lifecycles.
- **Arrow functions only**; composables are named `useAdjectiveX`
  (`useFacadeActivation`), never `useVerbX`.
- **`Intl.DateTimeFormat`** instantiated once and reused — never repeated
  `toLocaleDateString()`.
- **Widen contracts, don't coerce**: shared props (options/plugins/
  slidesPerView/layout/…) live as the runtime `carouselSharedProps` object in
  `src/runtime/utils/carouselProps.ts` — spread it into `defineProps`, never
  re-declare per component, and never `withDefaults` with a non-literal (the
  module builder drops the `mergeDefaults` import from the built component).
- No token auth/tracking params leak into embed URLs; keep the query-stripping
  and keyless-thumbnail behavior intact when touching `buildEmbedUrl` or
  thumbnail fallbacks.

## Testing process

TDD red → green → refactor. Unit-test pure runtime helpers (embed URL
building, slides CSS, facade/iframe parking) in `test/*.test.ts` without
network or DOM browser mocking; the fixture SSR suite covers the rendered
components.

## Dev flow

Push feature branches and open PRs; no Plane. Do not attribute code to AI in
commits, PRs, or comments.
