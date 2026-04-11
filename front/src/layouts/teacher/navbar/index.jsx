import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiAlignJustify,
  FiSearch,
  FiBell,
  FiLogOut,
  FiSettings,
} from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { MdPerson } from "react-icons/md";
import ApiCall from "../../../config";

const TeacherNavbar = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = useState(false);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");


  const logOut = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  if (user === null && location.pathname !== "/admin/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenSidenav}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 xl:hidden"
            >
              <FiAlignJustify className="h-5 w-5" />
            </button>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-teal-600">
                  <span className="text-sm font-bold text-white">🎓</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                 Smart edu
                </span>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden flex-1 md:flex md:max-w-xs">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              <FiBell className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                if (darkmode) {
                  document.body.classList.remove("dark");
                  setDarkmode(false);
                } else {
                  document.body.classList.add("dark");
                  setDarkmode(true);
                }
              }}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {darkmode ? (
                <RiSunFill className="h-5 w-5" />
              ) : (
                <RiMoonFill className="h-5 w-5" />
              )}
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500">
                  <MdPerson className="h-5 w-5 text-white" />
                </div>
                <span className="hidden text-sm font-medium text-gray-900 dark:text-white sm:inline">
                  {user?.name?.split(" ")?.[0] || "O'qituvchi"}
                </span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      O'qituvchi
                    </p>
                  </div>

                  <Link
                    to="/teacher/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <MdPerson className="h-4 w-4" />
                    Profil
                  </Link>

                  <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                    <FiSettings className="h-4 w-4" />
                    Sozlamalar
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => {
                        logOut();
                        setIsProfileOpen(false);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Chiqish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TeacherNavbar;

