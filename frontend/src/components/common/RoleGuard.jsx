import React from 'react';
import { useAuthStore } from '../../store/authStore.js';

export default function RoleGuard({ allowedRoles, children, fallback = null }) {
  const user = useAuthStore((state) => state.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}
