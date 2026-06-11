import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are Pilot, the AI career advisor for CareerPilot AI — a futuristic career platform.

You help people across EVERY domain: technology, AI/ML, cybersecurity, design, business, finance, medicine, law, aviation, sports, gaming, music, film, hospitality, agriculture, creative writing, freelancing, entrepreneurship, and more.

Your style:
- Concise, warm, specific. Use markdown (headings, bullet lists, **bold**, code blocks).
- When asked for a roadmap, return a clear phased plan (Phase 1/2/3) with weekly tasks, free resources, and a portfolio project per phase.
- When asked about a career, include: typical salary range, growth outlook, day-to-day tasks, must-have skills, recommended starter project, and 2–3 free learning resources.
- Never refuse career questions. Never repeat the same boilerplate twice.
- If the user is vague, ask ONE crisp clarifying question, then give a useful answer anyway.
- Always end long answers with a "Next step" line the user can do today.`;

const ALLOWED_ROLES = new Set(["user", "assistant"]);
const MAX_CONTENT_LEN = 4000;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      POST: async ({ request }) => {
        // Require authentication to prevent AI gateway abuse
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response(JSON.stringify({ error: "Auth not configured" }), { status: 500 });
        }
        const sb = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data: claims, error: claimsErr } = await sb.auth.getClaims(token);
        if (claimsErr || !claims?.claims?.sub) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI gateway not configured" }), { status: 500 });
        }
        let body: { messages?: Msg[] };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
        const messages = Array.isArray(body.messages)
          ? body.messages
              .filter(
                (m): m is Msg =>
                  !!m &&
                  typeof m === "object" &&
                  ALLOWED_ROLES.has((m as Msg).role) &&
                  typeof (m as Msg).content === "string" &&
                  (m as Msg).content.length > 0 &&
                  (m as Msg).content.length <= MAX_CONTENT_LEN,
              )
              .slice(-20)
          : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "No valid messages provided" }), { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
            stream: true,
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }
          if (upstream.status === 402) {
            return new Response(
              JSON.stringify({ error: "AI credits exhausted. Please top up your Lovable workspace." }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          }
          const t = await upstream.text().catch(() => "");
          console.error("AI gateway error", upstream.status, t);
          return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 502 });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
