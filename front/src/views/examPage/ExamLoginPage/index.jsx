import Footer from "components/footer/FooterAuthDefault";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import ApiCall from "../../../config/index";
import { ToastContainer, toast } from "react-toastify";
import Logo from "../../../assets/img/ebxu_images/logo.jpg";
import "react-toastify/dist/ReactToastify.css";

export default function Auth() {
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState({ login: "", password: "" });

    const handleStudentChange = (e) => {
        const { name, value } = e.target;
        setStudentData({ ...studentData, [name]: value });
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        localStorage.clear();

        try {
            const response = await toast.promise(
                ApiCall("/api/v1/student/login/exam", "POST", {
                    login: studentData.login,
                    password: studentData.password,
                }),
                {
                    pending: "Tekshirilmoqda...",
                    success: "Kirish muvaffaqiyatli!",
                    error: "Login yoki kod xato!",
                }
            );

            const data = response.data;

            // ===============================
            // 2) TALABA KIRITILGAN
            // ===============================
            if (data?.id) {
                localStorage.setItem("student", JSON.stringify(data));
                navigate(`/exam/subject/${data.id}`);
                return;
            }

            toast.error("Nomaʼlum maʼlumot qaytdi!");
        } catch (error) {
            toast.error("Login yoki kod xato!");
        }
    };

    return (
        <div className="selection:bg-primary/10 selection:text-primary min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <ToastContainer />

            <section className="flex min-h-screen items-center justify-center">
                <div className="mx-auto flex max-w-5xl items-center justify-center px-4 sm:px-6 lg:px-8">

                    <div className="my-8 flex flex-col items-center justify-center md:my-12 w-full">
                        <div className="relative w-full max-w-md rounded-2xl border border-gray-100/70 bg-white/80 p-6 shadow-2xl backdrop-blur-lg">

                            {/* Logo Section */}
                            <div className="mb-8 flex flex-col items-center text-center">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-lg ring-2 ring-blue-200">
                                    <img src={Logo} alt="BXU Logo" className="h-20 w-20 object-contain" />
                                </div>

                                <h2 className="text-2xl font-extrabold leading-snug text-gray-800 text-center">
                                    Buxoro Xalqaro Universiteti <br />
                                    <span className="text-blue-600">EDU.BXU.UZ</span> elektron platformasi
                                </h2>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleStudentSubmit} className="space-y-5">

                                <div className="mb-2 text-center">
                                    <p className="rounded-lg bg-blue-50 py-2 px-4 text-sm text-gray-600">
                                        Talaba ID va Test Center kodini kiriting
                                    </p>
                                </div>

                                {/* LOGIN */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Login (Talaba ID) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="login"
                                        value={studentData.login}
                                        onChange={handleStudentChange}
                                        className="w-full rounded-xl border border-gray-300 py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Talaba ID va bo'sh qoldiring (faqat test markaz kodi bo'lsa)"
                                    />
                                </div>

                                {/* PASSWORD */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Parol / Test markaz kodi <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={studentData.password}
                                        onChange={handleStudentChange}
                                        className="w-full rounded-xl border border-gray-300 py-3 px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                        placeholder="Parol yoki Test markaz kodi"
                                    />
                                </div>

                                {/* SUBMIT BUTTON */}
                                <button
                                    type="submit"
                                    className="w-full rounded-xl bg-blue-600 py-3.5 px-6 font-semibold text-white transition-all hover:bg-blue-700"
                                >
                                    Kirish
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
