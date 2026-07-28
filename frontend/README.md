# Version Control Management System (Frontend)

Production-ready, clean, modular React + TypeScript + Vite frontend application for the **Version Control Management System** assignment.

This frontend is designed to run independently and communicate strictly according to the shared backend API contract.

---

## Table of Contents




- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Shared API Contract Compliance](#shared-api-contract-compliance)
- [Getting Started](#getting-started)
- [Features & Implementation Details](#features--implementation-details)

---

## Technology Stack

- **Framework**: [ReactJS 18+](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS (Custom Design System with CSS variables, Glassmorphism, and responsive layout)

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx           # Main application layout wrapper
│   │   │   └── Sidebar.tsx             # Collapsible sidebar & logout control
│   │   └── versions/
│   │       ├── VersionFilters.tsx      # Search, project, version type, dates & toggle filters
│   │       ├── VersionTable.tsx        # Version listing data table
│   │       ├── VersionModal.tsx        # Reusable modal for Add, View, and Edit workflows
│   │       └── Pagination.tsx          # Server-side pagination controls
│   ├── context/
│   │   └── AuthContext.tsx             # React Context for JWT auth & user session
│   ├── pages/
│   │   ├── LoginPage.tsx               # Login page with form validation
│   │   └── VersionListingPage.tsx      # Main dashboard listing page
│   ├── routes/
│   │   └── ProtectedRoute.tsx          # Authentication route guard
│   ├── services/
│   │   ├── api.ts                      # Centralized Axios instance & 401 refresh token interceptor
│   │   ├── authService.ts              # API calls for login, logout, and token refresh
│   │   ├── projectService.ts           # API calls for GET /projects
│   │   ├── versionService.ts           # API calls for versions CRUD & next-number
│   │   └── mockData.ts                 # Isolated mock store for offline demonstration
│   ├── types/
│   │   ├── auth.ts                     # TypeScript interfaces for auth models
│   │   ├── project.ts                  # TypeScript interface for Project model
│   │   └── version.ts                  # TypeScript interfaces for Version model & filters
│   ├── App.tsx                         # Main Router configuration
│   ├── main.tsx                        # Application entry point
│   └── index.css                       # Modern CSS design system
├── .env.example                        # Environment variables template
├── index.html                          # Main HTML document
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript compiler options
└── vite.config.ts                      # Vite configuration with @ path alias
```

---

## Shared API Contract Compliance

This frontend strictly obeys all specified API endpoints, query parameters, payloads, and enum strings:

| Operation | Endpoint | Method | Payload / Params |
| :--- | :--- | :--- | :--- |
| **Login** | `/api/auth/login` | `POST` | `{ email, password }` |
| **Refresh Token** | `/auth/refresh-token` | `POST` | `{ refreshToken }` |
| **Logout** | `/auth/logout` | `POST` | Header Bearer Token |
| **Get Projects** | `/projects` | `GET` | None |
| **Get Versions** | `/versions` | `GET` | `search`, `projectId`, `versionType`, `startDate`, `endDate`, `showDeleted`, `page`, `limit` |
| **Get Next Version #**| `/versions/next-number` | `GET` | `projectId`, `versionType` (`"major"` \| `"minor"` \| `"bug-fix"`) |
| **Create Version** | `/versions` | `POST` | `{ projectId, version, versionTitle, versionInfo }` |
| **Get Version By ID** | `/versions/:id` | `GET` | None |
| **Update Version** | `/versions/:id` | `PUT` | `{ projectId, version, versionTitle, versionInfo }` |
| **Toggle Status** | `/versions/:id/toggle-status` | `PATCH` | None (Soft delete / restore) |

> [!IMPORTANT]
> - Enum values for `versionType` are strictly `"major"`, `"minor"`, `"bug-fix"`.
> - Version numbers displayed during creation/edit are read-only and retrieved dynamically via `GET /versions/next-number`.
> - Soft delete uses `PATCH /versions/:id/toggle-status` (HTTP DELETE is **not** used).

---

## Getting Started

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### 2. Installation

Navigate to the `frontend/` directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Environment Setup

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Configure your backend base API URL in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Running the Development Server

Start the local Vite dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Building for Production

To run TypeScript verification and generate production assets:

```bash
npm run build
```

---

## Features & Implementation Details

1. **Authentication & Token Management**:
   - Access and refresh tokens are managed automatically.
   - Centralized Axios interceptor attaches `Authorization: Bearer <accessToken>` to every API request.
   - Interceptor automatically intercepts `401` errors, calls `POST /auth/refresh-token`, queues concurrent pending requests, and retries original requests seamlessly.

2. **Collapsible Sidebar & Protected Routes**:
   - Protected routes ensure unauthenticated users are redirected to `/login`.
   - Collapsible sidebar with navigation items and bottom Logout button triggering `POST /auth/logout`.

3. **Version Listing, Search & Filtering**:
   - Dynamic search with debouncing.
   - Filter by Project (populated via `GET /projects`), Version Type (`major`, `minor`, `bug-fix`), Start Date, End Date, and Show Deleted toggle.
   - Filters reset page to 1 automatically.

4. **Add, View & Edit Modals**:
   - Add Version modal fetches computed version number via `GET /versions/next-number?projectId=...&versionType=...`.
   - Read-only Version Number field.
   - Version Info supports JSON data formatting and validation.
