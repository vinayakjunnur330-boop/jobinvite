## Mega-Menu Navigation Upgrade

Transform the current `Navbar` links into hover-triggered glassmorphic mega-menus on desktop, and collapsible accordions inside the mobile hamburger drawer. Keep the existing dark Apple-tier aesthetic and all current auth/theme controls intact.

### Scope
- File: `src/components/Navbar.tsx` (only file changed)
- No route/business logic changes. Sub-items link to existing routes with hash anchors where a dedicated page doesn't exist (e.g. `/#pricing`, `/dashboard#saved`).

### 1. Navigation data structure

Replace `primaryLinks` with a typed `navigation` array of 8 categories. Each entry: `{ label, to, children: [{ label, to }] }`.

| Category | Sub-items → target |
|---|---|
| Home `/` | How It Works `/#how`, Success Stories `/#stories`, Features `/#features`, Pricing `/#pricing`, FAQ `/#faq` |
| Assessment `/assessment` | Personality `/personality`, Technical Skills `/skills`, Aptitude Logic `/assessment#aptitude`, Career Fit `/assessment#fit`, AI Resume Grader `/resume`, Interview Readiness `/assessment#interview` |
| Dashboard `/dashboard` | My Profile `/profile`, Application Tracker `/dashboard#applications`, Saved Jobs `/dashboard#saved`, Analytics `/dashboard#analytics`, Badges `/dashboard#badges`, Settings `/profile#settings` |
| Roadmap `/roadmap` | Tech & Engineering `/roadmap#tech`, Business & Management `/roadmap#business`, Creative & Design `/roadmap#creative`, AI Roadmap `/roadmap#ai`, Milestone Tracker `/roadmap#milestones`, Resource Library `/resources` |
| Mentors `/mentors` | Find a Mentor `/mentors`, Top Rated `/mentors#top`, Book 1:1 `/mentors#book`, My Sessions `/mentors#sessions`, Become a Mentor `/mentors#become` |
| Scholarships `/scholarships` | Browse All `/scholarships`, Merit-Based `/scholarships#merit`, Need-Based `/scholarships#need`, Study Abroad `/scholarships#abroad`, Diversity `/scholarships#diversity`, Deadlines `/scholarships#deadlines` |
| Internships `/internships` | Summer `/internships#summer`, Remote `/internships#remote`, Tech & Startups `/internships#tech`, Corporate `/internships#corporate`, PPO `/internships#ppo`, Interview Prep `/internships#prep` |
| Blog `/blog` | Career Advice `/blog#advice`, Industry Trends `/blog#trends`, Interview Strategies `/blog#interview`, Resume Guides `/blog#resume`, Success Stories `/blog#stories` |

### 2. Desktop mega-menu

- New desktop nav strip rendered between the logo and the right-side controls, visible at `md:` and above.
- Each category is a hover/focus trigger. On hover or keyboard focus, fade+slide-in a dropdown panel positioned under the trigger.
- Panel styling: `bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 min-w-56`.
- Sub-links: `block text-sm text-gray-300 hover:text-cyan-400 hover:bg-white/5 px-4 py-2 rounded-md transition-colors`.
- Interaction: lightweight local state (`openIndex` + open/close timers ~120ms) so moving between trigger and panel doesn't flicker; click-outside and Esc close. No new dependency — reuses the existing motion primitives already in the project.
- Trigger label uses existing `story-link` underline treatment; active route gets `text-foreground`, others `text-muted-foreground`.

### 3. Mobile accordion in hamburger drawer

- Keep existing hamburger button. Inside the drawer, render each category as an accordion row:
  - Row: category label + chevron; tap toggles `expandedIndex`.
  - Expanded: children list indented, same hover/active styling as desktop sub-links, closes drawer on selection.
- Preserve existing auth actions block at the bottom of the drawer.

### 4. Behavior & a11y

- `aria-haspopup="menu"`, `aria-expanded`, `role="menu"`/`menuitem` on triggers and panels.
- Keyboard: Enter/Space opens, Esc closes, Tab moves through items naturally.
- Reduced motion: respect existing `prefers-reduced-motion` — skip the slide, keep instant fade.
- Preserve `showPageLoader()` calls where currently used (sign-in link).

### Technical Notes
- No new packages. Uses React state + Tailwind transitions already present. Radix isn't required for this scope; if later needed we can swap to `@radix-ui/react-navigation-menu` without changing the data structure.
- Hash targets that don't yet have matching `id` anchors will still navigate to the base route — adding the anchors is out of scope for this UI-only change.
