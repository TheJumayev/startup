import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Index() {
    const [student, setStudent] = useState(null);
    const [months, setMonths] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    // 🔹 Talaba maʼlumotlarini olish
    const fetchStudentData = async (token) => {
        try {
            setLoading(true);
            const response = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");
            console.log("🔍 Student data response:", response);
            if (
                response?.error === "INVALID_TOKEN" ||
                response?.error === true ||
                response?.status === 401 ||
                response?.status === 403
            ) {
                localStorage.clear();
                navigate("/student/login");
                return;
            }
            const studentData = response.data;
            setStudent(studentData);
            // 🔹 Agar guruh mavjud bo‘lsa, oylar ro‘yxatini olish
            if (studentData?.group?.id) {
                await fetchMonthsByGroup(studentData.group.id);
            } else {
                console.warn("⚠️ Student group ID topilmadi:", studentData);
            }
        } catch (error) {
            console.error("❌ Error fetching student data:", error);
            localStorage.removeItem("authToken");
            navigate("/student/login");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Guruh bo‘yicha oylarni olish
    const fetchMonthsByGroup = async (groupId) => {
        try {
            console.log(`📤 Oylar so‘rovi yuborilmoqda: /api/v1/months/${groupId}`);
            const res = await ApiCall(`/api/v1/months/${groupId}`, "GET");
            console.log("📥 Oylar javobi:", res);

            if (res?.data && Array.isArray(res.data)) {
                setMonths(res.data);
            } else {
                toast.warning("Ushbu guruh uchun oylar topilmadi!");
            }
        } catch (error) {
            console.error("❌ Oylarni olishda xato:", error);
        }
    };

    useEffect(() => {
        if (token) fetchStudentData(token);
    }, []);

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <ToastContainer />
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center text-gray-800">
                📅 Guruh oylar ro'yxati
            </h2>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Ma'lumot yuklanmoqda...</span>
                </div>
            ) : months.length > 0 ? (
                <div className="overflow-hidden rounded-lg shadow-md">
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-blue-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">№</th>
                                    <th className="px-4 py-3 text-left font-semibold">Oy nomi</th>
                                    <th className="px-4 py-3 text-left font-semibold">Izoh</th>
                                    <th className="px-4 py-3 text-left font-semibold">Tugash sanasi</th>
                                    <th className="px-4 py-3 text-left font-semibold">Yaratilgan sana</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {months.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() =>
                                                    navigate(`/student/amaliyot/${item.id}`, {
                                                        state: {
                                                            studentId: student?.id,
                                                            monthName: item?.months, // 🔹 qo‘shing shu qatordan
                                                            deadline: item?.deadline,
                                                        },
                                                    })
                                                }
                                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                            >
                                                {item.months}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{item.description}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                {new Date(item.deadline).toLocaleDateString('uz-UZ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">
                                            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-4">
                        {months.map((item, index) => (
                            <div key={item.id} className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg text-gray-800">{item.months}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                        #{index + 1}
                                    </span>
                                </div>

                                <p className="text-gray-600 mb-3">{item.description}</p>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Tugash sanasi:</span>
                                        <div className="mt-1">
                                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                                                {new Date(item.deadline).toLocaleDateString('uz-UZ')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Yaratilgan:</span>
                                        <p className="text-gray-500 mt-1">
                                            {new Date(item.createdAt).toLocaleDateString('uz-UZ')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() =>
                                        navigate(`/student/amaliyot/${item.id}`, {
                                            state: {
                                                studentId: student?.id,
                                                monthName: item?.months, // 🔹 qo‘shildi
                                            },
                                        })
                                    }
                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
                                    Ko'rish
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Oylar topilmadi</h3>
                    <p className="text-gray-500">Ushbu guruh uchun oylar mavjud emas.</p>
                </div>
            )}
        </div>
    );
}

export default Index;