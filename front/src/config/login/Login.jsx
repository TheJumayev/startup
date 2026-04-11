import { Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import ApiCall from "../index";

export default function Auth() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    phone: "",
    password: "",
    rememberMe: false,
  });

  // 🔥 Avtomatik tekshirish (agar token mavjud bo‘lsa)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  }, [navigate]);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    localStorage.clear();
    try {
      const response = await toast.promise(
        ApiCall("/api/v1/auth/login", "POST", studentData, null, false),
        {
          pending: "Login...",
          error: "Failed to login",
        }
      );

      if (response.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        if (response.data?.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }
      }
      const roles = response.data.roles || [];
      localStorage.setItem("roles", JSON.stringify(roles));
      console.log(roles[0].name);
      if (roles.length > 0) {
        if (roles[0].name === "ROLE_ADMIN") navigate("/admin");
        else if (roles[0].name === "ROLE_SUPERADMIN") {
          navigate("/superadmin/default");
        } else if (roles[0].name === "ROLE_TEACHER") {
          navigate("/teacher/default");
        } else if (roles[0].name === "ROLE_TEST_CENTER") {
          navigate("/test-center/default");
        } else if (roles[0].name === "ROLE_OFFICE") {
          navigate("/office/default");
        } else if (roles[0].name === "ROLE_BUGALTER") {
          navigate("/banker/default");
        } else if (roles[0].name === "ROLE_USER") {
          navigate("/user/default");
        } else if (roles[0].name === "ROLE_DEKAN") {
          console.log(roles[0].name);
          navigate("/dekan/default");
        } else if (roles[0].name === "ROLE_SECRETARY") {
          navigate("/secretary/default");
        } else if (roles[0].name === "ROLE_REKTOR")
          navigate("/rector/rector-default");
      } else {
        toast.error("Invalid role or unauthorized access!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("Login yoki parol xato");
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/10 selection:text-primary bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-blue-900/20">
      <section className="pt-10 lg:pt-20">
        <div className="px-4 mx-auto sm:px-6 lg:px-8 xl:max-w-6xl">
          <div className="relative">
            {/* Background effects */}
            <div
              aria-hidden="true"
              className="absolute inset-0 grid grid-cols-2 -top-20 -space-x-52 opacity-40 dark:opacity-20"
            >
              <div className="from-primary h-60 bg-gradient-to-br to-purple-400 blur-[106px] dark:from-blue-700"></div>
              <div className="to-sky-500 h-40 bg-gradient-to-r from-cyan-600 blur-[106px] dark:to-indigo-600"></div>
            </div>

            {/* Login card */}
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-md p-6 border shadow-xl rounded-2xl border-gray-200/80 bg-white/80 shadow-gray-400/10 backdrop-blur-sm dark:border-gray-600/50 dark:bg-gray-800/80 dark:shadow-none sm:p-8">
                {/* Header */}
                <div className="mb-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    SMART EDU
                  </h2>
                  <p className="mt-2 text-lg font-semibold text-blue-600 dark:text-blue-400">
                    Adminlar bo'limi
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Elektron platformaga kirish
                  </p>
                </div>

                {/* Login form */}
                <form onSubmit={handleAdminSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Login <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={studentData.phone}
                      onChange={handleStudentChange}
                      placeholder="Loginingizni kiriting"
                      className="w-full px-4 py-3 text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Parol <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={studentData.password}
                      onChange={handleStudentChange}
                      placeholder="Parolingizni kiriting"
                      className="w-full px-4 py-3 text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 text-lg font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    Tizimga kirish
                  </button>
                </form>

                {/* Footer note */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Faqat ma'sul shaxslar uchun
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer />
    </div>
  );
}
