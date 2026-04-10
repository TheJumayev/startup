import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ApiCall from "../../../../config/index";
import * as XLSX from 'xlsx-js-style';

function SuperadminHisobotExam() {
    const { state } = useLocation();
    const groupId = state?.groupId;

    const [loading, setLoading] = useState(true);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [search, setSearch] = useState("");
    const groupName = state?.groupName || "Guruh";

    const getScoreColor = (cell) => {
        if (!cell) return "red";

        const mustaqil = cell.mustaqil ?? 0;
        const oraliq = cell.oraliq ?? 0;
        const yakuniy = cell.yakuniy ?? 0;
        const jami = cell.jami ?? 0;

        if ((mustaqil + oraliq) < 30 || yakuniy < 30) {
            return "red";
        }

        if (jami >= 90) return "green";
        if (jami >= 75) return "blue";
        if (jami >= 60) return "yellow";

        return "red";
    };

    const colorClasses = {
        green: "bg-green-100 text-green-700",
        blue: "bg-blue-100 text-blue-700",
        yellow: "bg-yellow-100 text-yellow-700",
        red: "bg-red-100 text-red-700"
    };

    // 🔵 New: fan filtr
    const [subjectFilter, setSubjectFilter] = useState([]);
    const excelFillMap = {
        green: { rgb: "FF00B050" }, // 🟢 Yorqin yashil
        blue: { rgb: "FF2F75B5" }, // 🔵 Yorqin ko‘k
        yellow: { rgb: "FFFFC000" }, // 🟡 Yorqin sariq
        red: { rgb: "FFC00000" }  // 🔴 Yorqin qizil
    };



    const loadReport = async () => {
        try {
            const res = await ApiCall(
                `/api/v1/final-exam-student/hisobot/full/${groupId}`,
                "GET"
            );

            setSubjects(res.data.subjects || []);
            setStudents(res.data.students || []);

        } catch (err) {
            console.error("Hisobot yuklanmadi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (groupId) loadReport();
    }, []);

    // Student search filter
    const filteredStudents = useMemo(() => {
        if (!search.trim()) return students;

        return students.filter(student =>
            student.studentName.toLowerCase().includes(search.toLowerCase())
        );
    }, [students, search]);

    // 🎯 Fan filtrlangan ro'yxati
    const shownSubjects = useMemo(() => {
        if (subjectFilter.length === 0) return subjects;
        return subjects.filter(s => subjectFilter.includes(s.id));
    }, [subjects, subjectFilter]);

    const exportToExcel = () => {
        const worksheetData = [];


        const headers = ['№', 'Talaba', ...shownSubjects.map(s => s.name)];
        worksheetData.push(headers);

        filteredStudents.forEach((student, index) => {
            const row = [index + 1, student.studentName];

            shownSubjects.forEach(subject => {
                row.push(student.scores?.[subject.name]?.jami ?? "-");
            });

            worksheetData.push(row);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        // 🎨 RANG BERISH (TO‘G‘RI JOY)
        // 🎨 RANG BERISH
        filteredStudents.forEach((student, rIdx) => {
            shownSubjects.forEach((subject, cIdx) => {
                const cell = student.scores?.[subject.name];
                if (!cell) return;

                const color = getScoreColor(cell);

                const ref = XLSX.utils.encode_cell({
                    r: rIdx + 1,
                    c: cIdx + 2
                });

                if (!ws[ref]) return;

                ws[ref].s = {
                    fill: {
                        patternType: "solid",
                        fgColor: excelFillMap[color]
                    },
                    alignment: {
                        horizontal: "center",
                        vertical: "center"
                    },
                    font: { bold: true },
                    border: {
                        top: { style: "thin", color: { rgb: "FF000000" } },
                        bottom: { style: "thin", color: { rgb: "FF000000" } },
                        left: { style: "thin", color: { rgb: "FF000000" } },
                        right: { style: "thin", color: { rgb: "FF000000" } }
                    }

                };

            });
        });


        ws['!cols'] = [
            { wch: 5 },
            { wch: 30 },
            ...shownSubjects.map(() => ({ wch: 15 }))
        ];

        XLSX.utils.book_append_sheet(wb, ws, "Hisobot");

        XLSX.writeFile(
            wb,
            `Hisobot_${groupName}_${new Date().toLocaleDateString("uz-UZ")}.xlsx`
        );
    };




    if (loading) {
        return <div className="text-center p-10 text-xl font-bold">Yuklanmoqda…</div>;
    }

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Guruh Bo'yicha Hisobot</h1>

                    <div className="flex gap-3">
                        {/* Search */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Talaba qidirish..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                🔍
                            </div>
                        </div>

                        {/* Export Excel */}
                        <button
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                        >
                            📥 Excel
                        </button>
                    </div>
                </div>

                {/* === FAN FILTER === */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {subjects.map(s => (
                        <button
                            key={s.id}
                            onClick={() => {
                                if (subjectFilter.includes(s.id)) {
                                    setSubjectFilter(prev => prev.filter(x => x !== s.id));
                                } else {
                                    setSubjectFilter(prev => [...prev, s.id]);
                                }
                            }}
                            className={`
                                px-3 py-1 rounded-full border 
                                text-sm transition 
                                ${subjectFilter.includes(s.id)
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-blue-600 border-blue-400"}
                            `}
                        >
                            {s.name}
                        </button>
                    ))}

                    {subjectFilter.length > 0 && (
                        <button
                            onClick={() => setSubjectFilter([])}
                            className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                        >
                            🔄 Filtrni tozalash
                        </button>
                    )}
                </div>
            </div>

            {/* === TABLE === */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-left font-semibold w-12">№</th>
                            <th className="p-3 text-left font-semibold">Talaba</th>

                            {shownSubjects.map((s) => (
                                <th key={s.id} className="p-3 text-center font-semibold">
                                    {s.name}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={shownSubjects.length + 3} className="p-6 text-center text-gray-500">
                                    Hech qanday natija topilmadi
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((st, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-gray-500">{idx + 1}</td>
                                    <td className="p-3 font-medium">{st.studentName}</td>

                                    {shownSubjects.map((s) => {
                                        const cell = st.scores[s.name];
                                        const score = cell?.jami;

                                        const color = getScoreColor(cell); // ✅ SHU YERDA

                                        return (
                                            <td key={s.id} className="p-3 text-center">
                                                {score ? (
                                                    <button
                                                        onClick={() => setModalData({
                                                            student: st.studentName,
                                                            subject: s.name,
                                                            ...cell
                                                        })}
                                                        className={`px-2 py-1 rounded text-sm font-bold ${colorClasses[color]}`}
                                                    >
                                                        {score}
                                                        {cell?.attempt ? ` (${cell.attempt})` : ""}
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        );
                                    })}

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {/* === MODAL === */}
            {modalData && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-lg font-bold">{modalData.student}</h2>
                                <p className="text-gray-600">{modalData.subject}</p>
                            </div>
                            <button
                                onClick={() => setModalData(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Mustaqil ish:</span>
                                <span className="font-bold">{modalData.mustaqil}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Oraliq nazorat:</span>
                                <span className="font-bold">{modalData.oraliq}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Yakuniy nazorat:</span>
                                <span className="font-bold">{modalData.yakuniy}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Urinishlar:</span>
                                <span className="font-bold">{modalData.attempt}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between text-lg">
                                <span className="font-bold">Jami:</span>
                                <span className="font-bold text-blue-600">{modalData.jami}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setModalData(null)}
                            className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Yopish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SuperadminHisobotExam;
