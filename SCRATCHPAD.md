# SVU frontend merge scratchpad

This file records implementation decisions made while adapting the static mockup to the live Next.js application.

## Decisions

### 1. Public-route boundary

Only `/`, `/events`, `/school-groups`, and `/enquire` receive the new visual system. The mockup has no equivalents for login, registration, auth, ticketing, staff, admin, or test screens, so those screens remain untouched.

### 2. "No new frontend components" interpretation

No new product areas, dashboards, staff features, or pages will be invented. Small reusable components are permitted only when they directly translate repeated mockup elements (navigation, split controls, footer, and public-page interactions) and remain isolated to the four mapped public routes.

### 3. Backend preservation

All Supabase queries, Eventbrite calls, server actions, API routes, email logic, database migrations, auth/proxy behaviour, and environment contracts are preserved. Mixed page files may have their rendered JSX replaced, but their data-fetching logic and return values remain unchanged.

### 4. Mockup prototype data is not authoritative

`prototype-forms.js` will not be copied because it prevents submission and simulates success. The React `useActionState` forms and their existing names, validation attributes, pending states, errors, and success messages remain the source of truth.

Likewise, the mockup's `/events` empty gateway will become the empty state only when the live query returns no events. Real events and live ticket availability remain visible.

### 5. Live visitor statistics remain on the homepage

The mockup has technical-stat panels but no direct equivalent for the existing Supabase visitor dashboard. Removing it would discard live application behaviour, so it will be retained as an additional flat editorial statistics section that uses the new visual language.

### 6. Visual authority

The mockup implementation and `BRAND-STYLE-GUIDE.md` are the visual source of truth. Where the guide's prose conflicts with the supplied `navigation.css`, the actual mockup implementation wins for fidelity: the centered floating header is hidden at the top of the homepage and revealed by scrolling, top-edge pointer movement, or keyboard focus.

### 7. Styling isolation

Mockup CSS will not be pasted globally. Its rules will be adapted beneath a `.svu-public` namespace. Open Sans and shared shadcn/Tailwind primitives remain unchanged for staff/admin/auth screens; Funnel Display is exposed as a separate font variable and applied only inside the public wrapper.

### 8. Base-path-safe assets

`next/link` handles the configured base path automatically, but `next/image`, raw images, video, and iframe-adjacent public assets do not. Public asset URLs will be prefixed with the build-time `NEXT_PUBLIC_BASE_PATH` value.

### 9. Asset reuse and video delivery

The five supplied JPEGs are byte-identical to files already in `public/images`, so they will be reused. Unique logo/arrow/background/video assets will be copied. The 73.86 MiB hero video will use `preload="metadata"`, muted inline playback, a poster/static fallback, and reduced-motion handling rather than aggressive preload.

### 10. Campus map

The private-hire page will use an embedded OpenStreetMap locator with the mockup's dark treatment and a direct Google Maps directions link instead of adding a Leaflet runtime dependency. The address and directions remain usable if the embedded map cannot load.

### 11. Known repository baseline

- The actual framework is Next.js 16.2.2 even though `_docs/STARTUP.md` still says Next.js 14.
- Node 25.2.1 is installed; project documentation recommends Node 24, while Next supports the installed version.
- `npm.ps1` is blocked by Windows execution policy, so validation uses `npm.cmd`.
- Baseline TypeScript passes.
- Full baseline lint already contains unrelated staff/admin failures; targeted lint on changed files is the regression gate.
- `SVU_mockup/` was the only pre-existing untracked worktree item and must remain preserved.

### 12. Responsive and accessible integration

The static mockup's desktop rules were adapted rather than copied verbatim. The shared controls now use semantic links/buttons, service menus work with pointer and keyboard input, skip links move focus to each page's main landmark, form success states receive focus, interactive service/about content exposes state to assistive technology, and all public styles remain under `.svu-public`.

Exact 390px device emulation uncovered and resolved a service-hero breakpoint specificity issue. Desktop, narrow, and scrolled-section captures were then checked for all four public routes, including event content, both live forms, and the campus map.

### 13. Video delivery and caption limitation

Autoplaying the supplied 73.86 MiB film would impose that full download on homepage visitors. A silent, eight-second 720p preview (`public/svu/svu-preview.mp4`, about 1 MiB) is used for the looping hero; the original full-resolution film is not requested until the visitor opens the player.

The supplied 266.9-second film contains narration but no embedded caption track. A local offline speech-recognition pass was too inaccurate to publish safely, so fabricated captions were rejected. An authoritative transcript or caption file is still needed from the video owner before synchronized captions can be added.

## Validation result

- Changed-file ESLint: passed.
- TypeScript: passed through the production build.
- Standard production build: passed with non-secret placeholder environment values.
- `/bookings` base-path production build: passed; page, internal-link, image, logo, and video URLs were exercised over HTTP and returned the expected prefixes/statuses.
- Visual QA: passed at 1440px and exact 390px emulation for `/`, `/events`, `/school-groups`, and `/enquire`, plus anchored checks of About, Services, event listings, forms, and map sections.
- Diff boundary: no changes under API, backend library, proxy, Supabase, staff, admin, or server-action paths.
- Full repository lint still reports the known unrelated baseline: 21 errors and 14 warnings in existing admin/staff/ticketing/mockup files.
