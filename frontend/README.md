# Studio Shoot Management - Frontend

A modern React/Vite frontend for the Studio Shoot Management System with Tailwind CSS, React Query, and Socket.IO real-time updates.

## Features

- ✓ Responsive design (mobile-first)
- ✓ JWT authentication
- ✓ Role-based UI (ADMIN, HR, MANAGER, EMPLOYEE)
- ✓ Real-time updates with Socket.IO
- ✓ React Query for server state management
- ✓ Zustand for client state
- ✓ Tailwind CSS styling
- ✓ Form validation with React Hook Form + Zod
- ✓ Error boundaries and loading states

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Default `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

App will open at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client setup
│   │   ├── axios.js      # Axios instance with interceptors
│   │   └── index.js      # API endpoints
│   ├── components/
│   │   ├── common/       # Reusable components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   ├── store/            # Zustand stores (auth, notifications, etc.)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Key Components & Pages

### Pages

- **Login** (`/login`) - Authentication page
- **Dashboard** (`/dashboard`) - Main dashboard with workspace overview
- **Workspaces** (`/workspaces`) - Workspace management
- *More pages to be implemented*

### State Management

**Auth Store** (`src/store/authStore.js`):
```javascript
- user: Current user object
- token: JWT token
- isAuthenticated: Boolean
- unreadNotifications: Number
- setAuth(user, token)
- logout()
- updateUser(userData)
```

### API Client

All API calls are made through `src/api/index.js`:

```javascript
import { authApi, workspaceApi, taskApi } from '../api';

// Auth
authApi.login(email, password)
authApi.getCurrentUser()
authApi.updateProfile(data)

// Workspaces
workspaceApi.getAll(page, limit)
workspaceApi.getById(id)
workspaceApi.create(data)

// Tasks
taskApi.getAll(workspaceId)
taskApi.submit(workspaceId, taskId, data)
```

## Authentication Flow

1. User submits login form
2. API returns `{ user, token }`
3. Token stored in Zustand store (persisted to localStorage)
4. Token included in all API requests via Axios interceptor
5. On 401 response, user is logged out and redirected to `/login`
6. No refresh token mechanism - user must login again after 7 days

Example request:
```javascript
const response = await authApi.login('user@example.com', 'password');
// Response: { user: {...}, token: 'eyJhbGc...' }
```

## Styling

Uses **Tailwind CSS 3** with custom configuration:

```javascript
// tailwind.config.js
theme: {
  colors: {
    primary: '#6366f1',    // Indigo
    secondary: '#1e293b',  // Slate
  }
}
```

Dark mode ready - can enable with `darkMode: 'class'`

## Form Validation

Uses **React Hook Form** + **Zod** for schema validation:

```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

## Server State Management

Uses **React Query 5** (TanStack Query) for server state:

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['workspaces'],
  queryFn: () => workspaceApi.getAll(),
});
```

## Notifications

Uses **react-hot-toast** for notifications:

```javascript
import toast from 'react-hot-toast';

toast.success('Saved!');
toast.error('Error occurred');
toast.loading('Processing...');
```

## Testing Credentials

After backend is seeded:

| Role     | Email              | Password   |
| -------- | ------------------ | ---------- |
| Admin    | admin@studio.com   | Admin@123  |
| Manager  | manager1@studio.com| Manager@123|
| Employee | emp1@studio.com    | Emp@123    |

## Common Tasks

### Add a New Page

1. Create `src/pages/NewPage.jsx`
2. Add route in `App.jsx`:
```javascript
<Route path="/new-page" element={<PrivateRoute><NewPage /></PrivateRoute>} />
```

### Add API Endpoint

1. Add to `src/api/index.js`:
```javascript
export const myApi = {
  getAll: () => axiosInstance.get('/my-endpoint'),
  getById: (id) => axiosInstance.get(`/my-endpoint/${id}`),
};
```

### Create Custom Hook

Create `src/hooks/useMyHook.js`:
```javascript
import { useQuery } from '@tanstack/react-query';
import { myApi } from '../api';

export function useMyData() {
  return useQuery({
    queryKey: ['myData'],
    queryFn: myApi.getAll,
  });
}
```

## Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Troubleshooting

**CORS Errors**
- Ensure backend `CLIENT_URL` in .env matches frontend URL
- Check backend CORS configuration

**API Calls Failing**
- Verify backend is running on port 5000
- Check VITE_API_URL is correct
- Look at Network tab in browser dev tools

**Token Issues**
- Tokens are stored in localStorage
- Clear localStorage and re-login if token is corrupted
- Check token expiry (7 days)

## Next Steps

Implement remaining pages and features:
- [ ] Workspace detail page with tasks
- [ ] Kanban board with drag-and-drop
- [ ] Calendar view
- [ ] Employee dashboard
- [ ] Manager dashboard with analytics
- [ ] Real-time updates via Socket.IO
- [ ] File upload/download
- [ ] Comments and activity feed
- [ ] Notifications system
- [ ] Settings/profile management

## License

Private - Studio Shoot Management System
