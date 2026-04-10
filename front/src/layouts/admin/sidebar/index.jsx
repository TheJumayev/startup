/* eslint-disable */
import { HiX } from "react-icons/hi";
import Links from "./components/Links";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import routes from "../../../routes/admin";
import ApiCall from "../../../config/index";

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [duty, setDuty] = useState(null); // ⚡️ obyekt bo‘lishi kerak

  useEffect(() => {
    getAdmin();
  }, []);

  const getAdmin = async () => {
    try {
      const response = await ApiCall("/api/v1/auth/decode", "GET", null);
      if (response?.data?.id) {
        localStorage.setItem("adminId", response.data.id);
        getAdminAppeals(response.data.id);
      }
    } catch (error) {
      navigate("/admin/login");
    }
  };

  const getAdminAppeals = async (id) => {
    try {
      const response = await ApiCall(
        `/api/v1/admin-duty/by-admin/${id}`,
        "GET",
        null
      );
      console.log(response.data);
      setDuty(response.data || null);
    } catch (error) {
      navigate("/admin/login");
    }
  };

  // ✅ appealType borligini tekshiramiz
  const hasAppealTypes = duty?.appealType && duty.appealType.length > 0;

  // ✅ Bosh sahifa path nomi (sizning routes.js da "default")
  const homePath = "default";

  // ✅ routes.js ni filter qilish
  let filteredRoutes = [];

  if (hasAppealTypes) {
    // faqat bosh sahifa va arizalar ko‘rsatiladi
    filteredRoutes = routes.filter(
      (r) => !r.hidden && (r.path === homePath || r.path === "check-appeals")
    );
  } else {
    // bosh sahifa har doim chiqadi, arizalar yashiriladi
    filteredRoutes = routes.filter(
      (r) => !r.hidden && r.path !== "check-appeals"
    );

    // ⚡️ kafolat uchun bosh sahifani oldinga qo‘shamiz
    const home = routes.find((r) => r.path === homePath);
    if (home && !filteredRoutes.some((r) => r.path === homePath)) {
      filteredRoutes.unshift(home);
    }
  }

  return (
    <div
      className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl dark:!bg-navy-800 dark:text-white ${
        open ? "translate-x-0" : "-translate-x-96"
      }`}
    >
      <span
        className="absolute top-4 right-4 block cursor-pointer xl:hidden"
        onClick={onClose}
      >
        <HiX />
      </span>

      <div className={`mx-[20px] mt-[20px] flex items-center`}>
        <div className="mt-1 ml-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white">
          EDU.BXU.UZ
        </div>
      </div>
      <div className="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30" />

      {/* ✅ faqat filtered routes chiqariladi */}
      <div className="h-screen pb-36">
        <ul className="mb-auto h-full overflow-auto pb-20">
          <Links routes={filteredRoutes} />

          {/* Logout */}
          <Link to={"/"} className="mt-20">
            <div className="relative mb-3 flex hover:cursor-pointer">
              <li className="my-[3px] flex cursor-pointer items-center px-8">
                <p
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/admin/login";
                  }}
                  className="leading-1 ml-2 w-full cursor-pointer rounded-md p-2 text-sm font-medium text-red-600 hover:bg-gray-100 dark:text-white"
                >
                  Tizimdan chiqish
                </p>
              </li>
            </div>
          </Link>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
