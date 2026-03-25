# TravelLocal Tech Test Notes

## 🏗️ Assumptions & Architecture

- **Next.js Pages Router:** Stuck strictly to the Pages router as requested, avoiding App Router paradigms.
- **State Management:** Assumed that for a simple 3-step flow, local React state (via `react-hook-form`) was sufficient. I avoided pulling in Redux or Context API to prevent over-engineering.
- **Validation:** Chose `zod` alongside `react-hook-form` for robust, type-safe client-side validation that maps directly to TypeScript interfaces.

## ♿ Accessibility (A11y) Focus

- Implemented native semantic HTML (`<form>`, `<fieldset>`, `<legend>`).
- Enforced strict ARIA relationships: inputs use `aria-invalid` when errors occur, and `aria-describedby` to link the specific error message to the screen reader focus.
- Maintained visible keyboard focus states across all interactive elements.

## 🤖 AI Usage

- Used [Claude/Gemini] primarily as a pair-programming partner to scaffold boilerplate, generate the Vitest testing setups, and enforce strict W3C WAI-ARIA form compliance.
- Actively prompted the AI with a custom "Accessibility Auditor" context to double-check my semantic HTML structures.

## 🚀 What I'd Improve for Production

- **Global State / URL State:** For a real multi-step flow, I would sync the step state to the URL query parameters (e.g., `?step=2`) so users can share links or refresh without losing their place.
- **Form Persistence:** Implement `localStorage` or `sessionStorage` caching so users don't lose their data if they accidentally navigate away.
- **Internationalization (i18n):** Hardcoded strings would be extracted to a translation dictionary.
- **Advanced Phone Validation:** The current phone validation is basic. In production, I'd integrate `libphonenumber-js` to handle international dialing codes and strict format checking.
