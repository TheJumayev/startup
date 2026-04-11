import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import routes from "../../../routes/superadmin";

const SidebarModern = ({ open, onClose }) => {
  const location = useLocation();

  const activeRoute = (fullPath) => {
    return matchPath({ path: fullPath, end: false }, location.pathname);
  };

  const createLinks = (routes) => {
    return routes.map((route, index) => {
      if (route.layout === "/superadmin" && !route.hidden) {
        const fullPath = route.layout + "/" + route.path;
        const isActive = activeRoute(fullPath);

        return (
          <Link
            key={index}
            to={fullPath}
            onClick={onClose}
            className={`group relative mx-3 mb-2 flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 overflow-hidden ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-blue-50 hover:shadow-sm hover:scale-[1.02]"
            }`}
          >
            {/* Hover effekti - och ko'k */}
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 opacity-0 transition-opacity duration-300 ${
              !isActive && "group-hover:opacity-60"
            }`} />
            
            <span className={`relative text-xl transition-all duration-300 ${
              isActive ? "scale-110" : "group-hover:scale-105"
            }`}>
              {route.icon || "📊"}
            </span>
            
            <span className="relative flex-1 font-medium">
              {route.name}
            </span>

            {/* Aktiv bo'lganda o'ng tomondagi nuqta */}
            {isActive && (
              <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        );
      }
      return null;
    });
  };

  return (
    <>
      {/* Overlay - ko'k rang */}
      {open && (
        <div
          className="fixed inset-0 z-30 transition-all duration-300 bg-blue-500/10 backdrop-blur-sm xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-72 transform overflow-y-auto 
          bg-gradient-to-b from-white via-white to-blue-50/30
          shadow-xl 
          transition-all duration-500 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          xl:relative xl:translate-x-0`}
      >
        {/* Background decoration - ko'k ranglar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-64 h-64 rounded-full -top-20 -right-20 bg-blue-100/40 blur-2xl" />
          <div className="absolute w-64 h-64 rounded-full -bottom-20 -left-20 bg-blue-100/30 blur-2xl" />
          <div className="absolute w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-blue-100/20 blur-2xl" />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute inline-flex items-center justify-center p-2 text-gray-400 transition-all duration-300 rounded-lg group top-4 right-4 hover:bg-blue-100 hover:text-blue-500 xl:hidden"
        >
          <HiX className="w-5 h-5" />
        </button>

        {/* Logo - ko'k gradient */}
        <div className="relative px-6 py-8 border-b border-blue-100">
          <div className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-12 h-12 transition-all duration-300 shadow-md rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-105 group-hover:shadow-lg">
              <span className="text-xl font-bold text-white">📚</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">
                Smart edu
              </h1>
              <p className="text-xs text-gray-400">Superadmin Platform</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative px-3 py-6">
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-blue-600" />
              <h2 className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Asosiy menyu
              </h2>
            </div>
          </div>

          <div className="space-y-1">
            {createLinks(routes)}
          </div>
        </div>

        <div className="flex-1" />

        {/* Footer - chiqish tugmasi ko'k rangda */}
        <div className="relative px-4 py-5 mt-4 border-t border-blue-100">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/admin/login";
            }}
            className="group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-blue-50 to-blue-100 group-hover:opacity-100" />
            <div className="relative p-1.5 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-all duration-300 group-hover:rotate-6">
              <FiLogOut className="w-4 h-4 transition-all duration-300 group-hover:-translate-x-1" />
            </div>
            <span className="relative font-semibold tracking-wide">Tizimdan chiqish</span>
            <div className="absolute transition-all duration-300 transform translate-x-2 opacity-0 right-4 group-hover:opacity-100 group-hover:translate-x-0">
              →
            </div>
          </button>
        </div>

        {/* Bottom decoration - ko'k gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />
      </div>
    </>
  );
};

export default SidebarModern;