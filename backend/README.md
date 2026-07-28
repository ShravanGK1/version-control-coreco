# Version Control Management System - Backend API

Production-ready backend API service for the **Version Control Management System** built with **Node.js**, **Express.js**, **TypeScript**, **MySQL**, **Sequelize ORM**, and **JWT Authentication**.

---

## 📋 Features

- 🔐 **JWT Authentication & Authorization**: Access Token (1 hour expiry) and Refresh Token (6 hours expiry) with bcrypt password hashing.
- 📁 **Active Project Management**: Filtered retrieval of active system projects.
- 🏷️ **Version Control Management**:
  - Auto-calculated semver numbers (`MAJOR.MINOR.BUGFIX`) on the server side.
  - Server-side pagination (default 10 items/page) and sorting (`created_at DESC`).
  - Filtering by `projectId`, `versionType`, date ranges (`startDate`, `endDate`), and text `search` (in title and JSON info).
  - Soft-deletion via `PATCH /api/versions/:id/toggle-status` (toggles `is_active`).
- 🛠️ **Production Ready**: Fully compiled TypeScript output in `dist/` executed via `node dist/server.js`.

---

## 🚀 Prerequisites

- **Node.js**: v18.x or v20.x
- **npm**: v9.x or higher
- **MySQL**: v8.0 or higher running on `localhost:3306`

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the `backend/` root directory:

```bash
cp .env.example .env
```

Default `.env` configuration:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=version_control_management
DB_USER=root
DB_PASSWORD=

JWT_ACCESS_SECRET=super_secret_access_key_123!
JWT_REFRESH_SECRET=super_secret_refresh_key_456!

ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=6h

FRONTEND_URL=http://localhost:5173
```

---

## 🗄️ Database Setup, Migrations & Seeders

### 1. Create MySQL Database

Before running migrations, create the database in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS version_control_management;
```

### 2. Run Database Migrations

Create the database schema (`role_master`, `user_master`, `project_master`, `version_control`):

```bash
npm run migrate
```

### 3. Run Database Seeders

Seed initial roles, users, projects, and sample version records:

```bash
npm run seed
```

---

## 🔑 Seeded Login Credentials

Use these credentials to authenticate against `POST /api/auth/login`:

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@example.com` | `Password123!` |
| **Developer** | `john@example.com` | `Password123!` |

---

## 🏗️ Build & Execution

### Compile TypeScript (`npm run build`)

Compiles TypeScript source code from `src/` to JavaScript output in `dist/`:

```bash
npm run build
```

### Start Server (`npm start`)

Runs the compiled production server at `dist/server.js`:

```bash
npm start
```

> 📌 **Note**: `npm start` executes `node dist/server.js`. `ts-node` is NOT used for production execution.

---

## 📡 API Endpoint Reference

**Base URL**: `http://localhost:5000/api`

### Authentication (`/api/auth`)

- `POST /api/auth/login` - Authenticate user & receive access/refresh tokens.
- `POST /api/auth/refresh-token` - Obtain new 1-hour access token using 6-hour refresh token.
- `POST /api/auth/logout` - Invalidate session (client clears stored tokens).

### Projects (`/api/projects`)

- `GET /api/projects` - Retrieve list of active projects (`is_active = true`).

### Version Control (`/api/versions`)

- `GET /api/versions` - Retrieve paginated list of versions with search & filtering.
- `GET /api/versions/next-number` - Calculate next version number for a project (`?projectId=1&versionType=major`).
- `GET /api/versions/:id` - Retrieve single version record details by ID.
- `POST /api/versions` - Create new version entry (server calculates `versionNumber`).
- `PUT /api/versions/:id` - Update version entry details.
- `PATCH /api/versions/:id/toggle-status` - Soft delete toggle (`is_active = !is_active`).

---

## 📮 Postman Collection

A pre-configured Postman collection is included in the project root:

- File: `postman_collection.json`
- Import this file into Postman to test all endpoints. Login request automatically saves `accessToken` into collection variables for subsequent request authentication.
