# Design System

See [PRODUCT.md](./PRODUCT.md) for what this is, [ARCHITECTURE.md](./ARCHITECTURE.md) for how it's built, and [AGENT.md](./AGENT.md) for the operating manual.

## Tokens

OKLCH custom properties in `src/index.css` (`:root` light, `.dark` dark), mapped to Tailwind utilities via `@theme inline`. Add a token in both places + the theme block, or Tailwind won't generate a class for it.

| Token                                                | Tailwind Class                                       | Usage                                  |
| ---------------------------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `--background` / `--foreground`                      | `bg-background` / `text-foreground`                  | Page background, default text color    |
| `--primary` / `--secondary` / `--muted` / `--accent` | `bg-primary`, etc.                                   | Component states, emphasis, highlights |
| `--destructive`                                      | `bg-destructive`                                     | Danger actions (delete, cancel)        |
| `--border` / `--input` / `--ring`                    | `border-border` / `border-input` / `outline-ring/50` | Outlines, input boxes, focus rings     |
| `--radius` (+ `sm`/`md`/`lg`/`xl`)                   | `rounded-sm`, etc.                                   | Border radius scale                    |

**Known issue**: light-mode `--destructive-foreground` duplicates `--destructive` (text would be invisible). Dark mode has it right. Fix by customizing the light-mode token.

## Theming

Dark-mode tokens exist (`.dark` class) but no toggle is wired up — nothing sets `.dark` on `<html>` yet. Future sprints can wire up a theme switcher in `src/App.tsx` or a middleware context.

## Components

**Pattern** (see `src/components/ui/button.tsx` + `button-variants.ts`):

- Variants via `class-variance-authority` — define button sizes, colors, states once, no class duplication
- Class merging via `cn()` (`clsx` + `tailwind-merge`) — always applied last, so component consumers can override
- Polymorphism via Radix `Slot` (`asChild` prop) — render buttons as links, submit buttons, custom elements
- Variants exported from a separate `*-variants.ts` file, not the component file — avoids an `eslint-plugin-react-refresh` warning

**New shared components** go in `src/components/ui/`, follow this pattern, include a `*.test.tsx` spec.

## Icons

- **`lucide-react`** — general-purpose icons (check, x, menu, etc.)
- **`@heroicons/react`** — used for `@headlessui/react` overlays and navigation dialogs, alternate icon style

## Animation

`tw-animate-css` — Tailwind v4-compatible successor to `tailwindcss-animate`. Use `animate-*` utility classes (e.g., `animate-spin`, `animate-bounce`, `animate-fade-in`).

---

## Changelog

### 2026-07-26 — Sprint SPRINT-0015: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Bootstrap sprint

Initial design system documentation. OKLCH custom properties in `src/index.css` for light/dark mode tokens, mapped to Tailwind v4 utilities. Component pattern: CVA + Radix Slot for variants and polymorphism. Icons: lucide-react (general) + @heroicons/react (overlay/nav). Animation via tw-animate-css. Dark mode exists but no toggle wired yet.
