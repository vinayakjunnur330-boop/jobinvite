import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDomains from "./tools/list-domains";
import searchCareers from "./tools/search-careers";
import getCareer from "./tools/get-career";
import listSavedCareers from "./tools/list-saved-careers";
import saveCareer from "./tools/save-career";

// Direct Supabase issuer — the .lovable.cloud proxy is rejected by mcp-js
// (RFC 8414 issuer mismatch). Fallback keeps issuer well-formed during the
// throwaway manifest-extract eval; the published build inlines the real ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "careerpilot-ai-mcp",
  title: "CareerPilot AI",
  version: "0.1.0",
  instructions:
    "Tools for CareerPilot AI, an AI career-guidance platform. Use `list_domains` and `search_careers` to explore the catalog, `get_career` for full details, and `list_saved_careers` / `save_career` to manage the signed-in user's dashboard.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDomains, searchCareers, getCareer, listSavedCareers, saveCareer],
});
