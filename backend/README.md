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
- jasdeepsinghop@gmail.com / Manager@123
- ri00099g@gmail.com / Emp@123
- ri00089g@gmail.com / Emp@123
- riteshsharna148@gmail.com / Emp@123
- riisharma0014@gmail.com / Emp@123

Seeded demo tasks are created without assignees so employees start with no pre-assigned work.

API highlights
- POST /api/auth/login { email, password } → returns accessToken and sets httpOnly refresh cookie
- POST /api/auth/refresh → reads cookie, returns new accessToken
- POST /api/auth/logout → clears refresh cookie
- GET /api/workspaces → list workspaces (requires Authorization: Bearer <accessToken>)
- POST /api/workspaces → create workspace (auth)
- POST /api/workspaces/:id/members → add member (auth)
- POST /api/:workspaceId/tasks → create task (auth)
