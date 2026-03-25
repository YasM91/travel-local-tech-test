# TravelLocal Tech Test Notes

## 🏗️ Assumptions & Architecture

- **Next.js Pages Router:** Stuck strictly to the Pages Router as requested, avoiding App Router paradigms (no Server Components, no Server Actions).
- **Component tree is deliberately shallow:** `BookingPage` owns the top-level submitted state and renders either `<TravellerForm>` or `<SuccessMessage>`. `TravellerForm` owns its own form state via `react-hook-form`. I followed Kent C. Dodds' AHA principle — the `Field` helper is colocated inside `TravellerForm` because it is used in exactly one place.
- **State Management:** Local React state was sufficient for this single-page flow. I deliberately avoided Redux or Context API — that would be over-engineering a problem that doesn't exist yet.
- **Validation:** Chose `zod` alongside `react-hook-form` via `@hookform/resolvers`. `TravellerDetailsSchema` is the single source of truth for both runtime validation and the TypeScript type (`z.infer`) — eliminating the drift problem where a TS interface and a validation schema describe the same shape in two separate places.
- **SSR safety:** Mock data from `getServerSideProps` is run through the Zod schema with `.parse()` (not `.safeParse()`) before it reaches the render layer. This structurally prevents XSS from SSR props — only schema-valid strings can ever be serialised into page props.
- **Styling:** Tailwind v4's CSS-native `@theme` directive replaces `tailwind.config.js`. All brand tokens live in `globals.css` and are consumed as utilities (`bg-brand`, `text-error`). Reusable patterns (`.btn-primary`, `.input`) are declared as `@utility` blocks so they compose via `@apply` without creating unnecessary component abstractions.

## ♿ Accessibility (A11y) Focus

- Implemented native semantic HTML (`<form>`, `<fieldset>`, `<legend>`) — no `<div>` elements acting as interactive controls.
- Enforced strict ARIA relationships: inputs use `aria-invalid="true"` when errors occur, and `aria-describedby` to link each error `<p>` directly to its field so screen readers announce the message on focus (WCAG 3.3.1).
- `role="alert"` on error paragraphs creates an assertive live region — errors are announced immediately on submit without the user needing to tab to them.
- Added a visible "Fields marked _ are required" note after the `<legend>` — the `_`itself is`aria-hidden` but the explanation is real text (WCAG 3.3.2).
- On successful submission, `useEffect` moves focus programmatically to the `<SuccessMessage>` section (`tabIndex={-1}`) so keyboard and screen-reader users immediately know the form content has changed (WCAG 2.4.3).
- Maintained visible `focus-visible:ring` states across all interactive elements — no `outline: none` without a replacement.
- All decorative SVGs (checkmarks, step connectors) carry `aria-hidden="true"` to prevent double-reading.

## 🤖 AI Usage

- Used Claude (Anthropic) as a pair-programming partner throughout — scaffolding boilerplate, generating Vitest test suites, and enforcing W3C WAI-ARIA form compliance via a custom "Accessibility Auditor" prompt context.
- The AI flagged two real a11y gaps during the Phase 4 audit: missing focus management on the success state swap (WCAG 2.4.3) and the unexplained required-field indicator (WCAG 3.3.2) — both were fixed and covered with new tests.

## 🚀 What I'd Improve for Production

- **Real API call + server-side validation:** The current `onSubmit` fires a simulated delay and `console.log`s the payload — intentionally, as per the brief. In production this would be a `fetch` to a Next.js API route (`pages/api/bookings.ts`). Critically, `TravellerDetailsSchema` (currently exported from `TravellerForm.tsx`) would be moved to a shared location like `lib/schemas/traveller.ts` and imported by _both_ the client form and the API route. This means the same Zod constraints are enforced at both boundaries — a client-side bypass cannot produce invalid data server-side.
- **Global State / URL State:** For a real multi-step flow, I would sync the step state to the URL query parameters (e.g. `?step=2`) so users can share links, refresh, or use the browser back button without losing their place. In Pages Router this is a straightforward `useRouter` change.
- **Form Persistence:** A `beforeunload` listener + `sessionStorage` write would preserve draft field values if the user navigates away accidentally. The Zod schema would validate the stored shape before rehydrating — stale or structurally corrupt data in storage is a real failure mode.
- **Internationalization (i18n):** Hardcoded strings would be extracted to a translation dictionary (e.g. `next-intl`) and phone validation would use `libphonenumber-js` against the user's selected country code rather than the current permissive regex.
- **`<Head>` page title update:** When the success screen renders, `next/head` should update `<title>` to "Booking confirmed — TravelLocal" so browser history entries and screen reader page announcements reflect the state change.
- **Error boundary:** A React error boundary around `<TravellerForm />` would catch unexpected runtime errors and render a graceful fallback rather than a blank screen.
