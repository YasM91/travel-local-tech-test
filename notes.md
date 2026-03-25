# TravelLocal Tech Test Notes

## 🏗️ Assumptions & Architecture

- **Next.js Pages Router:** Stuck strictly to the Pages Router as requested, avoiding App Router paradigms (no Server Components, no Server Actions).
- **3-step booking flow:** The implemented flow is Step 1 (Your Trip — placeholder), Step 2 (Traveller Details), Step 3 (Confirm & Pay), with a final Booking Confirmed screen. The app lands on Step 2, which is the focus of the brief.
- **Component tree is deliberately shallow:** `BookingPage` is a thin orchestration layer — it owns top-level flow state and renders one of three step children based on `useBookingFlow`. `TravellerForm` owns its own form state via `react-hook-form`. The `Field` helper is colocated inside `TravellerForm` because it is used in exactly one place (AHA principle).
- **State Management:** Local React state via a dedicated `useBookingFlow` hook (in `hooks/`) was sufficient for this single-page flow. I deliberately avoided Redux or Context API — that would be over-engineering a problem that doesn't exist yet.
- **Validation:** Chose `zod` alongside `react-hook-form` via `@hookform/resolvers`. `TravellerDetailsSchema` is the single source of truth for both runtime validation and the TypeScript type (`z.infer`) — eliminating the drift problem where a TS interface and a validation schema describe the same shape in two separate places.
- **SSR safety:** Mock data from `getServerSideProps` is run through the Zod schema with `.parse()` (not `.safeParse()`) before it reaches the render layer. This structurally prevents XSS from SSR props — only schema-valid strings can ever be serialised into page props.
- **Styling:** Tailwind v4's CSS-native `@theme` directive replaces `tailwind.config.js`. All brand tokens live in `globals.css` and are consumed as utilities (`bg-brand`, `text-error`). Reusable patterns (`.btn-primary`, `.input`) are declared as `@utility` blocks so they compose via `@apply` without creating unnecessary component abstractions.
- **Fonts:** Inter is loaded via `next/font/google` in `_app.tsx` (self-hosted by Next.js, zero external font request at runtime, no FOUT).

## 🗂️ Project Structure

```
pages/
  booking.tsx          # SSR + orchestration (getServerSideProps + BookingPage)
  _app.tsx             # Next font setup (Inter)
  _document.tsx        # Global SEO meta (robots, theme-color, OG defaults)

components/
  TravellerForm.tsx    # Step 2 — react-hook-form + Zod
  ConfirmPayStep.tsx   # Step 3 — fake card form with live validation gating
  SuccessMessage.tsx   # Post-payment confirmation + confetti
  StepIndicator.tsx    # 3-step progress nav with celebration animation

hooks/
  use-booking-flow.ts  # Flow state: currentStep, submittedData, isPaid

lib/
  booking-steps.ts     # BOOKING_STEPS constant
  schemas/
    traveller.ts       # TravellerDetailsSchema (Zod)

styles/
  globals.css          # Tailwind v4 @theme tokens + all animation keyframes
```

## ♿ Accessibility (A11y) Focus

- Implemented native semantic HTML (`<form>`, `<fieldset>`, `<legend>`) — no `<div>` elements acting as interactive controls.
- Enforced strict ARIA relationships: inputs use `aria-invalid="true"` when errors occur, and `aria-describedby` to link each error `<p>` directly to its field so screen readers announce the message on focus (WCAG 3.3.1).
- `role="alert"` on error paragraphs creates an assertive live region — errors are announced immediately on submit without the user needing to tab to them.
- Added a visible "Fields marked _ are required" note after the `<legend>` — the `_`itself is`aria-hidden` but the explanation is real text (WCAG 3.3.2).
- **Focus management on every step transition:** Both `ConfirmPayStep` and `SuccessMessage` use `useRef` + `useEffect` to programmatically shift focus to their section on mount (`tabIndex={-1}`). This ensures keyboard and screen-reader users are never left behind when the step content changes (WCAG 2.4.3).
- **`aria-live="polite"` step region:** `BookingPage` wraps the step content area in `<div aria-live="polite" aria-atomic="false">` so screen readers announce step transitions without interrupting ongoing speech.
- **Mobile keyboard optimisation:** Email input has `inputMode="email"` (numeric soft keyboard for `@` and `.`). Phone uses `type="tel"`. Card fields use `inputMode="numeric"`.
- Maintained visible `focus-visible:ring` states across all interactive elements — no `outline: none` without a replacement.
- All decorative SVGs (checkmarks, step connectors, confetti) carry `aria-hidden="true"` to prevent double-reading.
- `prefers-reduced-motion` media query disables all CSS animations (confetti, step-celebrate, fadeIn, spinner) and transitions.

## 💳 ConfirmPayStep — Card Validation Design

The Pay button is disabled and visually grey (`bg-gray-200 text-gray-400`) until all three card fields pass inline validation:

- **Card number:** strip spaces/dashes, require 13–19 digits (covers Visa, Mastercard, Amex, Maestro).
- **Expiry:** strip spaces, enforce `MM/YY` with a valid month (`0[1-9]|1[0-2]`).
- **CVC:** require 3–4 digits.

`isCardValid` is a derived boolean computed on every render from controlled state — never stored in state itself, avoiding stale reads. The button uses a full alternate class string (not an override of `btn-primary`) because Tailwind v4 generates classes statically and cascade overrides are unreliable.

No real payment is processed. The `payDelay` prop (default 1500ms) simulates a network call with a `setTimeout` Promise, the same pattern used in `TravellerForm`'s `submitDelay`.

## 🎉 Celebration UX

When payment is confirmed:

- `useBookingFlow.onPaymentSuccess` sets `currentStep` to **4** (not 3). With 3 steps defined, `getStatus(index, 4)` returns `'complete'` for every index, making all three step circles show checkmarks simultaneously.
- **Step 3 circle animation:** `StepIndicator` receives `allComplete={isPaid}`. When true, the final circle gets the `.step-celebrate` class: a `step-pop` keyframe (scale burst: 1 → 1.3 → 0.92 → 1) combined with `step-ring-pulse` (expanding brand-colour ring, repeats 3×).
- **Confetti rain:** `SuccessMessage` renders 20 predetermined particles (module-level `const` — no `Math.random`, SSR-safe, no hydration mismatch). Particles alternate clockwise/CCW rotation via two `@keyframes` (`confetti-fall` / `confetti-fall-ccw`). Wrapped in `data-confetti` so the reduced-motion rule silences them with a single CSS selector.

## 🔒 SEO & Metadata

- `_document.tsx`: global `robots: noindex/nofollow` (appropriate for a take-home demo), `theme-color: #0f766e`, `og:site_name`, `og:type`, `og:locale`.
- `booking.tsx`: per-step dynamic `<title>` and `<meta description>` via `next/head` — updates from "Traveller Details" → "Confirm & Pay" → "Booking Confirmed" as the user progresses. `og:title` and `og:description` mirror the dynamic title.

## 🧾 Step 2 Form — Refinement Decisions

### `numberOfTravellers` Field

Added a `numberOfTravellers` field to `TravellerDetailsSchema` and the form. Key decisions:

- Used `z.coerce.number()` so the HTML input's string value is coerced to a number at validation time — no `valueAsNumber` plumbing needed in the component.
- Empty input → `Number("") === 0` → fails `.min(1)` → "At least 1 traveller is required". This is better than `valueAsNumber: true`, which would produce `NaN` on an empty input and surface an unhelpful "Must be a whole number" error instead.
- Zod v4 renamed `invalid_type_error` → `error` in the number constructor options. Updated accordingly.
- Phone field made unconditionally required (was previously accepting empty string). The `*` indicator and `aria-required="true"` were already on all fields — this aligns the schema with the stated UX.
- `numberOfTravellers` is surfaced in both the `ConfirmPayStep` booking summary and the `SuccessMessage` confirmation, giving the user a consistent audit trail across all three screens.
- Render Optimization: Used the register pattern from react-hook-form to maintain uncontrolled inputs. This prevents the entire form (and the parent BookingPage) from re-rendering on every single keystroke, keeping the "Time to Interactive" (TTI) low even on low-end mobile devices.

### Focus Management on Validation Failure (WCAG 2.4.3)

`handleSubmit` from `react-hook-form` accepts a second `onError` callback that fires when client-side validation fails. We use it to call `setFocus` on the first invalid field, ordered by visual position (`FIELD_ORDER` constant). This means:

- Keyboard users land on the problematic field immediately — no manual tabbing required.
- Screen readers announce the field label and its linked `aria-describedby` error message in sequence.
- The approach is zero-cost: no refs, no `querySelectorAll`, no DOM walking — just `setFocus(fieldName)` from react-hook-form.

### Unhappy Path — 5% Submission Failure

`onSubmit` runs `Math.random() < failureRate` after the simulated network delay. Rationale:

- `failureRate` is a prop (default `0.05`) so tests can pass `failureRate={0}` to pin the happy path, or `failureRate={1}` to force the failure branch. No `vi.spyOn(Math, 'random')` needed in unit tests.
- Integration tests in `booking.test.tsx` mock `Math.random` to `0.99` via `beforeEach` / `afterEach` since `BookingPage` doesn't forward the prop.
- The error banner uses `role="alert"` (assertive live region) so screen readers announce it immediately without the user needing to find it. It sits above the fieldset so it is visible above the fold without scrolling.
- The banner is cleared (`setSubmitError(null)`) on every new submit attempt so stale errors don't persist.
- The card form in `ConfirmPayStep` deliberately does not use the same failure simulation. It uses inline gating (Pay button disabled until all fields pass regex) — this matches the conventional pattern of payment UIs (e.g. Stripe Elements) where the button affordance communicates validity rather than explicit error messages.

## 🤖 AI Usage

- Used Claude (Anthropic) as a pair-programming partner throughout — scaffolding boilerplate, generating Vitest test suites, enforcing W3C WAI-ARIA form compliance, and iterating on UX/animation details.
- The AI flagged real a11y gaps during review: missing focus management on step transitions (WCAG 2.4.3), the unexplained required-field indicator (WCAG 3.3.2), and the absence of `aria-live` on the step region — all were fixed and covered with new tests.
- Verification Loop: Every AI-generated component was subjected to a manual "Code Review" against the project's strict security.md and w3c-accessibility.md rules. I used the AI to generate the Vitest unit tests simultaneously with the components to ensure a 1:1 "Feature-to-Test" ratio.

## 🚀 What I'd Improve for Production

- **Real API call + server-side validation:** The current `onSubmit` fires a simulated delay and `console.log`s the payload — intentionally, as per the brief. In production this would be a `fetch` to `pages/api/bookings.ts`. `TravellerDetailsSchema` is already in `lib/schemas/traveller.ts` and would be imported by both the client form and the API route — the same Zod constraints enforced at both boundaries. Use try/catch for proper error handling.
- **Real payment integration:** `ConfirmPayStep` would be replaced with a Stripe Elements embed (or equivalent). The card fields are intentionally fake — the validation regex and UI are a fidelity placeholder only.
- **URL-synced step state:** Sync `currentStep` to URL query params (`?step=2`) so users can share links, refresh without losing their place, and use the browser back button naturally. In Pages Router this is a straightforward `useRouter` change.
- **Form persistence:** A `beforeunload` listener + `sessionStorage` write would preserve draft field values if the user navigates away accidentally. The Zod schema validates the stored shape before rehydrating — stale or structurally corrupt storage data is a real failure mode.
- **Internationalisation (i18n):** Hardcoded strings would be extracted to a translation dictionary (e.g. `next-intl`). Phone validation would use `libphonenumber-js` against the user's selected country code rather than the current permissive regex.
- **Error boundary:** A React error boundary around each step component would catch unexpected runtime errors and render a graceful fallback.
- **Masked card input:** A masked-input library (e.g. `react-input-mask`) would auto-format the card number as `4242 4242 4242 4242` and the expiry as `12 / 28`, reducing friction and eliminating the need for the user to know the exact format the validation regex expects.
- **Booking reference:** The success screen should display a server-generated booking reference so the user has something to quote if they contact support.
- **End-to-End Type Safety:** I would implement Zod-to-TS or a shared Monorepo package so the backend API and frontend form share the exact same Zod schema, ensuring that a change in the database requirement (e.g., making 'Phone' optional again) would trigger a TypeScript error in the frontend immediately.
- **react Query:** use react-query for caching and retry api calls
- **Logging:** use sentry for logging and google mtag manager or amplitude for metrics.

## Payment UI & Input Masking (Future Implementation)

While not required for this MVP, I architected the Step 3 transition to support a payment flow. In a production environment, I would implement:

- **Input Masking:** Using a library like `react-number-format` or custom regex listeners to ensure 'Card Number' and 'CVC' remain numeric-only.
- **Smart Formatting:** An auto-formatting Expiry field that handles the `MM / YY` slash insertion automatically, improving UX speed.
- **PCI Compliance:** I would ensure these fields are never stored in local state longer than necessary and would integrate with a secure provider like Stripe Elements to avoid sensitive data touching the application server.
