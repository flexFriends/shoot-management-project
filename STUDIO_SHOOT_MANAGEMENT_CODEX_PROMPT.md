# Studio Shoot Management System — Complete Codex Build Prompt

> **Production-grade SaaS for creative studios. Give this entire document to Codex.**

---

## 1. PROJECT OVERVIEW

Build a full-stack **Studio Shoot Management Application** — a lightweight, real-time production management SaaS for small creative teams (photography/video studios). The system uses a **Workspace-based model** where managers create "shoot projects" (workspaces), assign employees to them, and manage granular tasks within each workspace. The app must feel like a polished, professional SaaS product.

---

## 2. TECH STACK — EXACT SPECIFICATIONS

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **ORM:** Prisma with PostgreSQL adapter
- **Database:** PostgreSQL (v15+)
- **Real-time:** Socket.IO (v4+)
- **Auth:** JWT (access token 15min + refresh token 7d, stored in httpOnly cookies)
- **Email:** Nodemailer (primary) with SMTP config via env vars; fallback to Resend SDK
- **Scheduler:** node-cron for automation jobs
- **File uploads:** Multer + local disk storage (configurable S3 path for production)
- **Validation:** Zod
- **Password hashing:** bcrypt
- **Environment:** dotenv

### Frontend
- **Framework:** React 18 + Vite
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS v3 + shadcn/ui components
- **State management:** Zustand (global) + React Query (server state)
- **Real-time:** Socket.IO client
- **Routing:** React Router v6
- **Date handling:** date-fns
- **Drag and drop (Kanban):** @dnd-kit/core + @dnd-kit/sortable
- **Calendar:** react-big-calendar
- **Charts/Progress:** recharts
- **Notifications toast:** react-hot-toast
- **Icons:** lucide-react
- **HTTP client:** axios with interceptors

---

## 3. FOLDER STRUCTURE

```
studio-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client singleton
│   │   │   ├── email.js           # Nodemailer transporter
│   │   │   └── socket.js          # Socket.IO setup
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification middleware
│   │   │   ├── roles.js           # Role-based access control
│   │   │   ├── upload.js          # Multer config
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── workspace.routes.js
│   │   │   ├── task.routes.js
│   │   │   ├── comment.routes.js
│   │   │   ├── notification.routes.js
│   │   │   └── dashboard.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── workspace.controller.js
│   │   │   ├── task.controller.js
│   │   │   ├── comment.controller.js
│   │   │   ├── notification.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── workspace.service.js
│   │   │   ├── task.service.js
│   │   │   ├── notification.service.js  # Unified in-app + email
│   │   │   ├── email.service.js
│   │   │   └── activity.service.js
│   │   ├── jobs/
│   │   │   └── scheduler.js       # All cron jobs
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── apiResponse.js
│   │   │   └── dateHelper.js
│   │   └── app.js                 # Express app setup
│   ├── server.js                  # Entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/                   # Axios API layer
    │   │   ├── axios.js           # Base config + interceptors
    │   │   ├── auth.api.js
    │   │   ├── workspace.api.js
    │   │   ├── task.api.js
    │   │   └── notification.api.js
    │   ├── components/
    │   │   ├── ui/                # shadcn/ui components (auto-generated)
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Header.jsx
    │   │   │   ├── NotificationBell.jsx
    │   │   │   └── AppLayout.jsx
    │   │   ├── workspace/
    │   │   │   ├── WorkspaceCard.jsx
    │   │   │   ├── WorkspaceForm.jsx
    │   │   │   ├── WorkspaceCalendar.jsx
    │   │   │   └── ActivityTimeline.jsx
    │   │   ├── tasks/
    │   │   │   ├── KanbanBoard.jsx
    │   │   │   ├── TaskCard.jsx
    │   │   │   ├── TaskForm.jsx
    │   │   │   ├── TaskComments.jsx
    │   │   │   └── TaskAttachments.jsx
    │   │   ├── dashboard/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── HRDashboard.jsx
    │   │   │   ├── ManagerDashboard.jsx
    │   │   │   └── EmployeeDashboard.jsx
    │   │   └── common/
    │   │       ├── PrivateRoute.jsx
    │   │       ├── RoleGuard.jsx
    │   │       └── LoadingSpinner.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Workspaces.jsx
    │   │   ├── WorkspaceDetail.jsx
    │   │   ├── Calendar.jsx
    │   │   ├── Team.jsx
    │   │   ├── Notifications.jsx
    │   │   └── Settings.jsx
    │   ├── store/
    │   │   ├── authStore.js       # Zustand auth state
    │   │   ├── notificationStore.js
    │   │   └── socketStore.js
    │   ├── hooks/
    │   │   ├── useSocket.js
    │   │   ├── useNotifications.js
    │   │   └── useWorkspace.js
    │   ├── lib/
    │   │   └── utils.js           # shadcn cn() helper
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 4. DATABASE SCHEMA (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  HR
  MANAGER
  EMPLOYEE
}

enum WorkspacePriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum WorkspaceStatus {
  DRAFT
  ACTIVE
  IN_PROGRESS
  COMPLETED
  ARCHIVED
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  IN_REVIEW
  COMPLETED
  BLOCKED
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_UPDATED
  TASK_COMMENTED
  WORKSPACE_CREATED
  WORKSPACE_UPDATED
  WORKSPACE_ASSIGNED
  ESCALATION_HR
  ESCALATION_ADMIN
  REMINDER_1PM
  REMINDER_2PM
  TASK_STATUS_CHANGED
  MENTION
}

model User {
  id                String         @id @default(cuid())
  name              String
  email             String         @unique
  password          String
  role              Role           @default(EMPLOYEE)
  avatar            String?
  phone             String?
  isActive          Boolean        @default(true)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  lastLoginAt       DateTime?

  // Relations
  createdWorkspaces  Workspace[]         @relation("WorkspaceCreator")
  workspaceMemberships WorkspaceMember[]
  assignedTasks      TodoTask[]          @relation("TaskAssignee")
  createdTasks       TodoTask[]          @relation("TaskCreator")
  taskSubmissions    TaskSubmission[]
  comments           Comment[]
  notifications      Notification[]      @relation("NotificationRecipient")
  sentNotifications  Notification[]      @relation("NotificationSender")
  activityLogs       ActivityLog[]
  refreshTokens      RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Workspace {
  id            String            @id @default(cuid())
  title         String
  description   String?
  shootLocation String?
  shootDate     DateTime?
  dueDate       DateTime?
  priority      WorkspacePriority @default(MEDIUM)
  status        WorkspaceStatus   @default(DRAFT)
  notes         String?
  coverImage    String?
  createdById   String
  createdBy     User              @relation("WorkspaceCreator", fields: [createdById], references: [id])
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  // Relations
  members       WorkspaceMember[]
  tasks         TodoTask[]
  activityLogs  ActivityLog[]
  notifications Notification[]
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  workspaceId String
  userId      String
  role        String    @default("MEMBER") // LEAD or MEMBER
  addedAt     DateTime  @default(now())

  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, userId])
}

model TodoTask {
  id              String     @id @default(cuid())
  workspaceId     String
  title           String
  description     String?
  referenceLink   String?    // Reference reel/video URL
  status          TaskStatus @default(TODO)
  priority        WorkspacePriority @default(MEDIUM)
  // assigneeId is OPTIONAL — if set, only that employee sees this task as "theirs"
  // if null, the task is shared — any workspace member can complete it
  assigneeId      String?
  createdById     String
  dueDate         DateTime?
  order           Int        @default(0)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  // Relations
  workspace       Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  assignee        User?        @relation("TaskAssignee", fields: [assigneeId], references: [id])
  createdBy       User         @relation("TaskCreator", fields: [createdById], references: [id])
  comments        Comment[]
  attachments     Attachment[]
  activityLogs    ActivityLog[]
  submission      TaskSubmission?  // one submission per task (last one wins)
}

// Tracks WHO completed a task, their submission link, and note.
// Replaces the old submissionLink field on TodoTask itself.
// Created when any workspace member marks a task as COMPLETED.
model TaskSubmission {
  id             String    @id @default(cuid())
  taskId         String    @unique   // one active submission per task
  submittedById  String
  submissionLink String?             // Google Drive, Dropbox, etc.
  note           String?             // optional note to manager
  submittedAt    DateTime  @default(now())

  task           TodoTask  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  submittedBy    User      @relation(fields: [submittedById], references: [id])
}

model Comment {
  id          String    @id @default(cuid())
  content     String
  taskId      String
  authorId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  task        TodoTask  @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author      User      @relation(fields: [authorId], references: [id])
}

model Attachment {
  id          String    @id @default(cuid())
  filename    String
  originalName String
  mimetype    String
  size        Int
  url         String
  taskId      String
  uploadedAt  DateTime  @default(now())

  task        TodoTask  @relation(fields: [taskId], references: [id], onDelete: Cascade)
}

model Notification {
  id          String           @id @default(cuid())
  type        NotificationType
  title       String
  message     String
  isRead      Boolean          @default(false)
  recipientId String
  senderId    String?
  workspaceId String?
  taskId      String?
  metadata    Json?            // Extra context data
  createdAt   DateTime         @default(now())

  recipient   User             @relation("NotificationRecipient", fields: [recipientId], references: [id], onDelete: Cascade)
  sender      User?            @relation("NotificationSender", fields: [senderId], references: [id])
  workspace   Workspace?       @relation(fields: [workspaceId], references: [id], onDelete: SetNull)
}

model ActivityLog {
  id          String    @id @default(cuid())
  action      String    // "TASK_CREATED", "STATUS_CHANGED", "MEMBER_ADDED", etc.
  description String
  userId      String
  workspaceId String?
  taskId      String?
  metadata    Json?
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace? @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  task        TodoTask?  @relation(fields: [taskId], references: [id], onDelete: Cascade)
}
```

---

## 5. AUTHENTICATION SYSTEM

### JWT Strategy
- **Access Token:** 15-minute expiry, signed with `JWT_ACCESS_SECRET`
- **Refresh Token:** 7-day expiry, stored in DB + sent as httpOnly cookie
- Implement `/auth/refresh` endpoint that validates DB refresh token and issues new access token
- Implement `/auth/logout` that deletes refresh token from DB and clears cookie

### Endpoints
```
POST /api/auth/login       → { accessToken, user }
POST /api/auth/logout      → clears cookie, deletes DB refresh token
POST /api/auth/refresh     → { accessToken } (reads cookie)
GET  /api/auth/me          → current user profile
```

### Middleware
- `authenticate` middleware: reads `Authorization: Bearer <token>`, verifies JWT, attaches `req.user`
- `authorize(...roles)` middleware: checks `req.user.role` against allowed roles array

---

## 6. ROLES & PERMISSIONS

### ADMIN
- Full access to everything
- Receives escalation notifications at 4 PM if tasks not assigned
- Can view all dashboards, all workspaces, all employees
- Can manage users (create, deactivate, change roles)
- Can see the full escalation log

### HR
- Receives escalation notifications at 2:30 PM if tasks not assigned
- Can view all employee schedules and workspace assignments
- Can view workspace and task data (read-only on tasks)
- Cannot create workspaces or tasks

### MANAGER
- Can create, edit, delete their own workspaces
- Can assign employees to workspaces
- Can create, edit, delete tasks within their workspaces
- Can view all employees for assignment
- Gets login popup + cron reminders if any employee has no tasks for next day
- Can view manager-specific dashboard with calendar, employee schedules, unassigned days

### EMPLOYEE
- Can view only workspaces they are assigned to as a WorkspaceMember
- Can only open a workspace's task board if `shootDate === today`
- Sees ALL tasks in the workspace (tasks are group-owned, not private per employee)
- Can mark ANY task in the workspace as completed (tick it off)
- When completing a task: must provide an optional submission link + optional note via `POST /api/tasks/:id/submit`
- Can add comments and upload attachments to any task in their workspace
- Sees weekly calendar view with their assigned workspace shoots
- Cannot see workspaces they are not a member of

---

## 7. WORKSPACE MODULE — COMPLETE SPEC

### Workspace Fields
```
title           String (required)
description     String (optional, rich text)
shootLocation   String (optional)
shootDate       DateTime (required — the actual shoot day)
dueDate         DateTime (optional — deliverable deadline)
priority        LOW | MEDIUM | HIGH | URGENT
status          DRAFT | ACTIVE | IN_PROGRESS | COMPLETED | ARCHIVED
notes           String (optional)
assignedMembers User[] (multiple employees)
```

### Business Rules
- Manager can create a workspace **up to months in advance** (no restriction on future dates)
- `shootDate` is the date employees can "open" and work on the workspace
- Employee can only access a workspace's task board if `shootDate === today`
- Workspace `status` auto-updates:
  - All tasks TODO → `ACTIVE`
  - Any task IN_PROGRESS → `IN_PROGRESS`
  - All tasks COMPLETED → auto-set to `COMPLETED`
- Workspace progress = `(completedTasks / totalTasks) * 100`

### API Endpoints
```
POST   /api/workspaces                     → create workspace (MANAGER+)
GET    /api/workspaces                     → list workspaces (role-filtered)
GET    /api/workspaces/:id                 → get single workspace with tasks
PUT    /api/workspaces/:id                 → update workspace (creator or ADMIN)
DELETE /api/workspaces/:id                 → soft delete (ADMIN only)
POST   /api/workspaces/:id/members         → add members to workspace
DELETE /api/workspaces/:id/members/:userId → remove member
GET    /api/workspaces/:id/activity        → workspace activity timeline
GET    /api/workspaces/calendar            → all workspaces as calendar events
GET    /api/workspaces/schedule/:date      → workspaces for a specific date
GET    /api/workspaces/unassigned-days     → dates with no workspace coverage (MANAGER+)
GET    /api/workspaces/employee/:userId    → workspaces by employee (MANAGER+)
```

### Response Filtering by Role
- ADMIN/HR: all workspaces
- MANAGER: workspaces they created
- EMPLOYEE: workspaces where they are a WorkspaceMember

---

## 8. TASK MODULE — COMPLETE SPEC

### Task Fields
```
title           String (required)
description     String (optional)
referenceLink   String (optional — YouTube/Vimeo reel URL)
status          TODO | COMPLETED   (simplified — employee either ticks it or not)
priority        LOW | MEDIUM | HIGH | URGENT
assigneeId      String? (optional — null means task is SHARED, any workspace member can complete it)
dueDate         DateTime (optional)
order           Int (for ordering within the todo list)
```

### Task ownership rules
- `assigneeId = null` → **group task** — any employee in the workspace can mark it done
- `assigneeId = userId` → **individual task** — only that employee sees it as assigned to them, but group members can still complete it if needed
- When an employee marks a task COMPLETED they must create a `TaskSubmission` record with their userId, an optional submission link, and an optional note
- Only one submission per task (`@unique` on taskId) — last submission overwrites if re-submitted
- Manager sees all submissions on the review screen grouped by task

### API Endpoints
```
POST   /api/workspaces/:workspaceId/tasks         → create task (MANAGER+)
GET    /api/workspaces/:workspaceId/tasks         → list tasks (all workspace members see all tasks)
PUT    /api/tasks/:id                             → update task title/description/ref link (MANAGER+)
DELETE /api/tasks/:id                             → delete task (MANAGER+)
PATCH  /api/tasks/reorder                         → reorder tasks in the list (drag-drop, MANAGER+)

// Completion flow (EMPLOYEE)
POST   /api/tasks/:id/submit                      → mark task complete + save submission
  body: { submissionLink?: string, note?: string }
  rules: user must be a WorkspaceMember of the task's workspace
         sets task.status = COMPLETED
         upserts TaskSubmission (creates or overwrites)
         emits task:completed Socket.IO event to workspace room
         sends in-app + email notification to workspace creator (manager)

GET    /api/tasks/:id/submission                  → get submission for a task (manager review)

POST   /api/tasks/:id/comments                    → add comment
GET    /api/tasks/:id/comments                    → get comments
POST   /api/tasks/:id/attachments                 → upload file (multipart/form-data)
GET    /api/tasks/:id/attachments                 → list attachments
DELETE /api/tasks/:id/attachments/:attachmentId   → delete attachment
```

---

## 9. REAL-TIME (SOCKET.IO)

### Setup
```javascript
// backend/src/config/socket.js
// Attach Socket.IO to HTTP server
// Use JWT middleware on connection:
//   socket.handshake.auth.token → verify → attach socket.userId, socket.userRole
// On connect: socket.join(`user:${userId}`) — personal room
// On connect: socket.join(`workspace:${workspaceId}`) — per workspace room
```

### Events (Server → Client)
```javascript
// Task events
'task:created'          → { task, workspaceId }
'task:updated'          → { task, workspaceId }
'task:deleted'          → { taskId, workspaceId }
'task:completed'        → { taskId, workspaceId, submission: { submittedBy, submissionLink, note, submittedAt } }
'task:commented'        → { taskId, comment }

// Workspace events
'workspace:updated'     → { workspace }
'workspace:member_added'    → { workspaceId, user }
'workspace:member_removed'  → { workspaceId, userId }

// Notification events
'notification:new'      → { notification }   // sent to user:{userId} room

// Escalation events
'escalation:hr'         → { message, workspaceIds }   // to role:HR room
'escalation:admin'      → { message }                 // to role:ADMIN room
```

### Events (Client → Server)
```javascript
'workspace:join'        → workspaceId  // join workspace room
'workspace:leave'       → workspaceId  // leave workspace room
'typing:start'          → { taskId, userId }
'typing:stop'           → { taskId, userId }
```

---

## 10. NOTIFICATION SYSTEM — COMPLETE SPEC

### Notification Service
Create a unified `NotificationService` that:
1. Creates a `Notification` record in the DB
2. Emits `notification:new` via Socket.IO to the recipient's personal room
3. Sends an email via `EmailService` (non-blocking, wrapped in try-catch)

```javascript
// services/notification.service.js
async function sendNotification({
  type,           // NotificationType enum value
  title,          // Short title
  message,        // Full message
  recipientId,    // Target user ID
  senderId,       // Triggering user ID (optional)
  workspaceId,    // Context workspace (optional)
  taskId,         // Context task (optional)
  metadata,       // Extra JSON data
  sendEmail,      // Boolean (default: true)
  emailSubject,   // Override email subject
  emailBody,      // HTML email body
}) { ... }
```

### In-App Notifications
- Stored in `Notification` table
- Retrieved via `GET /api/notifications?page=1&limit=20`
- Mark as read: `PATCH /api/notifications/:id/read`
- Mark all as read: `PATCH /api/notifications/read-all`
- Unread count: included in `GET /api/auth/me` response and via Socket.IO
- Real-time bell icon with badge count in header

### Email Templates (HTML)
Create beautiful HTML email templates for:
1. **Task Assigned** — employee receives when a task is assigned to them
2. **Task Status Changed** — notifies workspace creator
3. **New Comment** — notifies task assignee and workspace creator
4. **Workspace Assigned** — employee added to a workspace
5. **Reminder 1 PM** — manager reminder: employees without tasks for tomorrow
6. **Reminder 2 PM** — second manager reminder (more urgent tone)
7. **Escalation HR** — HR notification about unassigned employees
8. **Escalation Admin** — Admin escalation (final level)

All emails must use:
- Studio brand colors (dark theme: `#0F172A` background, `#6366F1` accent)
- Responsive HTML table layout (works in Gmail, Outlook)
- Clear CTA button linking to the relevant workspace/task
- Studio name from env var `STUDIO_NAME`

---

## 11. AUTOMATION — CRON JOBS (CRITICAL FEATURE)

```javascript
// backend/src/jobs/scheduler.js
// Uses node-cron. All times in the studio's local timezone (env: TZ or TIMEZONE)

/*
  BUSINESS RULE:
  Managers must assign tasks for the NEXT calendar day.
  Example: Today = May 15 → Tasks must exist for May 16.
  
  "Unassigned" means: employees assigned to a workspace scheduled for tomorrow
  who have ZERO tasks assigned to them in that workspace.
  
  Also flag: employees who are not assigned to ANY workspace for tomorrow.
*/

// CRON JOB 1: Login Check (runs every minute, triggered on manager login)
// On manager login response: check if any employee has no tasks for next day
// If YES: include { hasUnassignedAlert: true, unassignedEmployees: [...] } 
// in login API response — frontend shows modal popup

// CRON JOB 2: Daily 1:00 PM reminder
// Schedule: '0 13 * * 1-6'  (Mon-Sat)
// Check: find all employees with workspaces tomorrow but no tasks
// Action: send in-app + email notification to each responsible MANAGER
// Notification type: REMINDER_1PM

// CRON JOB 3: Daily 2:00 PM reminder
// Schedule: '0 14 * * 1-6'
// Same check, more urgent message
// Notification type: REMINDER_2PM

// CRON JOB 4: Escalation to HR — 2:30 PM
// Schedule: '30 14 * * 1-6'
// Check: still unresolved (employees still have no tasks for tomorrow)
// Action: send in-app + email to ALL HR users
// Include: list of managers, their workspaces, and the unassigned employees
// Notification type: ESCALATION_HR
// Socket.IO: emit 'escalation:hr' to all connected HR users

// CRON JOB 5: Escalation to Admin — 4:00 PM
// Schedule: '0 16 * * 1-6'
// Check: still unresolved
// Action: send in-app + email to ALL ADMIN users
// Include: full context — managers, workspaces, employees, hours since first reminder
// Notification type: ESCALATION_ADMIN
// Socket.IO: emit 'escalation:admin' to all connected ADMIN users

// CRON JOB 6: Daily cleanup — midnight
// Schedule: '0 0 * * *'
// Delete expired refresh tokens
// Archive completed workspaces older than 30 days (status → ARCHIVED)

// HELPER FUNCTION: getUnassignedEmployeesForTomorrow()
// Returns: Array of { manager, workspace, employees[] }
// Logic:
//   1. Get date = tomorrow (startOf day to endOf day)
//   2. Find all Workspaces where shootDate falls in tomorrow
//   3. For each workspace: find WorkspaceMembers (employees)
//   4. Check: does this workspace have ANY TodoTasks at all?
//      - If workspace has 0 tasks → entire workspace is "unassigned" → flag it
//      - If workspace has tasks but some members never submitted any → they are "unassigned"
//   5. Return grouped by workspace/manager
```

---

## 12. DASHBOARD VIEWS — BY ROLE

### Admin Dashboard
```
Widgets:
1. Summary stats: Total Users | Active Workspaces | Pending Tasks | Completed Today
2. Team utilization chart (bar chart: employee vs. tasks assigned this week)
3. Escalation log: recent escalations with timestamps
4. All workspace status overview (pie chart: DRAFT/ACTIVE/IN_PROGRESS/COMPLETED)
5. Recent activity feed (all teams)
6. Employee list with current workspace assignment
```

### HR Dashboard
```
Widgets:
1. Employee schedule overview — employee cards with this week's workspace assignments
2. Unassigned days calendar — red/amber/green heatmap calendar
3. Escalation history — received escalations with status
4. Team load balance chart
5. Quick search: find employee → see their full schedule
```

### Manager Dashboard — THE MOST COMPLEX VIEW
```
Section 1: Overview Cards
  - My Workspaces count | Tasks due today | Overdue tasks | Team members

Section 2: Alert Banner (conditionally shown)
  - If today and employees have no tasks for tomorrow → show dismissible orange alert
  - "⚠️ 3 employees have no tasks assigned for tomorrow. Assign now →"

Section 3: Calendar View (react-big-calendar)
  - Month view by default, switchable to week view
  - Each day shows workspace names scheduled for that day
  - Color coding:
    - Green = workspace complete (all tasks done)
    - Blue = workspace has tasks assigned
    - Orange = workspace exists but some employees have no tasks
    - Red = workspace exists but NO tasks assigned at all
    - Gray = no workspace scheduled
  - Clicking a day → opens workspace detail or "Create Workspace" modal

Section 4: Employee Schedule View
  - Dropdown to select an employee
  - Shows their workspace schedule for the next 30 days
  - Shows per-day task status

Section 5: Upcoming Shoots (next 7 days)
  - Table: Date | Workspace | Location | Assigned Employees | Tasks Status | Actions
  - Quick-action: "Assign Tasks" button for workspaces with missing assignments

Section 6: My Recent Workspaces
  - Card grid of recent workspaces with progress bars
```

### Employee Dashboard
```
Section 1: Weekly Calendar (custom component, NOT full react-big-calendar)
  - Shows Mon–Sun of current week
  - Each day shows workspace name if assigned
  - TODAY's workspace card is highlighted, clickable → opens workspace
  - Future days: shows title only, locked icon
  - Past days: shows completion status

Section 2: Today's Tasks (if today has a workspace)
  - Kanban columns: TODO | IN_PROGRESS | IN_REVIEW | COMPLETED
  - Only their assigned tasks
  - Drag to change status

Section 3: Upcoming Shoots (next 2 weeks)
  - Simple list: Date | Workspace | Location

Section 4: Activity Feed
  - Recent comments, status changes on their tasks
```

---

## 13. CALENDAR FEATURE — DETAILED SPEC

### Manager Calendar (Full)
- Use `react-big-calendar` with `date-fns` localizer
- Views: Month, Week, Day, Agenda
- Custom event renderer: shows workspace name, priority badge, assigned employee count
- Click event → workspace detail slide-over panel (not page navigation)
- Day click (empty) → opens "Create Workspace" modal pre-filled with that date
- Color coding per workspace status (see Manager Dashboard Section 3 above)
- **Unassigned day indicators:** red dot on calendar days where workspaces exist but employees have no tasks

### API for Calendar
```
GET /api/workspaces/calendar?startDate=2026-05-01&endDate=2026-05-31
Response: [
  {
    id, title, shootDate, dueDate, status, priority,
    memberCount, taskCount, completedTaskCount,
    hasUnassignedEmployees: boolean,
    members: [{ id, name, avatar }]
  }
]

GET /api/workspaces/unassigned-days?month=2026-05
Response: [
  { date: "2026-05-16", workspaces: [{ id, title, unassignedCount: 2 }] }
]
```

### Employee Weekly Calendar (Custom Component)
```jsx
// WeeklyCalendar.jsx
// Props: workspaces (array of workspace objects for the week)
// Shows 7 day columns (Mon-Sun)
// Each column:
//   - Day name + date number
//   - If workspace exists: colored card with workspace title + location
//   - If TODAY + workspace exists: clickable, highlighted with accent border
//   - If TODAY + no workspace: "No shoot scheduled today" empty state
//   - If future: locked appearance
//   - If past + completed: green checkmark
//   - If past + not completed: gray with "(past)" label
```

---

## 14. FRONTEND STATE MANAGEMENT

### Zustand Auth Store
```javascript
// store/authStore.js
{
  user: null,          // Current user object
  accessToken: null,
  isAuthenticated: false,
  unreadNotifications: 0,
  actions: {
    login(user, token),
    logout(),
    updateUser(userData),
    setUnreadCount(count),
    decrementUnread(),
  }
}
```

### Zustand Notification Store
```javascript
{
  notifications: [],
  unreadCount: 0,
  actions: {
    addNotification(notification),  // prepend to list
    markRead(id),
    markAllRead(),
    setNotifications(list),
  }
}
```

### Socket Store
```javascript
{
  socket: null,
  isConnected: false,
  actions: {
    connect(token),
    disconnect(),
    joinWorkspace(workspaceId),
    leaveWorkspace(workspaceId),
  }
}
```

### React Query Setup
- All API calls wrapped in React Query hooks
- Invalidate workspace queries on Socket.IO task events
- Optimistic updates for task status changes
- Prefetch workspace detail on hover over workspace card

---

## 15. UI DESIGN SYSTEM

### Theme (Dark Mode Default, Light Mode Toggle)

**Dark Mode Colors:**
```css
--bg-primary:    #0F172A  /* slate-900 */
--bg-secondary:  #1E293B  /* slate-800 */
--bg-tertiary:   #334155  /* slate-700 */
--accent:        #6366F1  /* indigo-500 */
--accent-hover:  #4F46E5  /* indigo-600 */
--text-primary:  #F1F5F9  /* slate-100 */
--text-muted:    #94A3B8  /* slate-400 */
--border:        #334155  /* slate-700 */
--success:       #10B981  /* emerald-500 */
--warning:       #F59E0B  /* amber-500 */
--danger:        #EF4444  /* red-500 */
--info:          #3B82F6  /* blue-500 */
```

**Light Mode Colors:**
```css
--bg-primary:    #FFFFFF
--bg-secondary:  #F8FAFC
--bg-tertiary:   #F1F5F9
--accent:        #6366F1
--text-primary:  #0F172A
--text-muted:    #64748B
--border:        #E2E8F0
```

### Priority Badge Colors
```
LOW     → gray badge
MEDIUM  → blue badge
HIGH    → amber badge
URGENT  → red badge with pulse animation
```

### Status Badge Colors
```
TODO        → slate
IN_PROGRESS → blue
IN_REVIEW   → purple
COMPLETED   → green
BLOCKED     → red
```

### Task Status Colors (Kanban columns)
```
TODO column header        → slate-600
IN_PROGRESS column header → blue-600
IN_REVIEW column header   → purple-600
COMPLETED column header   → green-600
BLOCKED column header     → red-600
```

---

## 16. WORKSPACE DETAIL PAGE — FULL SPEC

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back]  "Apple Product Shoot"              [Edit] [Delete]   │
│  📍 Apple HQ, Cupertino  |  📅 May 16, 2026  |  🔴 HIGH        │
│  ─────────────────────────────────────────────────────────────── │
│  Progress: ████████░░░░  67% (4/6 tasks done)                   │
│  Team: [Avatar RS] [Avatar PS] [Avatar AK]  +Add employee       │
├─────────────────────────────────────────────────────────────────┤
│  [Tasks]  [Activity]  [Notes]                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  EMPLOYEE VIEW (shootDate = today):                             │
│  Simple todo checklist — all tasks visible to all members       │
│  Each task row:                                                  │
│    [ ] Hero product shots          [Mark done →]                │
│    [✓] Lifestyle shots             Rahul · drive.google.com/... │
│    [ ] Detail macro shots          [Mark done →]                │
│                                                                  │
│  Clicking "Mark done" opens a slide-up panel:                   │
│    - Submission link input (optional)                           │
│    - Note textarea (optional)                                   │
│    - [Submit] button → marks COMPLETED, saves TaskSubmission    │
│                                                                  │
│  MANAGER VIEW (any date):                                       │
│  Same checklist + [Add task] button at top                      │
│  Completed tasks show: who submitted, link, note                │
│  Manager cannot un-complete a task (employee owns the tick)     │
└─────────────────────────────────────────────────────────────────┘
```

### Manager Review Screen (inside workspace detail, "Tasks" tab)

Manager sees a simple list — not Kanban. Two sections:

```
COMPLETED (4)
─────────────────────────────────────────────────────
✓  Hero product shots
   Completed by: Rahul Singh · 2:34 PM
   Submission:   [🔗 drive.google.com/file/abc...]
   Note:         "Used the new 50mm lens, 3 variations"

✓  Lifestyle shots
   Completed by: Priya Sharma · 3:10 PM
   Submission:   [🔗 dropbox.com/sh/xyz...]
   Note:         —

PENDING (2)
─────────────────────────────────────────────────────
○  Detail macro shots
○  Behind the scenes video reel
```

- Manager cannot tick tasks themselves — only employees can
- Manager can click any submission link to open it
- Manager can add a comment on any task for clarification
- Progress bar at top updates in real time via Socket.IO

```javascript
// Every significant action creates an ActivityLog entry
// Actions to log:
const ACTIVITY_ACTIONS = {
  WORKSPACE_CREATED:        "workspace_created",
  WORKSPACE_UPDATED:        "workspace_updated",
  WORKSPACE_STATUS_CHANGED: "workspace_status_changed",
  MEMBER_ADDED:             "member_added",
  MEMBER_REMOVED:           "member_removed",
  TASK_CREATED:             "task_created",
  TASK_UPDATED:             "task_updated",
  TASK_DELETED:             "task_deleted",
  TASK_STATUS_CHANGED:      "task_status_changed",
  TASK_ASSIGNED:            "task_assigned",
  COMMENT_ADDED:            "comment_added",
  FILE_UPLOADED:            "file_uploaded",
};

// ActivityTimeline component renders entries as a vertical timeline
// Each entry: Avatar | "Rahul changed task 'Hero Shots' from TODO to IN_PROGRESS" | "2 hours ago"
// Group entries by day
// Paginate: load 20 at a time, "Load more" button
```

---

## 18. FILE UPLOAD SYSTEM

### Backend (Multer)
```javascript
// File size limit: 50MB per file
// Allowed types: image/*, video/*, application/pdf, .zip, .psd, .ai, .raw
// Storage: local disk at /uploads/{workspaceId}/{taskId}/{filename}
// Static file serving: express.static('/uploads') at '/api/files'
// Filename: {uuid}-{originalname} (sanitized)

// Endpoint: POST /api/tasks/:id/attachments
// Multer middleware → save file → create Attachment record → return Attachment object
```

### Frontend
```jsx
// TaskAttachments.jsx
// Drag-and-drop upload zone using HTML5 drag events (no extra library)
// Shows upload progress (XHR with onUploadProgress)
// Thumbnail previews for images
// File type icons for non-images (PDF, ZIP, PSD, etc.)
// Delete button (only for uploader or manager)
// Download link for all files
```

---

## 19. RESPONSIVE DESIGN

- Mobile-first Tailwind classes
- Sidebar collapses to bottom nav on mobile (< 768px)
- Kanban board: horizontal scroll on mobile
- Calendar: switch to list view on mobile automatically
- All modals: full-screen on mobile
- Tables: horizontal scroll wrapper on mobile

---

## 20. ERROR HANDLING & VALIDATION

### Backend
```javascript
// Global error handler middleware
// Zod validation on all request bodies
// Prisma error mapping (P2002 unique constraint → 409, P2025 not found → 404)
// All controllers wrapped in try-catch with next(error)
// Error response format:
{ success: false, error: { code: "VALIDATION_ERROR", message: "...", details: [...] } }
// Success response format:
{ success: true, data: {...}, message: "..." }
```

### Frontend
```javascript
// Axios interceptors:
//   Request: attach Authorization header
//   Response 401: attempt token refresh → retry request → if still 401 → logout
//   All errors: show toast notification
// React Query onError: show toast with error.response.data.error.message
// Form validation: React Hook Form + Zod resolvers
```

---

## 21. ENVIRONMENT VARIABLES

```env
# backend/.env

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/studio_db"

# JWT
JWT_ACCESS_SECRET="your-access-secret-256-bit"
JWT_REFRESH_SECRET="your-refresh-secret-256-bit"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
TIMEZONE="Asia/Kolkata"

# Email (Nodemailer SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
EMAIL_FROM="Studio App <your@email.com>"

# Studio Branding
STUDIO_NAME="Your Studio"

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800  # 50MB in bytes

# Optional: Resend (fallback)
RESEND_API_KEY=re_xxx
```

```env
# frontend/.env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 22. SEED DATA

Create `prisma/seed.js` with:
```javascript
// Users:
// 1x Admin: admin@studio.com / Admin@123
// 2x HR: hr1@studio.com, hr2@studio.com / HR@123
// 2x Manager: manager1@studio.com, manager2@studio.com / Manager@123
// 5x Employee: emp1..5@studio.com / Emp@123

// For manager1: create 5 workspaces spanning next 30 days
// Each workspace: 3-6 tasks, various statuses
// Include past workspaces (completed), today's workspace (active), and future workspaces

// For manager2: create 3 workspaces
// One workspace: deliberately leave employees with NO tasks (to test cron alerts)
```

---

## 23. API SECURITY

- Rate limiting: `express-rate-limit` — 100 req/15min on auth routes, 500 req/15min general
- CORS: only allow `CLIENT_URL` from env
- Helmet.js: security headers
- Input sanitization: express-validator + Zod
- File upload: validate MIME type both from Content-Type header AND file magic bytes
- SQL injection: not possible with Prisma (parameterized queries)
- XSS: sanitize comment content with `sanitize-html`

---

## 24. SOCKET.IO AUTHENTICATION

```javascript
// Socket.IO middleware (runs before connection)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  // Join personal room
  socket.join(`user:${socket.userId}`);
  // Join role room for broadcast escalations
  socket.join(`role:${socket.userRole}`);
  
  socket.on("workspace:join", (workspaceId) => {
    // Verify user is member of workspace before joining
    socket.join(`workspace:${workspaceId}`);
  });
  
  socket.on("workspace:leave", (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
  });
  
  socket.on("disconnect", () => {
    // Cleanup if needed
  });
});
```

---

## 25. NOTIFICATION BELL COMPONENT

```jsx
// Header notification bell
// Shows badge with unread count (max display: 99+)
// Click → dropdown panel with last 10 notifications
// Each item: icon (by type) | title | message truncated | time ago
// "Mark all read" button
// "View all" → /notifications page
// Real-time: Socket.IO 'notification:new' event:
//   → increment badge count
//   → prepend to dropdown list
//   → show toast (react-hot-toast) in bottom-right corner
//   → play subtle notification sound (optional, user preference)
```

---

## 26. MANAGER LOGIN POPUP (Unassigned Alert)

```jsx
// After successful login, if manager role:
// API call: GET /api/dashboard/manager/unassigned-alert
// Response: { hasAlert: true, unassigned: [{ employee, workspaces: [...] }] }
// If hasAlert: show modal dialog
// Modal content:
//   Title: "⚠️ Tasks Not Assigned for Tomorrow"
//   Body: List of employees with no tasks for [tomorrow's date]
//   Each row: Employee name | Workspace name | "Assign Now →" link
//   Actions: [Assign Now] (→ calendar view on tomorrow) | [Dismiss] | [Remind me later]
// Also shows on dashboard as a sticky alert banner until resolved
```

---

## 27. COMPLETE IMPLEMENTATION CHECKLIST

Build in this order:

**Phase 1: Foundation**
- [ ] Project setup (both packages, env, DB)
- [ ] Prisma schema + migrations + seed
- [ ] Express app with all middleware
- [ ] Auth system (login/logout/refresh/me)
- [ ] User CRUD (Admin only)
- [ ] Frontend: Vite + React + Tailwind + shadcn/ui setup
- [ ] Frontend: Auth pages (Login)
- [ ] Frontend: Layout with sidebar, header, routing

**Phase 2: Core Features**
- [ ] Workspace CRUD API
- [ ] Task CRUD API
- [ ] Comment API
- [ ] File upload API
- [ ] Socket.IO setup (backend + frontend)
- [ ] Frontend: Workspace list/create/edit
- [ ] Frontend: Workspace detail with Kanban board
- [ ] Frontend: Task cards, drag-and-drop
- [ ] Frontend: Task detail slide-over

**Phase 3: Role Dashboards**
- [ ] Activity logging system
- [ ] Notification system (in-app + email)
- [ ] Frontend: Notification bell + dropdown
- [ ] Frontend: Employee Dashboard (weekly calendar)
- [ ] Frontend: Manager Dashboard (full calendar + employee schedule)
- [ ] Frontend: HR Dashboard
- [ ] Frontend: Admin Dashboard

**Phase 4: Automation**
- [ ] Cron jobs (all 5 jobs)
- [ ] Login popup for manager (unassigned alert)
- [ ] Calendar unassigned-day indicators
- [ ] Email templates

**Phase 5: Polish**
- [ ] Dark/light mode toggle
- [ ] Responsive mobile layout
- [ ] Loading states, skeleton loaders
- [ ] Error boundary components
- [ ] Rate limiting, security headers
- [ ] README with setup instructions

---

## 28. PACKAGE.JSON DEPENDENCIES

### Backend
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "express-rate-limit": "^7.0.0",
    "helmet": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.0",
    "sanitize-html": "^2.11.0",
    "socket.io": "^4.6.0",
    "zod": "^3.22.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "nodemon": "^3.0.0"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "lucide-react": "^0.400.0",
    "react": "^18.2.0",
    "react-big-calendar": "^1.8.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.0",
    "react-router-dom": "^6.20.0",
    "recharts": "^2.10.0",
    "socket.io-client": "^4.6.0",
    "zustand": "^4.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

---

## 29. CRITICAL NOTES FOR CODEX

1. **All file paths matter** — follow the folder structure exactly
2. **Prisma client** must be a singleton (prevent connection pool exhaustion in dev)
3. **Socket.IO** must be initialized ONCE and exported for use in controllers
4. **Cron jobs** run in the server process — ensure they access the singleton Prisma client
5. **JWT refresh flow** — frontend Axios interceptor must handle 401 → refresh → retry without infinite loops (use a flag)
6. **Drag-and-drop** — use @dnd-kit, NOT react-beautiful-dnd (deprecated)
7. **Calendar** — react-big-calendar requires a localizer; use `dateFnsLocalizer` from `react-big-calendar/lib/localizers/date-fns`
8. **File serving** — serve `/uploads` as static with proper content-type headers
9. **Role guards** — implement both backend middleware AND frontend `<RoleGuard>` component
10. **Employee date lock** — workspace task board is only accessible if `shootDate` = today (check in backend API + show lock UI on frontend)

---

## 30. README SETUP INSTRUCTIONS

The final README must include:
```markdown
# Studio Shoot Management App

## Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

## Setup

### 1. Clone and install
cd backend && npm install
cd frontend && npm install

### 2. Database
# Create PostgreSQL database
createdb studio_db

# Copy env files
cp backend/.env.example backend/.env
# Fill in DATABASE_URL, JWT secrets, SMTP credentials

# Run migrations
cd backend && npx prisma migrate dev --name init

# Seed database
npx prisma db seed

### 3. Start development
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd frontend && npm run dev

### 4. Default login credentials
Admin: admin@studio.com / Admin@123
Manager: manager1@studio.com / Manager@123
Employee: emp1@studio.com / Emp@123
```

---

*This document is the complete specification. Build every section. Do not skip features. The automation/cron section is critical business logic — implement all 5 jobs exactly as described.*
