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
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [mustaqilModalOpen, setMustaqilModalOpen] = useState(false);
  const [oraliqModalOpen, setOraliqModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [officeModalOpen, setOfficeModalOpen] = useState(false);
  const [officeDescription, setOfficeDescription] = useState("");
  const [selectedScore, setSelectedScore] = useState(null);
  const [newOraliq, setNewOraliq] = useState(0);
  const [newMustaqil, setNewMustaqil] = useState(0);
  const [extraModalOpen, setExtraModalOpen] = useState(false);
  const [newExtraScore, setNewExtraScore] = useState(0);
  const [selectedExtra, setSelectedExtra] = useState(null);
  const { state } = useLocation();
  const { subjectName } = state || {};
  const { isKursIshi } = state || {};

  const getKursIshiColor = (score) => {
    if (score >= 90) return "bg-green-500 hover:bg-green-600"; // 5 baho
    if (score >= 75) return "bg-blue-500 hover:bg-blue-600"; // 4 baho
    if (score >= 60) return "bg-yellow-500 hover:bg-yellow-600"; // 3 baho
    if (score > 0) return "bg-red-500 hover:bg-red-600"; // 2 baho
    return "bg-gray-400 hover:bg-gray-500";
  };

  const openExtraModal = (item) => {
    setSelectedExtra(item);
    setNewExtraScore(item.extra ?? 0); // extra = yangi baho turi
    setExtraModalOpen(true);
  };
  const openOfficeModal = (item) => {
    setSelectedScore(item);
  };

  const updateExtraScore = async () => {
    if (!canEditScore(selectedExtra.scoreSheetGroup)) {
      return toast.error("Baho qo'yish vaqti tugagan!");
    }

    if (newExtraScore > 101) return toast.error("Ball 25 dan oshmaydi!");
    const dto = {
      kursIshi: Number(newExtraScore),
      markerId: admin.id,
      qaytnoma: Number(selectedExtra.scoreSheetGroup.qaytnoma.split("-")[0]),
    };

    try {
      await ApiCall(`/api/v1/score-sheet/${selectedExtra.id}`, "PUT", dto);
      toast.success("Baho yangilandi!");

      setExtraModalOpen(false);
      fetchScoreSheet();
    } catch (error) {
      console.log(error);
      toast.error("Xatolik!");
    }
  };

  const getStudentId = (student) => {
    return student?.id || null;
  };

  const updateOfficeStatus = async (newStatus) => {
    if (!selectedScore) return;

    const studentId = selectedScore.student?.id;
    if (!studentId) {
      toast.error("Talaba ID topilmadi!");
      return;
    }

    try {
      const dto = {
        getIsOffice: newStatus, // TRUE yoki FALSE kelsa shu saqlanadi
        officeDescription: officeDescription,
      };

      await ApiCall(
        `/api/v1/score-sheet/office/${selectedScore.id}/${studentId}`,
        "PUT",
        dto
      );

      toast.success("Yangi status saqlandi!");
      setOfficeModalOpen(false);
      fetchScoreSheet();
    } catch (error) {
      toast.error("Xatolik!");
      console.log(error);
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
        passed:
          item.isPassed === true
            ? "O'tdi"
            : item.isPassed === false
            ? "O'tmadi"
            : "Belgilanmagan",
        mustaqil: item.mustaqil || 0,
        oraliq: item.oraliq || 0,
        jami,
        nb: `${nbPercent}%`,
      });

      // ***** Background colors *****
      const passedCell = row.getCell(3);
      if (item.isPassed === true)
        passedCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF4CAF50" },
        };
      else if (item.isPassed === false)
        passedCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF44336" },
        };
      else
        passedCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF9E9E9E" },
        };

      row.getCell(4).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: item.mustaqil > 0 ? "FF4CAF50" : "FFF44336" },
      };

      row.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: item.oraliq > 0 ? "FF4CAF50" : "FFF44336" },
      };

      row.getCell(6).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: jami >= 30 ? "FF4CAF50" : "FFF44336" },
      };

      row.getCell(7).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: nbPercent >= 25 ? "FFF44336" : "FF4CAF50" },
      };

      // ***** BORDER qo‘shish *****
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
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFBBDEFB" },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FF000000" } },
        left: { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right: { style: "thin", color: { argb: "FF000000" } },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `Vedims_${groupInfo?.group?.name || "Export"}.xlsx`
    );
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
    const requestValue =
      value === "null" ? null : value === "true" ? true : false;
    const dto = {
      isPassed: requestValue,
      description: "",
    };
    try {
      await ApiCall(`/api/v1/score-sheet/isPassed/${scoreId}`, "PUT", dto);
      fetchScoreSheet();
    } catch (err) {
      toast.error("Xatolik!");
    }
  };

  const getTimeStatus = (sheetGroup) => {
    if (!sheetGroup) return { status: "unknown", message: "Ma'lumot yo'q" };

    const now = new Date();
    const start = new Date(sheetGroup.startTime);
    const end = new Date(sheetGroup.endTime);

    if (now < start) {
      return {
        status: "not-started",
        message: `Boshlanishi: ${start.toLocaleDateString("uz-UZ")}`,
      };
    } else if (now > end) {
      return {
        status: "ended",
        message: `Vaqt tugadi: ${end.toLocaleDateString("uz-UZ")}`,
      };
    } else {
      return {
        status: "active",
        message: `Baholash davom etmoqda`,
      };
    }
  };

  const fetchScoreSheet = async () => {
    try {
      setLoading(true);
      const response = await ApiCall(`/api/v1/score-sheet/${id}`, "GET");

      console.log(response.data);
      const sorted = (response.data || []).sort((a, b) =>
        a.student.fullName.localeCompare(b.student.fullName, "uz", {
          sensitivity: "base",
        })
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

  useEffect(() => {
    if (id) fetchScoreSheet();
  }, [id]);

  const openMustaqilModal = (item) => {
    setSelectedScore(item);
    setNewMustaqil(item.mustaqil ?? 0);
    setMustaqilModalOpen(true);
  };

  const openOraliqModal = (item) => {
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
    if (mustaqil > 25)
      return toast.error("Mustaqil ta'lim 25 balldan oshmaydi!");
    if (oraliq > 25) return toast.error("Oraliq nazorat 25 balldan oshmaydi!");
    if (oraliq + mustaqil > 50)
      return toast.error("Jami ball 50 dan oshmasligi kerak!");

    const dto = {
      oraliq,
      mustaqil,
      markerId: admin.id,
      lecturerId: admin.id,
      qaytnoma: Number(selectedScore.scoreSheetGroup.qaytnoma?.split("-")[0]),
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
    setLoading(true); // ❤️ Tugmani vaqtinchalik bloklash uchun

    try {
      await ApiCall(`/api/v1/score-sheet/nb/${groupId}`, "GET");
      toast.success("NB ma'lumotlari yangilandi!");
      await fetchScoreSheet(); // yangilangan ma'lumotni qayta yuklash
    } catch (error) {
      toast.error("NB yangilashda xatolik!");
      setLoading(false);
    }
  };

  const getAcceptanceBadge = (value) => {
    if (value === true)
      return (
        <span className="whitespace-nowrap rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          ✅ Tanishdim
        </span>
      );

    if (value === false)
      return (
        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
          ❌ Rad etilgan
        </span>
      );

    return (
      <span className="whitespace-nowrap rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
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
    const withScores = scoreSheets.filter(
      (item) => (item.mustaqil || 0) + (item.oraliq || 0) > 0
    ).length;
    const averageScore =
      totalStudents > 0
        ? scoreSheets.reduce(
            (sum, item) => sum + (item.mustaqil || 0) + (item.oraliq || 0),
            0
          ) / totalStudents
        : 0;

    return { totalStudents, withScores, averageScore: averageScore.toFixed(1) };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            {groupInfo && (
              <div className="rounded-lg border bg-white p-3 shadow-sm">
                <p className="text-sm text-gray-600">Guruh</p>
                <p className="text-lg font-bold text-gray-800">
                  {groupInfo.group?.name}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {getTimeStatus(groupInfo).message}
                </p>
              </div>
            )}
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
              <svg
                className="h-6 w-6 text-red-600"
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

              <div className="text-2xl font-medium text-red-800">
                Baholar bir marta qo'yilgandan so'ng qayta o'zgartirilmaydi.
              </div>
            </div>

            <div>
              <button
                onClick={() => updateNB(id)}
                disabled={loading}
                className={`ml-4 rounded-lg px-4 py-2 font-semibold text-white transition
                                 ${
                                   loading
                                     ? "cursor-not-allowed bg-gray-400"
                                     : "bg-purple-600 hover:bg-purple-700"
                                 }`}
              >
                {loading ? "Yuklanmoqda..." : "NBlarni yangilash"}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Jami Talabalar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalStudents}
                  </p>
                </div>
                <div className="text-blue-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Baholanganlar</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.withScores}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.totalStudents > 0
                      ? Math.round(
                          (stats.withScores / stats.totalStudents) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="text-green-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">O'rtacha Ball</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.averageScore}
                  </p>
                  <p className="text-xs text-gray-500">50 balldan</p>
                </div>
                <div className="text-purple-600">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-4 flex w-full flex-col items-end justify-between gap-4 md:flex-row">
          {/* 🔍 Qidiruv inputi */}
          <div className="w-full md:w-1/3">
            <label className="mb-1 block text-sm text-gray-600">Qidiruv</label>
            <input
              type="text"
              placeholder="Talaba ismi..."
              className="w-full rounded-lg border bg-gray-50 px-4 py-2 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 📘 Fan nomi */}
          <div className="flex w-full md:w-1/3 md:justify-center">
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
              Fan nomi: <span className="font-bold">{subjectName}</span>
            </div>
          </div>

          {/* 📥 Excel yuklash tugmasi */}
          <div className="flex w-full md:w-1/3 md:justify-end">
            <button
              onClick={() => downloadExcel()}
              className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-teal-700 active:scale-95"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Vedimsni yuklab olish
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Talaba
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Qaydnoma
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Ma'ruza
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Mustaqil
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Oraliq
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Jami baho
                    </th>
                    {isKursIshi == true && (
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Kurs ishi
                      </th>
                    )}

                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      NB FOIZI
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Holati
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {scoreSheets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg
                            className="mb-3 h-12 w-12"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="mb-1 text-lg font-medium text-gray-500">
                            Ma'lumot topilmadi
                          </p>
                          <p className="text-sm text-gray-400">
                            Hozircha baholash ma'lumotlari mavjud emas
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    scoreSheets
                      .filter((item) =>
                        item.student.fullName
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      )
                      .map((item, index) => {
                        const jami = (item.mustaqil || 0) + (item.oraliq || 0);
                        const canEdit = canEditScore(item.scoreSheetGroup);
                        const timeStatus = getTimeStatus(item.scoreSheetGroup);
                        const sababsizNb = item.sababsizNb - item.sababliNB;
                        const details =
                          item.scoreSheetGroup.curriculumSubject.subjectDetails;
                        // academic_load yig'indisi (trainingCode === 17 bo'lsa o‘tmaydi)
                        const totalLoad = details
                          .filter((d) => d.trainingCode != 17)
                          .reduce((sum, d) => sum + (d.academic_load || 0), 0);
                        const percent = (
                          (sababsizNb / totalLoad) *
                          100
                        ).toFixed(2);
                        return (
                          <tr
                            key={item.id}
                            className="transition-colors hover:bg-gray-50"
                          >
                            {/* Talaba ismi */}
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                                  <span className="text-sm font-medium text-blue-600">
                                    {item.student?.fullName?.charAt(0) || "T"}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {item.student?.fullName}
                                  </div>
                                  <div className="mt-1 flex items-center text-xs text-gray-500">
                                    <div
                                      className={`mr-2 h-2 w-2 rounded-full ${
                                        timeStatus.status === "active"
                                          ? "bg-green-500"
                                          : timeStatus.status === "not-started"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    {timeStatus.message}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="whitespace-nowrap px-3 py-3 text-center">
                              {item?.scoreSheetGroup.qaytnoma}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <select
                                className="rounded border px-2 py-1 text-sm hover:cursor-not-allowed"
                                disabled={true}
                                value={
                                  item.isPassed === null
                                    ? "null"
                                    : item.isPassed === true
                                    ? "true"
                                    : "false"
                                }
                                onChange={(e) =>
                                  handlePassedChange(item.id, e.target.value)
                                }
                              >
                                <option value="null" disabled hidden>
                                  Belgilanmagan
                                </option>
                                <option value="true">O'tdi</option>
                                <option value="false">O'tmadi</option>
                              </select>
                            </td>
                            {/* Mustaqil ta'lim */}
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={() => openMustaqilModal(item)}
                                disabled={
                                  item?.mustaqil == 0 || item?.mustaqil == null
                                    ? false
                                    : true
                                }
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors
                                ${
                                  canEdit
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"
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
                                onClick={() => openOraliqModal(item)}
                                disabled={true}
                                className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors
                                ${
                                  canEdit
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-50"
                                }
                                ${getScoreColor(item.oraliq)}
                                `}
                              >
                                {item.oraliq || 0}
                              </button>
                            </td>
                            {/* Jami ball */}
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`inline-flex h-8 w-14 items-center justify-center rounded border-2 text-sm font-bold ${getTotalScoreColor(
                                  jami
                                )}`}
                              >
                                {jami}
                              </span>
                            </td>

                            {isKursIshi == true && (
                              <td className="px-3 py-3 text-center">
                                <button
                                  onClick={() => openExtraModal(item)}
                                  className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors
      ${canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
      ${getKursIshiColor(item.kursIshi || 0)}
    `}
                                >
                                  {item.kursIshi || 0}
                                </button>
                              </td>
                            )}
                            {/* Jami NB */}
                            {item.rektor === true ? (
                              <td className="max-w-[200px] whitespace-normal break-words px-3 py-3 text-center">
                                {item?.rektorDescription}
                              </td>
                            ) : (
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={`inline-flex h-8 w-14 items-center justify-center rounded text-sm font-bold
                              ${
                                percent >= 25
                                  ? "bg-red-500 text-white"
                                  : "bg-green-500 text-white"
                              }
                              `}
                                >
                                  {percent} %
                                </span>
                              </td>
                            )}
                            {/* Talaba imzosi */}
                            <td className="px-3 py-3 text-center">
                              {getAcceptanceBadge(item.isAccepted)}
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
        onRequestClose={() => {}} // ❌ FONGA BOSILSA YOPILMAYDI
        shouldCloseOnOverlayClick={false} // 🔥 Asosiy blok
        className="mx-auto mt-24 w-full max-w-md rounded-xl bg-white shadow-2xl outline-none lg:max-w-lg"
        overlayClassName="
        fixed inset-0 
        bg-black bg-opacity-50 
        backdrop-blur-md 
        flex justify-center items-start pt-20 z-50
    "
      >
        <div className="p-8">
          {" "}
          {/* 🔥 Kattaroq padding */}
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            {" "}
            {/* 🔥 Katta sarlavha */}
            Mustaqil Ta'lim Bahosi
          </h2>
          <p className="mb-5 text-2xl text-red-500">
            Talaba:{" "}
            <span className="font-semibold">
              {selectedScore?.student?.fullName}
            </span>
          </p>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ball (0–25)
            </label>

            <input
              type="number"
              value={newMustaqil}
              onChange={(e) => setNewMustaqil(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-semibold focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              min={0}
              max={25}
              placeholder="0"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Min: 0</span>
              <span>Max: 25</span>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => setMustaqilModalOpen(false)}
            >
              Bekor qilish
            </button>

            <button
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
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
        onRequestClose={() => {}} // ❌ Fonga bosilganida yopilmasin
        shouldCloseOnOverlayClick={false} // 🔥 Asosiy blok
        className="mx-auto mt-24 w-full max-w-md rounded-xl bg-white shadow-2xl outline-none lg:max-w-lg"
        overlayClassName="
        fixed inset-0 
        bg-black bg-opacity-50 
        backdrop-blur-md 
        flex justify-center items-start pt-20 z-50
    "
      >
        <div className="p-8">
          {" "}
          {/* 🔥 Kattaroq modal */}
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Oraliq Nazorat Bahosi
          </h2>
          <p className="mb-5 text-2xl text-red-500">
            Talaba:{" "}
            <span className="font-semibold">
              {selectedScore?.student?.fullName}
            </span>
          </p>
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ball (0–25)
            </label>

            <input
              type="number"
              value={newOraliq}
              onChange={(e) => setNewOraliq(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-semibold focus:border-green-500 focus:ring-1 focus:ring-green-500"
              min={0}
              max={25}
              placeholder="0"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Min: 0</span>
              <span>Max: 25</span>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-2">
            <button
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
              onClick={() => setOraliqModalOpen(false)}
            >
              Bekor qilish
            </button>

            <button
              className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
              onClick={() => updateScore("oraliq")}
            >
              Saqlash
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={officeModalOpen}
        onRequestClose={() => {}}
        shouldCloseOnOverlayClick={false}
        className="mx-auto mt-24 w-full max-w-md rounded-xl bg-white shadow-2xl outline-none lg:max-w-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-start pt-20 z-50"
      >
        <div className="p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Talabani chaqirish
          </h2>

          <p className="mb-5 text-lg text-gray-700">
            Talaba:{" "}
            <span className="font-semibold">
              {selectedScore?.student?.fullName}
            </span>
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Izoh (majburiy)
            </label>

            <textarea
              value={officeDescription}
              onChange={(e) => setOfficeDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows="4"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => setOfficeModalOpen(false)}
            >
              Bekor qilish
            </button>

            <button
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
              onClick={() => updateOfficeStatus(true)} // TRUE yuboriladi
            >
              Saqlash
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={extraModalOpen}
        onRequestClose={() => {}}
        shouldCloseOnOverlayClick={false}
        className="mx-auto mt-24 w-full max-w-md rounded-xl bg-white shadow-2xl outline-none lg:max-w-lg"
        overlayClassName="
          fixed inset-0 
          bg-black bg-opacity-50 
          backdrop-blur-md 
          flex justify-center items-start pt-20 z-50
        "
      >
        <div className="p-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Kurs ishi bahosi
          </h2>

          <p className="mb-5 text-2xl text-red-500">
            Talaba:{" "}
            <span className="font-semibold">
              {selectedExtra?.student?.fullName}
            </span>
          </p>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ball (0-100)
            </label>

            <input
              type="number"
              value={newExtraScore}
              onChange={(e) => setNewExtraScore(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-semibold focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              min={0}
              max={100}
            />

            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Min: 0</span>
              <span>Max: 100</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:bg-gray-100"
              onClick={() => setExtraModalOpen(false)}
            >
              Bekor qilish
            </button>

            <button
              className="rounded-lg bg-purple-600 px-5 py-2.5 text-white hover:bg-purple-700"
              onClick={updateExtraScore}
            >
              Saqlash
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ScoreStudent;
