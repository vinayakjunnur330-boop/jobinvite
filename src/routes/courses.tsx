import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { courses } from "@/lib/careers";

export const Route = createFileRoute("/courses")({
  head: () => ({
    meta: [
      { title: "Recommended Courses — CareerPilot AI" },
      { name: "description", content: "Curated learning resources matched to your target role and skill gaps." },
      { property: "og:title", content: "Course Recommendations" },
      { property: "og:description", content: "Top courses to close your skill gaps." },
    ],
  }),
  component: CoursesPage,
});

const tags = ["All", "AI", "Cloud", "Engineering", "Design", "Data", "Security"];

function CoursesPage() {
  const [tag, setTag] = useState("All");
  const list = tag === "All" ? courses : courses.filter((c) => c.tag === tag);
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="font-mono text-xs text-primary tracking-widest mb-3">LEARNING_RESOURCES</div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Courses picked for you</h1>
      <p className="text-muted-foreground max-w-2xl mb-8">Curated based on your top career match and skill gap analysis.</p>

      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${tag === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => (
          <div key={c.title} className="glass p-6 rounded-2xl hover:border-primary/50 transition-colors flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono px-2 py-1 bg-primary/10 text-primary rounded">{c.tag}</span>
              <span className="text-xs text-muted-foreground font-mono">{c.level}</span>
            </div>
            <h3 className="font-bold text-lg mb-1">{c.title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{c.provider}</p>
            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
              <span className="text-xs font-mono text-muted-foreground">{c.duration}</span>
              <span className="font-bold text-primary text-sm">{c.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
