# AI Study Assistant

## Overview

An AI-powered educational tool that helps engineering students understand complex study materials. Users upload PDFs, images, or handwritten notes, and the application uses OpenAI's GPT-5 to analyze and explain the content in beginner-friendly language. The system breaks down technical concepts into digestible explanations with step-by-step guidance, formulas, key points, and examples.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript running on Vite for fast development and optimized production builds.

**UI Component System**: Shadcn/ui components built on Radix UI primitives, providing accessible and customizable components following Material Design 3 principles. The design emphasizes clarity and strong information hierarchy suitable for educational content.

**Styling Approach**: Tailwind CSS with custom configuration for consistent spacing, typography, and theming. Supports light/dark mode with system preference detection. Custom CSS variables enable dynamic theming.

**State Management**: TanStack Query (React Query) handles server state, caching, and data synchronization. No global client state management needed - component-level state with React hooks suffices for UI interactions.

**Routing**: Wouter provides lightweight client-side routing. Currently implements a single-page application pattern with upload/analysis view and history sidebar.

**Typography System**: 
- Primary: Roboto for general content
- Secondary: Roboto Mono for code and formulas
- Clear hierarchy from 2.5rem page titles down to 0.875rem captions

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript compilation via tsx/esbuild.

**API Design**: RESTful endpoints for document upload, analysis retrieval, and document management. File uploads handled via Multer with 20MB limit and validation for PDF/JPG/PNG formats.

**AI Integration**: OpenAI API (GPT-5) for document analysis. Vision capabilities analyze uploaded images and PDFs. Structured JSON responses ensure consistent data format with sections typed as explanations, key points, formulas, step-by-step guides, examples, summaries, and definitions.

**File Processing**: Documents converted to base64 data URLs for transmission to OpenAI's vision API. Server extracts text, diagrams, formulas, and tables from uploaded materials.

**Build System**: Custom build script using esbuild for server bundling with selective dependency bundling (allowlist approach) to optimize cold start times. Vite handles client build with code splitting and asset optimization.

### Data Storage

**Current Implementation**: In-memory storage using a Map-based implementation (`MemStorage` class). Documents stored with metadata including filename, file type, upload timestamp, analysis results, and processing status.

**Interface Design**: Storage abstracted behind `IStorage` interface enabling easy migration to persistent databases. Methods support CRUD operations: getDocuments, getDocument, createDocument, updateDocument, deleteDocument.

**Schema Structure**: 
- Documents contain metadata and link to analysis results
- DocumentAnalysis includes structured sections with typed content
- Analysis sections categorized by type (explanation, formula, keyPoints, etc.)

**Database Configuration**: Drizzle ORM configured for PostgreSQL with schema defined in `shared/schema.ts`. Migration support via drizzle-kit though currently unused with in-memory storage.

### External Dependencies

**AI Service**: OpenAI API (GPT-5 model released August 2025) - Primary analysis engine requiring API key configuration via environment variables.

**UI Components**: Radix UI primitives (@radix-ui/* packages) provide accessible, unstyled component foundations that Shadcn/ui builds upon.

**Form Management**: React Hook Form with Zod resolvers for type-safe form validation and schema parsing.

**File Upload**: Multer middleware handles multipart form data with configurable size limits and MIME type filtering.

**Development Tools**: 
- Replit-specific plugins for runtime error overlays, cartographer, and dev banners
- Vite for HMR and development server with middleware mode integration

**Session Management**: Infrastructure exists for connect-pg-simple and express-session though not actively used in current implementation.

**Styling Dependencies**: 
- Tailwind CSS with PostCSS for processing
- class-variance-authority for variant-based component styling
- clsx and tailwind-merge for conditional class composition

**Validation**: Zod for runtime type validation with drizzle-zod integration for schema-to-validator conversion.