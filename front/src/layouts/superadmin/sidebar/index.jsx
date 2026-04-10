import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { HiX } from "react-icons/hi";
import { FiLogOut, FiMenu } from "react-icons/fi";
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
            className={`group relative mx-4 mb-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            <span className="text-xl">{route.icon || "📊"}</span>
            <span className="flex-1 font-medium">{route.name}</span>

            {isActive && (
              <div className="absolute -right-4 top-0 h-full w-1 rounded-r-lg bg-gradient-to-b from-blue-400 to-blue-600" />
            )}
          </Link>
        );
      }
      return null;
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 xl:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform overflow-y-auto border-r border-gray-200 bg-white shadow-xl transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900 ${
          open ? "translate-x-0" : "-translate-x-full"
        } xl:relative xl:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 xl:hidden"
        >
          <HiX className="h-6 w-6" />
        </button>

        {/* Logo Section */}
        <div className="border-b border-gray-200 px-6 py-8 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
              <span className="text-lg font-bold text-white">📚</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                edu.uz
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Platform
              </p>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-2 px-2 py-6">
          <h2 className="mb-4 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Navigation
          </h2>
          <nav className="space-y-1">{createLinks(routes)}</nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Section */}
        <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-700">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/admin/login";
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
          >
            <FiLogOut className="h-5 w-5" />
            Tizimdan chiqish
          </button>
        </div>
      </div>
    </>
  );
};

export default SidebarModern;

