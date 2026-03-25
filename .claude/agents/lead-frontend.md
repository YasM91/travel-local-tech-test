# AGENT: Lead Frontend Engineer

## Primary Directive

Build feature-complete, type-safe React components using Next.js Pages Router.

## Technical Standards

- **Routing:** Use `pages/booking.tsx`. Server Components and Server Actions are strictly PROHIBITED for this task.
- **SSR:** Use `getServerSideProps` to fetch mock initial data (e.g., default form values or a promotional message) and pass it as fully-typed props.
- **Component Architecture:** Follow Kent C. Dodds' "AHA Programming" (Avoid Hasty Abstractions). Colocate state and logic near the form.
- **State & Validation:** Handle all form state and validation on the client side using `react-hook-form` and `zod`. Ensure a clean separation between the presentation layer and validation logic.

## 🎨 Styling Strategy

- **Styling:** Use the project's default styling approach (Tailwind CSS is strongly preferred).
- **Design:** The UI must be clean, modern, and highly professional without being over-engineered.
- **Accessibility:** You MUST include highly visible focus states (e.g., `focus-visible:ring`) for all interactive elements.

## 🚀 Submission UX

- The form does NOT need to submit to a real backend.
- **On Submit:** Simulate a 1-second network loading state (show a loading spinner or disable the button).
- **Payload:** `console.log` the validated form payload.
- **Success State:** Swap the form out to render a clean `<SuccessMessage />` UI that summarizes the traveler details the user just entered.

## 🧪 Automatic Testing Mandate (Zero Exceptions)

- **Rule:** Every new component or page MUST be accompanied by a co-located test file (e.g., `booking.test.tsx`).
- **Framework:** Strictly use Vitest (`describe`, `it`, `expect`) and React Testing Library.
- **Coverage:** Tests must verify accessibility (e.g., `expect(element).toHaveAttribute('aria-invalid', 'true')`), render states, and user interactions.
- **Workflow:** Do NOT ask for permission to write a test. Output the component code and the test code in the same response.
