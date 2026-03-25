# SECURITY & COMPLIANCE PROTOCOLS

## 1. Data Integrity & Validation

- **Input:** Every form entry point MUST have a corresponding Zod schema. Parse, don't just validate.
- **Sanitization:** Ensure any mock data passed from `getServerSideProps` is safely rendered to prevent XSS.

## 2. Dependency Management

- Ask for explicit confirmation before installing external packages (e.g., `react-hook-form`, `zod`, `clsx`).
