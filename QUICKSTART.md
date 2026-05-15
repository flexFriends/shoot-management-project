# Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env (already created with default values)
# Ensure PostgreSQL is running on localhost:5432

# Push schema to database
npm run db:push

# Seed with test data
npm run seed

# Start server
npm run dev
```

**Backend is now running at:** `http://localhost:5000`

### 2. Frontend Setup

Open **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend will open automatically at:** `http://localhost:5173`

## 🔐 Login

Use these credentials:

```
Email:    manager1@studio.com
Password: Manager@123
```

Other test accounts available - see main README.md

## 📁 Key Files

### Backend
- **Entry**: `backend/server.js`
- **App**: `backend/src/app.js`
- **Routes**: `backend/src/routes/`
- **Controllers**: `backend/src/controllers/`
- **Database**: `backend/prisma/schema.prisma`
- **Seed**: `backend/prisma/seed.js`

### Frontend
- **Entry**: `frontend/src/main.jsx`
- **App**: `frontend/src/App.jsx`
- **Login**: `frontend/src/pages/Login.jsx`
- **Dashboard**: `frontend/src/pages/Dashboard.jsx`
- **API**: `frontend/src/api/index.js`
- **Store**: `frontend/src/store/authStore.js`

## 🔄 Common Tasks

### Reseed Database
```bash
cd backend
npm run seed
```

### Reset Database
```bash
cd backend
npm run db:push  # WARNING: drops and recreates all tables
npm run seed
```

### Build for Production
```bash
# Backend: Just run with NODE_ENV=production
NODE_ENV=production npm start

# Frontend: Build static files
cd frontend
npm run build
```

## 🐛 Troubleshooting

**Cannot connect to database?**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in backend/.env
- The database `shoot` must exist

**Port already in use?**
- Backend (5000): `npx lsof -ti :5000 | xargs kill -9`
- Frontend (5173): Usually auto-selects next port

**Dependencies missing?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Seed fails?**
```bash
# Make sure schema is pushed first
npm run db:push
npm run seed
```

## 📊 What's Implemented

✅ **Authentication** - JWT tokens, login/register, role-based access
✅ **Workspaces** - Create, read, update, delete with members
✅ **Tasks** - Full CRUD with comments and attachments
✅ **Database** - Prisma + PostgreSQL with migrations
✅ **API** - RESTful API with error handling
✅ **Frontend** - React/Vite with Tailwind CSS
✅ **State Management** - Zustand + React Query

## 🚧 Next Steps

High priority to implement:
1. Workspace detail page with task board
2. Kanban drag-and-drop interface
3. Real-time updates with Socket.IO
4. File upload/download
5. Calendar view
6. Dashboards by role

See main README.md for full TODO list.

## 📞 Support

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Architecture: See main `README.md`

---

**Ready to code?** Start implementing the remaining features based on the spec in `STUDIO_SHOOT_MANAGEMENT_CODEX_PROMPT.md`.
