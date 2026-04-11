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

const NavbarModern = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    getAdmin();
  }, []);

  const getAdmin = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      if (!token) {
        localStorage.clear();
        navigate("/admin/login");
        return;
      }

      // const response = await ApiCall("/api/v1/auth/decode", "GET", null);

      // Xatolik qaytgan bo'lsa (token eskirgan yoki noto'g'ri)
      // if (!response || response.error) {
      //   localStorage.clear();
      //   navigate("/admin/login");
      //   return;
      // }

      // const data = response.data;

      // // Backend 500 xatolik obyektini qaytargan bo'lsa
      // if (!data || data.status >= 400) {
      //   localStorage.clear();
      //   navigate("/admin/login");
      //   return;
      // }


    } catch (error) {
      console.error("Error fetching account data:", error);
      localStorage.clear();
      navigate("/admin/login");
    }
  };

  const logOut = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  if (admin === null && location.pathname !== "/admin/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b shadow-lg border-white/10 bg-white/70 backdrop-blur-xl dark:bg-gray-900/70 dark:border-gray-700/50">
  <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16 gap-4">

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidenav}
          className="inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 group rounded-xl hover:bg-blue-100 hover:scale-110 dark:text-gray-300 dark:hover:bg-gray-800 xl:hidden"
        >
          <FiAlignJustify className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex items-center justify-center shadow-md h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 shadow-blue-500/30 animate-pulse">
              <span className="text-sm font-bold text-white">📚</span>
            </div>
            <span className="text-lg font-extrabold text-transparent bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text">
              Smart edu
            </span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 hidden md:flex md:max-w-xs">
        <div className="relative w-full group">
          <FiSearch className="absolute w-4 h-4 text-gray-400 transition-colors -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Qidiruv..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-md py-2 pl-10 pr-4 text-sm text-gray-900 shadow-inner transition-all duration-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:scale-[1.03] dark:border-gray-600 dark:bg-gray-800/70 dark:text-white"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notifications */}
        <button className="relative inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 group rounded-xl hover:bg-blue-100 hover:scale-110 dark:text-gray-300 dark:hover:bg-gray-800">
          <FiBell className="w-5 h-5 group-hover:animate-bounce" />
          <span className="absolute w-2 h-2 bg-red-500 rounded-full -top-1 -right-1 animate-ping"></span>
        </button>

        {/* Dark Mode */}
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
          className="inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 group rounded-xl hover:bg-yellow-100 hover:scale-110 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {darkmode ? (
            <RiSunFill className="w-5 h-5 text-yellow-400 transition-transform duration-500 group-hover:rotate-180" />
          ) : (
            <RiMoonFill className="w-5 h-5 text-indigo-500 transition-transform duration-500 group-hover:-rotate-12" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 px-3 py-2 transition-all duration-300 rounded-xl hover:bg-blue-100 hover:scale-105 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-center rounded-full shadow-lg h-9 w-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-purple-500/30">
              <MdPerson className="w-5 h-5 text-white" />
            </div>
            <span className="hidden text-sm font-semibold text-gray-900 dark:text-white sm:inline">
              {admin?.name?.split(" ")?.[0] || "Admin"}
            </span>
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 border shadow-2xl top-full w-52 rounded-2xl border-white/20 bg-white/80 backdrop-blur-xl animate-fadeIn dark:border-gray-700 dark:bg-gray-800/80">

              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {admin?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Super Admin
                </p>
              </div>

              <Link
                to="/superadmin/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm transition-all hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <MdPerson className="w-4 h-4" />
                Profil
              </Link>

              <button className="flex items-center w-full gap-2 px-4 py-2 text-sm transition-all hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700">
                <FiSettings className="w-4 h-4" />
                Sozlamalar
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    logOut();
                    setIsProfileOpen(false);
                  }}
                  className="flex items-center w-full gap-2 px-4 py-2 text-sm text-red-500 transition-all hover:bg-red-50 dark:hover:bg-gray-700"
                >
                  <FiLogOut className="w-4 h-4" />
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

export default NavbarModern;

