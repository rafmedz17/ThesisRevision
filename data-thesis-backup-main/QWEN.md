# Thesis Archive System - QWEN Context

## Project Overview

This is a thesis archive system built for Tayabas Western Academy, designed to manage and provide access to academic research papers from both college and senior high school departments. The application is built with React, TypeScript, Vite, and uses shadcn-ui for the component library with Tailwind CSS for styling.

### Key Features
- Thesis repository with search and filtering capabilities
- Separate dashboards for college and senior high school theses
- Admin panel for thesis and user management
- Authentication system with role-based access
- Responsive UI with premium design system

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand with persist middleware
- **Data Fetching**: React Query (TanStack Query) with Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Data Tables**: Radix UI components

## Project Structure

```
src/
├── components/           # Shared UI components
├── features/             # Feature-specific components
│   ├── admin/            # Admin panel components
│   ├── auth/             # Authentication components
│   ├── landing/          # Landing page components
│   └── thesis/           # Thesis management components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API configuration
├── stores/               # Zustand stores for state management
├── types/                # Type definitions
└── pages/                # Route-level components
```

## Key Dependencies

- React 18 with TypeScript
- Vite for development/build tooling
- shadcn/ui for accessible UI components
- Tailwind CSS for styling with custom configuration
- Zustand for state management
- React Query for server state management
- React Router DOM for routing
- Axios for HTTP requests
- Lucide React for icons
- React Hook Form for form handling
- Zod for schema validation
- Recharts for data visualization

## Building and Running

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will be available at http://localhost:8080
```

### Production Build
```bash
# Build for production
npm run build
```

### Other Scripts
- `npm run build:dev` - Build for development environment
- `npm run lint` - Run ESLint to check for code issues
- `npm run preview` - Preview production build locally

## Development Conventions

### File Organization
- Components are organized by features in the `/features` directory
- Shared components go in `/components`
- Type definitions are in `/types`
- State management stores are in `/stores`
- Custom hooks are in `/hooks`
- Utility functions and API configuration in `/lib`

### Naming Conventions
- Component files use PascalCase: `ThesisCard.tsx`
- Utility functions and hooks use camelCase: `useThesis.ts`
- Type definitions use PascalCase: `Thesis.ts`
- Styles and constants use camelCase: `utils.ts`

### Component Architecture
- Feature-specific components are kept within their respective feature directories
- Shared UI components are in the `/components/ui` directory
- Shared business logic components are in the `/components/shared` directory
- Route-level components are in the `/pages` directory

### State Management
- Authentication state is managed with Zustand store in `/stores/auth-store.ts`
- UI state (like search queries) is managed with Zustand store in `/stores/ui-store.ts`
- Settings are managed with Zustand store in `/stores/settings-store.ts`
- Server state is managed with React Query

### API Integration
- API calls are configured in `/lib/api.ts` using Axios
- API endpoints follow the pattern `/api/*`
- Authentication tokens are stored in localStorage
- Mock API is used for demonstration (will be replaced with real backend)

### Authentication
- The application implements role-based access control
- Admin users can access admin-only routes
- Authenticated users have access to protected routes
- Login credentials are currently mocked (admin@twa.edu / admin123)

## Key Data Models

### Thesis
The main data model for academic papers includes:
- Title, abstract, authors, advisors
- Department (college/senior-high), program, year
- Status (published/draft/under-review)
- Download and view counts
- Keywords and categories

### User
The user model supports:
- Email-based authentication
- Role-based access (currently admin role)
- Profile management

## Routes

- `/` - Landing page
- `/college` - College department thesis dashboard
- `/senior-high` - Senior high school thesis dashboard
- `/login` - Login page
- `/admin` - Admin dashboard (protected route)
- `/settings` - User settings (protected route)
- `/*` - 404 not found page

## Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `tsconfig.json` - TypeScript configuration with path aliases
- `components.json` - shadcn/ui configuration
- `package.json` - Project metadata and dependencies