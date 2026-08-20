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

### 2026-08-20 — Sprint VRTX3-S-0033: Three Independent Health Check Endpoints (189360772)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their colocated tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. VRTX3-I-0040's design manifest is empty (`blocks: []`) and the idea says so itself — "this change adds no screen, page or flow" — so "unchanged" here means reviewed and found to have no visual surface, not skipped. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-20 — Sprint VRTX3-S-0028: Three Independent Health Check Endpoints (458730798)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. VRTX3-I-0037's design manifest is empty — `a2a_get_idea_design` returned `blocks: []` — so there was nothing to build to, and this entry exists so "unchanged" stays distinguishable from "not reviewed". The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-19 — Sprint VRTX3-S-0027: Three Independent Health Check Endpoints (868033827)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. VRTX3-I-0036's design manifest is empty — `a2a_get_idea_design` returned `blocks: []` — so there was nothing to build to, and this entry exists so "unchanged" stays distinguishable from "not reviewed". The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-19 — Sprint VRTX3-S-0026: Three Independent Health Check Endpoints (888240601)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The idea behind it carries no wireframe or mockup — its design manifest is empty — so there was nothing to build to. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-14 — Sprint VRTX3-S-0023: Three Independent Health Check Endpoints (1065915107)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The idea behind it carries no wireframe or mockup — its design manifest is empty — so there was nothing to build to. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-11 — Sprint VRTX3-S-0022: Three Independent Health Check Endpoints (600965021)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-11 — Sprint VRTX3-S-0021: Three Independent Health Check Endpoints (568557289)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-11 — Sprint VRTX3-S-0019: Three Independent Health Check Endpoints (472035881)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-10 — Sprint VRTX3-S-0017: Three Independent Health Check Endpoints (238855431)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-10 — Sprint VRTX3-S-0016: Three Independent Health Check Endpoints (756246354)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-09 — Sprint VRTX3-S-0013: Three Independent Health Check Endpoints (841017405)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed, as does the missing dark-mode toggle under [Theming](#theming).

### 2026-08-09 — Sprint VRTX3-S-0011: Three Independent Health Check Endpoints (528856326)

No design-system change. The sprint is backend-only (three `routes/api/` handlers plus their tests); nothing in `src/`, no token, component, icon or animation touched, and no UI surface links to the new endpoints. The light-mode `--destructive-foreground` issue noted under [Tokens](#tokens) remains open and unclaimed.

### 2026-08-05 — Sprint VRTX3-S-0006: Three Independent Health Check Endpoints

No design system changes for this sprint (backend-only API endpoint additions). Three new endpoints added to demonstrate parallel development pattern without code sharing.

### 2026-08-02 — Sprint VRTX3-S-0004: Three Independent Health Check Endpoints

No design system changes for this sprint (backend-only API endpoint additions). Three new endpoints added to demonstrate parallel development pattern without code sharing.

### 2026-07-26 — Sprint SPRINT-0019: Three Independent Health Check Endpoints

No design system changes for this sprint (backend-only API endpoint additions). Three new endpoints added to demonstrate parallel development pattern.

### 2026-07-26 — Sprint SPRINT-0007: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Sprint SPRINT-0005: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Sprint SPRINT-0004: Health Check Endpoint

No design system changes for this sprint (backend-only API endpoint addition).

### 2026-07-26 — Bootstrap sprint

Initial design system documentation. OKLCH custom properties in `src/index.css` for light/dark mode tokens, mapped to Tailwind v4 utilities. Component pattern: CVA + Radix Slot for variants and polymorphism. Icons: lucide-react (general) + @heroicons/react (overlay/nav). Animation via tw-animate-css. Dark mode exists but no toggle wired yet.
