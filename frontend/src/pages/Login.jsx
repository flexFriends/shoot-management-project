// import React, { useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import toast from 'react-hot-toast';
// import { authApi } from '../api/index.js';
// import { useAuthStore } from '../store/authStore.js';

// const loginSchema = z.object({
//   email: z.string().email('Invalid email'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// });

// export default function Login() {
//   const navigate = useNavigate();
//   const setAuth = useAuthStore((state) => state.setAuth);
//   const [isLoading, setIsLoading] = useState(false);
//   const isSubmittingRef = useRef(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const { register, handleSubmit, formState: { errors } } = useForm({
//     resolver: zodResolver(loginSchema),
//   });

//   const onSubmit = async (data) => {
//     if (isSubmittingRef.current) {
//       return;
//     }

//     try {
//       isSubmittingRef.current = true;
//       setIsLoading(true);
//       const response = await authApi.login(data.email, data.password);
//       const { user, token } = response.data.data;

//       setAuth(user, token);
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     } catch (error) {
//       if (error.response?.status === 429) {
//         toast.error('Too many login attempts. Please wait a few minutes and try again.');
//       } else {
//         toast.error(error.response?.data?.message || 'Login failed');
//       }
//     } finally {
//       setIsLoading(false);
//       isSubmittingRef.current = false;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
//       </div>

//       <div className="relative w-full max-w-md">
//         <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
//           <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-center">
//             <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
//               <span className="text-5xl">🎬</span>
//             </div>
//           </div>

//           <div className="px-8 py-8">
//             <div className="text-center mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-1">Studio Shoot</h1>
//               <p className="text-gray-600 font-medium text-sm">Production Management System</p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//               <div>
//                 <label className="block text-sm font-semibold text-gray-800 mb-2.5">Email Address</label>
//                 <div className="relative">
//                   <input
//                     {...register('email')}
//                     type="email"
//                     className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none transition duration-200 ${
//                       errors.email
//                         ? 'border-red-300 focus:border-red-500 bg-red-50/30'
//                         : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-gray-50'
//                     }`}
//                     placeholder="you@studio.com"
//                   />
//                   <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">✉️</span>
//                 </div>
//                 {errors.email && <p className="text-red-500 text-sm mt-2 font-medium">{errors.email.message}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold text-gray-800 mb-2.5">Password</label>
//                 <div className="relative">
//                   <input
//                     {...register('password')}
//                     type={showPassword ? 'text' : 'password'}
//                     className={`w-full px-4 py-3 pl-11 pr-12 border-2 rounded-xl focus:outline-none transition duration-200 ${
//                       errors.password
//                         ? 'border-red-300 focus:border-red-500 bg-red-50/30'
//                         : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-gray-50'
//                     }`}
//                     placeholder="••••••••"
//                   />
//                   <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">🔐</span>
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
//                   >
//                     {showPassword ? '👁️' : '👁️‍🗨️'}
//                   </button>
//                 </div>
//                 {errors.password && <p className="text-red-500 text-sm mt-2 font-medium">{errors.password.message}</p>}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                     Signing in...
//                   </>
//                 ) : (
//                   <>
//                     Sign In <span>→</span>
//                   </>
//                 )}
//               </button>
//             </form>

//             <div className="relative my-6">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-200"></div>
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">Test Credentials</span>
//               </div>
//             </div>

//             <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 space-y-2">
//               <div className="text-xs">
//                 <p className="text-gray-600 mb-2 font-semibold">👤 Admin</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">djas7616@gmail.com</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">Admin@123</p>
//               </div>
//               <div className="text-xs pt-2 border-t border-blue-200">
//                 <p className="text-gray-600 mb-2 font-semibold">📋 Manager</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">jasdeepsinghop@gmail.com</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">Manager@123</p>
//               </div>
//               <div className="text-xs pt-2 border-t border-blue-200">
//                 <p className="text-gray-600 mb-2 font-semibold">👥 HR</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200 mb-1">jasdeepsingh8077@gmail.com</p>
//                 <p className="text-gray-700 font-mono text-xs bg-white/50 p-1.5 rounded border border-blue-200">HR@123</p>
//               </div>
//             </div>
//           </div>

//           <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 text-center text-xs text-gray-600">
//             <p>Studio Shoot Management © 2026</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { authApi } from '../api/index.js';
import { useAuthStore } from '../store/authStore.js';
import logo from "../assets/logo-removebg-.png";

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched' // Production practice: Validate when user steps away from field
  });

  const onSubmit = async (data) => {
    if (isSubmittingRef.current) return;

    try {
      isSubmittingRef.current = true;
      setIsLoading(true);
      const response = await authApi.login(data.email, data.password);
      const { user, token } = response.data.data;

      setAuth(user, token);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error('Too many login attempts. Please try again in a few minutes.');
      } else {
        toast.error(error.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // UX Booster: Quickly copy credentials to clipboard for faster testing/QA cycles
  const handleCopyCredentials = (email, pass, index) => {
    navigator.clipboard.writeText(`${email} | ${pass}`)
      .then(() => {
        setCopiedIndex(index);
        toast.success('Credentials copied to clipboard!', { id: 'copy-toast' });
        setTimeout(() => setCopiedIndex(null), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy');
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 sm:px-6 py-12 selection:bg-slate-900 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Section */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm p-2.5 mb-4 overflow-hidden">
            <img 
              src={logo} 
              alt="We Promote Logo" 
              className="w-full h-full object-contain" 
              loading="eager"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            We Promote
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Production Management System
          </p>
        </header>

        {/* Form Card */}
        <main className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:opacity-60 ${
                  errors.email
                    ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500'
                    : 'border-slate-200 bg-slate-50/30'
                }`}
                placeholder="name@company.com"
              />
              <div className="min-h-[20px] mt-1">
                {errors.email && (
                  <p className="text-red-600 text-xs font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={isLoading}
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 pr-12 disabled:opacity-60 ${
                    errors.password
                      ? 'border-red-300 bg-red-50/10 focus:ring-red-500/10 focus:border-red-500'
                      : 'border-slate-200 bg-slate-50/30'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  tabIndex={0}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition focus:outline-none rounded"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              <div className="min-h-[20px] mt-1">
                {errors.password && (
                  <p className="text-red-600 text-xs font-medium flex items-center gap-1">
                    <span>⚠️</span> {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" aria-hidden="true"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Separation Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="px-3 bg-white text-slate-400 font-bold">Quick Access Credentials</span>
            </div>
          </div>

          {/* Test Credentials Grid layout */}
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { role: 'Admin', email: 'djas7616@gmail.com', pass: 'Admin@123' },
              { role: 'Manager', email: 'jasdeepsinghop@gmail.com', pass: 'Manager@123' },
              { role: 'HR', email: 'jasdeepsingh8077@gmail.com', pass: 'HR@123' }
            ].map((cred, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleCopyCredentials(cred.email, cred.pass, idx)}
                className="group w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100/80 active:bg-slate-100 border border-slate-200/60 hover:border-slate-300 rounded-xl transition text-xs flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-slate-400"
                title="Click to copy these credentials"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-600 transition"></span>
                    {cred.role}
                  </p>
                  <div className="font-mono text-slate-500 space-y-0.5 pl-3">
                    <p><span className="text-slate-400">User:</span> {cred.email}</p>
                    <p><span className="text-slate-400">Pass:</span> {cred.pass}</p>
                  </div>
                </div>
                <div className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-sm group-hover:text-slate-700 transition">
                  {copiedIndex === idx ? 'Copied! ✓' : 'Click to Copy'}
                </div>
              </button>
            ))}
          </div>
        </main>

        {/* Footer Area */}
        <footer className="text-center text-xs text-slate-400">
          <p>Studio Shoot Management © 2026</p>
        </footer>
      </div>
    </div>
  );
}