Update the global navigation menu in `src/components/Navbar.tsx`.

1. Locate the `primaryLinks` array at the top of the component.
2. Replace its contents with exactly these 8 items in this order:
   - { to: "/", label: "Home" }
   - { to: "/assessment", label: "Assessment" }
   - { to: "/dashboard", label: "Dashboard" }
   - { to: "/roadmap", label: "Roadmap" }
   - { to: "/mentors", label: "Mentors" }
   - { to: "/scholarships", label: "Scholarships" }
   - { to: "/internships", label: "Internships" }
   - { to: "/blog", label: "Blog" }
3. Leave all Tailwind classes, hover states, mobile menu structure, and other component logic untouched.
4. The mobile hamburger menu already maps over `primaryLinks`, so it will automatically sync.

All target routes already exist in `src/routes/`, so no placeholder `#` links are needed.