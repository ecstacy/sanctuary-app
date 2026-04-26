# Sanctuary — Backlog

Running list of deferred work. Newest items on top. Move to "Done" with a date when shipped.

---

## Open

### Design System

- **Custom icon library pilot** — Evaluate swapping (or complementing) Material Symbols Outlined with a warmer icon set. Candidates:
  - Lucide (`lucide-react`) — clean outlined, tree-shakable
  - Phosphor (`@phosphor-icons/react`) — 6 weights; Duotone/Regular suit wellness tone
  - Heroicons, Tabler — alternates
  - Material Symbols Rounded/Sharp — CSS-only swap, no new dep
  - Plan: wrap in `<Icon name="..." />` component for centralized swaps; pilot on bottom nav + primary CTAs before full migration.

### Features

- **"Done for the day" asana completion tracking** — User JTBD: tick an asana as done for the day.
  - Currently `completedAsanas` lives only in `PracticePage.jsx` reducer state (no persistence).
  - Needs: new data model (Supabase table or local column), per-day reset logic, UI affordance (checkmark on asana card + streak integration).
  - Affects: HomePage "Pick up where you left off" widget (show completed state), AsanaDetailPage, Journey stats.

### Content / Media

- _(none open)_

### Quality

- **i18n coverage** — ~110 hardcoded user-facing strings across pages. Extract into locale files; wire through existing i18n setup.
- **a11y pass for icon-only buttons** — Add `aria-label` to all icon-only controls (back buttons, close buttons, expand toggles, etc.).

---

## Done

<!-- Format: - YYYY-MM-DD — short description -->
