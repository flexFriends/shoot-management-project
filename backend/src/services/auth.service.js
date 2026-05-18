import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.js';
import { prisma } from '../config/db.js';

/**
 * Register a new user
 */
export const registerUser = async (userData) => {
  const { email, name, password, role, managerId } = userData;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user with optional manager assignment
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: role || 'EMPLOYEE',
      managerId: managerId || null, // Assign to manager if provided
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      managerId: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Login user
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      isActive: user.isActive,
    },
    token,
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update user
 */
export const updateUser = async (userId, updateData) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get counts of users by role for HR dashboard
 */
export const getRoleCounts = async () => {
  const [managers, employees, hrs, admins] = await Promise.all([
    prisma.user.count({ where: { role: 'MANAGER' } }),
    prisma.user.count({ where: { role: 'EMPLOYEE' } }),
    prisma.user.count({ where: { role: 'HR' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
  ]);

  return {
    managers,
    employees,
    hrs,
    admins,
    total: managers + employees + hrs + admins,
  };
};

/**
 * Deactivate user
 */
export const deactivateUser = async (userId) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });

  return user;
};

/**
 * Change user role
 */
export const changeUserRole = async (userId, newRole) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
};

export default {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  getAllUsers,
  deactivateUser,
  changeUserRole,
};
