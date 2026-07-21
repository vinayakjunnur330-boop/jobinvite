import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { careers } from "@/lib/careers";

export default defineTool({
  name: "generate_career_roadmap",
  title: "Generate personalized career roadmap",
  description: "Build a personalized, milestone-based career roadmap from assessment inputs (interests, current skills, target career, and timeframe).",
  inputSchema: {
    targetSlug: z.string().min(1).max(80).describe("Career slug the roadmap should target."),
    currentSkills: z.array(z.string().min(1)).max(30).optional().describe("Skills the user already has."),
    interests: z.array(z.string().min(1)).max(20).optional().describe("Interests or focus areas."),
    experienceYears: z.number().min(0).max(50).optional().describe("Years of professional experience."),
    timeframeMonths: z.number().int().min(3).max(120).default(24).describe("Target timeframe in months."),
  },
  annotations: { readOnlyHint: true, idempotentHint: false, openWorldHint: false },
  handler: async ({ targetSlug, currentSkills = [], interests = [], experienceYears = 0, timeframeMonths }) => {
    const career = careers.find((c) => c.slug === targetSlug);
    if (!career) {
      return { content: [{ type: "text", text: `No career found for slug "${targetSlug}".` }], isError: true };
    }
    const have = new Set(currentSkills.map((s) => s.toLowerCase()));
    const gaps = career.skills.filter((s) => !have.has(s.toLowerCase()));
    const level = experienceYears >= 6 ? "senior" : experienceYears >= 2 ? "mid" : "entry";

    const phases = [
      {
        phase: "Foundation",
        months: `0–${Math.round(timeframeMonths * 0.25)}`,
        focus: gaps.slice(0, 2),
        actions: [
          `Complete a structured course on ${gaps[0] ?? career.skills[0]}`,
          `Build 1 portfolio project applying ${career.industry} fundamentals`,
        ],
      },
      {
        phase: "Depth",
        months: `${Math.round(timeframeMonths * 0.25)}–${Math.round(timeframeMonths * 0.6)}`,
        focus: gaps.slice(2, 4).length ? gaps.slice(2, 4) : career.skills.slice(0, 2),
        actions: [
          `Ship 2 real-world projects and open-source or publish them`,
          `Contribute to communities in ${interests[0] ?? career.category}`,
        ],
      },
      {
        phase: "Positioning",
        months: `${Math.round(timeframeMonths * 0.6)}–${Math.round(timeframeMonths * 0.85)}`,
        focus: ["Personal brand", "Network"],
        actions: [
          `Publish weekly on your ${career.title} journey`,
          `Do 10 informational interviews with ${career.title}s`,
        ],
      },
      {
        phase: "Launch",
        months: `${Math.round(timeframeMonths * 0.85)}–${timeframeMonths}`,
        focus: ["Interviews", "Offers"],
        actions: [
          `Apply to 30 targeted ${career.title} roles`,
          `Prepare for ${level}-level technical + behavioral loops`,
        ],
      },
    ];

    const text =
      `Roadmap → ${career.title} (${timeframeMonths} months)\n` +
      `Level: ${level} • Skill gaps: ${gaps.join(", ") || "none"}\n\n` +
      phases.map((p) => `▸ ${p.phase} (mo ${p.months})\n  Focus: ${p.focus.join(", ")}\n  - ${p.actions.join("\n  - ")}`).join("\n\n");

    return {
      content: [{ type: "text", text }],
      structuredContent: { target: career, level, skillGaps: gaps, timeframeMonths, phases },
    };
  },
});
