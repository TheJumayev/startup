/* eslint-disable */
import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import routes from "../../../routes/student";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import ApiCall from "config";
import { MdLogout, MdOutlineDoorBack } from "react-icons/md";
import { getStudentRoutes } from "../../../views/student/util/studentRoutesFilter";

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [magistr, setMagistr] = useState(null);
  const [isGroupLeader, setIsGroupLeader] = useState(false);
  const studentRoutes = getStudentRoutes(routes, magistr, isGroupLeader);
  // фетчим данные студента
  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await ApiCall(
        "/api/v1/student/account/all/me/" + token,
        "GET"
      );
      setUser(response.data);
      setMagistr(response.data.educationType);
      setIsGroupLeader(response.data.isGroupLeader);
    } catch (error) {
      navigate("/student/login");
      console.error("Error fetching user in Sidebar:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const online = true;

  // фильтруем только те маршруты, что доступны
  // const studentRoutes = routes.filter((r) => {
  //   if (r.layout !== "/student") return false;

  //   // Bakalavr bo‘lsa magistr sahifa chiqmasin
  //   if (magistr === "Bakalavr" && r.path === "magistr") {
  //     return false;
  //   }

  //   if (!isGroupLeader && r.path == "group-offline-davomat") {
  //     return false;
  //   }
  //   if (!isGroupLeader && r.path == "group/:groupId") {
  //     return false;
  //   }
  //   if (!isGroupLeader && r.path == "group/students") {
  //     return false;
  //   }

  //   if (r.hidden) return false;

  //   return !r.isOnline || online;
  // });

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <div className="mx-[20px] mt-[1px] flex items-center lg:mt-[20px]">
        <div className="h-2.5 font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white">
          EDU.BXU.UZ
        </div>
        <span
          className="cursor-pointer pt-4 pl-4 text-2xl xl:hidden"
          onClick={onClose}
        >
          <HiX />
        </span>
      </div>
      <div className="mt-[28px] mb-7 h-px bg-gray-300 dark:bg-white/30 lg:mt-11" />

      {/* Nav item */}
      <div className="h-screen pb-36">
        <ul className="mb-auto h-full scroll-m-0 overflow-auto overscroll-y-auto pb-20">
          {/* передаём только отфильтрованные маршруты */}
          <Links routes={studentRoutes} />

          <Link to={"/"} className="mt-20">
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li className="px-6">
                <button
                  onClick={() => {
                    const weeklyConfirmDate =
                      localStorage.getItem("weeklyConfirmDate");
                    localStorage.clear();
                    if (weeklyConfirmDate) {
                      localStorage.setItem(
                        "weeklyConfirmDate",
                        weeklyConfirmDate
                      );
                    }
                    window.location.href = "/student/login";
                  }}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-sm font-medium text-red-600 transition hover:bg-gray-100 dark:text-white"
                >
                  <MdLogout className="text-xl" />
                  Tizimdan chiqish
                </button>
              </li>
            </div>
          </Link>
        </ul>
      </div>

      {/* Free Horizon Card */}
      <div className="flex justify-center"></div>
      {/* Nav item end */}
    </div>
  );
};

export default Sidebar;
