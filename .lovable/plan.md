
# Build all sub-pages with real functionality

Replace every "Coming Soon" `SubPageShell` across the 8 nav categories with real, working features. Because this is 40+ pages, I'll ship it in 6 sequential turns, each focused on one theme. Turn 1 lands the flagship Resume Grader; the remaining turns follow the same quality bar.

## Shared foundation (Turn 1)

Built once, reused across every sub-page:

- **Private storage bucket** `user-uploads` (Supabase Storage, private, RLS scoped to `auth.uid()` folder prefix) — used by resume, profile portfolio, mentor uploads.
- **AI helper** `src/lib/ai-grader.functions.ts` — `createServerFn` + `requireSupabaseAuth`, calls Lovable AI Gateway (`google/gemini-3.6-flash`) with strict JSON output for scoring.
- **Common tables** (all with RLS + GRANTs per rules):
  - `resume_analyses` (user_id, file_path, overall_score, ats_score, sections jsonb, suggestions jsonb, matched_role, created_at)
  - `assessment_results` (user_id, kind, score, traits jsonb, answers jsonb, created_at) — powers all 4 assessment quizzes
  - `roadmap_progress` (user_id, roadmap_slug, milestone_id, completed_at)
  - `mentor_sessions` (user_id, mentor_id, scheduled_at, status, notes)
  - `mentors` (seeded catalog, public read)
  - `scholarships`, `internships`, `blog_posts` (seeded content, public read)
- **Reusable components**: `QuizRunner`, `ScoreCard`, `ProgressRing`, `FilterBar`, `EmptyState`.

## Turn 1 — Assessment category (flagship: Resume Grader)

- `/assessment/resume` — **Full AI Resume Grader**
  - Drag/drop PDF or DOCX upload (react-dropzone)
  - Uploads to `user-uploads/{uid}/resumes/{uuid}.pdf` (private bucket)
  - Server fn extracts text (pdf-parse), sends to Gemini with strict schema → returns `{ overallScore, atsScore, sections: {contact, summary, experience, skills, education}, strengths[], weaknesses[], suggestions[], suggestedRoles[] }`
  - Results dashboard: animated score rings, per-section breakdown, rewrite suggestions, downloadable improved-bullets, history list of past analyses
- `/assessment/personality` — 20-question Big Five quiz, radar chart of traits, saved to `assessment_results`
- `/assessment/technical` — 15-question adaptive MCQ across React/Python/SQL/DSA, per-topic scores
- `/assessment/aptitude` — timed logic/numerical/verbal quiz, percentile rank
- `/assessment/career-fit` — combines latest personality + technical + resume scores into top-5 career matches
- `/assessment/interview` — AI mock interview: Gemini asks 5 role-specific questions, user answers via text or voice, gets scored feedback per answer

## Turn 2 — Dashboard category

- `/dashboard/profile` — editable profile + portfolio links + avatar upload
- `/dashboard/applications` — full CRUD on `job_applications` (already exists) with kanban board (Applied / Interview / Offer / Rejected)
- `/dashboard/saved` — grid of saved careers/jobs with unsave + notes
- `/dashboard/analytics` — charts (recharts): applications over time, assessment score trend, skill coverage
- `/dashboard/badges` — earned badges (first-assessment, resume-grader, 5-applications, mentor-session)
- `/dashboard/settings` — email prefs, theme, delete account, active sessions

## Turn 3 — Roadmap category

- `/roadmap/tech`, `/roadmap/business`, `/roadmap/creative` — curated milestone lists (seeded) with check-off persistence via `roadmap_progress`
- `/roadmap/ai` — Gemini generates a personalized 12-milestone roadmap from user's target role + current skills; saved and re-editable
- `/roadmap/milestones` — global tracker across all roadmaps with progress rings
- `/roadmap/resources` — searchable/filterable library of curated links (seeded), bookmark to profile

## Turn 4 — Mentors category

- `/mentors/find` — filterable directory (domain, price, rating) from `mentors` table
- `/mentors/top` — sorted by rating leaderboard
- `/mentors/book` — calendar picker → creates `mentor_sessions` row (mock payment)
- `/mentors/sessions` — user's upcoming/past sessions with cancel + join-link
- `/mentors/become` — application form → inserts into `mentor_applications`

## Turn 5 — Scholarships + Internships

- `/scholarships/*` — 5 filtered views over shared `scholarships` table (browse/merit/need/abroad/diversity), each with apply-tracking, deadlines, save
- `/internships/*` — 5 filtered views over `internships` table (summer/remote/startup/corporate) + `/internships/prep` interactive checklist with AI question generator

## Turn 6 — Blog + Home sub-anchors

- `/blog/advice`, `/blog/news`, `/blog/stories` — MDX-style article listings from `blog_posts` table with detail routes, reading time, related posts
- Home anchors (`/#how`, `/#stories`, `/#features`, `/#pricing`, `/#faq`) — verify smooth-scroll targets exist on `/`; add any missing sections

## Technical section (details for reference)

- All server logic via `createServerFn` in `src/lib/*.functions.ts` (never edge functions).
- Auth: every user-scoped fn uses `requireSupabaseAuth`; loaders on public routes call public fns only.
- Storage: single private `user-uploads` bucket, RLS `((storage.foldername(name))[1] = auth.uid()::text)` for select/insert/update/delete.
- AI: Lovable AI Gateway, `google/gemini-3.6-flash`, structured output via `Output.object(zodSchema)`, wrapped in `NoObjectGeneratedError` fallback.
- PDF parsing: `pdf-parse` (pure JS, Worker-safe). DOCX: `mammoth`.
- Every route keeps its own `head()` with unique title/description/og tags (already scaffolded).
- Reuses existing dark glassmorphic design tokens; no new theme.

## What ships this turn

Only **Turn 1 (Assessment category + shared foundation)**. After you approve and it lands, say "continue" and I'll roll Turn 2, etc. This keeps each turn reviewable rather than a single mega-change.
