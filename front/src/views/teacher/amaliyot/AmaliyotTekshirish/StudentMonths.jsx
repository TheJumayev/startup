import React, { useEffect, useState } from "react";
import ApiCall from "../../../../config";
import { useParams } from "react-router-dom";

function TeacherGroups() {
    const { id } = useParams();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [monthDetails, setMonthDetails] = useState(null);

    // 12 ta amaliyot
    const tasks = [
        { key: "kundalik", title: "Kundalik 1-haftalik", status: "kundalikStatus", end: "kundalikEndTime", icon: "📅" },
        { key: "kundalik1", title: "Kundalik 2-haftalik", status: "kundalik1Status", end: "kundalikEndTime1", icon: "📅" },
        { key: "kundalik2", title: "Kundalik 3-haftalik", status: "kundalik2Status", end: "kundalikEndTime2", icon: "📅" },
        { key: "kundalik3", title: "Kundalik 4-haftalik", status: "kundalik3Status", end: "kundalikEndTime3", icon: "📅" },
        { key: "darsTahlili", title: "Dars Tahlili", status: "darsTahliliStatus", end: "darsTahliliEnd", icon: "📊" },
        { key: "darsIshlanmasi", title: "Dars Ishlanmasi", status: "darsIshlanmasiStatus", end: "darsIshlanmasiEnd", icon: "📝" },
        { key: "tarbiyaviy", title: "Tarbiyaviy", status: "tarbiyaviyStatus", end: "tarbiyaviyEnd", icon: "👨‍🏫" },
        { key: "sinfRahbar", title: "Sinf Rahbar", status: "sinfRahbarStatus", end: "sinfRahbarEnd", icon: "👩‍🏫" },
        { key: "pedagogik", title: "Pedagogik", status: "pedagogikStatus", end: "pedagogikEnd", icon: "🎓" },
        { key: "tadbir", title: "Tadbir", status: "tadbirStatus", end: "tadbirEnd", icon: "🎯" },
        { key: "photo", title: "Foto", status: "photoStatus", end: "photoEnd", icon: "📷" },
        { key: "hisobot", title: "Hisobot", status: "hisobotStatus", end: "hisobotEnd", icon: "📋" }
    ];

    const getStatusInfo = (status) => {
        switch (status) {
            case 3:
                return {
                    color: "bg-green-100 text-green-800 border-green-200",
                    label: "Qabul qilingan",
                    badgeColor: "bg-green-500"
                };
            case 2:
                return {
                    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
                    label: "Ko'rib chiqilmoqda",
                    badgeColor: "bg-yellow-500"
                };
            case 1:
                return {
                    color: "bg-blue-100 text-blue-800 border-blue-200",
                    label: "Yangi",
                    badgeColor: "bg-blue-500"
                };
            case 4:
                return {
                    color: "bg-red-100 text-red-800 border-red-200",
                    label: "Rad etilgan",
                    badgeColor: "bg-red-500"
                };
            default:
                return {
                    color: "bg-gray-100 text-gray-500 border-gray-200",
                    label: "Yuklanmagan",
                    badgeColor: "bg-gray-400"
                };
        }
    };

    const getMonthStats = (monthData) => {
        const stats = {
            total: tasks.length,
            accepted: 0,
            pending: 0,
            rejected: 0,
            notUploaded: 0
        };

        tasks.forEach(task => {
            const status = monthData[task.status];
            if (status === 3) stats.accepted++;
            else if (status === 2 || status === 1) stats.pending++;
            else if (status === 4) stats.rejected++;
            else stats.notUploaded++;
        });

        return stats;
    };

    const getData = async () => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/amaliyot-yuklama/student/${id}`, "GET");

            if (Array.isArray(res.data)) {
                setRows(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMonthClick = (monthData) => {
        setSelectedMonth(monthData);
        setMonthDetails(getMonthStats(monthData));
    };

    useEffect(() => {
        getData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Ma'lumot topilmadi</h3>
                    <p className="text-gray-500">Talaba uchun amaliyot ma'lumotlari mavjud emas</p>
                </div>
            </div>
        );
    }

    const studentName = rows[0]?.student?.fullName;

    return (
        <div className="min-h-screen pt-4">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                        <div className="flex items-center mb-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                {studentName?.charAt(0) || "T"}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {studentName}
                                </h1>
                                <p className="text-gray-600">Yillik amaliyot jadvali</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <div className="text-2xl font-bold text-blue-600">{rows.length}</div>
                            <div className="text-xs text-blue-600 font-medium">Jami oylar</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <div className="text-2xl font-bold text-green-600">
                                {rows.reduce((acc, row) => acc + tasks.filter(t => row[t.status] === 3).length, 0)}
                            </div>
                            <div className="text-xs text-green-600 font-medium">Qabul qilingan</div>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                            <div className="text-2xl font-bold text-yellow-600">
                                {rows.reduce((acc, row) => acc + tasks.filter(t => row[t.status] === 2 || row[t.status] === 1).length, 0)}
                            </div>
                            <div className="text-xs text-yellow-600 font-medium">Kutilayotgan</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                            <div className="text-2xl font-bold text-gray-600">
                                {rows.reduce((acc, row) => acc + tasks.filter(t => !row[t.status]).length, 0)}
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Yuklanmagan</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Table */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                            Oy
                                        </th>
                                        {tasks.map((t, i) => (
                                            <th key={i} className="px-3 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg mb-1">{t.icon}</span>
                                                    <span className="text-xs">{t.title}</span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {rows.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className={`hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${selectedMonth?.id === row.id ? 'bg-blue-50' : ''
                                                }`}
                                            onClick={() => handleMonthClick(row)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-3 w-3 rounded-full mr-3 ${getMonthStats(row).accepted === tasks.length ? 'bg-green-500' :
                                                        getMonthStats(row).accepted > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                                        }`}></div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {row.month?.months}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {getMonthStats(row).accepted}/{tasks.length} bajarildi
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {tasks.map((t, i) => {
                                                const status = row[t.status];
                                                const endTime = row[t.end]?.split("T")[0] || "-";
                                                const statusInfo = getStatusInfo(status);

                                                return (
                                                    <td key={i} className="px-3 py-4 whitespace-nowrap text-center">
                                                        <div className="flex flex-col items-center space-y-1">
                                                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                                                <span className={`w-2 h-2 ${statusInfo.badgeColor} rounded-full mr-1.5`}></span>
                                                                {status || 0}
                                                            </div>
                                                            {endTime !== "-" && (
                                                                <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                                    {endTime}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Month Details */}
                <div className="lg:col-span-1">
                    {selectedMonth ? (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {selectedMonth.month?.months} oyi
                                </h3>
                                <div className={`h-3 w-3 rounded-full ${monthDetails?.accepted === tasks.length ? 'bg-green-500' :
                                    monthDetails?.accepted > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                                    }`}></div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Umumiy topshiriqlar:</span>
                                    <span className="font-semibold">{monthDetails?.total}</span>
                                </div>
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="text-sm">Qabul qilingan:</span>
                                    <span className="font-semibold">{monthDetails?.accepted}</span>
                                </div>
                                <div className="flex justify-between items-center text-yellow-600">
                                    <span className="text-sm">Kutilayotgan:</span>
                                    <span className="font-semibold">{monthDetails?.pending}</span>
                                </div>
                                <div className="flex justify-between items-center text-red-600">
                                    <span className="text-sm">Rad etilgan:</span>
                                    <span className="font-semibold">{monthDetails?.rejected}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span className="text-sm">Yuklanmagan:</span>
                                    <span className="font-semibold">{monthDetails?.notUploaded}</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="font-semibold text-blue-800 mb-2">Statistika</h4>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(monthDetails?.accepted / monthDetails?.total) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-blue-600 mt-2 text-center">
                                    {Math.round((monthDetails?.accepted / monthDetails?.total) * 100)}% bajarildi
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 text-center">
                            <div className="text-gray-400 text-4xl mb-3">📅</div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Oy tanlang</h3>
                            <p className="text-gray-500 text-sm">
                                Batafsil ma'lumot ko'rish uchun jadvaldan oyni tanlang
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-800 mb-3">Holatlar bo'yicha izoh:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-sm text-gray-600">Qabul qilingan (3)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                        <span className="text-sm text-gray-600">Ko'rib chiqilmoqda (2)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-sm text-gray-600">Yangi (1)</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        <span className="text-sm text-gray-600">Rad etilgan (4)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherGroups;