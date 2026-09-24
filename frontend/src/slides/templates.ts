import type { Slide, SlideContent, SlideTheme } from "@/src/storage/db";
import { genId } from "@/src/storage/db";

export type TemplateCategory =
  | "Education" | "Business" | "Startup" | "Pitch Deck" | "AI/Technology"
  | "Research" | "Finance" | "Marketing" | "Project" | "Portfolio"
  | "Reports" | "Minimal" | "Modern" | "Dark" | "Creative" | "Healthcare" | "Travel";

export type SlideTemplate = {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  theme: SlideTheme;
  build: (title: string) => Slide[];
};

const W = 720;
const H = 405;

function titleSlide(theme: SlideTheme, title: string, subtitle: string): Slide {
  return {
    id: genId(), bg: theme.bg, layout: "title",
    elements: [
      { id: genId(), kind: "shape", x: 0, y: 0, w: 12, h: H, shape: "rect", fill: theme.primary },
      { id: genId(), kind: "text", x: 40, y: 140, w: W - 80, h: 60, text: title, fontSize: 40, bold: true, color: theme.text },
      { id: genId(), kind: "text", x: 40, y: 210, w: W - 80, h: 40, text: subtitle, fontSize: 20, color: theme.secondary },
      { id: genId(), kind: "text", x: 40, y: H - 40, w: 200, h: 24, text: theme.name.toUpperCase(), fontSize: 12, color: theme.primary },
    ],
  };
}

function sectionSlide(theme: SlideTheme, label: string, title: string): Slide {
  return {
    id: genId(), bg: theme.primary, layout: "section",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 140, w: W - 80, h: 30, text: label.toUpperCase(), fontSize: 14, color: theme.bg, bold: true },
      { id: genId(), kind: "text", x: 40, y: 180, w: W - 80, h: 60, text: title, fontSize: 36, bold: true, color: theme.bg },
    ],
  };
}

function contentSlide(theme: SlideTheme, title: string, bullets: string[]): Slide {
  return {
    id: genId(), bg: theme.bg, layout: "content",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 40, w: W - 80, h: 40, text: title, fontSize: 26, bold: true, color: theme.primary },
      { id: genId(), kind: "shape", x: 40, y: 82, w: 40, h: 3, shape: "rect", fill: theme.accent },
      ...bullets.map((b, i) => ({
        id: genId(), kind: "text" as const,
        x: 40, y: 110 + i * 44, w: W - 80, h: 36,
        text: `•  ${b}`, fontSize: 16, color: theme.text,
      })),
    ],
  };
}

function twoColSlide(theme: SlideTheme, title: string, leftTitle: string, leftText: string, rightTitle: string, rightText: string): Slide {
  return {
    id: genId(), bg: theme.bg, layout: "two-col",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 40, w: W - 80, h: 40, text: title, fontSize: 26, bold: true, color: theme.primary },
      { id: genId(), kind: "shape", x: 40, y: 82, w: 40, h: 3, shape: "rect", fill: theme.accent },
      { id: genId(), kind: "shape", x: 40, y: 110, w: 300, h: 220, shape: "rect", fill: theme.bg, stroke: theme.primary },
      { id: genId(), kind: "text", x: 56, y: 126, w: 268, h: 30, text: leftTitle, fontSize: 18, bold: true, color: theme.primary },
      { id: genId(), kind: "text", x: 56, y: 160, w: 268, h: 160, text: leftText, fontSize: 14, color: theme.text },
      { id: genId(), kind: "shape", x: 360, y: 110, w: 320, h: 220, shape: "rect", fill: theme.primary },
      { id: genId(), kind: "text", x: 376, y: 126, w: 288, h: 30, text: rightTitle, fontSize: 18, bold: true, color: theme.bg },
      { id: genId(), kind: "text", x: 376, y: 160, w: 288, h: 160, text: rightText, fontSize: 14, color: theme.bg },
    ],
  };
}

function statsSlide(theme: SlideTheme, title: string, stats: { label: string; value: string }[]): Slide {
  const each = (W - 80 - (stats.length - 1) * 16) / stats.length;
  return {
    id: genId(), bg: theme.bg, layout: "stats",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 40, w: W - 80, h: 40, text: title, fontSize: 26, bold: true, color: theme.primary },
      { id: genId(), kind: "shape", x: 40, y: 82, w: 40, h: 3, shape: "rect", fill: theme.accent },
      ...stats.flatMap((s, i) => {
        const x = 40 + i * (each + 16);
        return [
          { id: genId(), kind: "shape" as const, x, y: 130, w: each, h: 170, shape: "rect" as const, fill: theme.primary },
          { id: genId(), kind: "text" as const, x, y: 160, w: each, h: 60, text: s.value, fontSize: 40, bold: true, color: theme.bg, align: "center" as const },
          { id: genId(), kind: "text" as const, x, y: 230, w: each, h: 30, text: s.label, fontSize: 14, color: theme.bg, align: "center" as const },
        ];
      }),
    ],
  };
}

function timelineSlide(theme: SlideTheme, title: string, items: { time: string; label: string }[]): Slide {
  const step = (W - 120) / Math.max(1, items.length - 1);
  return {
    id: genId(), bg: theme.bg, layout: "timeline",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 40, w: W - 80, h: 40, text: title, fontSize: 26, bold: true, color: theme.primary },
      { id: genId(), kind: "shape", x: 60, y: 200, w: W - 120, h: 4, shape: "rect", fill: theme.accent },
      ...items.flatMap((it, i) => {
        const x = 60 + i * step;
        return [
          { id: genId(), kind: "shape" as const, x: x - 10, y: 190, w: 24, h: 24, shape: "circle" as const, fill: theme.primary },
          { id: genId(), kind: "text" as const, x: x - 60, y: 140, w: 120, h: 24, text: it.time, fontSize: 14, bold: true, color: theme.primary, align: "center" as const },
          { id: genId(), kind: "text" as const, x: x - 60, y: 224, w: 120, h: 40, text: it.label, fontSize: 12, color: theme.text, align: "center" as const },
        ];
      }),
    ],
  };
}

function conclusionSlide(theme: SlideTheme): Slide {
  return {
    id: genId(), bg: theme.primary, layout: "conclusion",
    elements: [
      { id: genId(), kind: "text", x: 40, y: 160, w: W - 80, h: 60, text: "Thank You", fontSize: 44, bold: true, color: theme.bg, align: "center" },
      { id: genId(), kind: "text", x: 40, y: 220, w: W - 80, h: 30, text: "Questions & Discussion", fontSize: 18, color: theme.bg, align: "center" },
    ],
  };
}

export const SLIDE_THEMES: Record<string, SlideTheme> = {
  modernOrange: { name: "Modern Orange", bg: "#FFFFFF", primary: "#FF5E00", secondary: "#8E8E93", text: "#1C1C1E", accent: "#FF6600", font: "System" },
  darkPro: { name: "Dark Pro", bg: "#0F172A", primary: "#F97316", secondary: "#94A3B8", text: "#F1F5F9", accent: "#22D3EE", font: "System" },
  academic: { name: "Academic Blue", bg: "#FFFFFF", primary: "#1E40AF", secondary: "#64748B", text: "#0F172A", accent: "#F59E0B", font: "System" },
  corporate: { name: "Corporate Navy", bg: "#F8FAFC", primary: "#0F172A", secondary: "#475569", text: "#0F172A", accent: "#FF5E00", font: "System" },
  startup: { name: "Startup Vibrant", bg: "#FFFFFF", primary: "#7C3AED", secondary: "#6B7280", text: "#111827", accent: "#EC4899", font: "System" },
  finance: { name: "Finance Emerald", bg: "#FFFFFF", primary: "#047857", secondary: "#4B5563", text: "#111827", accent: "#F59E0B", font: "System" },
  marketing: { name: "Marketing Coral", bg: "#FFFBEB", primary: "#DC2626", secondary: "#78716C", text: "#1C1917", accent: "#F97316", font: "System" },
  tech: { name: "Tech Cyan", bg: "#0F172A", primary: "#06B6D4", secondary: "#94A3B8", text: "#F1F5F9", accent: "#A78BFA", font: "System" },
  minimal: { name: "Minimal Mono", bg: "#FFFFFF", primary: "#111827", secondary: "#6B7280", text: "#111827", accent: "#111827", font: "System" },
  research: { name: "Research Slate", bg: "#F1F5F9", primary: "#1E293B", secondary: "#64748B", text: "#0F172A", accent: "#0EA5E9", font: "System" },
  creative: { name: "Creative Sunset", bg: "#FFF7ED", primary: "#DB2777", secondary: "#78716C", text: "#1C1917", accent: "#F59E0B", font: "System" },
  portfolio: { name: "Portfolio Cream", bg: "#FAF7F2", primary: "#1C1917", secondary: "#78716C", text: "#1C1917", accent: "#C2410C", font: "System" },
  healthcare: { name: "Healthcare Teal", bg: "#F0FDFA", primary: "#0D9488", secondary: "#64748B", text: "#0F172A", accent: "#0EA5E9", font: "System" },
  travel: { name: "Travel Sky", bg: "#F0F9FF", primary: "#0369A1", secondary: "#64748B", text: "#0F172A", accent: "#F59E0B", font: "System" },
  bold: { name: "Bold Black", bg: "#111827", primary: "#F59E0B", secondary: "#9CA3AF", text: "#F9FAFB", accent: "#EF4444", font: "System" },
};

function buildStandard(theme: SlideTheme, sections: { title: string; bullets: string[] }[], subtitle: string) {
  return (title: string): Slide[] => {
    const slides: Slide[] = [];
    slides.push(titleSlide(theme, title, subtitle));
    slides.push(sectionSlide(theme, "Overview", "What we'll cover"));
    slides.push(contentSlide(theme, "Agenda", sections.map((s) => s.title)));
    sections.forEach((s) => slides.push(contentSlide(theme, s.title, s.bullets)));
    slides.push(statsSlide(theme, "Key Numbers", [
      { label: "Growth", value: "35%" }, { label: "Users", value: "10K" }, { label: "Reach", value: "24" },
    ]));
    slides.push(twoColSlide(theme, "Comparison", "Before", "Manual process\nSlower turnaround\nInconsistent quality", "After", "Automated flow\nFaster results\nConsistent output"));
    slides.push(timelineSlide(theme, "Roadmap", [
      { time: "Q1", label: "Discovery" }, { time: "Q2", label: "Build" }, { time: "Q3", label: "Launch" }, { time: "Q4", label: "Scale" },
    ]));
    slides.push(conclusionSlide(theme));
    return slides;
  };
}

export const TEMPLATES: SlideTemplate[] = [
  { id: "edu-modern", name: "College Presentation", category: "Education", description: "Clean academic layout for lectures and projects", theme: SLIDE_THEMES.academic, build: buildStandard(SLIDE_THEMES.academic, [{ title: "Introduction", bullets: ["Overview", "Why it matters", "Key questions"] }, { title: "Background", bullets: ["Prior work", "Definitions", "Context"] }, { title: "Methodology", bullets: ["Approach", "Tools", "Data"] }, { title: "Findings", bullets: ["Main results", "Insights"] }], "A structured academic overview") },
  { id: "edu-thesis", name: "Thesis Defense", category: "Education", description: "Formal layout for final year projects", theme: SLIDE_THEMES.research, build: buildStandard(SLIDE_THEMES.research, [{ title: "Research Question", bullets: ["Hypothesis", "Objectives"] }, { title: "Literature Review", bullets: ["Prior studies", "Gap"] }, { title: "Methodology", bullets: ["Design", "Sample", "Analysis"] }, { title: "Results", bullets: ["Findings", "Statistical significance"] }], "Formal thesis presentation") },
  { id: "edu-lecture", name: "Teaching Lecture", category: "Education", description: "Slide deck for classroom teaching", theme: SLIDE_THEMES.minimal, build: buildStandard(SLIDE_THEMES.minimal, [{ title: "Objectives", bullets: ["What you'll learn"] }, { title: "Key Concepts", bullets: ["Concept 1", "Concept 2"] }, { title: "Examples", bullets: ["Example A", "Example B"] }, { title: "Practice", bullets: ["Exercises"] }], "Classroom lecture") },
  { id: "biz-corporate", name: "Corporate Overview", category: "Business", description: "Company introduction and services", theme: SLIDE_THEMES.corporate, build: buildStandard(SLIDE_THEMES.corporate, [{ title: "About Us", bullets: ["Mission", "Vision", "Values"] }, { title: "Services", bullets: ["Service A", "Service B"] }, { title: "Team", bullets: ["Leadership", "Reach"] }, { title: "Contact", bullets: ["Address", "Email"] }], "Professional company profile") },
  { id: "biz-report", name: "Business Report", category: "Reports", description: "Quarterly / monthly business report", theme: SLIDE_THEMES.corporate, build: buildStandard(SLIDE_THEMES.corporate, [{ title: "Executive Summary", bullets: ["Highlights", "Risks"] }, { title: "Financials", bullets: ["Revenue", "Profit"] }, { title: "Operations", bullets: ["Efficiency", "Quality"] }, { title: "Outlook", bullets: ["Next quarter"] }], "Quarterly business report") },
  { id: "startup-pitch", name: "Startup Pitch Deck", category: "Pitch Deck", description: "Investor-ready pitch deck", theme: SLIDE_THEMES.startup, build: buildStandard(SLIDE_THEMES.startup, [{ title: "Problem", bullets: ["Pain point", "Market size"] }, { title: "Solution", bullets: ["Product", "Unique value"] }, { title: "Market", bullets: ["TAM", "SAM", "SOM"] }, { title: "Traction", bullets: ["Users", "Growth"] }, { title: "Team", bullets: ["Founders"] }, { title: "Ask", bullets: ["Funding", "Use of funds"] }], "Investor pitch") },
  { id: "startup-mvp", name: "MVP Launch", category: "Startup", description: "Announce and demo an MVP", theme: SLIDE_THEMES.tech, build: buildStandard(SLIDE_THEMES.tech, [{ title: "Idea", bullets: ["Insight"] }, { title: "Product", bullets: ["Core", "Demo"] }, { title: "Users", bullets: ["Personas", "Feedback"] }, { title: "Next", bullets: ["Roadmap"] }], "MVP launch deck") },
  { id: "tech-ai", name: "AI / Technology", category: "AI/Technology", description: "Technical presentation with dark theme", theme: SLIDE_THEMES.tech, build: buildStandard(SLIDE_THEMES.tech, [{ title: "Problem Space", bullets: ["Domain", "Challenges"] }, { title: "Approach", bullets: ["Architecture", "Data"] }, { title: "Results", bullets: ["Accuracy", "Benchmarks"] }, { title: "Limitations", bullets: ["Bias", "Edge cases"] }, { title: "Future Work", bullets: ["Next steps"] }], "Technology overview") },
  { id: "tech-product", name: "Software Product", category: "AI/Technology", description: "Technical product presentation", theme: SLIDE_THEMES.darkPro, build: buildStandard(SLIDE_THEMES.darkPro, [{ title: "Vision", bullets: ["Why we build"] }, { title: "Features", bullets: ["A", "B", "C"] }, { title: "Architecture", bullets: ["Stack", "Scale"] }, { title: "Roadmap", bullets: ["Now", "Next"] }], "Product overview") },
  { id: "research-paper", name: "Research Paper", category: "Research", description: "Formal research paper presentation", theme: SLIDE_THEMES.research, build: buildStandard(SLIDE_THEMES.research, [{ title: "Abstract", bullets: ["Summary"] }, { title: "Related Work", bullets: ["Prior studies"] }, { title: "Method", bullets: ["Setup"] }, { title: "Experiments", bullets: ["Metrics"] }, { title: "Results", bullets: ["Findings"] }], "Research paper") },
  { id: "finance-quarterly", name: "Finance Quarterly", category: "Finance", description: "Financial performance review", theme: SLIDE_THEMES.finance, build: buildStandard(SLIDE_THEMES.finance, [{ title: "P&L", bullets: ["Revenue", "COGS"] }, { title: "Balance Sheet", bullets: ["Assets", "Liabilities"] }, { title: "Cash Flow", bullets: ["Operating"] }, { title: "Outlook", bullets: ["Guidance"] }], "Financial results") },
  { id: "finance-invest", name: "Investment Deck", category: "Finance", description: "Investment thesis", theme: SLIDE_THEMES.finance, build: buildStandard(SLIDE_THEMES.finance, [{ title: "Thesis", bullets: ["Why now"] }, { title: "Market", bullets: ["Size"] }, { title: "Model", bullets: ["Revenue"] }, { title: "Returns", bullets: ["Projections"] }], "Investment thesis") },
  { id: "marketing-plan", name: "Marketing Plan", category: "Marketing", description: "Campaign strategy overview", theme: SLIDE_THEMES.marketing, build: buildStandard(SLIDE_THEMES.marketing, [{ title: "Objectives", bullets: ["Goals", "KPIs"] }, { title: "Audience", bullets: ["Personas"] }, { title: "Content", bullets: ["Themes"] }, { title: "Budget", bullets: ["ROI"] }], "Marketing strategy") },
  { id: "marketing-launch", name: "Product Launch", category: "Marketing", description: "Go-to-market launch deck", theme: SLIDE_THEMES.marketing, build: buildStandard(SLIDE_THEMES.marketing, [{ title: "Product", bullets: ["Value prop"] }, { title: "GTM", bullets: ["Positioning"] }, { title: "Plan", bullets: ["Timeline"] }, { title: "Metrics", bullets: ["Adoption"] }], "Product launch") },
  { id: "project-status", name: "Project Status", category: "Project", description: "Status update for a project", theme: SLIDE_THEMES.corporate, build: buildStandard(SLIDE_THEMES.corporate, [{ title: "Scope", bullets: ["Objectives"] }, { title: "Progress", bullets: ["Completed"] }, { title: "Risks", bullets: ["Blockers"] }, { title: "Next", bullets: ["Milestones"] }], "Project status") },
  { id: "project-plan", name: "Project Plan", category: "Project", description: "Kickoff and plan", theme: SLIDE_THEMES.academic, build: buildStandard(SLIDE_THEMES.academic, [{ title: "Charter", bullets: ["Goals"] }, { title: "Timeline", bullets: ["Phases"] }, { title: "Team", bullets: ["Roles"] }, { title: "Budget", bullets: ["Estimate"] }], "Project kickoff") },
  { id: "portfolio-designer", name: "Designer Portfolio", category: "Portfolio", description: "Showcase your design work", theme: SLIDE_THEMES.portfolio, build: buildStandard(SLIDE_THEMES.portfolio, [{ title: "About", bullets: ["Bio"] }, { title: "Work", bullets: ["Project A"] }, { title: "Process", bullets: ["Discover"] }, { title: "Contact", bullets: ["Email"] }], "Designer portfolio") },
  { id: "portfolio-dev", name: "Developer Portfolio", category: "Portfolio", description: "Showcase engineering work", theme: SLIDE_THEMES.darkPro, build: buildStandard(SLIDE_THEMES.darkPro, [{ title: "About", bullets: ["Bio"] }, { title: "Projects", bullets: ["P1"] }, { title: "Skills", bullets: ["Stack"] }, { title: "Contact", bullets: ["GitHub"] }], "Developer portfolio") },
  { id: "min-clean", name: "Clean Minimal", category: "Minimal", description: "Simple, minimal, professional", theme: SLIDE_THEMES.minimal, build: buildStandard(SLIDE_THEMES.minimal, [{ title: "Overview", bullets: ["Point 1", "Point 2"] }, { title: "Details", bullets: ["A", "B"] }, { title: "Summary", bullets: ["Takeaway"] }], "Simple minimal deck") },
  { id: "min-mono", name: "Monochrome", category: "Minimal", description: "Black and white minimal", theme: SLIDE_THEMES.minimal, build: buildStandard(SLIDE_THEMES.minimal, [{ title: "Introduction", bullets: ["Context"] }, { title: "Content", bullets: ["Idea"] }, { title: "Closing", bullets: ["Takeaway"] }], "Monochrome deck") },
  { id: "modern-orange", name: "Modern Orange", category: "Modern", description: "Vibrant modern layout", theme: SLIDE_THEMES.modernOrange, build: buildStandard(SLIDE_THEMES.modernOrange, [{ title: "Overview", bullets: ["Purpose"] }, { title: "Highlights", bullets: ["H1", "H2"] }, { title: "Details", bullets: ["A"] }], "Modern presentation") },
  { id: "modern-clean", name: "Modern Clean", category: "Modern", description: "Fresh modern design", theme: SLIDE_THEMES.modernOrange, build: buildStandard(SLIDE_THEMES.modernOrange, [{ title: "Why", bullets: ["Reason"] }, { title: "How", bullets: ["Step"] }, { title: "What", bullets: ["Outcome"] }], "Modern clean") },
  { id: "dark-pro", name: "Dark Professional", category: "Dark", description: "High-contrast dark theme", theme: SLIDE_THEMES.darkPro, build: buildStandard(SLIDE_THEMES.darkPro, [{ title: "Introduction", bullets: ["Context"] }, { title: "Key Points", bullets: ["A", "B"] }, { title: "Wrap-up", bullets: ["Summary"] }], "Dark professional") },
  { id: "dark-bold", name: "Dark Bold", category: "Dark", description: "Bold impact dark theme", theme: SLIDE_THEMES.bold, build: buildStandard(SLIDE_THEMES.bold, [{ title: "Big Idea", bullets: ["One thing"] }, { title: "Impact", bullets: ["Changes"] }, { title: "CTA", bullets: ["Next"] }], "Bold dark") },
  { id: "creative-sunset", name: "Creative Sunset", category: "Creative", description: "Colorful creative deck", theme: SLIDE_THEMES.creative, build: buildStandard(SLIDE_THEMES.creative, [{ title: "Concept", bullets: ["Inspiration"] }, { title: "Mood", bullets: ["Colors"] }, { title: "Deliverables", bullets: ["A"] }], "Creative deck") },
  { id: "creative-brand", name: "Brand Story", category: "Creative", description: "Tell your brand story", theme: SLIDE_THEMES.creative, build: buildStandard(SLIDE_THEMES.creative, [{ title: "Origin", bullets: ["How it began"] }, { title: "Purpose", bullets: ["Why"] }, { title: "Impact", bullets: ["Who"] }, { title: "Future", bullets: ["Where"] }], "Brand story") },
  { id: "health-clinic", name: "Healthcare Overview", category: "Healthcare", description: "Clinic or hospital deck", theme: SLIDE_THEMES.healthcare, build: buildStandard(SLIDE_THEMES.healthcare, [{ title: "Services", bullets: ["Specialty A"] }, { title: "Team", bullets: ["Doctors"] }, { title: "Facilities", bullets: ["Equipment"] }, { title: "Contact", bullets: ["Location"] }], "Healthcare overview") },
  { id: "travel-guide", name: "Travel Guide", category: "Travel", description: "Trip itinerary or travel plan", theme: SLIDE_THEMES.travel, build: buildStandard(SLIDE_THEMES.travel, [{ title: "Destination", bullets: ["City"] }, { title: "Itinerary", bullets: ["Day 1"] }, { title: "Highlights", bullets: ["Must-see"] }, { title: "Tips", bullets: ["Packing"] }], "Travel guide") },
  { id: "reports-monthly", name: "Monthly Report", category: "Reports", description: "Monthly review deck", theme: SLIDE_THEMES.corporate, build: buildStandard(SLIDE_THEMES.corporate, [{ title: "Highlights", bullets: ["Wins"] }, { title: "Metrics", bullets: ["KPI A"] }, { title: "Actions", bullets: ["Priorities"] }], "Monthly report") },
  { id: "reports-data", name: "Data Analytics", category: "Reports", description: "Data-driven insights", theme: SLIDE_THEMES.research, build: buildStandard(SLIDE_THEMES.research, [{ title: "Data Overview", bullets: ["Source"] }, { title: "Insights", bullets: ["Trend A"] }, { title: "Recommendations", bullets: ["Action 1"] }], "Data analytics") },
];

export function buildFromTemplate(tpl: SlideTemplate, title: string): SlideContent {
  return { theme: tpl.theme, slides: tpl.build(title) };
}

export function blankPresentation(title: string): SlideContent {
  return { theme: SLIDE_THEMES.modernOrange, slides: [titleSlide(SLIDE_THEMES.modernOrange, title, "Click to add subtitle")] };
}
