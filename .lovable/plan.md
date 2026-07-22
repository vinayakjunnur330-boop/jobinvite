## Root cause

Buttons across the app use `bg-foreground text-background`. In the current dark "Deep Glass" theme, `--foreground` is white and `--background` is `transparent` (see `src/styles.css` L43, L66). So the button renders as a solid white pill with transparent text — the label is there but invisible (matches the screenshot of the Mentor cards' "Book" button).

## Fix

Replace `text-background` with an explicit dark text color (`text-neutral-900`) everywhere it is paired with `bg-foreground`. CSS-class-only edits, no component rewrites, no new elements.

### Files to edit (only the affected className strings)

- `src/components/Navbar.tsx` — Sign out / primary CTA buttons using `bg-foreground text-background`
- `src/routes/mentors.tsx` L52 — "Book" button on mentor cards (the reported one)
- `src/routes/about.tsx` L60
- `src/routes/contact.tsx` L200
- `src/routes/dashboard.tsx` L299
- `src/routes/jobs.tsx` L153
- `src/routes/resources.tsx` L95
- `src/routes/scholarships.tsx` L58
- `src/routes/internships.tsx` L55
- Any other match surfaced by `rg "bg-foreground[^\"]*text-background"` at build time

Change pattern:
`bg-foreground text-background` → `bg-foreground text-neutral-900`

No other classes, tokens, or components change. No `bg-white` + `text-white` pairings were found in the scan, so nothing else needs adjusting.