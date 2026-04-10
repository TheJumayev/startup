import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function ScoreSheetStudent() {
  const [scoreSheets, setScoreSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const [finalExamBalls, setFinalExamBalls] = useState({});
  const [studentId, setStudentId] = useState(null);
  const getFinalExamColor = (ball) => {
    if (ball < 30) return "bg-red-500 text-white"; // 2
    if (ball >= 30 && ball < 36) return "bg-yellow-400 text-black"; // 3
    if (ball >= 36 && ball < 45) return "bg-blue-500 text-white"; // 4
    if (ball >= 45) return "bg-green-500 text-white"; // 5
    return "bg-gray-300 text-gray-600";
  };

  useEffect(() => {
    if (scoreSheets.length > 0) {
      loadFinalBalls();
    }
  }, [scoreSheets]);

  const loadFinalBalls = async () => {
    if (!studentId) return; // student aniqlanmaguncha ishlamasin

    const result = {};

    for (const item of scoreSheets) {
      const subjectId = item.scoreSheetGroup?.curriculumSubject?.id;

      try {
        const res = await ApiCall(
          `/api/v1/final-exam-student/finalBall/${subjectId}/${studentId}`,
          "GET"
        );

        result[subjectId] = res.data; // integer bo‘lishi kerak
      } catch (err) {
        result[subjectId] = 0;
      }
    }

    setFinalExamBalls(result);
  };

  // ⭐ token localStorage dan
  const token = localStorage.getItem("authToken");

  // 🔹 Student ma'lumotlarini olish
  const fetchStudentData = async () => {
    try {
      setLoading(true);

      if (!token) {
        navigate("/student/login");
        return;
      }

      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      const student = response.data;

      if (!student?.id) {
        toast.error("Talaba ID topilmadi!");
        return navigate("/student/login");
      }

      // ⭐ Endi baholarni olish
      setStudentId(student.id);
      fetchScores(student.id);
    } catch (error) {
      console.error("Error fetching student data:", error);
      localStorage.removeItem("authToken");
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Talabaning baholarini olish
  const fetchScores = async (studentId) => {
    try {
      setLoading(true);

      const res = await ApiCall(
        `/api/v1/score-sheet-student/${studentId}`,
        "GET"
      );
      console.log(res.data);

      setScoreSheets(res.data || []);
    } catch (err) {
      toast.error("Ma'lumot yuklanmadi!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  // ⭐ Tanishdim tugmasi
  const acceptScore = async (scoreSheetId) => {
    try {
      setActionLoading(scoreSheetId);
      await ApiCall(
        `/api/v1/score-sheet-student/accept/${scoreSheetId}`,
        "GET"
      );
      toast.success("✅ Tanishganingiz tasdiqlandi!");

      // 🔥 qayta yuklash uchun student ID kerak (yana backenddan olish xavfsizroq)
      fetchStudentData();
    } catch (err) {
      toast.error("❌ Xatolik! Tanishganlik tasdiqlanmadi");
    } finally {
      setActionLoading(null);
    }
  };

  const getAcceptanceBadge = (value) => {
    if (value === true)
      return (
        <div className="flex flex-col items-center">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
            <svg
              className="h-4 w-4 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-xs font-medium text-green-600">
            Tasdiqlangan
          </span>
        </div>
      );

    return (
      <div className="flex flex-col items-center">
        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-400">
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <span className="text-xs font-medium text-gray-600">Kutilmoqda</span>
      </div>
    );
  };

  const getKursIshiColor = (score) => {
    if (score >= 90) return "bg-green-600";
    if (score >= 75) return "bg-blue-600";
    if (score >= 60) return "bg-yellow-500 text-black";
    if (score > 0) return "bg-red-600";
    return "bg-gray-400";
  };

  const getScoreColor = (score, maxScore = 25) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "bg-green-500 text-white";
    if (percentage >= 60) return "bg-blue-500 text-white";
    if (percentage >= 40) return "bg-yellow-500 text-white";
    if (score > 0) return "bg-orange-500 text-white";
    return "bg-gray-300 text-gray-600";
  };

  const getTotalScoreColor = (score) => {
    if (score >= 40) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 30) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 20) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const calculateStats = () => {
    const totalSubjects = scoreSheets.length;
    const acceptedCount = scoreSheets.filter(
      (item) => item.isAccepted === true
    ).length;
    const totalScore = scoreSheets.reduce(
      (sum, item) => sum + (item.mustaqil || 0) + (item.oraliq || 0),
      0
    );
    const averageScore =
      totalSubjects > 0 ? (totalScore / totalSubjects).toFixed(1) : 0;

    return { totalSubjects, acceptedCount, averageScore };
  };

  const stats = calculateStats();
  // ⭐ Kurs ishi bor fanlar (status = true va baho ≠ null)
  const kursIshiList = scoreSheets.filter(
    (item) => item.kursIshiStatus === true && item.kursIshi != null
  );

  // Loading komponenti
  const LoadingSpinner = ({ size = "small" }) => {
    const sizes = {
      small: "w-4 h-4",
      medium: "w-6 h-6",
      large: "w-8 h-8",
    };

    return (
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`}
      ></div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="mb-6 flex flex-col items-start justify-between sm:flex-row sm:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Mening Baholarim
              </h1>
              <p className="text-gray-600">
                Barcha fanlar bo'yicha olingan baholar
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border-l-4 border-blue-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Jami Fanlar
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.totalSubjects}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-l-4 border-green-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tasdiqlangan
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.acceptedCount}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {stats.totalSubjects > 0
                      ? Math.round(
                          (stats.acceptedCount / stats.totalSubjects) * 100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
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

            <div className="rounded-xl border-l-4 border-purple-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    O'rtacha Ball
                  </p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.averageScore}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">50 balldan</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-blue-500"></div>
              <p className="text-lg text-gray-600">Baholar yuklanmoqda...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {scoreSheets.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-12 w-12 text-gray-400"
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
                </div>
                <p className="mb-2 text-xl font-medium text-gray-500">
                  Hozircha baholar mavjud emas
                </p>
                <p className="text-gray-400">
                  Baholar qo'yilgandan so'ng bu yerda ko'rasiz
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Fan
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Office Registrator
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Mustaqil
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Oraliq
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Jami
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Imthon baholari
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Seminarchi
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Ma'ruzachi
                      </th>
                      {/* {scoreSheets.some(s => s.scoreSheetGroup?.curriculumSubject?.semesterName) && (
                                                <th className="px-4 py-4 text-center font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                                    Semester
                                                </th>
                                            )} */}
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Qaytnoma
                      </th>

                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Holati
                      </th>
                      <th className="px-4 py-4 text-center text-sm font-semibold uppercase tracking-wider text-gray-700">
                        Amal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {scoreSheets.map((item, index) => {
                      const subjectId =
                        item.scoreSheetGroup?.curriculumSubject?.id;
                      const finalBall = finalExamBalls[subjectId] ?? 0;
                      const jami = (item.mustaqil || 0) + (item.oraliq || 0);
                      const cannotAccept =
                        (item.mustaqil ?? 0) === 0 || (item.oraliq ?? 0) === 0;
                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          {/* FAN NOMI */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white
                                                                ${
                                                                  index % 4 ===
                                                                  0
                                                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                                                                    : index %
                                                                        4 ===
                                                                      1
                                                                    ? "bg-gradient-to-r from-purple-500 to-pink-500"
                                                                    : index %
                                                                        4 ===
                                                                      2
                                                                    ? "to-emerald-500 bg-gradient-to-r from-green-500"
                                                                    : "bg-gradient-to-r from-orange-500 to-red-500"
                                                                }`}
                              >
                                {item.scoreSheetGroup?.curriculumSubject?.subject?.name?.charAt(
                                  0
                                ) || "F"}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {
                                    item.scoreSheetGroup?.curriculumSubject
                                      ?.subject?.name
                                  }
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* MUSTAQIL */}
                          <td className="px-4 py-4 text-center">
                            <div className="text-sm text-gray-900">
                              {item.getIsOffice === true ? (
                                <span className="text-xl font-semibold text-red-500">
                                  {item.officeDescription
                                    ? item.officeDescription
                                    : "-"}
                                </span>
                              ) : (
                                <div>-</div>
                              )}
                            </div>
                          </td>
                          {/* MUSTAQIL */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-white ${getScoreColor(
                                item.mustaqil
                              )}`}
                            >
                              {item.mustaqil || 0}
                            </span>
                          </td>

                          {/* ORALIQ */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-white ${getScoreColor(
                                item.oraliq
                              )}`}
                            >
                              {item.oraliq || 0}
                            </span>
                          </td>

                          {/* JAMI */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex h-10 w-16 items-center justify-center rounded-lg border-2 text-lg font-bold ${getTotalScoreColor(
                                jami
                              )}`}
                            >
                              {jami}
                            </span>
                          </td>
                          {/* YAKUNIY */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-white ${getFinalExamColor(
                                finalBall
                              )}`}
                            >
                              {finalBall}
                            </span>
                          </td>

                          {/* O'QITUVCHI */}
                          <td className="px-4 py-4 text-center">
                            <div className="text-sm text-gray-900">
                              {item.scoreSheetGroup?.teacher?.name || "—"}
                            </div>
                          </td>
                          {/* O'QITUVCHI */}
                          <td className="px-4 py-4 text-center">
                            <div className="text-sm text-gray-900">
                              {item.scoreSheetGroup?.lecturer?.name || "—"}
                            </div>
                          </td>

                          {/* SEMESTER */}
                          {/* {scoreSheets.some(s => s.scoreSheetGroup?.curriculumSubject?.semesterName) && (
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {item.scoreSheetGroup?.curriculumSubject?.semesterName || "—"}
                                                            </span>
                                                        </td>
                                                    )} */}
                          <td className="px-4 py-4 text-center">
                            <span
                              className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs 
        font-medium text-indigo-800"
                            >
                              {item.scoreSheetGroup?.qaytnoma || "—"}
                            </span>
                          </td>

                          {/* HOLAT */}
                          <td className="px-4 py-4 text-center">
                            {getAcceptanceBadge(item.isAccepted)}
                          </td>

                          {/* AMAL */}
                          <td className="px-4 py-4 text-center">
                            {item.rektor !== true ? (
                              item.isAccepted ? (
                                <button
                                  disabled
                                  className="flex cursor-not-allowed items-center space-x-2 rounded-lg bg-gray-300 px-4 py-2 font-medium text-gray-500"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span>Tasdiqlangan</span>
                                </button>
                              ) : cannotAccept ? (
                                <button
                                  disabled
                                  className="flex cursor-not-allowed items-center space-x-2 rounded-lg bg-yellow-100 px-4 py-2 font-medium text-yellow-800"
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
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>Baho kutilmoqda</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => acceptScore(item.id)}
                                  disabled={actionLoading === item.id}
                                  className="flex items-center space-x-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {actionLoading === item.id ? (
                                    <LoadingSpinner size="small" />
                                  ) : (
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                  <span>
                                    {actionLoading === item.id
                                      ? "Tasdiqlanmoqda..."
                                      : "Tanishdim"}
                                  </span>
                                </button>
                              )
                            ) : (
                              <span className="text-red-500">
                                {item.rektorDescription}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {kursIshiList.length > 0 && (
              <div className="mt-10 rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Kurs ishi baholari
                  </h2>
                  <div className="text-sm text-gray-500">
                    Jami: {kursIshiList.length} ta fan
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  <table className="w-full min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          №
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Fan nomi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                          Kurs ishi bahosi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                      {kursIshiList.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`transition-all duration-200 hover:bg-blue-50 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                        >
                          {/* № */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="font-medium text-gray-700">
                              {index + 1}
                            </span>
                          </td>

                          {/* Fan nomi */}
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.scoreSheetGroup?.curriculumSubject?.subject
                                ?.name || "—"}
                            </div>
                            {item.scoreSheetGroup?.curriculumSubject?.subject
                              ?.code && (
                              <div className="mt-1 text-xs text-gray-500">
                                Kod:{" "}
                                {
                                  item.scoreSheetGroup.curriculumSubject.subject
                                    .code
                                }
                              </div>
                            )}
                          </td>

                          {/* Baho */}
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center">
                              <div
                                className={`rounded-lg px-4 py-2 font-semibold shadow-sm ${getKursIshiColor(
                                  item.kursIshi
                                )}`}
                              >
                                <span className="text-white">
                                  {item.kursIshi}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreSheetStudent;
