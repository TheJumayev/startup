import React from "react";
import { Link } from "react-router-dom";
import { MdKeyboardArrowRight, MdHome } from "react-icons/md";

const Breadcrumbs = ({ items = [], className = "" }) => {
  // Agar hech narsa bo'lmasa, breadcrumbsni ko'rsatma
  if (items.length === 0) {
    return (
      <nav className={`mb-6 flex items-center ${className}`}>
        <Link
          to="/superadmin/default"
          className="flex items-center rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-1.5 text-indigo-700 shadow-sm transition-all duration-300 hover:from-indigo-100 hover:to-indigo-200 hover:shadow-md dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-200 dark:hover:from-indigo-800/50 dark:hover:to-indigo-700/50"
        >
          <MdHome className="mr-2 h-4 w-4" />
          Bosh sahifa
        </Link>
      </nav>
    );
  }

  return (
    <nav
      className={`mb-6 flex flex-wrap items-center gap-1 md:gap-2 ${className}`}
    >
      {/* Doimiy bosh sahifa */}
      <Link
        to="/superadmin/default"
        className="flex items-center rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 px-3 py-1.5 text-indigo-700 shadow-sm transition-all duration-300 hover:from-indigo-100 hover:to-indigo-200 hover:shadow-md dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-200 dark:hover:from-indigo-800/50 dark:hover:to-indigo-700/50"
        aria-label="Bosh sahifa"
      >
        <MdHome className="mr-2 h-4 w-4" />
        Bosh sahifa
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <MdKeyboardArrowRight
            className="mx-1 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500 md:mx-2"
            aria-hidden="true"
          />
          {index === items.length - 1 ? (
            <Link
              to={item.to}
              className="rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-200 px-3 py-1.5 font-semibold text-indigo-700 shadow-sm dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300"
            >
              {item.label}
            </Link>
          ) : (
            <Link
              to={item.to}
              className="rounded-lg bg-gradient-to-r from-indigo-100 to-indigo-200 px-3 py-1.5 font-semibold text-indigo-700 shadow-sm dark:from-indigo-900/40 dark:to-indigo-800/40 dark:text-indigo-300"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
