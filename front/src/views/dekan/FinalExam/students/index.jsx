import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../../config/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SuperadminFinalExamEdit() {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentName, setSelectedStudentName] = useState("");
    const [reasonText, setReasonText] = useState([]);
    const [reasonStudentName, setReasonStudentName] = useState("");
    const [reasonModal, setReasonModal] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const navigate = useNavigate();
    const goToTests = (studentId) => {
        navigate(`/test-center/final-exam/students/tests/${studentId}`);
    };

    const exportToExcel = () => {
        if (!students.length) {
            toast.error("Eksport uchun ma'lumot yo'q!");
            return;
        }

        const data = students.map((st, index) => {
            const status = getTestStatus(st).text;

            return {
                "№": index + 1,
                "F.I.Sh": st.student?.fullName,
                "Guruh": st.student?.groupName || st.student?.group?.name,
                "Fan nomi": st.finalExam?.name,
                "Urinishlar": `${st.attempt}/${st.finalExam?.attempts}`,
                "Boshlagan vaqt": st.startTime || "Boshlamagan",
                "Tugatgan vaqt": st.endTime || "-",
                "Test holati": status,
                "To'g'ri": st.correctCount ?? "-",
                "Xato": st.wrongCount ?? "-",
                "Ball": st.ball ?? "-",
                "O'tgan / O'tmagan": st.isPassed === true ? "O'tdi" : st.isPassed === false ? "O'tmadi" : "-",
                "Ruxsat sabablari": st.permissionTextList?.join("; ") || "-"
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Final Exam");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        saveAs(
            new Blob([excelBuffer], { type: "application/octet-stream" }),
            `final_exam_${new Date().toLocaleDateString()}.xlsx`
        );

        toast.success("📥 Excel muvaffaqiyatli yaratildi!");
    };
    const getTestStatus = (st) => {
        // 1) Hali boshlamagan
        if (!st.startTime) {
            return { text: "Hali boshlamagan", color: "bg-gray-200 text-gray-800" };
        }

        // 2) Test davomida
        if (st.startTime && !st.endTime) {
            return { text: "Test ishlamoqda", color: "bg-yellow-200 text-yellow-800" };
        }

        // 3) Tugagan → O'tdi / O'tmadi
        if (st.endTime) {
            if (st.isPassed === true) {
                return { text: "O'tdi", color: "bg-green-200 text-green-800" };
            }
            if (st.isPassed === false) {
                return { text: "O'tmadi", color: "bg-red-200 text-red-800" };
            }
        }

        return { text: "Noma'lum", color: "bg-gray-300 text-gray-700" };
    };




    const togglePermission = async () => {
        try {
            const res = await ApiCall(
                `/api/v1/final-exam-student/exam-status/${selectedStudentId}`,
                "PUT"
            );

            toast.success("✅ Ruxsat muvaffaqiyatli yangilandi!");

            setStudents((prev) =>
                prev.map((s) =>
                    s.id === selectedStudentId ? res.data : s
                )
            );

        } catch (err) {
            toast.error("❌ Xatolik! Holat o'zgartirilmadi.");
        } finally {
            setShowModal(false);
            setSelectedStudentId(null);
        }
    };

    useEffect(() => {
        if (!id) {
            setError("ID topilmadi! URL noto'g'ri.");
            setLoading(false);
            return;
        }
        fetchExamStudents();
    }, [id]);

    const handleDownload = async (fileId, fileName) => {
        try {
            const res = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
            const blob = await res.blob();

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName || "document.pdf";
            link.click();
            toast.success("📥 Fayl yuklab olindi!");
        } catch (err) {
            toast.error("❌ Yuklab olishda xatolik");
        }
    };

    const handleFileUpload = async (examStudentId, file, text) => {
        if (!file) return toast.error("⚠️ Fayl tanlanmadi!");
        if (file.type !== "application/pdf") {
            return toast.error("❌ Faqat PDF fayl yuklash mumkin!");
        }

        try {
            setLoading(true);

            const form = new FormData();
            form.append("photo", file);
            form.append("prefix", "/final-exam");

            const uploadRes = await fetch(`${baseUrl}/api/v1/file/upload`, {
                method: "POST",
                body: form,
            });

            const attachmentId = await uploadRes.json();

            await ApiCall(
                `/api/v1/final-exam-student/${examStudentId}/${attachmentId}/${text}`,
                "PUT"
            );

            toast.success("✅ Fayl muvaffaqiyatli yuklandi!");
            fetchExamStudents();
        } catch (err) {
            toast.error("❌ Xatolik! Fayl yuklanmadi.");
        } finally {
            setLoading(false);
        }
    };

    const fetchExamStudents = async () => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/final-exam-student/${id}`, "GET");
            console.log(res.data);


            if (!Array.isArray(res.data) || res.data.length === 0) {
                setError("Ma'lumotlar topilmadi!");
            } else {
                const sorted = [...res.data].sort((a, b) => {
                    const nameA = (a.student?.fullName || "").toLowerCase();
                    const nameB = (b.student?.fullName || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                });
                setStudents(sorted);
            }
        } catch (err) {
            setError("Ma'lumot yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    // Filter students based on search and status
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "passed" && student.examPermission) ||
            (filterStatus === "failed" && !student.examPermission);

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Xatolik</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchExamStudents}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Qayta urinish
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen  py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-blue-600">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                👨‍🎓 Yakuniy Nazorat Talabalari
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Barcha talabalar ro'yxati va ularning holatlari
                            </p>


                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToExcel}
                                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow"
                            >
                                📊 Excelga eksport qilish
                            </button>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                                {students.length} ta talaba
                            </p>
                            <p className="text-gray-500">
                                Jami ro'yxat
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Qidirish</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Talaba ismi bo'yicha qidirish..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Holat bo'yicha filtrlash</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            >
                                <option value="all">Barcha talabalar</option>
                                <option value="passed">O'tgan talabalar</option>
                                <option value="failed">O'tmagan talabalar</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="p-4 text-left text-gray-700 font-semibold">№</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Talaba</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Fan nomi</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Test holati</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Guruh</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Kirish holati</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Baholar</th>
                                    {/* <th className="p-4 text-center text-gray-700 font-semibold">Fayl</th>
                                    <th className="p-4 text-center text-gray-700 font-semibold">Imtihonga ruxsat</th> */}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStudents.map((st, i) => (
                                    <tr key={st.id} className="hover:bg-blue-50 transition-colors duration-150">
                                        <td className="p-4 text-gray-600 font-medium whitespace-nowrap">{i + 1}</td>
                                        <td className="p-4">
                                            <div
                                                className="text-blue-700 font-semibold cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                                                onClick={() => {
                                                    setReasonStudentName(st.student?.fullName || "");
                                                    setReasonText(st.permissionTextList || []);
                                                    setReasonModal(st.examPermission ? "allowed" : "denied");
                                                }}
                                            >
                                                {st.student?.fullName || "-"}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="inline-flex items-center rounded-full text-blue-800 text-sm font-semibold">
                                                {st.finalExam?.curriculumSubject?.subject?.name || "-"}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap cursor-pointer"
                                            onClick={() => {
                                                const s = getTestStatus(st).text;
                                                if (
                                                    s === "Test ishlamoqda" ||
                                                    s === "O'tdi" ||
                                                    s === "O'tmadi"
                                                ) {
                                                    navigate(`/dekan/final-exam/students/tests/${st.id}`);
                                                }
                                            }}
                                        >
                                            {(() => {
                                                const s = getTestStatus(st);
                                                return (
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${s.color}`}
                                                    >
                                                        {s.text}
                                                    </span>
                                                );
                                            })()}
                                        </td>


                                        <td className="p-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                                {st.student?.group?.name || "-"}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            {st.examPermission ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Ruxsat!
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Ruxsat berilmagan!
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                                                {st.ball || "Baholanmagan"}
                                            </span>
                                        </td>
                                        {/* <td className="p-4 whitespace-nowrap">
                                            <div className="flex justify-center gap-2">
                                                {st.examPermission ? (
                                                    <>
                                                        {st.examAttachment ? (
                                                            <button
                                                                onClick={() => handleDownload(st.examAttachment.id, st.examAttachment.name)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Yuklab olish
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-500 text-sm">Fayl yo'q</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {st.examAttachment && (
                                                            <button
                                                                onClick={() => handleDownload(st.examAttachment.id, st.examAttachment.name)}
                                                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Yuklab olish
                                                            </button>
                                                        )}
                                                        <label className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 cursor-pointer">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                            </svg>
                                                            Yuklash
                                                            <input
                                                                type="file"
                                                                accept="application/pdf"
                                                                className="hidden"
                                                                onChange={(e) => handleFileUpload(st.id, e.target.files[0], "Tekshirildi")}
                                                            />
                                                        </label>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={st.examPermission === true}
                                                        readOnly
                                                        className="sr-only"
                                                    />
                                                    <div
                                                        onClick={() => {
                                                            if (!st.examPermission) return;
                                                            setSelectedStudentId(st.id);
                                                            setSelectedStudentName(st.student?.fullName || "");
                                                            setShowModal(true);
                                                        }}
                                                        className={`w-14 h-8 rounded-full transition-colors duration-200 ${st.examPermission
                                                            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                                            : "bg-gray-300 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform duration-200 ${st.examPermission ? "left-7" : "left-1"
                                                            }`}></div>
                                                    </div>
                                                </label>
                                            </div>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4 p-4">
                        {filteredStudents.map((st, i) => (
                            <div key={st.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div
                                                className="text-blue-700 font-semibold text-lg cursor-pointer hover:underline"
                                                onClick={() => {
                                                    setReasonStudentName(st.student?.fullName || "");
                                                    setReasonText(st.permissionTextList || []);
                                                    setReasonModal(st.examPermission ? "allowed" : "denied");
                                                }}
                                            >
                                                {st.student?.fullName || "-"}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                    {st.student?.group?.name || "-"}
                                                </span>
                                                {st.examPermission ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        O'tdi
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                                                        O'tmadi
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-gray-500 font-medium">#{i + 1}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {st.examPermission ? (
                                            <>
                                                {st.examAttachment && (
                                                    <button
                                                        onClick={() => handleDownload(st.examAttachment.id, st.examAttachment.name)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        Yuklab olish
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {st.examAttachment && (
                                                    <button
                                                        onClick={() => handleDownload(st.examAttachment.id, st.examAttachment.name)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                                                    >
                                                        Yuklab olish
                                                    </button>
                                                )}
                                                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200 cursor-pointer">
                                                    Yuklash
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(st.id, e.target.files[0], "Tekshirildi")}
                                                    />
                                                </label>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-sm text-gray-600">Imtihonga ruxsat:</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={st.examPermission === true}
                                                readOnly
                                                className="sr-only"
                                            />
                                            <div
                                                onClick={() => {
                                                    if (!st.examPermission) return;
                                                    setSelectedStudentId(st.id);
                                                    setSelectedStudentName(st.student?.fullName || "");
                                                    setShowModal(true);
                                                }}
                                                className={`w-12 h-6 rounded-full transition-colors duration-200 ${st.examPermission
                                                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                                    : "bg-gray-300 cursor-not-allowed"
                                                    }`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${st.examPermission ? "left-6" : "left-1"
                                                    }`}></div>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {filteredStudents.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center mt-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Talabalar topilmadi</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterStatus !== "all"
                                ? "Qidiruv shartlariga mos talabalar topilmadi"
                                : "Hali birorta talaba ro'yxatga qo'shilmagan"}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals remain the same as your original code */}
            {reasonModal === "allowed" && (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-green-600 mx-4">
                        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
                            ✅ Talabaga ruxsat berilgan
                        </h2>
                        <p className="text-center text-lg text-green-600 font-semibold mb-4">
                            {reasonStudentName}
                        </p>
                        <p className="text-center text-green-500 font-medium text-lg">
                            Ushbu talaba imtihonga kirishga to'liq ruxsat olgan.
                        </p>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setReasonModal(null)}
                                className="px-5 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reasonModal === "denied" && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-lg w-full border-t-4 border-red-600 mx-4">
                        <h2 className="text-2xl font-bold text-center text-red-600 mb-4">
                            ❗ Ruxsat berilmagan sabablari
                        </h2>
                        <p className="text-center text-xl font-semibold mb-3">
                            {reasonStudentName}
                        </p>
                        <div className="bg-red-50 border border-red-400 rounded-lg p-4 text-red-700">
                            {reasonText.filter(t => t && t.trim() !== "").length > 0 ? (
                                reasonText.map((txt, idx) => (
                                    <p key={idx} className="mb-2">
                                        • {txt}
                                    </p>
                                ))
                            ) : (
                                <p>Sabab ko'rsatilmagan.</p>
                            )}
                        </div>
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setReasonModal(null)}
                                className="px-5 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-red-600 mx-4">
                        <h2 className="text-2xl font-bold mb-6 text-center text-red-600">
                            ⚠️ Diqqat! Imtihonga ruxsat holatini o'zgartirmoqchimisiz?
                        </h2>
                        <p className="text-center text-lg text-red-500 font-semibold mb-6">
                            "{selectedStudentName}" talabasining imtihonga ruxsat holatini o'zgartirmoqchimisiz?
                        </p>
                        <div className="flex justify-center gap-5 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-3 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400 transition"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={togglePermission}
                                className="px-5 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                Tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    );
}

export default SuperadminFinalExamEdit;