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

## Recent Changes (August 1, 2025)

### Dashboard Restructuring & Critical Features Enhancement
- **Widget Consolidation**: Removed 3 separate Telemetry Critical widgets and replaced with single "Critical Features" widget containing only Telemetry
- **Naming Updates**: Changed "Critical Telemetry" to "Telemetry" throughout dashboard and export sections
- **Enhanced Telemetry Widget**: Added Total Test Cases and Passed Test Cases input fields in premium design layout
- **Color Scheme Update**: Changed "Skipped" status color from yellow/orange to gray across all charts and labels for better professional appearance

### Dual-Size Chart System for Dashboard vs Export
- **Dashboard Charts**: Optimized for daily use with practical sizes (Overall: 280px, Telemetry: 200px)
- **Export Charts**: Professional large sizes for reports (Overall: 450px, Telemetry: 320px) with enhanced data display
- **Export Enhancement**: Added comprehensive data display within charts showing total, passed, failed, and skipped counts
- **Premium Export Design**: Enhanced export layout with larger charts, better spacing, and professional styling for attractive reports

### Modular Comment System Implementation
- **Complete Redesign**: Replaced static text areas with dynamic modular comment system
- **Add New Comment**: "+" button to create new comment boxes with title and detailed content fields
- **Chronological Display**: Comments appear in chronological order with numbered sequence and timestamps
- **Full CRUD Operations**: Save, edit, delete functionality for all comments with real-time state management
- **Export Integration**: Comments automatically included in exported reports with professional formatting
- **Enhanced UX**: Professional styling with gradients, shadows, hover effects, and smooth animations

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