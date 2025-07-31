# Test Case Analytics Dashboard

## Overview

This is a professional, enterprise-grade test case management dashboard built with React, TypeScript, and modern web technologies. The application provides real-time data visualization for test case analytics across different environments and sites, featuring interactive pie charts and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, professional design
- **State Management**: React hooks for local state, React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts library for interactive data visualizations
- **Forms**: React Hook Form with Zod validation for robust form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Express sessions with PostgreSQL session store
- **Build Tool**: Vite for frontend bundling, esbuild for backend compilation

### Key Components

#### Dashboard Interface
- **Environment Selection**: PROD, UAT, DEV, Sandbox
- **Site Selection**: LON1A, LON1B, NOV1A, NOV1B, FRA1, JHB1A
- **Enhanced Test Case Input**: Four-category system (Total, Passed, Failed, Skipped) with real-time validation
- **Real-time Visualization**: Four interactive pie charts with enhanced color coding and center totals
- **Validation System**: Real-time sum validation with error highlighting and status indicators
- **Remarks System**: Text areas for failure analysis and widget-specific notes

#### Data Visualization
- **Overall Test Cases Chart**: Large pie chart with center total display showing four-category distribution
- **Critical Widgets**: Three separate charts for Telemetry, Inbound, and Outbound widgets with individual inputs
- **Enhanced Color Scheme**: Professional four-color palette (Green/Red/Orange/Blue for Passed/Failed/Skipped/Info)
- **Interactive Features**: Enhanced hover tooltips with percentages and smooth animations
- **Status Indicators**: Color-coded status cards with icons and real-time counts

#### UI Components
- **Design System**: shadcn/ui components with "new-york" style
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Professional Styling**: Custom CSS variables for consistent theming
- **Accessibility**: ARIA labels and keyboard navigation support

## Data Flow

1. **User Input**: Dashboard configuration (environment, site) and enhanced four-category test metrics
2. **Real-time Validation**: Immediate sum validation with visual feedback and error highlighting
3. **Real-time Updates**: Instant chart updates on data entry with zero lag and smooth animations
4. **State Management**: Local React state with validation logic and error tracking
5. **Enhanced Validation**: Zod schemas with custom refinement rules for data integrity
6. **Advanced Visualization**: Recharts renders four-segment pie charts with center totals and enhanced tooltips

## Recent Changes (January 31, 2025)

### Enhanced Four-Category Test Case System
- **Updated Schema**: Modified shared schema to support Total, Passed, Failed, and Skipped test cases
- **New Environment/Site Options**: Updated to use client-specified PROD/UAV/DEV/Sandbox environments and LON1A/LON1B/NOV1A/NOV1B/FRA1/JHB1A sites
- **Real-time Validation**: Implemented comprehensive validation with visual error feedback
- **Enhanced UI Components**: Redesigned input sections with icons, improved layouts, and professional status indicators
- **Advanced Charts**: Added center total displays, four-color coding, and enhanced tooltips with percentages

### Professional Export Enhancement & Animation System
- **Optimized PDF Export Layout**: Streamlined export with minimal header, better chart spacing, and centered remarks section
- **Color Legend Integration**: Added comprehensive color legend explaining chart meanings (green=passed, red=failed, orange=skipped)
- **Advanced Animation System**: Implemented attractive animations throughout entire website including glow, bounce, slide, and shimmer effects
- **Educational Guidance**: Added step-by-step tooltips and helpful guidance for better user experience
- **Enhanced Chart Sizing**: Fixed pie chart dimensions to prevent segments touching edges with proper spacing
- **Professional Button Styling**: Enhanced export buttons with animations and professional messaging

## External Dependencies

### Core Libraries
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database operations
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **recharts**: Chart visualization library
- **zod**: Runtime type validation
- **react-hook-form**: Form handling and validation

### UI Libraries
- **@radix-ui/***: Accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Variant-based component styling
- **lucide-react**: Icon library

### Development Tools
- **vite**: Frontend build tool with HMR
- **drizzle-kit**: Database migration management
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with HMR
- **Database**: Neon Database with connection pooling
- **Hot Reload**: Real-time code updates for rapid development

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles Node.js application
- **Output**: `dist/` directory with client assets and server bundle
- **Environment**: Production-ready Express server

### Database Management
- **Migrations**: Drizzle Kit handles schema changes
- **Connection**: Environment-based DATABASE_URL configuration
- **Session Storage**: PostgreSQL-backed session persistence

### Key Features
- **Zero Configuration**: Ready-to-run development environment
- **Type Safety**: End-to-end TypeScript coverage
- **Professional UI**: Enterprise-grade design standards
- **Real-time Updates**: Instant chart updates with smooth animations
- **Scalable Architecture**: Modular component structure for easy extension