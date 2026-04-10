import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";

function EditFinalExam() {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navigateLoading, setNavigateLoading] = useState(false);
    const [filterName, setFilterName] = useState("");
    const [filterGroup, setFilterGroup] = useState("");
    const [filterDate, setFilterDate] = useState("");

    const canEnterExam = (startTime) => {
        if (!startTime) return false;
        const now = new Date();
        const start = new Date(startTime);
        const fiveMinBefore = new Date(start.getTime() - 5 * 60 * 1000);
        return now >= fiveMinBefore;
    };

    const fetchFinalExams = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/final-exam", "GET");
            console.log(res.data);

            setExams(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Xatolik:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinalExams();
    }, []);



    // Format date for better display
    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return "—";
        const date = new Date(dateTimeString);
        return date.toLocaleString('uz-UZ', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const filteredExams = exams.filter(exam => {
        const byName = exam.name?.toLowerCase().includes(filterName.toLowerCase());
        const byGroup = exam.group?.name?.toLowerCase().includes(filterGroup.toLowerCase());
        const byDate = filterDate ? exam.startTime?.slice(0, 10) === filterDate : true;

        return byName && byGroup && byDate;
    });


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {navigateLoading && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] backdrop-blur-sm">
                    <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-semibold text-gray-700">Yuklanmoqda...</span>
                    </div>
                </div>
            )}

            <div className="min-h-screen p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-blue-600">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                                    Yakuniy imtihonlar ro'yxati
                                </h1>
                                <p className="text-gray-600">
                                    Barcha yakuniy imtihonlarni ko'rish
                                </p>
                            </div>
                        </div>
                        {/* FILTERS */}
                        <div className="bg-white rounded-2xl shadow p-4 mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <input
                                type="text"
                                placeholder="Fan nomi..."
                                value={filterName}
                                onChange={(e) => setFilterName(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2"
                            />

                            <input
                                type="text"
                                placeholder="Guruh..."
                                value={filterGroup}
                                onChange={(e) => setFilterGroup(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2"
                            />

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2"
                            />
                            <button
                                onClick={() => {
                                    setFilterName("");
                                    setFilterGroup("");
                                    setFilterDate("");
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                            >
                                Tozalash
                            </button>
                        </div>

                    </div>

                    {/* Empty State */}
                    {exams.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-yellow-200">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Hali birorta final imtihon yaratilmagan
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Yangi imtihon yaratish uchun yuqoridagi tugmani bosing
                            </p>
                        </div>
                    )}

                    {/* Exams Table */}
                    {exams.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <th className="p-4 text-left text-gray-700 font-semibold">№</th>
                                            <th className="p-4 text-left text-gray-700 font-semibold">Imtihon nomi</th>
                                            <th className="p-4 text-left text-gray-700 font-semibold">Guruh</th>
                                            <th className="p-4 text-left text-gray-700 font-semibold">Boshlanish</th>
                                            <th className="p-4 text-left text-gray-700 font-semibold">Tugash</th>
                                            <th className="p-4 text-center text-gray-700 font-semibold">Amal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredExams.map((exam, index) => (
                                            <tr key={exam.id} className="hover:bg-blue-50 transition-colors duration-150">
                                                <td className="p-4 text-gray-600 font-medium">{index + 1}</td>
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-800">{exam.name}</div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    <span
                                                        onClick={() =>
                                                            navigate(`/dekan/final-exam/hisobot/${exam.id}`, {
                                                                state: {
                                                                    groupId: exam.group?.id,
                                                                    groupName: exam.group?.name,
                                                                    subjects: [
                                                                        {
                                                                            id: exam.curriculumSubject?.id,
                                                                            name: exam.curriculumSubject?.subject?.name
                                                                        }
                                                                    ]
                                                                }
                                                            })
                                                        }
                                                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium cursor-pointer hover:bg-blue-200 transition"
                                                    >
                                                        {exam.group?.name || "—"}
                                                    </span>
                                                </td>

                                                <td className="p-4 text-gray-700">
                                                    {formatDateTime(exam.startTime)}
                                                </td>
                                                <td className="p-4 text-gray-700">
                                                    {formatDateTime(exam.endTime)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2 justify-center items-center">
                                                        {/* Students Button */}
                                                        <button
                                                            disabled={!canEnterExam(exam.startTime)}
                                                            onClick={async () => {
                                                                if (!canEnterExam(exam.startTime)) return;
                                                                setNavigateLoading(true);
                                                                navigate(`/dekan/final-exam/students/${exam.id}`);
                                                            }}
                                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md ${canEnterExam(exam.startTime)
                                                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                            </svg>
                                                            Talabalar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-4 p-4">
                                {filteredExams.map((exam, index) => (
                                    <div key={exam.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm flex items-center justify-center font-medium">
                                                        {index + 1}
                                                    </span>
                                                    <h3 className="font-semibold text-gray-800 text-lg">{exam.name}</h3>
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {exam.group?.name || "—"}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Boshlanish: {formatDateTime(exam.startTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Tugash: {formatDateTime(exam.endTime)}</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!canEnterExam(exam.startTime)) return;
                                                        setNavigateLoading(true);
                                                        navigate(`/dekan/final-exam/students/${exam.id}`);
                                                    }}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${canEnterExam(exam.startTime)
                                                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                    </svg>
                                                    Talabalar ruxsat
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default EditFinalExam;