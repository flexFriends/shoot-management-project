import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";
import NotificationCenter from "../common/NotificationCenter.jsx";
import logo from "../../assets/logo-removebg-.png";
import { 
  ShieldUser, 
  BookUser, 
  Users, 
  CircleUser, 
  SquareUserRound, 
  Film, 
  CheckSquare, 
  LogOut, 
  Menu, 
  X,
  User,
  LayoutDashboard
} from "lucide-react";

export default function Sidebar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const isManager = user?.role === "MANAGER" || user?.role === "ADMIN";
  const isEmployee = user?.role === "EMPLOYEE";
  const isHR = user?.role === "HR";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    setIsOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const menuItemClass = (path) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
      isActive(path)
        ? "bg-indigo-600 text-white shadow-sm font-semibold"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
            <img src={logo} alt="We Promote" className="w-full h-full object-contain" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">
            We <span className="text-indigo-600">Promote</span>
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <NotificationCenter />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
            aria-label={isOpen ? "Close configuration menu" : "Open configuration menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Modern Backdrop Overlay for Mobile Drawer view */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={closeSidebar}
        />
      )}

      {/* Main Container Drawer Layout */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col z-50
          transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Workspace Brand / Desktop Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg from-slate-50 to-zinc-300 border border-slate-200 p-0 flex items-center justify-center overflow-hidden">
              <img src={logo} alt="We Promote Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">
              We <span className="text-indigo-600">Promote</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <NotificationCenter />
            </div>
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded"
              aria-label="Close panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Workspace Info Card Component */}
        <div className="px-4 pt-4 shrink-0">
          <div className="p-3.5 bg-slate-50 border border-indigo-100/60 rounded-xl">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <User size={13} className="text-slate-400" />
              <span>Session Account</span>
            </div>
            <p className="font-bold text-sm text-slate-900 mt-1.5 truncate">
              {user?.name || "User Portal"}
            </p>
            
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md">
                {user?.role === "ADMIN" && (
                   <>
                    <ShieldUser size={13} />
                    Admin
                  </>
                )}
                {user?.role === "MANAGER" && (
                  <>
                    <BookUser size={13} />
                    Manager
                  </>
                )}
                {user?.role === "HR" && (
                  <>
                    <SquareUserRound size={13} />
                    HR
                  </>
                )}
                {user?.role === "EMPLOYEE" && (
                  <>
                    <CircleUser size={13} />
                    Employee
                  </>
                )} 
              </span>
            </div>
          </div>
        </div>

        {/* Clean Application Functional Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {/* Main Dashboard Root Link Group */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3.5 mb-2">
              Overview
            </p>
            <Link
              to="/dashboard"
              className={menuItemClass("/dashboard")}
              onClick={closeSidebar}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Manager/Admin Management Loop Container */}
          {isManager && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3.5 mb-2">
                Management
              </p>
              <Link
                to="/workspaces"
                className={menuItemClass("/workspaces")}
                onClick={closeSidebar}
              >
                <Film size={18} />
                <span>Shoots</span>
              </Link>
              <Link
                to="/workspaces/create"
                className={menuItemClass("/workspaces/create")}
                onClick={closeSidebar}
              >
                <Film size={18} />
                <span>Create Shoot</span>
              </Link>
              <Link
                to="/tasks"
                className={menuItemClass("/tasks")}
                onClick={closeSidebar}
              >
                <CheckSquare size={18} />
                <span>Tasks</span>
              </Link>
              {user?.role === "ADMIN" && (
                <Link
                  to="/manage-users"
                  className={menuItemClass("/manage-users")}
                  onClick={closeSidebar}
                >
                  <Users size={18} />
                  <span>Users</span>
                </Link>
              )}
            </div>
          )}

          {/* Employee Assigned Workspace Loop */}
          {isEmployee && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3.5 mb-2">
                Work assignment
              </p>
              <Link
                to="/workspaces"
                className={menuItemClass("/workspaces")}
                onClick={closeSidebar}
              >
                <Film size={18} />
                <span>My Shoots</span>
              </Link>
              <Link
                to="/tasks"
                className={menuItemClass("/tasks")}
                onClick={closeSidebar}
              >
                <CheckSquare size={18} />
                <span>My Tasks</span>
              </Link>
            </div>
          )}

          {/* HR Management Routing Block */}
          {isHR && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3.5 mb-2">
                HR Core
              </p>
              <Link
                to="/manage-users"
                className={menuItemClass("/manage-users")}
                onClick={closeSidebar}
              >
                <Users size={18} />
                <span>Manage Users</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Secure Exit Actions Panel Footer */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition text-sm font-medium shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <LogOut size={16} className="opacity-80" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}