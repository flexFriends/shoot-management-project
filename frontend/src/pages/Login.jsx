import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { authApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    if (isSubmittingRef.current) {
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsLoading(true);
      const response = await authApi.login(data.email, data.password);
      const { user, token } = response.data.data;

      setAuth(user, token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please wait a few minutes and try again.');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-5xl">🎬</span>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Studio Shoot</h1>
              <p className="text-gray-600 font-medium text-sm">Production Management System</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2.5">Email Address</label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none transition duration-200 ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-gray-50'
                    }`}
                    placeholder="you@studio.com"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">✉️</span>
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2.5">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className={`w-full px-4 py-3 pl-11 pr-12 border-2 rounded-xl focus:outline-none transition duration-200 ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500 bg-red-50/30'
                        : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-gray-50'
                    }`}
                    placeholder="••••••••"
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">🔐</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-2 font-medium">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <span>→</span>
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Test Credentials</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-2">
              <div className="text-xs">
                <p className="text-gray-600 mb-2 font-semibold">👤 Admin</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">djas7616@gmail.com</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">Admin@123</p>
              </div>
              <div className="text-xs pt-2 border-t border-blue-200">
                <p className="text-gray-600 mb-2 font-semibold">📋 Manager</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">jasdeepsinghop@gmail.com</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">Manager@123</p>
              </div>
              <div className="text-xs pt-2 border-t border-blue-200">
                <p className="text-gray-600 mb-2 font-semibold">👥 HR</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">jasdeepsingh8077@gmail.com</p>
                <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">HR@123</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
            <p>Studio Shoot Management © 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
