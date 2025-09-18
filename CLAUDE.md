# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gui-Center is a French real estate platform ("Plateforme Immobilière Moderne") built with Next.js 13.5.1, TypeScript, and Tailwind CSS. The application allows users to browse, search, and filter property listings for both sale and rental.

## Development Commands

```bash
# Development
npm run dev          # Start development server (Next.js)
npm run build        # Build for production (static export)
npm start           # Start production server
npm run lint        # Run ESLint

# No test scripts are currently configured
```

## Architecture & Structure

### Tech Stack
- **Framework**: Next.js 13.5.1 with App Router
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3 with custom design system
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Maps**: Leaflet with react-leaflet
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (AuthProvider)
- **Icons**: Lucide React

### Key Directory Structure
- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components organized by feature
  - `ui/` - Base shadcn/ui components
  - `layout/` - Header, Footer, navigation components
  - `properties/` - Property-specific components
  - `maps/` - Map-related components
  - `providers/` - Context providers
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `lib/` - Utility functions and validations

### Important Patterns

**Component Organization**: Components follow shadcn/ui patterns with Tailwind CSS. The design system uses CSS custom properties for theming.

**Data Handling**: Currently uses mock data in `useProperties` hook. All property data is client-side with simulated API delays.

**Authentication**: Context-based auth system via `AuthProvider` and `useAuth` hook.

**Routing**: Uses Next.js App Router with French locale (`lang="fr"`).

**Styling**: Custom Tailwind config with extended color palette using CSS variables. Components use `clsx` and `tailwind-merge` for conditional classes.

### Configuration Notes
- **Static Export**: Configured for static export (`output: 'export'`)
- **Images**: Unoptimized images due to static export
- **ESLint**: Ignores builds (`ignoreDuringBuilds: true`)
- **Path Aliases**: Uses `@/*` for root-level imports

### Data Models
Key interfaces defined in `types/index.ts`:
- `Property` - Core property data with address, features, photos
- `User` - User accounts with roles (admin/seller/buyer)  
- `SearchFilters` - Property search and filtering
- `VisitRequest` - Property viewing requests

### Mock Data
Currently uses hardcoded mock properties in `hooks/useProperties.ts` with sample listings for Paris and Lyon.