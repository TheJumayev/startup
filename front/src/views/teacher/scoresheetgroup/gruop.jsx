import React, { useEffect, useMemo, useState } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function GroupPage() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupSearch, setGroupSearch] = useState("");
    const [subjectSearch, setSubjectSearch] = useState("");
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const groupName =
                g.group?.name?.toLowerCase() || "";
            const subjectName =
                g.curriculumSubject?.subject?.name?.toLowerCase() || "";

            return (
                groupName.includes(groupSearch.toLowerCase()) &&
                subjectName.includes(subjectSearch.toLowerCase())
            );
        });
    }, [groups, groupSearch, subjectSearch]);

    const getTeacherGroups = async (teacherId) => {
        try {
            const response = await ApiCall(
                `/api/v1/score-sheet-group/teacher/${teacherId}`,
                "GET"
            );
            console.log(response.data);

            const filtered = response.data.filter(g => g.status === true);
            setGroups(filtered);
        } catch (error) {
            console.error("Guruhlarni olishda xatolik:", error);
            toast.error("Guruhlarni yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    const getAdmin = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET");
            setAdmin(response.data);
            getTeacherGroups(response.data.id);
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        getAdmin();
    }, []);

    // Vaqtni formatlash funksiyasi
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";

        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('uz-UZ', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTimeString.replace("T", " ") || "—";
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Sarlavha qismi */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mening guruhlarim</h1>
                        <p className="text-gray-600">Barcha o'qitayotgan guruhlaringiz ro'yxati</p>
                    </div>
                    {/* 🔍 FILTERS */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Guruh filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Guruh nomi bo‘yicha qidirish
                                </label>
                                <input
                                    type="text"
                                    value={groupSearch}
                                    onChange={(e) => setGroupSearch(e.target.value)}
                                    placeholder="Masalan: 23-ATT"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Fan filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Fan nomi bo‘yicha qidirish
                                </label>
                                <input
                                    type="text"
                                    value={subjectSearch}
                                    onChange={(e) => setSubjectSearch(e.target.value)}
                                    placeholder="Masalan: Matematika"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Statistik ma'lumotlar */}
                    {groups.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
                            <div className="flex items-center">
                                <div className="rounded-full bg-blue-100 p-3 mr-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Jami guruhlar</p>
                                    <p className="text-2xl font-bold text-gray-800">{groups.length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Jadval qismi */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">№</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Guruh</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Fan</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Semestr</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Boshlanish vaqti</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Tugash vaqti</th>
                                        <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Izoh</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {groups.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-12 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-lg font-medium">Ma'lumot topilmadi</p>
                                                    <p className="text-sm mt-1">Hozircha sizga biriktirilgan guruhlar mavjud emas</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredGroups.map((g, index) => (
                                            <tr
                                                key={g.id}
                                                className="hover:bg-blue-50 transition-all duration-200 group"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {index + 1}
                                                </td>

                                                {/* Guruh */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/teacher/score-schedule/${g.id}`, {
                                                                state: {
                                                                    teacherId: admin?.id,
                                                                    subject: g.curriculumSubject?.subject?.name,
                                                                    kursIshi: g.isKursIshi,
                                                                }
                                                            })
                                                        }
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 hover:text-blue-800 transition-colors duration-200 group-hover:bg-blue-200"
                                                    >
                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        {g.group?.name || "—"}
                                                    </button>
                                                </td>

                                                {/* Fan nomi */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                                                    {g.curriculumSubject?.subject?.name || "—"}
                                                </td>

                                                {/* Semestr */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {g.curriculumSubject?.semesterName || "—"}
                                                    </span>
                                                </td>

                                                {/* Start time */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDateTime(g.startTime)}
                                                </td>

                                                {/* End time */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {formatDateTime(g.endTime)}
                                                </td>

                                                {/* Izoh */}
                                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                    {g.description || (
                                                        <span className="text-gray-400 italic">Izoh yo'q</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}

export default GroupPage;