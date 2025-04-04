# AD Scanner - Modular Code Structure

This document outlines the modular code structure of the AD Scanner application.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── alerts/          # Alert-related components  
│   ├── layout/          # Layout components (Navbar, Sidebar, etc.)
│   ├── network/         # Network scanner specific components
│   └── vulnerabilities/ # Vulnerability scanner specific components
│
├── contexts/            # React context providers
│
├── hooks/               # Custom React hooks
│
├── interfaces/          # TypeScript interfaces
│   ├── common.ts        # Shared interfaces
│   ├── networkScanner.ts # Network scanner interfaces
│   └── vulnerabilityScanner.ts # Vulnerability scanner interfaces
│
├── pages/               # Page components for routing
│   └── admin/           # Admin-specific pages
│
├── services/            # Service layer
│   ├── api/             # API services
│   └── ...              # Other services
│
├── theme/               # Theme configuration
│
├── translations/        # i18n files
│
├── utils/               # Utility functions
│
├── App.tsx              # Main application component
└── main.tsx             # Entry point
```

## Key Design Principles

1. **Modularity**
   - Each component has a single responsibility
   - Components are organized by feature/domain

2. **Separation of Concerns**
   - UI components in `/components`
   - Business logic in services
   - Data fetching in API services
   - Global state in contexts

3. **Reusability**
   - Common components are designed to be reusable
   - Utilities and hooks are shared across the application

## Core Components

### Layout Components

- **Layout**: Main layout wrapper that combines Navbar and Sidebar
- **Navbar**: Top navigation bar with user menu and theme toggle
- **Sidebar**: Navigation sidebar with links to different sections
- **ProtectedRoute**: Route wrapper for authentication/authorization

### Feature Components

- **Vulnerability Scanner**: Components for scanning and displaying vulnerabilities
- **Network Scanner**: Components for analyzing network traffic

### Services

- **API Services**: Handle communication with backend APIs
- **Auth Services**: Handle user authentication and authorization
- **Logging Service**: Handle application logging

## Development Guidelines

1. Create new components in the appropriate directory
2. Keep components focused on a single responsibility
3. Use TypeScript interfaces for prop definitions
4. Implement proper error handling in API services
5. Follow the existing naming conventions
6. Add appropriate comments for complex logic

## How to Add a New Feature

1. Define interfaces in the appropriate interfaces file
2. Create any necessary API services
3. Implement UI components
4. Add routing in App.tsx
5. Update Sidebar with new navigation items if needed 