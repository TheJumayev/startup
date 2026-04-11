import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiAlignJustify,
  FiSearch,
  FiBell,
  FiLogOut,
} from "react-icons/fi";
import { RiMoonFill, RiSunFill } from "react-icons/ri";
import { MdPerson } from "react-icons/md";
import {
  isAuthenticated,
  getStoredStudentInfo,
  clearLoginData,
} from "../../../api/studentApi";

const NavbarModern = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onOpenSidenav, brandText } = props;
  const [darkmode, setDarkmode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);
  const [showSearch, setShowSearch] = useState(false);

  const studentInfo = getStoredStudentInfo();

  useEffect(() => {
    if (!isAuthenticated() && location.pathname !== "/student/login") {
      navigate("/student/login");
    }
  }, [location.pathname]);

  const logOut = () => {
    clearLoginData();
    localStorage.clear();
    navigate("/student/login");
  };

  if (!isAuthenticated() && location.pathname !== "/student/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 w-full transition-all duration-500 border-b shadow-lg bg-white/80 backdrop-blur-md border-blue-100/50 dark:border-blue-800/30 dark:bg-gray-900/80">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Section: Menu + Brand */}
          <div className="flex items-center gap-4">
            {/* Menu Button - with animation */}
            <button
              onClick={onOpenSidenav}
              className="relative inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 group rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gray-800 hover:scale-110 xl:hidden"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 group-hover:opacity-100" />
              <FiAlignJustify className="relative w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            </button>

            {/* Brand Logo - with 3D effect */}
            <div className="hidden sm:block group perspective-500">
              <div className="flex items-center gap-2 transition-all duration-500 cursor-pointer group-hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-md group-hover:opacity-60" />
                  <div className="relative flex items-center justify-center transition-all duration-300 shadow-md w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:rotate-6 group-hover:shadow-lg">
                    <span className="text-sm font-bold text-white animate-bounce-subtle">🎓</span>
                  </div>
                </div>
                <span className="text-lg font-black text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text bg-300% animate-gradient">
                  {brandText || "SMART EDU"}
                </span>
              </div>
            </div>
          </div>

          {/* Center Section: Search - with animation */}
          <div className="flex-1 hidden md:flex md:max-w-xs">
            <div className="relative w-full group">
              <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-md group-hover:opacity-100" />
              <div className="relative">
                <FiSearch className="absolute w-4 h-4 text-gray-400 transition-all duration-300 -translate-y-1/2 left-3 top-1/2 group-hover:text-blue-500" />
                <input
                  type="text"
                  placeholder="Qidiruv..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-700 transition-all duration-300 bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Mobile search button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          >
            <FiSearch className="w-5 h-5" />
          </button>

          {/* Right Section: Icons + Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications - with badge and animation */}
            <div className="relative group">
              <button className="relative inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gray-800 group-hover:scale-110">
                <FiBell className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-md animate-pulse-slow">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notification dropdown - optional */}
              <div className="absolute right-0 invisible mt-2 transition-all duration-300 transform -translate-y-2 border border-blue-100 shadow-xl opacity-0 w-72 bg-white/90 backdrop-blur-md rounded-xl group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
                <div className="p-3 border-b border-blue-100">
                  <p className="text-sm font-semibold text-gray-800">Bildirishnomalar</p>
                </div>
                <div className="p-2">
                  <div className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-blue-50">
                    <p className="text-xs text-gray-600">Yangi dars materiali qo'shildi</p>
                    <p className="text-[10px] text-gray-400 mt-1">5 daqiqa oldin</p>
                  </div>
                  <div className="p-2 transition-colors rounded-lg cursor-pointer hover:bg-blue-50">
                    <p className="text-xs text-gray-600">Test natijalari e'lon qilindi</p>
                    <p className="text-[10px] text-gray-400 mt-1">1 soat oldin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Mode Toggle - with animation */}
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
              className="relative inline-flex items-center justify-center p-2 text-gray-600 transition-all duration-300 group rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 group-hover:opacity-100" />
              {darkmode ? (
                <RiSunFill className="relative w-5 h-5 transition-all duration-500 group-hover:rotate-180 group-hover:scale-110" />
              ) : (
                <RiMoonFill className="relative w-5 h-5 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />

            {/* Profile Dropdown - with animation */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 transition-all duration-300 group rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:bg-gray-800"
              >
                <div className="relative">
                  <div className="absolute inset-0 transition-all duration-500 rounded-full opacity-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-md group-hover:opacity-50" />
                  <div className="relative flex items-center justify-center transition-all duration-300 rounded-full shadow-md w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 group-hover:scale-110">
                    <MdPerson className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <span className="hidden text-sm font-semibold text-gray-700 transition-colors dark:text-white sm:inline group-hover:text-blue-600">
                  {studentInfo?.fullName?.split(" ")?.[0] || "Talaba"}
                </span>
              </button>

              {/* Dropdown Menu - with animation */}
              {isProfileOpen && (
                <div className="absolute right-0 w-56 mt-2 overflow-hidden border border-blue-100 shadow-2xl bg-white/95 backdrop-blur-md rounded-xl animate-scaleIn">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                  
                  <div className="px-4 py-3 border-b border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                    <p className="text-sm font-bold text-gray-800">
                      {studentInfo?.fullName || "Talaba"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {studentInfo?.login || ""}
                    </p>
                  </div>

                  <Link
                    to="/student/profile"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:translate-x-1 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center justify-center rounded-lg w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100">
                      <MdPerson className="w-4 h-4 text-blue-600" />
                    </div>
                    Profil
                  </Link>

                  <div className="border-t border-blue-100">
                    <button
                      onClick={() => {
                        logOut();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-red-600 transition-all duration-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:translate-x-1 dark:text-red-400 dark:hover:bg-gray-800 group"
                    >
                      <div className="flex items-center justify-center transition-all duration-300 bg-red-100 rounded-lg w-7 h-7 group-hover:rotate-12">
                        <FiLogOut className="w-4 h-4 text-red-600" />
                      </div>
                      Chiqish
                      <span className="ml-auto transition-all duration-300 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - expandable */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ${showSearch ? 'max-h-20 opacity-100 mt-2 pb-3' : 'max-h-0 opacity-0'}`}>
          <div className="relative w-full group">
            <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur-md group-hover:opacity-100" />
            <div className="relative">
              <FiSearch className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Qidiruv..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm text-gray-700 transition-all duration-300 bg-white/50 backdrop-blur-sm border border-blue-100 rounded-xl placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animations styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-pulse-slow { animation: pulse-slow 1.5s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-gradient { background-size: 200% 200%; animation: gradient 3s ease infinite; }
        .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        
        .bg-300\% { background-size: 300% 300%; }
        .perspective-500 { perspective: 500px; }
      `}</style>
    </nav>
  );
};

export default NavbarModern;