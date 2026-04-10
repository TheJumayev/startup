import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function TeacherGroups() {
    const [groups, setGroups] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const navigate = useNavigate();

    // 🔹 1. Token orqali foydalanuvchini aniqlash
    const getTeacher = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET");
            setTeacher(response.data);
            // 🔹 Faqat ID bilan guruhlarni olish
            getGroups(response.data.id);
        } catch (error) {
            console.error("Foydalanuvchini olishda xatolik:", error);
            navigate("/login"); // token yo'q bo'lsa — login sahifaga yo'naltirish
        }
    };

    // 🔹 2. O'qituvchining guruhlarini olish
    const getGroups = async (teacherId) => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/amaliyot-group/${teacherId}`, "GET");
            console.log(res.data);
            const groupsData = Array.isArray(res.data) ? res.data : [];
            setGroups(groupsData);

            // Statistika hisoblash
            setStats({
                total: groupsData.length,
                active: groupsData.filter(g => g.group?.isActive).length
            });
        } catch (err) {
            console.error("❌ Guruhlarni yuklashda xatolik:", err);
            toast.error("Guruhlarni yuklab bo'lmadi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTeacher();
    }, []);

    const getGroupStatus = (group) => {
        return group.group?.isActive ?
            { label: "Faol", color: "bg-green-100 text-green-800", dot: "bg-green-500" } :
            { label: "Nofaol", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    };

    return (
        <div className="min-h-screen p-6">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center mb-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                {teacher?.name?.charAt(0) || "O"}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {teacher ? `${teacher.name}ning amaliyot guruhlari` : "Amaliyot guruhlari"}
                                </h1>
                                <p className="text-gray-600">Taqsimlangan amaliyot guruhlari ro'yxati</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                    <div className="text-xs text-blue-600 font-medium">Jami guruhlar</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                                    <div className="text-xs text-green-600 font-medium">Faol guruhlar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Guruhlar yuklanmoqda...</p>
                    </div>
                </div>
            ) : groups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Guruhlar topilmadi</h3>
                    <p className="text-gray-500 mb-6">Sizga hozircha hech qanday guruh biriktirilmagan.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-150"
                    >
                        Yangilash
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        №
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Guruh ma'lumotlari
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Holati
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        O'qituvchi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Harakatlar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {groups.map((g, i) => {
                                    const status = getGroupStatus(g);
                                    return (
                                        <tr key={g.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 text-center">
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                                                        {g?.group?.name?.charAt(0) || "G"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {g?.group?.name || "—"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {g?.group?.id || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    <span className={`w-2 h-2 ${status.dot} rounded-full mr-2`}></span>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold mr-3">
                                                        {g?.user?.name?.charAt(0) || "O"}
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {g?.user?.name || "—"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => g?.group?.id && navigate(`/teacher/amaliyots/${g.group.id}`)}
                                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-150 shadow-md flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Ko'rish
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Footer Info */}
            {groups.length > 0 && (
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Jami {groups.length} ta guruh • {stats.active} ta faol
                    </p>
                </div>
            )}
        </div>
    );
}

export default TeacherGroups;