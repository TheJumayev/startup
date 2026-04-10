import React, { useEffect, useState } from "react";
import { FiAlignJustify } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/img/ebxu_images/logo.jpg";
import avatar from "assets/img/avatars/avatar4.png";
import ApiCall from "config";

const Navbar = ({ onToggleSidenav, user }) => {
  const [student, setStudent] = useState(user);
  const [showHamburger, setShowHamburger] = useState(() => {
    // показываем гамбургер только < 1200px
    if (typeof window === "undefined") return true;
    return window.innerWidth < 1200;
  });
  const navigate = useNavigate();

  // точное отслеживание порога 1200px
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1200px)");
    const onChange = (e) => setShowHamburger(!e.matches); // >=1200 → false, иначе true
    onChange(mql); // инициализация
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");


    // 🔴 token yo‘q bo‘lsa → login
    if (!token) {
      navigate("/student/login");
      return;
    }


    // 🟡 token bor, lekin user yo‘q → backenddan tekshiramiz
    if (!user) {
      fetchData(token);
    }
  }, [user, navigate]);



  const fetchData = async (token) => {
    try {
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      setStudent(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/student/login");
      }
    }
  };

  return (
    <nav className="sticky top-0 z-40 mx-auto flex max-w-[88rem] flex-row flex-wrap items-center justify-between rounded-xl bg-white/5 p-2 pt-0 shadow-sm backdrop-blur-2xl dark:bg-[#0b14374d]">
      {/* Логотип */}
      <div className="ml-[6px] mt-3">
        <Link to={"/student/default"}>
          <img className="my-auto w-12 md:w-14" src={logo} alt="logo" />
        </Link>
      </div>

      {/* Гамбургер (<1200px) + аватар */}
      <div className="relative mt-[10px] flex h-[50px] w-auto flex-grow-0 items-center gap-4 rounded-full bg-white px-4 shadow-xl dark:!bg-navy-800 dark:shadow-none xl:px-1">
        {showHamburger && (
          <FiAlignJustify
            className="h-7 w-7 cursor-pointer text-gray-600 dark:text-white"
            onClick={onToggleSidenav}
            title="menu"
          />
        )}
        <Link to={"/student/cabinet"}>
          <img
            className="h-12 w-12 cursor-pointer rounded-full border-2 border-gray-200 object-cover dark:border-gray-600 lg:h-14 lg:w-14"
            src={student?.image}
            alt={`${student?.first_name || ""} ${student?.second_name || ""}`}
          />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
