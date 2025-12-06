# AI Study Assistant - Design Guidelines

## Design Approach
**Selected System:** Material Design 3  
**Rationale:** Educational tools require clarity, strong information hierarchy, and excellent readability. Material Design's emphasis on surface elevation, clear typography, and structured content organization is ideal for displaying complex engineering concepts, formulas, and explanations.

## Typography System

**Primary Font:** Roboto (via Google Fonts)  
**Secondary Font:** Roboto Mono (for code, formulas, technical content)

**Hierarchy:**
- Page Title: 2.5rem (40px), weight 700
- Section Headers: 2rem (32px), weight 600
- Subsection Headers: 1.5rem (24px), weight 600
- Body Text: 1rem (16px), weight 400, line-height 1.6
- Formulas/Code: Roboto Mono 0.95rem, weight 400
- Captions/Labels: 0.875rem (14px), weight 500

## Layout System

**Spacing Units:** Tailwind's 4, 6, 8, 12, 16, 24 system  
- Component padding: p-6 or p-8
- Section spacing: mb-12 or mb-16
- Card gaps: gap-6
- Form spacing: space-y-6

**Container Strategy:**
- Main content: max-w-5xl mx-auto
- Upload area: max-w-2xl mx-auto
- Results display: max-w-4xl mx-auto (optimal for reading technical content)

## Core Components

### Navigation Bar
- Fixed top navigation with subtle shadow/border
- Logo/App name on left
- Navigation links: "Upload" | "History" | "How to Use"
- Compact height (h-16), clean and functional

### Upload Interface (Primary Focus Area)
**Hero-Style Upload Section:**
- Prominent drag-and-drop zone: Large dashed border, rounded-xl corners
- Height: min-h-64, centered vertically
- Icon: Large upload icon (w-16 h-16) from Material Icons
- Primary text: "Upload Your Study Materials"
- Secondary text: "Drop PDFs, images, or handwritten notes here"
- Supported formats badge: Small pills showing "PDF • JPG • PNG"
- Upload button: Elevated surface with shadow, medium size
- Visual feedback on drag-over: Transform border style, subtle scale

### Analysis Results Display

**Structure (Card-based Material Design):**

1. **Document Header Card**
   - Rounded-lg, elevated surface with shadow
   - Document name, file type icon, upload timestamp
   - Action buttons: "Download Summary" | "Share"
   - Padding: p-6

2. **Table of Contents Card** (if multiple topics)
   - Quick navigation links to each section
   - Rounded-lg surface, p-6
   - Hierarchical list with indentation

3. **Content Section Cards** (repeating pattern)
   - Each major topic gets its own elevated card
   - Rounded-lg, p-8, mb-6
   - Internal structure:
     - **Topic Title:** Large heading with icon
     - **Simple Explanation:** Body text paragraph with generous line-height
     - **Key Points:** Bulleted list with custom Material Design list markers
     - **Formulas:** Displayed in Roboto Mono on distinct background surface (p-4, rounded-md)
     - **Step-by-Step Breakdown:** Numbered list with increased spacing (space-y-4)
     - **Examples:** Nested card (lighter surface) within main card, p-6

4. **Summary Card** (at bottom)
   - Highlighted surface treatment
   - Condensed key takeaways
   - Rounded-lg, p-8

### Form Elements
- Text inputs: Rounded-md borders, p-3, focus ring
- File input: Custom styled with Material Design upload button
- Buttons: Rounded-md, py-3 px-6, medium weight text, subtle shadow
- Primary action: Elevated appearance with deeper shadow
- Secondary action: Outlined style

### Information Display Patterns
**For Technical Content:**
- Definition boxes: Bordered surface, rounded-md, p-4, mb-4
- Formula displays: Monospace font, distinct background, p-4
- Diagrams/Images: Rounded-lg, max width with auto margins, shadow
- Tables: Bordered cells, alternating row backgrounds, p-3 cells
- Code blocks: Dark surface, syntax highlighting consideration, p-4

### Loading States
- Skeleton screens for content cards during AI processing
- Linear progress indicator at top of upload section
- Processing message: "Analyzing your materials..." with animated icon

### Empty States
- Upload section: Friendly illustration placeholder
- History section (no uploads): "No documents yet" with CTA to upload

## Component Styling Principles

**Elevation System:**
- Base surface: No shadow
- Raised cards: shadow-md
- Interactive elements: shadow-sm, hover:shadow-lg
- Active/focused: shadow-lg with border accent

**Borders & Corners:**
- Cards: rounded-lg (0.5rem)
- Buttons: rounded-md (0.375rem)
- Form inputs: rounded-md
- Images/diagrams: rounded-lg

**Spacing Consistency:**
- Card internal padding: p-6 or p-8
- Between cards: mb-6
- Section margins: mb-12
- List item spacing: space-y-3 or space-y-4

## Accessibility Requirements
- All form inputs with clear labels (not placeholders alone)
- Focus indicators on all interactive elements (ring-2 on focus)
- Sufficient contrast for all text (WCAG AA minimum)
- Alt text for all uploaded images/diagrams
- Semantic HTML with proper heading hierarchy (h1 → h2 → h3)
- Keyboard navigation support throughout

## Images
**No large hero image.** This is a utility-focused application where the upload interface IS the hero. The visual focus should be on:
- Upload zone illustration/icon (custom or Material Design upload icon)
- Document type icons in results (PDF, image icons)
- Small decorative icons for sections (lightbulb for explanations, key for key points, etc.)
- User-uploaded document images displayed in results (diagrams, notes)

## Mobile Responsiveness
- Single column layout on mobile (all cards stack)
- Upload zone: Reduce height on mobile (min-h-48)
- Typography: Scale down by 10-15% on mobile
- Navigation: Hamburger menu for mobile
- Reduced padding on cards: p-4 instead of p-8 on small screens