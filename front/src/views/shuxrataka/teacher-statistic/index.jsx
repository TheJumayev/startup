import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Select from "react-select";

function TeacherStatistic() {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showSelect, setShowSelect] = useState(false);

    // 🔹 Ma'lumotni olish
    const fetchStatistics = async () => {
        try {
            const response = await ApiCall("/api/v1/teacher-homework/statistic-teacher", "GET");
            setStats(response.data || []);
        } catch (err) {
            console.error("Xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, []);

    // 🔹 Unikal qiymatlar
    const teacherOptions = [
        { value: "all", label: "Barcha o'qituvchilar" },
        ...Array.from(new Set(stats.map((s) => s.teacherName))).map((name) => ({
            value: name,
            label: name,
        })),
    ];

    const subjectOptions = [
        { value: "all", label: "Barcha fanlar" },
        ...Array.from(new Set(stats.map((s) => s.subjectName))).map((subj) => ({
            value: subj,
            label: subj,
        })),
    ];

    const groupOptions = [
        { value: "all", label: "Barcha guruhlar" },
        ...Array.from(new Set(stats.map((s) => s.groupName))).map((g) => ({
            value: g,
            label: g,
        })),
    ];

    // 🔍 Filtrlash
    const filteredStats = stats.filter((s) => {
        return (
            (!selectedTeacher || selectedTeacher.value === "all" || s.teacherName === selectedTeacher.value) &&
            (!selectedSubject || selectedSubject.value === "all" || s.subjectName === selectedSubject.value) &&
            (!selectedGroup || selectedGroup.value === "all" || s.groupName === selectedGroup.value)
        );
    });

    // 📦 Excel eksport
    const handleDownloadExcel = async () => {
        if (filteredStats.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Statistika");

        worksheet.columns = [
            { header: "№", key: "index", width: 5 },
            { header: "O'qituvchi", key: "teacherName", width: 20 },
            { header: "Fan", key: "subjectName", width: 30 },
            { header: "Guruh", key: "groupName", width: 20 },
            { header: "Guruh ro'yxati", key: "totalStudents", width: 12 },
            { header: "Topshiriq bajargan talabalar", key: "submittedCount", width: 16 },
            { header: "Baholangan", key: "gradedCount", width: 12 },
            { header: "Topshiriq bajarmagan talabalar", key: "notSubmittedCount", width: 16 },
            { header: "Topshiriqlar soni", key: "totalHomework", width: 12 },
            { header: "Video", key: "videoCount", width: 10 },
            { header: "PDF", key: "pdfCount", width: 10 },
            { header: "Test", key: "testCount", width: 10 },
            { header: "Izoh", key: "commentCount", width: 10 },
        ];

        // 🔹 Sarlavhalar dizayni
        worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
        worksheet.getRow(1).alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(1).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF1E40AF" }, // ko'k sarlavha
        };

        // 🔹 Har bir qatordan ma'lumot kiritish
        filteredStats.forEach((t, i) => {
            const rowIndex = i + 2;
            const row = worksheet.addRow({
                index: i + 1,
                ...t,
            });

            // 🎨 Rangli tahlil — har bir ustun uchun shartli fon rang
            const total = Number(t.totalStudents) || 0;
            const submitted = Number(t.submittedCount) || 0;
            const graded = Number(t.gradedCount) || 0;
            const totalHomework = Number(t.totalHomework) || 0;

            // 🟢 1. "Topshiriq bajargan talabalar" ustuni (E + 2 = F)
            let submitColor = "FFFF0000"; // 🔴 qizil — 0 bo'lsa
            if (submitted > 0 && submitted < total) submitColor = "FF60A5FA"; // 🟦 ko'k — qisman
            if (submitted === total && total > 0) submitColor = "FF22C55E"; // 🟩 yashil — hammasi topshirgan

            row.getCell("submittedCount").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: submitColor },
            };

            // 🟢 2. "Baholangan" ustuni
            let gradeColor = "FFFF0000"; // 🔴 agar 0 bo‘lsa
            if (graded === 0) {
                gradeColor = "FFFF0000"; // 🔴 hech kim baholanmagan
            } else if (graded < submitted) {
                gradeColor = "FF60A5FA"; // 🟦 qisman baholangan
            } else {
                gradeColor = "FF22C55E"; // 🟩 graded ≥ submitted bo‘lsa ham yashil
            }

            row.getCell("gradedCount").fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: gradeColor },
            };


            // 🟢 3. "Topshiriqlar soni" ustuni
            if (totalHomework === 0) {
                row.getCell("totalHomework").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFFF0000" }, // 🔴 qizil
                };
            }

            // 🔹 Font va markazlashtirish
            row.alignment = { vertical: "middle", horizontal: "center" };
        });

        // 🔹 Chegaralar
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FFCCCCCC" } },
                    left: { style: "thin", color: { argb: "FFCCCCCC" } },
                    bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
                    right: { style: "thin", color: { argb: "FFCCCCCC" } },
                };
            });
        });
        // 🔹 Izoh qo'shish (oxirgi qatorda)
        const lastRowIndex = worksheet.lastRow.number + 2;
        const noteRow = worksheet.getRow(lastRowIndex);

        noteRow.getCell(1).value =
            "Qizil rang umuman topshiriq berilmagan, sariq rang topshiriq o'qituvchi tomonidan baholanmagan, havo rang topshiriq barcha talabalar tomonidan (guruhdagi talabalar soni) ya'ni guruh talabalarning barchasi yoki qisman bir qismi bajargan.";

        // 🔹 Stil berish
        noteRow.getCell(1).font = {
            bold: true,
            color: { argb: "FFFF0000" }, // qizil
        };

        noteRow.getCell(1).alignment = { wrapText: true };

        // 🔹 Bitta katakda ko'rsatish uchun ustunlarni birlashtirish (merge)
        worksheet.mergeCells(
            `A${lastRowIndex}:M${lastRowIndex}`
        );

        const richText = [
            { text: "Qizil rang ", font: { color: { argb: "FFFF0000" }, bold: true, size: 20 } },
            { text: "umuman topshiriq berilmagan, ", font: { size: 20 } },
            { text: "sariq rang ", font: { color: { argb: "FFFFCC00" }, bold: true, size: 20 } },
            { text: "topshiriq o'qituvchi tomonidan baholanmagan, ", font: { size: 20 } },
            { text: "havo rang ", font: { color: { argb: "FF38BDF8" }, bold: true, size: 20 } },
            { text: "topshiriq barcha talabalar tomonidan (guruhdagi talabalar soni) ya'ni guruh talabalarning barchasi yoki qisman bir qismi bajargan.", font: { size: 20 } },
        ];
        // Rich text qo'llash
        noteRow.getCell(1).value = { richText };
        // 🔹 Qator balandligini sozlash
        noteRow.height = 80;
        // 📥 Faylni saqlash
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], { type: "application/octet-stream" }),
            `Statistika_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
    };


    if (loading)
        return (
            <div className="flex justify-center items-center h-64 text-lg text-gray-500">
                Ma'lumot yuklanmoqda...
            </div>
        );

    return (
        <div className="p-6 min-h-screen ">
            <div className="flex flex-wrap justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">📊 O'qituvchi statistikasi</h2>
                <button
                    onClick={handleDownloadExcel}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                >
                    📥 Excelga yuklab olish
                </button>
            </div>

            {/* 🔹 Filtrlar */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                    <Select
                        options={teacherOptions}
                        value={selectedTeacher}
                        onChange={(opt) => setSelectedTeacher(opt)}
                        placeholder="O'qituvchi..."
                        isSearchable
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <Select
                        options={subjectOptions}
                        value={selectedSubject}
                        onChange={(opt) => setSelectedSubject(opt)}
                        placeholder="Fan..."
                        isSearchable
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <Select
                        options={groupOptions}
                        value={selectedGroup}
                        onChange={(opt) => setSelectedGroup(opt)}
                        placeholder="Guruh..."
                        isSearchable
                    />
                </div>
            </div>

            {/* 🔹 Jadval */}
            <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                <table className="w-full border-collapse text-sm">
                    <thead className="bg-blue-700 text-white">
                        <tr>
                            <th className="p-3 text-left">#</th>
                            <th className="p-3 text-left">O'qituvchi</th>
                            <th className="p-3 text-left">Fan</th>
                            <th className="p-3 text-left">Guruh</th>
                            <th className="p-3 text-center">Guruh ro'yxati</th>
                            <th className="p-3 text-center">Topshiriq bajargan talabalar</th>
                            <th className="p-3 text-center">Baholangan</th>
                            <th className="p-3 text-center">Topshiriq bajarmagan talabalar</th>
                            <th className="p-3 text-center">Topshiriqlar soni</th>
                            <th className="p-3 text-center">Video</th>
                            <th className="p-3 text-center">PDF</th>
                            <th className="p-3 text-center">Test</th>
                            <th className="p-3 text-center">Izoh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStats.length === 0 ? (
                            <tr>
                                <td colSpan="13" className="p-6 text-center text-gray-500 italic">
                                    Ma'lumot topilmadi
                                </td>
                            </tr>
                        ) : (
                            filteredStats.map((t, index) => (
                                <tr
                                    key={index}
                                    className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50`}
                                >
                                    <td className="p-3 text-gray-600">{index + 1}</td>
                                    <td className="p-3 font-medium text-gray-800">{t.teacherName}</td>
                                    <td className="p-3 text-gray-700">{t.subjectName}</td>
                                    <td className="p-3 text-gray-700">{t.groupName}</td>
                                    <td className="p-3 text-center">{t.totalStudents}</td>
                                    <td className="p-3 text-center text-blue-700 font-semibold">{t.submittedCount}</td>
                                    <td className="p-3 text-center text-green-700 font-semibold">{t.gradedCount}</td>
                                    <td className="p-3 text-center text-red-600 font-semibold">{t.notSubmittedCount}</td>
                                    <td className="p-3 text-center">{t.totalHomework}</td>
                                    <td className="p-3 text-center text-purple-600">{t.videoCount}</td>
                                    <td className="p-3 text-center text-green-600">{t.pdfCount}</td>
                                    <td className="p-3 text-center text-orange-500">{t.testCount}</td>
                                    <td className="p-3 text-center text-gray-700">{t.commentCount}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TeacherStatistic;
