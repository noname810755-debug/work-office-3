# Office work — Offline AI Office (Docs, Sheets & Slides)

## Overview
Office work is a fully offline productivity suite for Android/iOS/Web built with Expo. It has three tightly integrated modules — Docs, Sheets, Slides — with a shared local AI engine, workspaces, global search, version history, and a rich slide template library. All data is persisted on-device via AsyncStorage. No backend. No network calls are made for any core feature.

## Key Modules

### Docs
- Block-based editor: H1/H2/H3, paragraph, bullet/numbered lists, quote, code, divider
- Rich formatting toolbar (bold, italic, underline, strike, alignment)
- Autosave, undo/redo, find & replace, word count
- Docs Tools screen: 30 categorized tools grouped into AI & Writing, Document Intelligence, Conversion, Productivity, Collaboration
  - Real functionality: AI builder, rewriting, summarizer, grammar & spelling, tone changer, translator (es/fr/hi), outline, TOC, consistency checker, document comparison, fact/claim finder, PDF/Image→Doc (paste), Document→Sheet, Document→Slides, smart tables, checklist/task extractor, meeting minutes, auto formatting, template generator, version history, comments, document agent

### Sheets
- Real spreadsheet with A1 references, ranges, formulas
- Full formula engine: SUM, AVERAGE, COUNT, MAX/MIN, IF, AND/OR, ROUND, ABS, POWER, MOD, CONCAT, LEFT/RIGHT/MID, UPPER/LOWER, TODAY/NOW, COUNTIF, SUMIF, AVERAGEIF, and more; supports +, -, *, /, ^, %, comparisons
- Multiple sheets, formula bar, cell formatting (bold/italic/align/number/currency/percent/date)
- Real charts (SVG): column, bar, line, pie, doughnut, area, scatter, combo — live from cell data
- Sheets Tools: AI builder, formula builder/doctor/explainer, ask-your-data, smart fill, spreadsheet agent, data cleaning, duplicates/missing detector, categorization, reconciliation, data detective, trend/anomaly detector, image/PDF/receipt/doc→sheet, auto dashboard, forecasting, what-if simulator, scenario manager, AI pivot, sheet→report, sheet→slides

### Slides
- Slide canvas editor with text/shape elements, per-element selection & edit
- Presentation mode with keyboard-like nav (prev/next)
- Thumbnails strip, duplicate/delete/add slide
- Slides Tools: AI presentation builder, topic→presentation, storyline builder, layout designer, smart theme generator, slide-by-slide editor, presentation agent, document→slides, PDF→slides, speaker notes, script generator, audience/tone adaptation, summarizer, practice coach, auto formatting, consistency checker, alignment, brand manager, template generator, presentation→document
- 30+ real editable slide templates across Education, Business, Startup, Pitch Deck, Tech, Research, Finance, Marketing, Project, Portfolio, Reports, Minimal, Modern, Dark, Creative, Healthcare, Travel

### Shared Local AI Engine (`src/ai/engine.ts`)
- Extractive summarization (TF-IDF-ish)
- Outline extraction
- Grammar fixer (regex rules)
- Tone adjuster (professional/friendly/concise/formal/casual)
- Rewrite (expand/shorten/improve)
- Dictionary-based translation (es/fr/hi)
- Duplicate/missing/anomaly detection
- Trend detection & linear-regression forecasting
- Table/task extraction from text
- Chart-type suggestion
- Text categorization

### Workspaces
- Create, rename, delete workspaces
- File browser scoped to workspace
- Workspace AI: summarize all documents in the workspace into a new report

### Global Search
- Indexes all Docs/Sheets/Slides content and titles
- Snippet previews and quick-jump to open the source file

### Version History
- Auto-snapshots on every save (keeps last 20)
- One-tap restore

### Settings + Legal
- Privacy Policy, Terms & Conditions, Support (jarvisai9077@gmail.com)

## Design
- Primary #FF5E00, secondary #FF6600, background #F5F6F8
- Light + Dark (system-driven)
- Card radius 16–24, 8pt spacing grid
- MaterialCommunityIcons for iconography

## Tech
- Expo 57 (React Native 0.86, React 19)
- Expo Router (file-based)
- react-native-svg for charts and slide rendering
- AsyncStorage for local persistence
- Fully offline — no backend server required (backend stub retained but unused)

## Routes
- `/` — Home (creates, filters, recent, all files)
- `/docs/[id]` — Doc editor
- `/docs/tools/[id]` — Doc Tools
- `/sheets/[id]` — Sheet editor
- `/sheets/tools/[id]` — Sheet Tools
- `/slides/[id]` — Slide editor
- `/slides/tools/[id]` — Slide Tools
- `/templates` — Slide template library
- `/workspaces` and `/workspaces/[id]`
- `/search`, `/history/[id]`, `/rename/[id]`
- `/settings`, `/legal/privacy`, `/legal/terms`

## Support
Email: jarvisai9077@gmail.com
