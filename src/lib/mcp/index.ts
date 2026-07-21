import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDomains from "./tools/list-domains";
import searchCareers from "./tools/search-careers";
import getCareer from "./tools/get-career";
import listSavedCareers from "./tools/list-saved-careers";
import saveCareer from "./tools/save-career";
import getJobTrends from "./tools/get-job-trends";
import generateRoadmap from "./tools/generate-roadmap";
import exportReportPdf from "./tools/export-report-pdf";

// Direct Supabase issuer — the .lovable.cloud proxy is rejected by mcp-js
// (RFC 8414 issuer mismatch). Fallback keeps issuer well-formed during the
// throwaway manifest-extract eval; the published build inlines the real ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "careerpilot-ai-mcp",
  title: "CareerPilot AI",
  version: "0.1.0",
  instructions:
    "Tools for CareerPilot AI. Public: list_domains, search_careers, get_career, get_job_trends, generate_career_roadmap. Auth-required: list_saved_careers, save_career, export_career_report_pdf.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listDomains, searchCareers, getCareer, listSavedCareers, saveCareer, getJobTrends, generateRoadmap, exportReportPdf],
});

