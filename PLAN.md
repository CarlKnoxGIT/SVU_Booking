# SVU public frontend merge plan

## Objective

Replace the visual presentation of the existing public SVU application with the supplied `SVU_mockup/` design while preserving the current Next.js application, data sources, server actions, integrations, routes, and authenticated staff/admin interfaces.

## Scope

The mockup maps to the existing public routes as follows:

| Mockup source | Existing route | Existing behaviour to preserve |
| --- | --- | --- |
| `SVU_mockup/index.html` | `/` | Supabase visitor totals, category relabelling/merging, and 60-second revalidation |
| `SVU_mockup/public-events.html` | `/events` | Supabase event query, Eventbrite availability/session counts, Humanitix promotion, hidden count, and notify-me server action |
| `SVU_mockup/school-visits.html` | `/school-groups` | Live school interest form, pending/error/success states, database write, and notification email |
| `SVU_mockup/private-event-hire.html` | `/enquire` | Live private-hire enquiry form, pending/error/success states, database write, and notification email |

Explicitly out of scope:

- `src/app/admin/**`
- `src/app/staff/**`
- Auth, registration, ticket checkout/success/cancellation, and test routes
- `src/app/api/**`
- `src/lib/**`
- `src/proxy.ts`
- `supabase/**`
- Every `actions.ts` file
- Shared staff/admin UI primitives and dashboard layouts

## Implementation approach

1. Establish a public-only visual system based on the mockup brand guide:
   - Funnel Display at weight 300 for the four mapped pages only.
   - Near-black `#030705`, white, and charcoal `#1c1c1c` palette.
   - Square geometry, flat panels, large editorial media, split directional controls, visible focus, and reduced-motion handling.
   - Strong namespace beneath `.svu-public` so protected and supporting routes keep their existing styling.
2. Add only shared public-site presentation helpers needed by the supplied design:
   - Floating navigation with an accessible services menu.
   - Split-arrow links/buttons.
   - Shared editorial footer.
   - Narrow client-side effects for reveal behaviour and homepage-only interactions.
3. Rebuild the homepage composition from the mockup:
   - Editorial introduction and supplied hero video.
   - Interactive About section.
   - Technical specifications and the existing live visitor totals.
   - Interactive service selector.
   - Image-led contact section and mockup footer.
4. Rebuild `/events` from the service-page mockup while rendering the real event dataset and availability states instead of the mockup's static empty gateway.
5. Rebuild `/school-groups` and `/enquire` from their mockup pages while keeping the current server-action forms and exact field contracts.
6. Copy only unique mockup assets into `public/`; reuse the five JPEGs already present because they are byte-identical.
7. Validate public-route behaviour and confirm no backend or protected-interface files changed.

## Validation gates

- `npm.cmd exec tsc -- --noEmit --incremental false`
- Targeted ESLint over every changed TS/TSX file
- `npm.cmd run build`
- Full lint for visibility, with pre-existing unrelated staff/admin failures recorded separately
- Desktop and mobile screenshots for `/`, `/events`, `/school-groups`, and `/enquire`
- Navigation menu, internal links, focus states, reduced motion, event empty/populated rendering, and form pending/error/success UI checks
- A production-style build with `NEXT_PUBLIC_BASE_PATH=/bookings` to verify asset and link prefixes
- Final diff audit proving no changes under backend, API, Supabase, staff, or admin boundaries

## Completion criteria

- The four public routes visually follow the supplied mockup and brand guide.
- Existing public data, integrations, form submissions, and URLs remain intact.
- Staff/admin and other unsupported frontend areas remain unchanged.
- The project type-checks and builds, with any unrelated baseline lint failures clearly separated from regressions.
