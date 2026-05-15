# Studio Backend (minimal)

Quick start for the minimal local backend used during development.

Prerequisites
- Node.js 18+ (works with Node 20)

Install & run
```powershell
cd "f:\Shoot Project\backend"
npm install
npm run dev
```

Seeded users (development):
- manager1@studio.com / Manager@123
- emp1@studio.com / Emp@123

API highlights
- POST /api/auth/login { email, password } → returns accessToken and sets httpOnly refresh cookie
- POST /api/auth/refresh → reads cookie, returns new accessToken
- POST /api/auth/logout → clears refresh cookie
- GET /api/workspaces → list workspaces (requires Authorization: Bearer <accessToken>)
- POST /api/workspaces → create workspace (auth)
- POST /api/workspaces/:id/members → add member (auth)
- POST /api/:workspaceId/tasks → create task (auth)
