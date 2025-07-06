# Ops Leader Visit Calendar

## Overview

This is a React/Express full-stack web application for CAVA restaurant operations leaders to schedule and manage their restaurant visits. The application features a drag-and-drop calendar interface with predefined visit types, period-based scheduling, and CAVA-branded styling.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom CAVA brand colors
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Drag & Drop**: Custom implementation for calendar scheduling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: Currently using in-memory storage with interface for database integration
- **API**: RESTful endpoints for calendar sessions and visit types
- **Development**: Hot reload with Vite middleware integration

## Key Components

### Calendar System
- **Period-based scheduling**: 13 fiscal periods with 4 weeks each
- **Visit types**: Configurable visit types with specific periods, durations, and colors
- **Drag-and-drop interface**: Visual scheduling with time slot validation
- **Restaurant management**: Dynamic restaurant name fields based on garden size

### Visit Types
- Quality Restaurant Audit (QRA) - 5 hours
- Coaching Visit - 2 hours
- Cash Audit - 1 hour
- GM Impact Plan Conversation - 1 hour
- Guest Experience Night/Weekend - 2 hours
- Static visits (one per period)

### Data Models
- **Users**: Basic user authentication structure
- **Calendar Sessions**: User-specific schedule data per period
- **Visit Types**: Configurable visit definitions

## Data Flow

1. **User Setup**: User enters name and restaurant count, generates dynamic restaurant fields
2. **Visit Generation**: System creates visit tiles based on current period's available visit types
3. **Scheduling**: Drag-and-drop interface allows placing visits on calendar grid
4. **Persistence**: Schedule data is saved per user and period
5. **Navigation**: Users can switch between periods with data persistence

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI libraries (Radix UI, Tailwind CSS, shadcn/ui)
- TanStack Query for server state management
- Date manipulation (date-fns)
- Form handling (React Hook Form with Zod validation)

### Backend Dependencies
- Express.js with TypeScript
- Drizzle ORM with PostgreSQL adapter
- Neon Database serverless connection
- Zod for schema validation
- Development tools (tsx, esbuild)

## Deployment Strategy

### Development
- Vite dev server for frontend with hot reload
- Express server with TypeScript compilation via tsx
- Concurrent development with Vite middleware integration

### Production
- Frontend: Vite build to static assets
- Backend: esbuild bundle for Node.js deployment
- Database: PostgreSQL with Drizzle migrations
- Environment: DATABASE_URL required for database connection

### Build Process
1. `npm run build` - Builds frontend and backend
2. `npm run start` - Runs production server
3. `npm run db:push` - Pushes database schema changes

## Changelog

```
Changelog:
- July 06, 2025. Initial setup
- July 06, 2025. Fixed period switching issue - visit tracking now properly maintained per period
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```