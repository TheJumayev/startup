import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import Modal from "react-modal";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

function ScoreStudent() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [scoreSheets, setScoreSheets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupInfo, setGroupInfo] = useState(null);
    const [admin, setAdmin] = useState(null)
    const [mustaqilModalOpen, setMustaqilModalOpen] = useState(false);
    const [oraliqModalOpen, setOraliqModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedScore, setSelectedScore] = useState(null);
    const [newOraliq, setNewOraliq] = useState();
    const [newMustaqil, setNewMustaqil] = useState();
    const [failModalOpen, setFailModalOpen] = useState(false);
    const [failDescription, setFailDescription] = useState("");
    const [extraModalOpen, setExtraModalOpen] = useState(false);
    const [newExtraScore, setNewExtraScore] = useState(0);
    const [selectedExtra, setSelectedExtra] = useState(null);
    const location = useLocation();
    const { kursIshi } = location.state || {};
    const { subject } = location.state || {};
    const { teacherId } = location.state || {};






    const getKursIshiColor = (score) => {
        if (score >= 90) return "bg-green-500 hover:bg-green-600";   // 5 baho
        if (score >= 75) return "bg-blue-500 hover:bg-blue-600";    // 4 baho
        if (score >= 60) return "bg-yellow-500 hover:bg-yellow-600"; // 3 baho
        if (score > 0) return "bg-red-500 hover:bg-red-600";        // 2 baho
        return "bg-gray-400 hover:bg-gray-500";
    };

    const updateExtraScore = async () => {
        if (!canEditScore(selectedExtra.scoreSheetGroup)) {
            return toast.error("Baho qo'yish vaqti tugagan!");
        }

        if (newExtraScore > 101)
            return toast.error("Ball 100 dan oshmasligi kerak!");

        const dto = {
            kursIshi: Number(newExtraScore),
            markerId: admin.id,   // teacherId emas, admin.id bo‘ladi (birinchi kodga mos)
            qaytnoma: Number(
                selectedExtra.scoreSheetGroup.qaytnoma.split("-")[0]
            )
        };

        try {
            await ApiCall(
                `/api/v1/score-sheet/kurs-ishi/${selectedExtra.id}`,
                "PUT",
                dto
            );

            toast.success("Kurs ishi bahosi yangilandi!");

            setExtraModalOpen(false);
            fetchScoreSheet();
        } catch (error) {
            console.log(error);
            toast.error("Xatolik! Kurs ishi bahosi yangilanmadi");
        }
    };

    const openExtraModal = (item) => {
        setSelectedExtra(item);
        setNewExtraScore(item.extra ?? 0);   // extra = yangi baho turi
        setExtraModalOpen(true);
    };
    const openFailedDescriptionModal = (item) => {
        setSelectedScore(item);
        setFailDescription("");  // tozalash
        setFailModalOpen(true);
    };

    const sendFailedStatus = async () => {
        if (!failDescription.trim()) {
            return toast.error("❗ Sababni yozing!");
        }

        try {
            await ApiCall(`/api/v1/score-sheet/isPassed/${selectedScore.id}`, "PUT", {
                isPassed: false,
                description: failDescription
            });

            toast.success("O'tmadi sababi saqlandi!");
            setFailModalOpen(false);
            fetchScoreSheet();
        } catch {
            toast.error("Xatolik!");
        }
    };



    const downloadExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Vedims Baholar");

        worksheet.columns = [
            { header: "№", key: "id", width: 5 },
            { header: "Talaba", key: "student", width: 30 },
            { header: "Ma'ruza", key: "passed", width: 12 },
            { header: "Mustaqil", key: "mustaqil", width: 12 },
            { header: "Oraliq", key: "oraliq", width: 12 },
            { header: "Jami", key: "jami", width: 10 },
            { header: "NB %", key: "nb", width: 10 },
        ];

        scoreSheets.forEach((item, index) => {
            const jami = (item.mustaqil || 0) + (item.oraliq || 0);
            const details = item.scoreSheetGroup.curriculumSubject.subjectDetails;
            const totalLoad = details
                .filter((d) => d.trainingCode != 17)
                .reduce((sum, d) => sum + (d.academic_load || 0), 0);

            const nbPercent = ((item.sababsizNb / totalLoad) * 100).toFixed(2);

            const row = worksheet.addRow({
                id: index + 1,
                student: item.student.fullName,
                passed: item.isPassed === true ? "O'tdi" : item.isPassed === false ? "O'tmadi" : "Belgilanmagan",
                mustaqil: item.mustaqil || 0,
                oraliq: item.oraliq || 0,
                jami,
                nb: `${nbPercent}%`,
            });

            // ***** Background colors *****
            const passedCell = row.getCell(3);
            if (item.isPassed === true)
                passedCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4CAF50" } };
            else if (item.isPassed === false)
                passedCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF44336" } };
            else
                passedCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF9E9E9E" } };

            row.getCell(4).fill = {
                type: "pattern", pattern: "solid", fgColor: { argb: item.mustaqil > 0 ? "FF4CAF50" : "FFF44336" },
            };

            row.getCell(5).fill = {
                type: "pattern", pattern: "solid", fgColor: { argb: item.oraliq > 0 ? "FF4CAF50" : "FFF44336" },
            };

            row.getCell(6).fill = {
                type: "pattern", pattern: "solid", fgColor: { argb: jami >= 30 ? "FF4CAF50" : "FFF44336" },
            };

            row.getCell(7).fill = {
                type: "pattern", pattern: "solid", fgColor: { argb: nbPercent >= 25 ? "FFF44336" : "FF4CAF50" },
            };

            // ***** BORDER qo'shish *****
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: "thin", color: { argb: "FF000000" } },
                    left: { style: "thin", color: { argb: "FF000000" } },
                    bottom: { style: "thin", color: { argb: "FF000000" } },
                    right: { style: "thin", color: { argb: "FF000000" } },
                };
            });
        });

        // ***** HEADER STYLE *****
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true, color: { argb: "FF000000" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFBBDEFB" } };
            cell.border = {
                top: { style: "thin", color: { argb: "FF000000" } },
                left: { style: "thin", color: { argb: "FF000000" } },
                bottom: { style: "thin", color: { argb: "FF000000" } },
                right: { style: "thin", color: { argb: "FF000000" } },
            };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Vedims_${groupInfo?.group?.name || "Export"}.xlsx`);
    };


    // ⭐ VAQTNI TEKSHIRISH
    const canEditScore = (sheetGroup) => {
        if (!sheetGroup) return false;
        const now = new Date();
        const start = new Date(sheetGroup.startTime);
        const end = new Date(sheetGroup.endTime);
        return now >= start && now <= end;
    };

    useEffect(() => {
        getAdmin();
    }, []);
    const getAdmin = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET", null);
            setAdmin(response.data); // response.data => { id, fullName, role, ... }
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        }
    };


    const handlePassedChange = async (scoreId, value) => {
        const requestValue = value === "true";

        try {
            await ApiCall(`/api/v1/score-sheet/isPassed/${scoreId}`, "PUT", {
                isPassed: requestValue,   // true
                description: null         // description yuborilmaydi
            });

            fetchScoreSheet();
            toast.success("O'tdi belgilandi");
        } catch (err) {
            toast.error("Xatolik!");
        }
    };


    const getTimeStatus = (sheetGroup) => {
        if (!sheetGroup) return { status: 'unknown', message: 'Ma\'lumot yo\'q' };

        const now = new Date();
        const start = new Date(sheetGroup.startTime);
        const end = new Date(sheetGroup.endTime);

        if (now < start) {
            return {
                status: 'not-started',
                message: `Boshlanishi: ${start.toLocaleDateString('uz-UZ')}`
            };
        } else if (now > end) {
            return {
                status: 'ended',
                message: `Vaqt tugadi: ${end.toLocaleDateString('uz-UZ')}`
            };
        } else {
            return {
                status: 'active',
                message: `Baholash davom etmoqda`
            };
        }
    };

    const fetchScoreSheet = async () => {
        try {
            setLoading(true);
            const response = await ApiCall(`/api/v1/score-sheet/${id}`, "GET");
            console.log(response.data);

            const sorted = (response.data || []).sort((a, b) =>
                a.student.fullName.localeCompare(b.student.fullName, "uz", { sensitivity: "base" })
            );

            setScoreSheets(sorted);

            if (response.data && response.data.length > 0) {
                setGroupInfo(response.data[0].scoreSheetGroup);
            }
        } catch (error) {
            toast.error("Ma'lumot yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    };
    const getUserPermissions = () => {
        if (!admin || !groupInfo) return [];

        const lecturerId = groupInfo.lecturer?.id;
        const teacherId = groupInfo.teacher?.id;

        const userId = admin?.id;

        const isLecturer = lecturerId === userId;
        const isTeacher = teacherId === userId;
        const isBoth = isLecturer && isTeacher;  // ⭐ BU JOY YETISHMAYOTGAN EDI

        if (isTeacher && !isLecturer) {
            return [
                "Ma'ruza baholash mumkin emas",
                "Mustaqil ta’lim bahosi qo'ya oladi",
                "Oraliq nazorat bahosi qo'ya oladi (faqat O'tdi bo'lsa)",
                "Kurs ishi bahosini qo'ya oladi",
            ];
        }

        if (isLecturer && !isTeacher) {
            return [
                "FaQat Ma'ruza baholash (O'tdi / O'tmadi)",
                "Mustaqil ta’limni baholay olmaydi",
                "Oraliq nazoratni baholay olmaydi",
                "Kurs ishini baholay olmaydi",
            ];
        }

        if (isBoth) {
            return [
                "Ma'ruza baholash (O'tdi / O'tmadi)",
                "Mustaqil ta’lim bahosi qo'ya oladi",
                "Oraliq nazorat bahosi qo'ya oladi",
                "Kurs ishi bahosini qo'ya oladi",
            ];
        }

        return [];
    };





    useEffect(() => {
        if (id) fetchScoreSheet();
    }, [id]);

    const openMustaqilModal = (item) => {
        if (item.mustaqil > 0) {
            toast.error("❌ Mustaqil ta'lim bahosi allaqachon qo'yilgan!");
            return;
        }
        setSelectedScore(item);
        setNewMustaqil(item.mustaqil ?? 0);
        setMustaqilModalOpen(true);
    };

    const openOraliqModal = (item, percent) => {
        console.log(percent);

        if (percent >= 25) {
            return;
        }
        if (!item.isPassed) {
            toast.error("❌ Ma'ruza o'tilgan bo'lishi shart (O'tdi holati)!");
            return;
        }

        if (item.oraliq > 0) {
            toast.error("❌ Oraliq nazorat bahosi allaqachon qo'yilgan!");
            return;
        }

        setSelectedScore(item);
        setNewOraliq(item.oraliq ?? 0);
        setOraliqModalOpen(true);
    };



    // ⭐ PUT UPDATE
    const updateScore = async (field) => {
        // Yana vaqtni tekshiramiz (inspektordan qo'ymasin)
        if (!canEditScore(selectedScore.scoreSheetGroup)) {
            return toast.error("Baho qo'yish vaqti tugagan!");
        }

        let oraliq = selectedScore.oraliq ?? 0;
        let mustaqil = selectedScore.mustaqil ?? 0;

        if (field === "mustaqil") mustaqil = Number(newMustaqil);
        if (field === "oraliq") oraliq = Number(newOraliq);

        // ⭐ LIMIT CHECK
        if (mustaqil > 25) return toast.error("Mustaqil ta'lim 25 balldan oshmaydi!");
        if (oraliq > 25) return toast.error("Oraliq nazorat 25 balldan oshmaydi!");
        if (oraliq + mustaqil > 50) return toast.error("Jami ball 50 dan oshmasligi kerak!");

        const dto = {
            oraliq,
            mustaqil,
            markerId: admin.id,
            lecturerId: admin.id,
            qaytnoma: Number(
                selectedScore.scoreSheetGroup.qaytnoma?.split("-")[0]
            )
        };

        try {
            await ApiCall(`/api/v1/score-sheet/${selectedScore.id}`, "PUT", dto);
            toast.success("✅ Baho muvaffaqiyatli yangilandi!");

            setMustaqilModalOpen(false);
            setOraliqModalOpen(false);
            fetchScoreSheet();
        } catch (error) {
            toast.error("❌ Xatolik! Baho yangilanmadi");
        }
    };



    const updateNB = async (groupId) => {
        setLoading(true);   // ❤️ Tugmani vaqtinchalik bloklash uchun

        try {
            await ApiCall(`/api/v1/score-sheet/nb/${groupId}`, "GET");
            toast.success("NB ma'lumotlari yangilandi!");
            await fetchScoreSheet();  // yangilangan ma'lumotni qayta yuklash
        } catch (error) {
            toast.error("NB yangilashda xatolik!");
            setLoading(false);
        }
    };

    const getAcceptanceBadge = (value, percent) => {
        if (value === true)
            return (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✅ Tanishdim
                </span>
            );

        if (percent >= 25)
            return (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    Komissiyaga!
                </span>
            );

        return (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                ⏳ Kutilmoqda
            </span>
        );
    };

    const getScoreColor = (score) => {
        if (score >= 20) return "bg-green-500 hover:bg-green-600";
        if (score >= 15) return "bg-blue-500 hover:bg-blue-600";
        if (score >= 10) return "bg-yellow-500 hover:bg-yellow-600";
        if (score > 0) return "bg-orange-500 hover:bg-orange-600";
        return "bg-gray-400 hover:bg-gray-500";
    };

    const getTotalScoreColor = (score) => {
        if (score >= 40) return "bg-green-100 text-green-800 border-green-300";
        if (score >= 30) return "bg-blue-100 text-blue-800 border-blue-300";
        if (score >= 20) return "bg-yellow-100 text-yellow-800 border-yellow-300";
        return "bg-red-100 text-red-800 border-red-300";
    };

    const calculateStats = () => {
        const totalStudents = scoreSheets.length;
        const withScores = scoreSheets.filter(item => (item.mustaqil || 0) + (item.oraliq || 0) > 0).length;
        const averageScore = totalStudents > 0
            ? scoreSheets.reduce((sum, item) => sum + (item.mustaqil || 0) + (item.oraliq || 0), 0) / totalStudents
            : 0;

        return { totalStudents, withScores, averageScore: averageScore.toFixed(1) };
    };

    const stats = calculateStats();

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        {groupInfo && (
                            <div className="bg-white rounded-lg shadow-sm p-3 border">
                                <p className="text-sm text-gray-600">Guruh</p>
                                <p className="text-lg font-bold text-gray-800">{groupInfo.group?.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {getTimeStatus(groupInfo).message}
                                </p>
                            </div>
                        )}
                        <div className="flex items-center gap-3 p-4 mb-4 rounded-lg bg-red-50 border border-red-300">
                            <svg
                                className="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>

                            <div className="text-2xl text-red-800 font-medium">
                                Baholar bir marta qo'yilgandan so'ng qayta o'zgartirilmaydi.
                            </div>
                        </div>


                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <div className="bg-white rounded-lg shadow-sm p-4 border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Jami Talabalar</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
                                </div>
                                <div className="text-blue-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Baholanganlar</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.withScores}</p>
                                    <p className="text-xs text-gray-500">
                                        {stats.totalStudents > 0 ? Math.round((stats.withScores / stats.totalStudents) * 100) : 0}%
                                    </p>
                                </div>
                                <div className="text-green-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-4 border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">O'rtacha Ball</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.averageScore}</p>
                                    <p className="text-xs text-gray-500">50 balldan</p>
                                </div>
                                <div className="text-purple-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-20 mb-4">
                    {/* Vakolat paneli */}
                    {groupInfo && (
                        <div className="w-full md:w-1/3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow p-4 border border-indigo-200">
                            <p className="text-md font-bold text-indigo-700 mb-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                Sizning vakolatingiz
                            </p>

                            <ul className="space-y-1 text-gray-700 text-sm">
                                {getUserPermissions().map((p, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                                        {p}
                                    </li>
                                ))}
                            </ul>

                            <p className="text-xs text-gray-500 mt-2 italic">
                                {getTimeStatus(groupInfo).message}
                            </p>
                        </div>
                    )}

                    <div>
                        <div className="">
                            <button
                                onClick={() => updateNB(id)}
                                disabled={loading}
                                className={`px-5 py-2.5 rounded-lg font-semibold text-white transition ml-4
                                 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"}`}
                            >
                                {loading ? "Yuklanmoqda..." : "NBlarni yangilash"}
                            </button>
                        </div>
                        {/* Excel download */}
                        <div className="w-full my-2">
                            <button
                                onClick={() => downloadExcel()}
                                className="px-5 py-2 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md"
                            >
                                Vedimsni yuklab olish
                            </button>
                        </div>

                        <div className="flex items-center bg-indigo-50 border my-2 border-indigo-200 px-4 py-2 rounded-lg shadow-sm gap-2 max-w-xs">
                            <span className="font-semibold">Fan nomi:</span>
                            <span className="text-indigo-900 font-semibold text-base">
                                {subject || "Fan nomi topilmadi"}
                            </span>
                        </div>
                        {/* Qidiruv */}
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="Talaba ismi bo'yicha qidirish..."
                                className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                    </div>

                </div>


                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                        <div className="overflow-x-auto">
                            <table id="vedims-table" className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                                            №
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">
                                            Talaba
                                        </th>
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            Ma'ruza
                                        </th>
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            Mustaqil
                                        </th>
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            Oraliq
                                        </th>
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            Jami baho
                                        </th>
                                        {kursIshi == true && (
                                            <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                                Kurs ishi
                                            </th>
                                        )}
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            NB FOIZI
                                        </th>
                                        <th className="px-3 py-3 text-center font-semibold text-gray-700 text-sm">
                                            Holati
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {scoreSheets.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-400">
                                                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-lg font-medium text-gray-500 mb-1">Ma'lumot topilmadi</p>
                                                    <p className="text-gray-400 text-sm">Hozircha baholash ma'lumotlari mavjud emas</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        scoreSheets
                                            .filter(item =>
                                                item.student.fullName.toLowerCase().includes(search.toLowerCase())
                                            )
                                            .map((item, index) => {
                                                const jami = (item.mustaqil || 0) + (item.oraliq || 0);
                                                const canEdit = canEditScore(item.scoreSheetGroup);
                                                const timeStatus = getTimeStatus(item.scoreSheetGroup);
                                                const sababsizNb = item.sababsizNb - item.sababliNB;
                                                const details = item.scoreSheetGroup.curriculumSubject.subjectDetails;
                                                const canEditPassed = item.scoreSheetGroup.lecturer?.id === admin?.id;
                                                const lecturerId = groupInfo?.lecturer?.id;
                                                const teacherId = groupInfo?.teacher?.id;
                                                const userId = admin?.id;
                                                const isLecturer = lecturerId === userId;
                                                const isTeacher = teacherId === userId;
                                                const isBoth = isLecturer && isTeacher;
                                                // Permissions
                                                const canSetPassed = isLecturer || isBoth;
                                                const canSetMustaqil = isTeacher || isBoth;
                                                const canSetOraliq = (isTeacher || isBoth) && item.isPassed === true;
                                                const canSetKursIshi = isTeacher || isBoth;

                                                // academic_load yig'indisi (trainingCode == 17 bo'lsa o'tmaydi)
                                                const totalLoad = details
                                                    .filter(d => d.trainingCode != 17)
                                                    .reduce((sum, d) => sum + (d.academic_load || 0), 0);
                                                const percent = ((sababsizNb / totalLoad) * 100).toFixed(2);
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3">
                                                            {index + 1}
                                                        </td>
                                                        {/* Talaba ismi */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-blue-600 font-medium text-sm">
                                                                        {item.student?.fullName?.charAt(0) || "T"}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {item.student?.fullName}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 flex items-center mt-1">
                                                                        <div className={`w-2 h-2 rounded-full mr-2 ${timeStatus.status === 'active' ? 'bg-green-500' :
                                                                            timeStatus.status === 'not-started' ? 'bg-yellow-500' :
                                                                                'bg-red-500'
                                                                            }`}></div>
                                                                        {timeStatus.message}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center flex gap-4">

                                                            {/* O'tdi */}
                                                            {(item.isPassed === null || item.isPassed === true || item.isPassed == false) && (
                                                                <button
                                                                    className={`px-3 py-2 rounded font-semibold text-sm transition
                                                                ${item.isPassed === true ? "bg-green-600 text-white border-2 border-green-800" : "bg-gray-200 text-green-800 border border-green-300"}
                                                              `}
                                                                    onClick={() => handlePassedChange(item.id, "true")}
                                                                    disabled={!canSetPassed}
                                                                >
                                                                    O'tdi
                                                                </button>
                                                            )}

                                                            {/* O'tmadi */}
                                                            {(item.isPassed === null || item.isPassed === false) && (
                                                                <button
                                                                    className={`px-3 py-2 rounded font-semibold text-sm transition
                     ${item.isPassed === false ? "bg-red-600 text-white border-2 border-red-800" : "bg-gray-200 text-red-800 border border-red-300"}
                    `}
                                                                    onClick={() => openFailedDescriptionModal(item)}
                                                                    disabled={!canSetPassed || item.isPassed !== null}
                                                                >
                                                                    O'tmadi
                                                                </button>
                                                            )}

                                                        </td>

                                                        {/* Mustaqil ta'lim */}
                                                        <td className="px-3 py-3 text-center">
                                                            <button
                                                                onClick={() => openMustaqilModal(item)}
                                                                disabled={true}

                                                                className={`w-12 h-12 rounded-lg font-semibold text-white text-sm transition
                                                                  ${(!canEditScore(item.scoreSheetGroup) || item.mustaqil > 0)
                                                                        ? "cursor-not-allowed opacity-50"
                                                                        : "cursor-pointer"
                                                                    }
      ${getScoreColor(item.mustaqil)}
  `}
                                                            >
                                                                {item.mustaqil || 0}
                                                            </button>


                                                        </td>

                                                        {/* Oraliq nazorat */}
                                                        <td className="px-3 py-3 text-center">
                                                            <button
                                                                onClick={() => openOraliqModal(item, percent)}
                                                                disabled={(!canSetOraliq || item.oraliq > 0)}
                                                                className={`w-12 h-12 rounded-lg font-semibold text-white text-sm transition
      ${(!canEditScore(item.scoreSheetGroup) || item.oraliq > 0 || item.isPassed !== true)
                                                                        ? "cursor-not-allowed opacity-50"
                                                                        : "cursor-pointer"
                                                                    }
      ${getScoreColor(item.oraliq)}
  `}
                                                            >
                                                                {item.oraliq || 0}
                                                            </button>


                                                        </td>

                                                        {/* Jami ball */}
                                                        <td className="px-3 py-3 text-center">
                                                            <span className={`inline-flex items-center justify-center w-14 h-8 rounded border-2 font-bold text-sm ${getTotalScoreColor(jami)}`}>
                                                                {jami}
                                                            </span>
                                                        </td>

                                                        {kursIshi == true && (
                                                            <td className="px-3 py-3 text-center">
                                                                <button
                                                                    disabled={!canSetKursIshi || item.kursIshi > 0}
                                                                    onClick={() => openExtraModal(item)}
                                                                    className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-semibold text-white text-sm transition-colors
      ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
      ${getKursIshiColor(item.kursIshi || 0)}
    `}
                                                                >
                                                                    {item.kursIshi || 0}
                                                                </button>
                                                            </td>
                                                        )}
                                                        {/* Jami NB */}
                                                        {item.rektor === true ? (
                                                            <td className="px-3 py-3 text-center whitespace-normal break-words max-w-[200px]">
                                                                {item?.rektorDescription}
                                                            </td>


                                                        ) : (
                                                            <td className="px-3 py-3 text-center">

                                                                <span
                                                                    className={`inline-flex items-center w-14 h-8 justify-center rounded font-bold text-sm
                              ${percent >= 25 ? "bg-red-500 text-white" : "bg-green-500 text-white"}
                              `}
                                                                >
                                                                    {percent} %
                                                                </span>
                                                            </td>
                                                        )}

                                                        {/* Talaba imzosi */}
                                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                                            {getAcceptanceBadge(item.isAccepted, percent)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* ⭐ MUSTAQIL MODAL */}
            <Modal
                isOpen={mustaqilModalOpen}
                onRequestClose={() => { }}                // ❌ FONGA BOSILSA YOPILMAYDI
                shouldCloseOnOverlayClick={false}        // 🔥 Asosiy blok
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto mt-24 lg:max-w-lg outline-none"
                overlayClassName="
        fixed inset-0 
        bg-black bg-opacity-50 
        backdrop-blur-md 
        flex justify-center items-start pt-20 z-50
    "            >
                <div className="p-8">   {/* 🔥 Kattaroq padding */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">   {/* 🔥 Katta sarlavha */}
                        Mustaqil Ta'lim Bahosi
                    </h2>

                    <p className="text-red-500 mb-5 text-2xl">
                        Talaba: <span className="font-semibold">{selectedScore?.student?.fullName}</span>
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ball (0–25)
                        </label>

                        <input
                            type="number"
                            value={newMustaqil}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setNewMustaqil(val < 1 ? 0 : val > 25 ? newMustaqil : val);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            min={0}
                            max={25}
                            placeholder="0"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Min: 0</span>
                            <span>Max: 25</span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-2">
                        <button
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setMustaqilModalOpen(false)}
                        >
                            Bekor qilish
                        </button>

                        <button
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            onClick={() => updateScore("mustaqil")}
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            </Modal>


            {/* ⭐ ORALIQ MODAL */}
            <Modal
                isOpen={oraliqModalOpen}
                onRequestClose={() => { }}                 // ❌ Fonga bosilganida yopilmasin
                shouldCloseOnOverlayClick={false}         // 🔥 Asosiy blok
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto mt-24 lg:max-w-lg outline-none"
                overlayClassName="
        fixed inset-0 
        bg-black bg-opacity-50 
        backdrop-blur-md 
        flex justify-center items-start pt-20 z-50
    "            >
                <div className="p-8">   {/* 🔥 Kattaroq modal */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Oraliq Nazorat Bahosi
                    </h2>

                    <p className="text-red-500 mb-5 text-2xl">
                        Talaba: <span className="font-semibold">{selectedScore?.student?.fullName}</span>
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ball (0–25)
                        </label>

                        <input
                            type="number"
                            value={newOraliq}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                setNewOraliq(val < 1 ? 0 : val > 25 ? newOraliq : val);
                            }}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-semibold focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            min={0}
                            max={25}
                            placeholder="0"
                        />

                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Min: 0</span>
                            <span>Max: 25</span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-2">
                        <button
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            onClick={() => setOraliqModalOpen(false)}
                        >
                            Bekor qilish
                        </button>

                        <button
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                            onClick={() => updateScore("oraliq")}
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={failModalOpen}
                onRequestClose={() => setFailModalOpen(false)}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto p-6 mt-24"
            >
                <h2 className="text-xl font-bold mb-4 text-red-600">O'tmadi sababi</h2>
                <textarea
                    className="w-full border rounded-lg p-3"
                    rows="4"
                    placeholder="Sababni kiriting..."
                    value={failDescription}
                    onChange={(e) => setFailDescription(e.target.value)}
                />
                <div className="flex justify-end space-x-3 mt-4">
                    <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setFailModalOpen(false)}>Bekor</button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => sendFailedStatus()}>
                        Saqlash
                    </button>
                </div>
            </Modal>
            <Modal
                isOpen={extraModalOpen}
                onRequestClose={() => { }}
                shouldCloseOnOverlayClick={false}
                className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto mt-24 lg:max-w-lg outline-none"
                overlayClassName="
          fixed inset-0 
          bg-black bg-opacity-50 
          backdrop-blur-md 
          flex justify-center items-start pt-20 z-50
        "
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Kurs ishi bahosi
                    </h2>

                    <p className="text-red-500 mb-5 text-2xl">
                        Talaba: <span className="font-semibold">{selectedExtra?.student?.fullName}</span>
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ball (0-100)
                        </label>

                        <input
                            type="number"
                            value={newExtraScore}
                            onChange={(e) => setNewExtraScore(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            min={0}
                            max={100}
                        />

                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Min: 0</span>
                            <span>Max: 100</span>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                            onClick={() => setExtraModalOpen(false)}
                        >
                            Bekor qilish
                        </button>

                        <button
                            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            onClick={updateExtraScore}
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            </Modal>

        </div >
    );
}

export default ScoreStudent;