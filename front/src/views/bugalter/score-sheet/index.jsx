import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// MODAL WRAPPER
const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fadeIn">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ScoreSheet = () => {
    const [groups, setGroups] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [sheets, setSheets] = useState([]);
    const [selectedQaydnoma, setSelectedQaydnoma] = useState(null);
    const [pendingStatusId, setPendingStatusId] = useState(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const navigate = useNavigate();
    // Temporary filter state (select qilinadi)
    const [tempGroup, setTempGroup] = useState(null);
    const [tempTeacher, setTempTeacher] = useState("");
    const [tempSubject, setTempSubject] = useState("");
    const [tempQaytnoma, setTempQaytnoma] = useState(null);
    const [selectedTeacher2, setSelectedTeacher2] = useState(null);


    // Real filter state (tugma bosilganda ishlaydi)
    const [filterGroup, setFilterGroup] = useState(null);
    const [filterTeacher, setFilterTeacher] = useState("");
    const [filterSubject, setFilterSubject] = useState("");
    const [filterQaytnoma, setFilterQaytnoma] = useState(null);
    const applyFilters = () => {
        setFilterGroup(tempGroup);
        setFilterTeacher(tempTeacher);
        setFilterSubject(tempSubject);
        setFilterQaytnoma(tempQaytnoma);
    };
    const filteredSheets = sheets.filter((item) => {
        const matchGroup = filterGroup ? item.group?.id === filterGroup.value : true;
        const matchTeacher = filterTeacher
            ? item.teacher?.name.toLowerCase().includes(filterTeacher.toLowerCase())
            : true;
        const matchSubject = filterSubject
            ? item.curriculumSubject?.subject?.name.toLowerCase().includes(filterSubject.toLowerCase())
            : true;
        const matchQaytnoma = filterQaytnoma
            ? item.qaytnoma === filterQaytnoma.value
            : true;

        return matchGroup && matchTeacher && matchSubject && matchQaytnoma;
    });


    const now = new Date().toISOString().slice(0, 16);

    const handleStatusClick = (id) => {
        setPendingStatusId(id);
        setStatusModalOpen(true);
    };
    const confirmStatusChange = async () => {
        try {
            await ApiCall(`/api/v1/score-sheet-group/change-status/${pendingStatusId}`, "PUT");
            toast.success("Status yangilandi!");
            fetchSheets();
        } catch {
            toast.error("Statusni o'zgartirishda xatolik!");
        } finally {
            setStatusModalOpen(false);
            setPendingStatusId(null);
        }
    };

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // MODAL STATES
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const [editItem, setEditItem] = useState(null);
    const [deleteItemId, setDeleteItemId] = useState(null);
    const qaydnomaOptions = [
        { value: 1, label: "1-qaydnoma" },
        { value: 2, label: "2-qaydnoma" },
        { value: 3, label: "3-qaydnoma" },
    ];

    // =============================
    // 🔹 1) GROUPS GET
    // =============================
    const fetchGroups = async () => {
        try {
            const res = await ApiCall("/api/v1/groups", "GET");
            const mapped = res.data.map((g) => ({
                value: g.id,
                label: g.name,
                curriculumId: g.curriculum ?? null,
            }));
            setGroups(mapped);
        } catch {
            toast.error("Guruhlarni olib bo'lmadi");
        }
    };


    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName || "document.pdf";
            link.click();
            toast.success("📥 Fayl yuklab olindi");
        } catch (error) {
            toast.error("❌ Yuklab olishda xatolik");
        }
    };

    const handleUpload = async (scoreSheetGroupId, file) => {
        if (!file) return toast.warning("⚠️ Avval fayl tanlang!");

        try {
            setLoading(true);

            // 1️⃣ Faylni backendga yuklaymiz
            const form = new FormData();
            form.append("photo", file);
            form.append("prefix", "/score-sheet");

            const uploadRes = await fetch(`${baseUrl}/api/v1/file/upload`, {
                method: "POST",
                body: form,
            });

            if (!uploadRes.ok) throw new Error("Upload error");
            const attachmentId = await uploadRes.json(); // backend attachment UUID qaytaradi

            // 2️⃣ SCORE SHEET GROUPga biriktiramiz
            await ApiCall(
                `/api/v1/score-sheet-group/file-upload/${scoreSheetGroupId}/${attachmentId}`,
                "PUT"
            );

            toast.success("📎 Fayl muvaffaqiyatli yuklandi!");
            fetchSheets(); // jadvalni yangilab qo‘yadi
        } catch (err) {
            console.error(err);
            toast.error("❌ Fayl yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    };




    const handleStatusToggle = async (id) => {
        try {
            await ApiCall(`/api/v1/score-sheet-group/change-status/${id}`, "PUT");
            toast.success("Status yangilandi!");
            fetchSheets();
        } catch {
            toast.error("Statusni o'zgartirishda xatolik!");
        }
    };

    const clearFilters = () => {
        setTempGroup(null);
        setTempTeacher("");
        setTempSubject("");
        setTempQaytnoma(null);

        setFilterGroup(null);
        setFilterTeacher("");
        setFilterSubject("");
        setFilterQaytnoma(null);
    };


    // =============================
    // 🔹 2) SUBJECTS GET (BY CURRICULUM)
    // =============================
    const fetchSubjects = async (curriculumId) => {
        if (!curriculumId) {
            setSubjects([]);
            return;
        }

        try {
            const res = await ApiCall(
                `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}`,
                "GET"
            );
            const content = res?.data?.content ?? [];
            const extractSemester = (v) => {
                if (!v) return 0;
                return parseInt(v.toString().replace(/\D/g, "")); // faqat raqamni oladi
            };

            const mapped = content
                .slice()
                .sort((a, b) => {
                    const semA = extractSemester(a.subject?.semesterName);
                    const semB = extractSemester(b.subject?.semesterName);
                    return semA - semB;
                })
                .map((item) => ({
                    value: item.subject?.id,
                    label: ` ${item.subject?.semesterName || "-"
                        } - ${item.subject?.subject?.name || "Noma'lum fan"} `,
                }));

            setSubjects(mapped);
        } catch {
            toast.error("Fanlarni yuklashda xatolik!");
        }
    };

    // =============================
    // 🔹 3) TEACHERS GET
    // =============================
    const fetchTeachers = async () => {
        try {
            const res = await ApiCall("/api/v1/teacher", "GET");
            setTeachers(
                res.data.map((t) => ({
                    value: t.id,
                    label: t.name,
                }))
            );
        } catch {
            toast.error("O'qituvchilarni yuklab bo'lmadi");
        }
    };
    const fetchUpdateStudents = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/score-sheet-group/add/update/score-sheet", "GET");

        } catch {
            toast.error("O'qituvchilarni yuklab bo'lmadi");
        } finally {
            setLoading(false);
        }
    };

    const fetchScoreStatistik = async () => {
        try {
            setLoading(true);

            const res = await ApiCall("/api/v1/score-sheet/get-all", "GET");
            const data = res.data;

            // =======================
            // GROUPING
            // =======================
            const grouped = {};

            data.forEach((item) => {
                const groupId = item.scoreSheetGroup?.id;
                const subjectId = item.scoreSheetGroup?.curriculumSubject?.subject?.id;
                const uniqueKey = `${groupId}_${subjectId}`;

                if (!grouped[uniqueKey]) {
                    grouped[uniqueKey] = {
                        groupName: item.scoreSheetGroup?.group?.name,
                        subjectName: item.scoreSheetGroup?.curriculumSubject?.subject?.name,
                        teacher: item.scoreSheetGroup?.teacher?.name,
                        lecturer: item.scoreSheetGroup?.lecturer?.name,
                        endTime: item.scoreSheetGroup?.endTime,
                        totalStudents: 0,
                        passed: 0,
                        failed: 0,
                        none: 0,
                        mustaqilCount: 0,
                        oraliqCount: 0,
                        acceptedCount: 0,
                    };
                }

                const obj = grouped[uniqueKey];
                obj.totalStudents++;

                if (item.isPassed === true) obj.passed++;
                else if (item.isPassed === false) obj.failed++;
                else obj.none++;

                if (item.mustaqil) obj.mustaqilCount++;
                if (item.oraliq) obj.oraliqCount++;
                if (item.isAccepted) obj.acceptedCount++;
            });

            // =======================
            // CELL COLOR RULES
            // =======================
            const getCellColors = (g) => {
                const total = g.totalStudents;
                const passedFailed = g.passed + g.failed;

                const colors = {
                    passedFailed: "yellow",
                    none: "yellow",
                    must: "yellow",
                    ora: "yellow",
                    acc: "yellow",
                };

                // 1. O‘tdi + O‘tmadi
                if (passedFailed === total) colors.passedFailed = "green";
                else if (passedFailed === 0) colors.passedFailed = "red";

                // 2. Belgilanmadi
                if (g.none === 0) colors.none = "green";
                else if (g.none === total) colors.none = "red";

                // 3. Mustaqil
                if (g.mustaqilCount === total - g.failed) colors.must = "green";
                else if (g.mustaqilCount === 0) colors.must = "red";

                // 4. Oraliq
                if (g.oraliqCount === total - g.failed) colors.ora = "green";
                else if (g.oraliqCount === 0) colors.ora = "red";

                // 5. Tanishgan
                if (g.acceptedCount === total - g.failed) colors.acc = "green";
                else if (g.acceptedCount === 0) colors.acc = "red";

                return colors;
            };

            // =======================
            // ROW MAIN COLOR
            // =======================
            const getMainRowColor = (colors) => {
                if (Object.values(colors).includes("red")) return "FFFF3300";
                if (Object.values(colors).every((c) => c === "green")) return "FF00FF00";
                return "FFFFFF00";
            };

            // =======================
            // EXCEL
            // =======================
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet("Statistika");
            // =======================
            // TOP INFO (date + responsible)
            // =======================

            // Excel fayl yaratilgan vaqt
            const now = new Date();
            const dateStr =
                `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // 1-qator: Vaqt
            sheet.addRow([
                `Yuklab olingan vaqt: ${dateStr}`
            ]);

            // 2-qator: Mas’ul xodim
            sheet.addRow([
                `Mas'ul xodim: Jumayev Diyorbek  (+998 91 418 44 15)`
            ]);

            // 3-qator: Bo‘sh qator
            sheet.addRow([""]);

            // Qatorlarni formatlash
            sheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true, size: 14 };
            });

            sheet.getRow(2).eachCell((cell) => {
                cell.font = { bold: true, size: 13 };
            });

            // HEADER
            sheet.addRow([
                "№",
                "Guruh",
                "Fan nomi",
                "Seminarchi",
                "Ma'ruzachi",
                "Jami talabalar",
                "O'tdi",
                "O'tmadi",
                "Belgilanmadi",
                "Mustaqil olganlar soni",
                "Oraliq olganlar soni",
                "Tanishgan talabalar soni",
                "Tugash vaqti",
            ]);

            sheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });

            // FIX HEADER
            sheet.views = [{ state: "frozen", ySplit: 4 }];

            // =======================
            // ROWS
            // =======================
            let counter = 1;

            Object.values(grouped).forEach((g) => {
                const colors = getCellColors(g);
                const mainRowColor = getMainRowColor(colors);

                let formattedEndTime = "-";
                if (g.endTime) {
                    const d = new Date(g.endTime);
                    formattedEndTime =
                        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
                            d.getDate()
                        ).padStart(2, "0")} ` +
                        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
                }

                const row = sheet.addRow([
                    counter++,
                    g.groupName,
                    g.subjectName,
                    g.teacher,
                    g.lecturer,
                    g.totalStudents,
                    g.passed,
                    g.failed,
                    g.none,
                    g.mustaqilCount,
                    g.oraliqCount,
                    g.acceptedCount,
                    formattedEndTime,
                ]);

                row.eachCell((cell, colIndex) => {
                    let color = mainRowColor;

                    // Specific columns
                    if (colIndex === 7 || colIndex === 8)
                        color = colors.passedFailed === "green" ? "FF00FF00" : colors.passedFailed === "red" ? "FFFF3300" : "FFFFFF00";

                    if (colIndex === 9)
                        color = colors.none === "green" ? "FF00FF00" : colors.none === "red" ? "FFFF3300" : "FFFFFF00";

                    if (colIndex === 10)
                        color = colors.must === "green" ? "FF00FF00" : colors.must === "red" ? "FFFF3300" : "FFFFFF00";

                    if (colIndex === 11)
                        color = colors.ora === "green" ? "FF00FF00" : colors.ora === "red" ? "FFFF3300" : "FFFFFF00";

                    if (colIndex === 12)
                        color = colors.acc === "green" ? "FF00FF00" : colors.acc === "red" ? "FFFF3300" : "FFFFFF00";

                    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
                    cell.border = {
                        top: { style: "thin" },
                        left: { style: "thin" },
                        bottom: { style: "thin" },
                        right: { style: "thin" },
                    };
                });
            });

            // COLUMN WIDTH
            sheet.columns.forEach((col) => (col.width = 22));

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Hisobot-Qaydnoma.xlsx");

            toast.success("Statistika muvaffaqiyatli yuklandi!");
        } catch (e) {
            console.log(e);
            toast.error("Xatolik!");
        } finally {
            setLoading(false);
        }
    };

    // =============================
    // 🔹 4) SCORE SHEETS GET ALL
    // =============================
    const fetchSheets = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/score-sheet-group", "GET");
            console.log(res.data);

            setSheets(res.data);
        } catch {
            toast.error("Score Sheetlarni olishda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    // =============================
    // 🔹 LOAD ALL INITIAL DATA
    // =============================
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await Promise.all([
                fetchGroups(),
                fetchTeachers(),
                fetchSheets()
            ]);
            setLoading(false);
        };
        load();
    }, []);

    // =====================================================
    // 🔹 GROUP CHANGE → LOAD SUBJECTS
    // =====================================================
    const handleGroupChange = (item) => {
        setSelectedGroup(item);
        setSelectedSubject(null);

        if (item?.curriculumId) fetchSubjects(item.curriculumId);
    };



    // =============================
    // 🔹 CREATE SCORE SHEET
    // =============================
    const handleCreate = async () => {
        if (!selectedGroup || !selectedSubject || !selectedTeacher) {
            toast.error("Barcha maydonlarni to'ldiring!");
            return;
        }
        const payload = {
            groupId: selectedGroup.value,
            curriculumSubjectId: selectedSubject.value,
            teacherId: selectedTeacher.value,
            lecturerId: selectedTeacher2?.value ?? null,
            startTime,
            endTime,
            description,
            qaytnoma: selectedQaydnoma?.value
        };



        try {
            setActionLoading(true);
            await ApiCall("/api/v1/score-sheet-group", "POST", payload);
            toast.success("✅ Muvaffaqiyatli yaratildi!");

            setCreateModalOpen(false);
            fetchSheets();
            clearForm();
        } catch {
            toast.error("❌ Yaratishda xatolik!");
        } finally {
            setActionLoading(false);
        }
    };

    // =============================
    // 🔹 EDIT SCORE SHEET
    // =============================
    const handleEdit = async () => {
        const payload = {
            groupId: selectedGroup?.value,
            curriculumSubjectId: selectedSubject?.value,
            teacherId: selectedTeacher?.value,
            lecturerId: selectedTeacher2?.value ?? null,
            description,
            startTime,
            endTime,
            qaytnoma: selectedQaydnoma?.value
                ?? parseInt(editItem.qaytnoma?.replace(/\D/g, ""), 10),
        };

        try {
            setActionLoading(true);

            await ApiCall(
                `/api/v1/score-sheet-group/${editItem.id}`,
                "PUT",
                payload
            );

            toast.success("Muvaffaqiyatli yangilandi!");
            setEditModalOpen(false);
            fetchSheets();
            clearForm();
        } catch (error) {
            toast.error("❌ O'zgartirishda xatolik!");
        } finally {
            setActionLoading(false);
        }
    };


    // =============================
    // 🔹 DELETE SCORE SHEET
    // =============================
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            await ApiCall(`/api/v1/score-sheet-group/${deleteItemId}`, "DELETE");
            toast.success("✅ O'chirildi!");
            setDeleteModalOpen(false);
            fetchSheets();
        } catch {
            toast.error("❌ O'chirishda xatolik!");
        } finally {
            setActionLoading(false);
        }
    };

    // =============================
    // 🔹 CLEAR FORM
    // =============================
    const clearForm = () => {
        setSelectedGroup(null);
        setSelectedSubject(null);
        setSelectedTeacher(null);
        setSelectedTeacher2(null);
        setStartTime("");
        setEndTime("");
        setDescription("");
    };

    // =============================
    // 🔹 LOADING COMPONENT
    // =============================
    const LoadingSpinner = ({ size = "medium" }) => {
        const sizes = {
            small: "w-4 h-4",
            medium: "w-8 h-8",
            large: "w-12 h-12"
        };

        return (
            <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`}></div>
        );
    };

    // =============================
    // 🔹 LOADING SCREEN
    // =============================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    // =============================
    // 🔥 RENDER PAGE
    // =============================
    return (
        <div className="min-h-screen p-6">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div className="mb-4 sm:mb-0">
                        <h1 className="text-3xl font-bold text-gray-800 mb-1">Baholash Jadvalari</h1>
                        <p className="text-gray-600">Barcha guruhlar va fanlar bo'yicha baholash jadvallari</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => fetchUpdateStudents()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm"
                        >
                            <span>Talabalarni yangilash</span>
                        </button>
                        <button
                            onClick={() => fetchScoreStatistik()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm"
                        >
                            <span>Hisobot</span>
                        </button>
                        <button
                            onClick={() => setCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Yangi Jadval</span>
                        </button>
                    </div>
                </div>
                <div className="flex justify-end">
                    <p className="text-2xl mb-4 font-semibold text-gray-600">Jami jadval: {sheets.length} ta</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4">
                    <Select
                        options={groups}
                        value={tempGroup}
                        onChange={setTempGroup}
                        placeholder="Guruh tanlang..."
                        isSearchable
                        classNamePrefix="react-select"
                    />

                    <input
                        type="text"
                        placeholder="Seminarchi..."
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={tempTeacher}
                        onChange={(e) => setTempTeacher(e.target.value)}
                    />

                    <input
                        type="text"
                        placeholder="Fan..."
                        className="border rounded-lg px-3 py-2 text-sm"
                        value={tempSubject}
                        onChange={(e) => setTempSubject(e.target.value)}
                    />

                    <Select
                        options={[
                            { value: 1, label: "1-qaydnoma" },
                            { value: 2, label: "2-qaydnoma" },
                            { value: 3, label: "3-qaydnoma" }
                        ]}
                        value={tempQaytnoma}
                        onChange={setTempQaytnoma}
                        placeholder="Qaydnoma"
                        classNamePrefix="react-select"
                    />

                    <button
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Filtrlash
                    </button>
                    <button
                        onClick={clearFilters}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        Tozalash
                    </button>
                </div>


                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    {sheets.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium text-gray-500 mb-1">Ma'lumot topilmadi</p>
                            <p className="text-gray-400 mb-4">Hozircha baholash jadvallari mavjud emas</p>
                            <button
                                onClick={() => setCreateModalOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Birinchi Jadval Yaratish
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            №
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Guruh
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Fan
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Seminarchi
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Ma'ruzachi
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Qaydnoma
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Vaqt Oralig'i
                                        </th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                            Amallar
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredSheets.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{index + 1}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    <button
                                                        className="text-blue-600 hover:underline font-semibold"
                                                        onClick={() =>
                                                            navigate(`/banker/vedimis/${item.id}`, {
                                                                state: {
                                                                    isKursIshi: item.isKursIshi,
                                                                    subjectName: item.curriculumSubject?.subject?.name ?? "",
                                                                },
                                                            })
                                                        }
                                                    >
                                                        {item.group?.name}
                                                    </button>

                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.curriculumSubject?.subject?.name}</div>
                                                <div className="text-xs text-gray-500">{item.curriculumSubject?.semesterName}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.teacher?.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.lecturer?.name || "-"}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{item.qaytnoma}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    Boshlash: {new Date(item.startTime).toLocaleDateString('uz-UZ')}  <br />
                                                    Tugatish: {new Date(item.endTime).toLocaleDateString('uz-UZ')}
                                                </div>

                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-3">

                                                    {/* Asosiy amallar qatori */}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {/* Tahrirlash tugmasi */}
                                                            <button
                                                                className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-xs transition-colors duration-200 flex items-center gap-1.5"
                                                                onClick={() => {
                                                                    setEditItem(item);
                                                                    setSelectedQaydnoma({
                                                                        value: parseInt(item.qaytnoma.replace(/\D/g, "")),
                                                                        label: item.qaytnoma
                                                                    });
                                                                    setSelectedGroup({
                                                                        value: item.group.id,
                                                                        label: item.group.name,
                                                                        curriculumId: item.group.curriculum,
                                                                    });
                                                                    setSelectedTeacher({
                                                                        value: item.teacher.id,
                                                                        label: item.teacher.name,
                                                                    });
                                                                    fetchSubjects(item.group.curriculum);
                                                                    setTimeout(() => {
                                                                        setSelectedSubject({
                                                                            value: item.curriculumSubject.id,
                                                                            label: `${item.curriculumSubject.semesterName} - ${item.curriculumSubject.subject.name}`,
                                                                        });
                                                                        setSelectedTeacher2(item.lecturer ? {
                                                                            value: item.lecturer.id,
                                                                            label: item.lecturer.name
                                                                        } : null);
                                                                    }, 200);
                                                                    setStartTime(item.startTime?.substring(0, 16));
                                                                    setEndTime(item.endTime?.substring(0, 16));
                                                                    setDescription(item.description);
                                                                    setEditModalOpen(true);
                                                                }}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                                <span>Tahrirlash</span>
                                                            </button>

                                                            {/* O'chirish tugmasi */}
                                                            <button
                                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition-colors duration-200 flex items-center gap-1.5"
                                                                onClick={() => {
                                                                    setDeleteItemId(item.id);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                <span>O'chirish</span>
                                                            </button>
                                                        </div>

                                                        {/* Status tugmasi */}
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={item.status}
                                                                onChange={() => handleStatusClick(item.id)}
                                                                className="sr-only"
                                                            />
                                                            <div className={`w-11 h-6 rounded-full transition-colors ${item.status ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform ${item.status ? 'transform translate-x-5' : ''}`}></div>
                                                            </div>
                                                        </label>
                                                    </div>

                                                    {/* Fayl boshqaruv bo'limi */}
                                                    <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">

                                                        {/* Mavjud fayllar */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Biriktirilgan fayllar
                                                            </div>

                                                            <div className="flex flex-wrap gap-1.5">
                                                                {item.attachments && item.attachments.length > 0 ? (
                                                                    item.attachments.map((file) => (
                                                                        <button
                                                                            key={file.id}
                                                                            onClick={() => handleDownload(file.id, file.fileOriginalName)}
                                                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded text-xs transition-all duration-150 max-w-[140px]"
                                                                            title={file.fileOriginalName}
                                                                        >
                                                                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                            </svg>
                                                                            <span className="truncate flex-1">{file.fileOriginalName}</span>
                                                                        </button>
                                                                    ))
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5 text-gray-400 text-xs bg-white px-3 py-2 rounded border border-gray-300">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Fayl mavjud emas
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Yangi fayl yuklash */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                                </svg>
                                                                Yangi fayl yuklash
                                                            </div>

                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex gap-2">
                                                                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                                                        <input
                                                                            id={`file_${item.id}`}
                                                                            type="file"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0];
                                                                                if (file) {
                                                                                    const fileNameElement = document.getElementById(`file-name_${item.id}`);
                                                                                    if (fileNameElement) {
                                                                                        fileNameElement.textContent = file.name;
                                                                                        fileNameElement.className = "text-xs text-green-600 font-medium truncate";
                                                                                    }
                                                                                }
                                                                            }}
                                                                        />
                                                                        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                                                                        </svg>
                                                                        <span className="text-gray-600">Tanlash</span>
                                                                    </label>

                                                                    <button
                                                                        onClick={() => {
                                                                            const input = document.getElementById(`file_${item.id}`);
                                                                            if (!input?.files?.[0]) {
                                                                                return toast.warning("⚠️ Iltimos, fayl tanlang!");
                                                                            }
                                                                            handleUpload(item.id, input.files[0]);
                                                                        }}
                                                                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                                                                    >
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                                        </svg>
                                                                        Yuklash
                                                                    </button>
                                                                </div>

                                                                <div id={`file-name_${item.id}`} className="text-xs text-gray-400 truncate px-1">
                                                                    Hech qanday fayl tanlanmagan
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Statusni o'zgartirish">
                <div className="text-center">
                    <p className="text-gray-700 mb-6">
                        Ushbu jadvalning statusini o'zgartirmoqchimisiz?
                    </p>

                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => setStatusModalOpen(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                        >
                            Bekor qilish
                        </button>

                        <button
                            onClick={confirmStatusChange}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Tasdiqlash
                        </button>
                    </div>
                </div>
            </Modal>


            {/* CREATE MODAL */}
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Yangi Baholash Jadvali">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guruh</label>
                        <Select
                            options={groups}
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            placeholder="Guruh tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fan</label>
                        <Select
                            options={subjects}
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            placeholder="Fan tanlang..."
                            isDisabled={!selectedGroup}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seminarchi</label>
                        <Select
                            options={teachers}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            placeholder="Seminarchi tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ma'ruzachi</label>
                        <Select
                            options={teachers}
                            value={selectedTeacher2}
                            onChange={setSelectedTeacher2}
                            placeholder="Ma'ruzachi tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish Vaqti</label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={startTime}
                                min={now}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tugash Vaqti</label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={endTime}
                                min={startTime || now}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qaydnoma turi</label>
                            <Select
                                options={qaydnomaOptions}
                                value={selectedQaydnoma}
                                onChange={setSelectedQaydnoma}
                                placeholder="Qaydnoma tanlang..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                        <textarea
                            className="resize-none w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Qo'shimcha izoh..."
                        ></textarea>


                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setCreateModalOpen(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading && <LoadingSpinner size="small" />}
                            <span>{actionLoading ? "Yaratilmoqda..." : "Yaratish"}</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* EDIT MODAL */}
            <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Jadvalni Tahrirlash">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Guruh</label>
                        <Select
                            options={groups}
                            value={selectedGroup}
                            onChange={handleGroupChange}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fan</label>
                        <Select
                            options={subjects}
                            value={selectedSubject}
                            onChange={setSelectedSubject}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seminarchi</label>
                        <Select
                            options={teachers}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ma'ruzachi</label>
                        <Select
                            options={teachers}
                            value={selectedTeacher2}
                            onChange={setSelectedTeacher2}
                            placeholder="Ma'ruzachi tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Boshlanish Vaqti</label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={startTime}
                                min={now}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tugash Vaqti</label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                value={endTime}
                                min={startTime || now}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Qaydnoma turi</label>
                            <Select
                                options={qaydnomaOptions}
                                value={selectedQaydnoma}
                                onChange={setSelectedQaydnoma}
                                placeholder="Qaydnoma tanlang..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={() => setEditModalOpen(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleEdit}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading && <LoadingSpinner size="small" />}
                            <span>{actionLoading ? "Yangilanmoqda..." : "Yangilash"}</span>
                        </button>
                    </div>
                </div>
            </Modal>

            {/* DELETE MODAL */}
            <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="O'chirishni Tasdiqlash">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 mb-6">Bu jadvalni o'chirishni istaysizmi? Bu amalni ortga qaytarib bo'lmaydi.</p>

                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actionLoading && <LoadingSpinner size="small" />}
                            <span>{actionLoading ? "O'chirilmoqda..." : "Ha, O'chirish"}</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ScoreSheet;