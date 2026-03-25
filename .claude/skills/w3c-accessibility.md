# SKILL: W3C WAI ACCESSIBILITY

## 1. Forms & Error Handling (WCAG 3.3)

- **Labeling:** Explicit `<label>` tied via `htmlFor` to the input's `id` is mandatory.
- **Validation State:** Inputs failing validation must have `aria-invalid="true"`.
- **Error Messages:** Error text must be linked to the input using `aria-describedby` so screen readers announce it on focus.

## 2. Keyboard Navigation

- All form fields and buttons must be accessible via `Tab`.
- Never remove focus outlines (`outline: none`) without providing a visible `:focus-visible` state.
