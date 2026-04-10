import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { studentLogin, saveLoginData } from "../../../api/studentApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logo from "../../../assets/img/logo.jpg";

export default function Auth() {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();

    if (!studentData.login || !studentData.password) {
      toast.warning("Login va parolni kiriting!");
      return;
    }

    setLoading(true);

    try {
      const data = await studentLogin(studentData.login, studentData.password);

      // Token va ma'lumotlarni localStorage ga saqlash
      saveLoginData(data);

      toast.success(`Xush kelibsiz, ${data.fullName}!`);

      // Boshqa sahifaga yo'naltirish
      setTimeout(() => {
        navigate("/student");
      }, 500);
    } catch (error) {
      const errorMessage =
        error.response?.data || "Login yoki parol noto'g'ri!";
      toast.error(errorMessage);
      console.error("Login xatosi:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selection:bg-primary/10 selection:text-primary min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer />
      <section className="flex min-h-screen items-center justify-center">
        <div className="mx-auto flex max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="my-8 flex flex-col items-center justify-center md:my-12">
            <div className="relative w-full max-w-md rounded-2xl border border-gray-100/70 bg-white/80 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-800/80 dark:shadow-none">
              {/* Logo/Header section */}
              <div className="mb-8 flex flex-col items-center text-center">
                {/* Logo qismi */}
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-2 ring-blue-200">
                  <img
                    src={Logo}
                    alt="BXU Logo"
                    className="h-20 w-20 object-contain"
                  />
                </div>
                {/* Sarlavha */}
                <h2 className="max-w-2xl text-2xl font-extrabold leading-snug text-gray-800 dark:text-white">
                  Buxoro Xalqaro Universiteti <br />
                  <span className="text-blue-600 dark:text-blue-400">
                    EDU.BXU.UZ
                  </span>{" "}
                  elektron platformasi
                </h2>
              </div>

              {/* Login form */}
              <form onSubmit={handleStudentSubmit} className="space-y-5">
                <div className="mb-2 text-center">
                  <p className="rounded-lg bg-blue-50 py-2 px-4 text-sm text-gray-600 dark:bg-blue-900/20 dark:text-gray-300">
                    Tizimga kirish uchun login va parolingizni kiriting
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="login"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Login <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="login"
                      id="login"
                      autoComplete="username"
                      value={studentData.login}
                      onChange={handleStudentChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:ring-blue-500/20"
                      placeholder="Loginingizni kiriting"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Parol <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    <input
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="current-password"
                      value={studentData.password}
                      onChange={handleStudentChange}
                      className="block w-full rounded-xl border border-gray-200 bg-white/50 py-3 pl-10 pr-4 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:ring-blue-500/20"
                      placeholder="Maxfiy parol"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`flex w-full transform items-center justify-center rounded-xl py-3.5 px-6 font-semibold text-white shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                    loading
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-800"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Kirish...</span>
                    </>
                  ) : (
                    <>
                      <span>Tizimga kirish</span>
                      <svg
                        className="ml-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Additional info */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Agar login yoki parolni unutgan bo'lsangiz, registrator
                  ofisiga murojaat qiling
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}