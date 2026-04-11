/* eslint-disable */
import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";

import routes from "../../../routes/student";
import { clearLoginData, getStoredStudentInfo } from "../../../api/studentApi";

const SidebarModern = ({ open, onClose }) => {
  const location = useLocation();
  const studentInfo = getStoredStudentInfo();

  const activeRoute = (fullPath) => {
    return matchPath({ path: fullPath, end: false }, location.pathname);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.layout === "/student" && !route.hidden) {
        const fullPath = route.layout + "/" + route.path;
        const isActive = activeRoute(fullPath);

        return (
          <Link
            key={index}
            to={fullPath}
            onClick={onClose}
            className={`group relative mx-3 mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 overflow-hidden ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-md hover:scale-[1.02] dark:text-gray-300 dark:hover:bg-gray-800/50"
            }`}
            style={{
              transformStyle: "preserve-3d",
              perspective: "500px",
            }}
          >
            {/* Hover shine effect */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 transition-opacity duration-500 ${
              !isActive && "group-hover:opacity-10"
            }`} />
            
            {/* Active indicator left bar */}
            {isActive && (
              <div className="absolute left-0 w-1 h-8 -translate-y-1/2 rounded-r-full top-1/2 bg-gradient-to-b from-blue-400 to-indigo-500 animate-pulse" />
            )}

            <span className={`relative text-xl transition-all duration-300 ${
              isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"
            }`}>
              {route.icon || "📊"}
            </span>
            
            <span className="relative flex-1 font-medium tracking-wide">
              {route.name}
            </span>

            {/* Active indicator right dot */}
            {isActive && (
              <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            )}
          </Link>
        );
      }
      return null;
    });
  };

  return (
    <>
      {/* Overlay for mobile - with animation */}
      {open && (
        <div
          className="fixed inset-0 z-30 transition-all duration-500 bg-gradient-to-br from-black/60 via-black/40 to-blue-900/20 backdrop-blur-md xl:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar - with 3D transform */}
      <div
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 transform flex-col overflow-y-auto 
          bg-gradient-to-b from-white via-white/95 to-blue-50/80 
          dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/80
          backdrop-blur-xl shadow-2xl 
          transition-all duration-700 ease-[cubic-bezier(0.34,1.2,0.64,1)] 
          border-r border-white/30 dark:border-white/10
          ${open ? "translate-x-0 scale-100 opacity-100" : "-translate-x-full scale-95 opacity-0"}
          xl:relative xl:translate-x-0 xl:scale-100 xl:opacity-100`}
        style={{
          transformStyle: "preserve-3d",
          perspective: "1200px",
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl animate-float-slow" />
          <div className="absolute rounded-full -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300/15 to-cyan-300/15 blur-3xl animate-float-slower" />
          <div className="absolute w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-blue-400/5 blur-3xl animate-spin-slow" />
          
          {/* Floating particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-blue-400/30 animate-float-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Close button for mobile - with animation */}
        <button
          onClick={onClose}
          className="absolute inline-flex items-center justify-center p-2.5 text-gray-600 transition-all duration-500 group top-5 right-5 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:scale-110 hover:rotate-90 dark:text-gray-300 xl:hidden shadow-lg hover:shadow-red-500/30 z-10"
        >
          <HiX className="w-5 h-5 transition-all duration-500 group-hover:rotate-90 group-hover:scale-110 group-hover:text-white" />
        </button>

        {/* Logo Section - with 3D effect */}
        <div className="relative px-6 py-8 border-b border-blue-100/50 dark:border-blue-800/30">
          <div className="flex items-center gap-3 cursor-pointer group perspective-500">
            <div className="relative">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl group-hover:opacity-70" />
              <div className="relative flex items-center justify-center transition-all duration-700 shadow-2xl h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/50 group-hover:rotate-12 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-blue-500/50 transform-gpu">
                <span className="text-2xl font-bold text-white animate-bounce-subtle">🎓</span>
              </div>
            </div>
            <div className="transition-all duration-500 transform group-hover:translate-x-1">
              <h1 className="text-xl font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text bg-300% animate-gradient">
                SMART EDU
              </h1>
              <p className="text-xs font-medium tracking-wider text-gray-500 dark:text-gray-400">
                Talaba paneli
              </p>
            </div>
          </div>
        </div>

        {/* Student Info - with hover effect */}
        {studentInfo?.fullName && (
          <div className="relative px-6 py-4 mx-3 mt-3 mb-2 overflow-hidden border border-blue-100 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20 group">
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-400/10 to-indigo-400/10 group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 transition-all duration-500 rounded-full opacity-0 bg-gradient-to-r from-blue-400 to-indigo-500 blur-md group-hover:opacity-50" />
                <div className="relative flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-110">
                  <span className="text-sm font-bold text-white">
                    {studentInfo.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate transition-colors dark:text-white group-hover:text-blue-600">
                  {studentInfo.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                  {studentInfo.login}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Section */}
        <div className="flex-1 px-3 py-6 space-y-3">
          <div className="flex items-center gap-2 px-3 mb-2 overflow-hidden">
            <div className="w-1.5 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full animate-pulse" />
            <h2 className="text-xs font-bold tracking-wider text-transparent uppercase bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text">
              Asosiy menyu
            </h2>
          </div>
          <nav className="space-y-1">{createLinks(routes)}</nav>
        </div>

        {/* Footer Section - with animation */}
        <div className="relative px-4 py-5 mt-4 overflow-hidden border-t border-blue-100/50 dark:border-blue-800/30 group/footer">
          <div className="absolute inset-0 transition-all duration-700 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover/footer:from-blue-500/5 group-hover/footer:via-indigo-500/5 group-hover/footer:to-blue-500/5" />
          <button
            onClick={() => {
              clearLoginData();
              localStorage.clear();
              window.location.href = "/student/login";
            }}
            className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-blue-600 transition-all duration-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-200/50 overflow-hidden"
          >
            <div className="absolute inset-0 transition-transform duration-700 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full" />
            <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
              <FiLogOut className="w-4 h-4 transition-all duration-500 group-hover:-translate-x-1.5 group-hover:scale-110" />
            </div>
            <span className="font-semibold tracking-wide">Tizimdan chiqish</span>
            <div className="absolute transition-all duration-500 transform translate-x-2 opacity-0 right-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:right-3">
              →
            </div>
          </button>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-b-2xl" />
      </div>

      {/* Animations styles */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }
        
        @keyframes float-slower {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 15px) scale(1.08); }
          66% { transform: translate(20px, -20px) scale(0.92); }
        }
        
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-float-particle { animation: float-particle linear infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-pulse { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        .bg-300\% { background-size: 300% 300%; }
        .perspective-500 { perspective: 500px; }
      `}</style>
    </>
  );
};

export default SidebarModern;