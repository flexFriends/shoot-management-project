# Studio Shoot Management System

A production-grade SaaS platform for creative studios to manage shoot projects, team assignments, and task workflows. Built with Node.js/Express, React, PostgreSQL, and real-time Socket.IO.

## Overview

This is a complete full-stack application with:

- **Backend**: Express.js server with Prisma ORM, PostgreSQL database, JWT authentication
- **Frontend**: React 18 + Vite with Tailwind CSS and React Query
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT tokens only (7-day expiry, no refresh tokens)
- **Database**: PostgreSQL with Prisma schema

## Tech Stack

### Backend
- Node.js 20+
- Express.js
- Prisma ORM
- PostgreSQL 15+
- JWT authentication
- Socket.IO
- Zod validation

### Frontend
- React 18
- Vite
- Tailwind CSS 3
- React Query
- React Router v6
- Zustand (state management)
- React Hook Form + Zod

## Features

✅ User authentication & authorization (4 roles: ADMIN, HR, MANAGER, EMPLOYEE)
✅ Workspace management with team assignments
✅ Task management with drag-and-drop (planned)
✅ Task submission tracking
✅ Comments and file attachments
✅ Activity logging
✅ Real-time notifications (planned)
✅ Email notifications (planned)
✅ Cron jobs for reminders and escalations (planned)
✅ Role-based dashboards (planned)
✅ Calendar view (planned)

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 1. Clone & Setup

```bash
cd f:\Shoot Project\

# Create .env files
echo DATABASE_URL="postgresql://postgres:root@localhost:5432/shoot?schema=public" > backend/.env
echo JWT_SECRET="your-secret-key-here-change-in-production" >> backend/.env
echo PORT=5000 >> backend/.env
echo CLIENT_URL=http://localhost:5173 >> backend/.env
echo VITE_API_URL=http://localhost:5000/api > frontend/.env
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create database (ensure PostgreSQL is running)
# The database "shoot" should exist, or create it:
# createdb -U postgres shoot

# Push schema to database
npm run db:push

# Seed with test data
npm run seed

# Start dev server
npm run dev
```

Server will run at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

App will open at: **http://localhost:5173**

## Test Credentials

After seeding the backend, use these credentials:

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@studio.com     | Admin@123   |
| HR       | hr1@studio.com       | HR@123      |
| Manager  | manager1@studio.com  | Manager@123 |
| Employee | emp1@studio.com      | Emp@123     |

## API Documentation

### Core Endpoints

#### Authentication
```
POST   /api/auth/login              - Login (no password in response)
POST   /api/auth/register           - Register new user
GET    /api/auth/me                 - Get current user (requires token)
PUT    /api/auth/profile            - Update profile
GET    /api/auth/users              - List users (ADMIN only)
```

#### Workspaces
```
POST   /api/workspaces              - Create workspace
GET    /api/workspaces              - List workspaces (role-filtered)
GET    /api/workspaces/:id          - Get workspace with tasks
PUT    /api/workspaces/:id          - Update workspace
DELETE /api/workspaces/:id          - Archive workspace
POST   /api/workspaces/:id/members  - Add member
DELETE /api/workspaces/:id/members/:userId - Remove member
GET    /api/workspaces/:id/activity - Activity timeline
```

#### Tasks
```
POST   /api/workspaces/:wId/tasks          - Create task
GET    /api/workspaces/:wId/tasks          - List tasks
GET    /api/workspaces/:wId/tasks/:id      - Get task
PUT    /api/workspaces/:wId/tasks/:id      - Update task
DELETE /api/workspaces/:wId/tasks/:id      - Delete task
POST   /api/workspaces/:wId/tasks/:id/submit - Submit/complete task
POST   /api/workspaces/:wId/tasks/:id/comments - Add comment
POST   /api/workspaces/:wId/tasks/:id/attachments - Upload file
```

## Database Schema

Key models:
- **User** - Users with roles (ADMIN, HR, MANAGER, EMPLOYEE)
- **Workspace** - Projects/shoots with status and progress tracking
- **TodoTask** - Individual tasks within workspaces
- **TaskSubmission** - Track task completion with submission details
- **Comment** - Task discussions
- **Attachment** - File uploads
- **Notification** - In-app and email notifications
- **ActivityLog** - Audit trail of all actions

See `backend/prisma/schema.prisma` for full schema.

## Project Structure

```
Shoot Project/
├── backend/                   # Node.js/Express server
│   ├── src/
│   │   ├── config/           # Database & configuration
│   │   ├── middleware/       # Auth, error handling, uploads
│   │   ├── routes/           # API routes
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── utils/            # JWT, responses, helpers
│   │   ├── jobs/             # Cron jobs (planned)
│   │   └── app.js            # Express setup
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Seed script
│   ├── server.js             # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/                  # React/Vite app
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── store/            # Zustand stores
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env
│
└── README.md                  # This file
```

## Authentication (JWT Only)

- **No refresh tokens** - Single access token valid for 7 days
- **Token format**: `Authorization: Bearer <token>`
- **Storage**: Persisted in browser localStorage
- **Expiry**: 7 days (adjustable via `JWT_EXPIRES` env var)
- **On expiry**: User must login again

## Development Workflow

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then navigate to **http://localhost:5173**

## Common Commands

### Backend
```bash
npm run dev           # Start dev server
npm run db:push      # Push schema to DB
npm run db:migrate   # Create migration
npm run seed         # Seed test data
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

### Backend (`.env`)
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/shoot?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
TIMEZONE=Asia/Kolkata
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
EMAIL_FROM="Studio App <your@email.com>"
STUDIO_NAME="Studio Management"
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Architecture

### JWT Authentication Flow
1. User logs in with email/password
2. Backend validates credentials and generates JWT token
3. Frontend stores token in localStorage
4. Token included in every API request header
5. Backend validates token middleware
6. On 401, frontend redirects to login

### API Response Format
```json
{
  "success": true,
  "status": 200,
  "message": "Success message",
  "data": { /* actual data */ },
  "timestamp": "2026-05-15T10:30:00Z"
}
```

### State Management
- **Auth**: Zustand store (persisted to localStorage)
- **Server data**: React Query (with caching)
- **UI state**: React local state
- **Real-time**: Socket.IO (planned)

## Security Features

- ✅ Helmet.js security headers
- ✅ CORS protection
- ✅ Rate limiting (100 req/15min)
- ✅ Bcrypt password hashing
- ✅ JWT token validation
- ✅ Input validation (Zod)
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection

## Troubleshooting

### Database Connection Error
```
Check that PostgreSQL is running:
- Windows: Start PostgreSQL service
- Mac: brew services start postgresql
- Linux: sudo systemctl start postgresql
```

### PORT Already in Use
```bash
# Kill process on port 5000
npx lsof -ti :5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### Node Modules Error
```bash
rm -rf node_modules package-lock.json
npm install
```

### Seed Fails
```bash
# Make sure database schema is pushed
npm run db:push

# Then seed
npm run seed
```

## Next Steps / TODO

High Priority:
- [ ] Workspace detail page with tasks
- [ ] Kanban board interface
- [ ] Task submission flow
- [ ] File upload/download
- [ ] Comments system
- [ ] Real-time Socket.IO integration
- [ ] Notification system

Medium Priority:
- [ ] Calendar view
- [ ] Employee dashboard
- [ ] Manager dashboard
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Cron jobs

Lower Priority:
- [ ] Dark mode
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Integration APIs
- [ ] Audit logs

## Performance Considerations

- React Query caching reduces API calls
- Code splitting with Vite
- Database query optimization (Prisma)
- Rate limiting on backend
- Static file serving optimized
- Lazy loading components (planned)

## Deployment

### Backend (Node.js)
```bash
npm install --production
npm run db:migrate
npm run seed  # optional
npm start
```

### Frontend (Static Build)
```bash
npm run build
# Serve dist/ folder with nginx or similar
```

## Support & Documentation

- Backend API docs: See `backend/README.md`
- Frontend guide: See `frontend/README.md`
- Database schema: See `backend/prisma/schema.prisma`

## License

Private - Studio Shoot Management System

---

**Questions or Issues?** Check the individual README files in `/backend` and `/frontend` directories.
