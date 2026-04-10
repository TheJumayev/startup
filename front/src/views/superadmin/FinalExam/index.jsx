import React, { useEffect, useState, useCallback } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: i + 1, // backend Integer kutadi
  label: `${i + 1}-semestr`,
}));

const LS_KEY = "final_exam_filters";

const defaultFilters = {
  group: null,
  semester: null,
  search: "",
};

const loadLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...defaultFilters, ...JSON.parse(raw) } : defaultFilters;
  } catch {
    return defaultFilters;
  }
};

const saveLS = (f) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(f));
  } catch {}
};

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const formatDateTime = (str) => {
  if (!str) return "—";
  return new Date(str).toLocaleString("uz-UZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const canEnterExam = (startTime) => {
  if (!startTime) return false;
  const now = new Date();
  const start = new Date(startTime);
  return now >= new Date(start.getTime() - 5 * 60 * 1000);
};

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
function EditFinalExam() {
  const navigate = useNavigate();

  // ── Data ──────────────────────────────
  const [groups, setGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ── UI ────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [navigateLoading, setNavigateLoading] = useState(false);

  // ── Filters ───────────────────────────
  const [tempFilters, setTempFilters] = useState(loadLS);
  const [activeFilters, setActiveFilters] = useState(loadLS);
  const setTempField = (key, val) =>
    setTempFilters((p) => ({ ...p, [key]: val }));

  // ─────────────────────────────────────────
  // CLIENT-SIDE: fan nomi qidiruvi + sana
  // ─────────────────────────────────────────
  const filteredExams = exams.filter((exam) => {
    const { search, date } = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      const inName = exam.name?.toLowerCase().includes(q);
      const inSubject = exam.curriculumSubject?.subject?.name
        ?.toLowerCase()
        .includes(q);
      if (!inName && !inSubject) return false;
    }

    if (date && exam.startTime?.slice(0, 10) !== date) return false;

    return true;
  });

  // ─────────────────────────────────────────
  // FETCH: guruhlar
  // ─────────────────────────────────────────
  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      setGroups(res.data.map((g) => ({ value: g.id, label: g.name })));
    } catch {
      console.error("Guruhlarni yuklab bo'lmadi");
    }
  };

  // ─────────────────────────────────────────
  // FETCH: filter bilan imtihonlar
  // GET /api/v1/final-exam/filter?semesterCode=...&groupId=...
  // ─────────────────────────────────────────
  const fetchExams = useCallback(
    async (filters) => {
      const { semester, group } = filters ?? activeFilters;
      if (!semester || !group) return;

      const semesterCode = String(Number(semester.value) + 10);
      const groupId = group.value;

      // faqat guruh + semestr serverga — date va search client-side
      const url = `/api/v1/final-exam/filter?semesterCode=${semesterCode}&groupId=${groupId}`;

      try {
        setLoading(true);
        const res = await ApiCall(url, "GET");
        setExams(Array.isArray(res.data) ? res.data : []);
        setHasSearched(true);
      } catch (e) {
        console.error("Xatolik:", e);
        setExams([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [activeFilters]
  );
  // ─────────────────────────────────────────
  // INITIAL LOAD
  // ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const groupRes = await ApiCall("/api/v1/groups", "GET");
        const mappedGroups = groupRes.data.map((g) => ({
          value: g.id,
          label: g.name,
        }));
        setGroups(mappedGroups);

        // LocalStorage'dan tiklash
        const saved = loadLS();
        if (saved.group && saved.semester) {
          const found = mappedGroups.find((x) => x.value === saved.group.value);
          const restoredFilters = { ...saved, group: found || null };
          setTempFilters(restoredFilters);
          setActiveFilters(restoredFilters);
          await fetchExams(restoredFilters);
        } else {
          setExams([]);
          setHasSearched(false);
        }
      } catch {
        console.error("Yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────
  // FILTER ACTIONS
  // ─────────────────────────────────────────
  const applyFilters = () => {
    if (!tempFilters.group || !tempFilters.semester) {
      alert("⚠️ Guruh va semestrni tanlang!");
      return;
    }
    setActiveFilters(tempFilters);
    saveLS(tempFilters);
    fetchExams(tempFilters);
  };

  const clearFilters = () => {
    setTempFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setExams([]);
    setHasSearched(false);
    localStorage.removeItem(LS_KEY);
  };

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────
  const updateStatus = async (id) => {
    try {
      await ApiCall(`/api/v1/final-exam-student/change-status/${id}`, "PUT");
      setExams((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, status: !ex.status } : ex))
      );
      return true;
    } catch (err) {
      console.error("Status o'zgartirishda xatolik:", err);
      return false;
    }
  };

  const deleteFinalExam = async (id) => {
    if (!window.confirm("Rostdan ham ushbu imtihonni o'chirmoqchimisiz?"))
      return;
    try {
      await ApiCall(`/api/v1/final-exam/${id}`, "DELETE");
      setExams((prev) => prev.filter((ex) => ex.id !== id));
      alert("Imtihon muvaffaqiyatli o'chirildi!");
    } catch {
      alert("Xatolik! Imtihon o'chirilmedi.");
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setNavigateLoading(true);
      const response = await fetch(
        `${baseUrl}/api/v1/final-exam-student/allHisobot/simple`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        }
      );
      if (!response.ok) throw new Error(`Server xatosi: ${response.status}`);
      const blob = await response.blob();
      if (blob.size === 0) throw new Error("Fayl bo'sh");

      let fileName = "guruh_hisobot.xlsx";
      const cd = response.headers.get("content-disposition");
      if (cd) {
        const m = cd.match(/filename="?(.+?)"?$/);
        if (m?.[1]) fileName = m[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      alert("Excel fayli muvaffaqiyatli yuklandi!");
    } catch (error) {
      alert("Xatolik: " + error.message);
    } finally {
      setNavigateLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="font-medium text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <>
      {/* Global loading overlay */}
      {navigateLoading && (
        <div className="bg-black/40 fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm">
          <div className="flex items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-2xl">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
            <span className="text-lg font-semibold text-gray-700">
              Yuklanmoqda...
            </span>
          </div>
        </div>
      )}

      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-7xl">
          {/* ── Header ── */}
          <div className="mb-6 rounded-2xl border-l-4 border-blue-600 bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-800 lg:text-3xl">
                  Final imtihonlar ro'yxati
                </h1>
                <p className="text-gray-600">
                  Barcha final imtihonlarni boshqarish va tahrirlash
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <button
                  onClick={handleDownloadExcel}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-green-700 hover:to-green-800 hover:shadow-lg"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Excel yuklab olish
                </button>
                <button
                  onClick={() => navigate("/superadmin/final-exam/create")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Yangi imtihon yaratish
                </button>
              </div>
            </div>

            {/* ── Filters ── */}
            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
                {/* Guruh — majburiy */}
                <Select
                  options={groups}
                  value={tempFilters.group}
                  onChange={(v) => setTempField("group", v)}
                  placeholder="Guruh *"
                  isSearchable
                  classNamePrefix="react-select"
                />

                {/* Semestr — majburiy */}
                <Select
                  options={SEMESTER_OPTIONS}
                  value={tempFilters.semester}
                  onChange={(v) => setTempField("semester", v)}
                  placeholder="Semestr *"
                  classNamePrefix="react-select"
                />

                {/* Sana */}
                {/* Yaratilgan sana — real-time client-side */}
                <input
                  type="date"
                  value={tempFilters.date}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTempField("date", val);
                    setActiveFilters((p) => ({ ...p, date: val }));
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none"
                />

                {/* Umumiy qidiruv — real-time client-side */}
                <div className="relative md:col-span-2">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Fan yoki imtihon nomi..."
                    value={tempFilters.search}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTempField("search", val);
                      setActiveFilters((p) => ({ ...p, search: val }));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-400 focus:outline-none"
                  />
                </div>

                <button
                  onClick={applyFilters}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Filtrlash
                </button>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Tozalash
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                * Guruh va semestr majburiy — filtrlash uchun ikkalasini tanlang
              </p>
            </div>
          </div>

          {/* ── Jami ── */}
          {hasSearched && (
            <div className="mb-4 flex justify-end">
              <p className="text-lg font-semibold text-gray-600">
                Jami:{" "}
                <span className="text-blue-600">{filteredExams.length}</span> ta
              </p>
            </div>
          )}

          {/* ── Holat 1: Qidiruv qilinmagan ── */}
          {!hasSearched ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              <p className="mb-1 text-lg font-medium text-gray-400">
                Qidiruv amalga oshirilmagan
              </p>
              <p className="text-sm text-gray-400">
                Guruh va semestrni tanlang, so'ng "Filtrlash" tugmasini bosing
              </p>
            </div>
          ) : filteredExams.length === 0 ? (
            /* ── Holat 2: Natija yo'q ── */
            <div className="rounded-2xl border border-yellow-200 bg-white p-8 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Ma'lumot topilmadi
              </h3>
              <p className="text-gray-600">
                Tanlangan guruh va semestr bo'yicha imtihon mavjud emas
              </p>
            </div>
          ) : (
            /* ── Holat 3: Desktop jadval ── */
            <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                      {[
                        "№",
                        "Imtihon nomi",
                        "Guruh",
                        "Boshlanish",
                        "Tugash",
                        "Amal",
                      ].map((h) => (
                        <th
                          key={h}
                          className={`p-4 font-semibold text-gray-700 ${
                            h === "Amal" ? "text-center" : "text-left"
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExams.map((exam, index) => (
                      <tr
                        key={exam.id}
                        className="transition-colors hover:bg-blue-50"
                      >
                        <td className="p-4 font-medium text-gray-600">
                          {index + 1}
                        </td>

                        <td className="p-4 font-semibold text-gray-800">
                          {exam.name}
                        </td>

                        <td className="whitespace-nowrap p-4">
                          <span
                            onClick={() =>
                              navigate(
                                `/superadmin/final-exam/hisobot/${exam.id}`,
                                {
                                  state: {
                                    groupId: exam.group?.id,
                                    groupName: exam.group?.name,
                                    subjects: [
                                      {
                                        id: exam.curriculumSubject?.id,
                                        name: exam.curriculumSubject?.subject
                                          ?.name,
                                      },
                                    ],
                                  },
                                }
                              )
                            }
                            className="inline-flex cursor-pointer items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 transition hover:bg-blue-200"
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
                          <div className="flex items-center justify-center gap-2">
                            {/* Tahrirlash */}
                            <button
                              onClick={() => {
                                setNavigateLoading(true);
                                navigate(
                                  `/superadmin/final-exam/edit/${exam.id}`
                                );
                              }}
                              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600 hover:shadow-md"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Tahrirlash
                            </button>

                            {/* Talabalar */}
                            <button
                              disabled={!canEnterExam(exam.startTime)}
                              onClick={async () => {
                                if (!canEnterExam(exam.startTime)) return;
                                setNavigateLoading(true);
                                await updateStatus(exam.id);
                                navigate(
                                  `/superadmin/final-exam/students/${exam.id}`
                                );
                              }}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md ${
                                canEnterExam(exam.startTime)
                                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                                  : "cursor-not-allowed bg-gray-200 text-gray-400"
                              }`}
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
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                              </svg>
                              Talabalar
                            </button>

                            {/* Status toggle */}
                            <label className="relative inline-block h-[26px] w-[50px] cursor-pointer">
                              <input
                                type="checkbox"
                                className="h-0 w-0 opacity-0"
                                checked={exam.status}
                                onChange={async () => {
                                  await ApiCall(
                                    `/api/v1/final-exam/statusForView/${exam.id}`,
                                    "GET"
                                  );
                                  await fetchExams(activeFilters);
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  cursor: "pointer",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: exam.status
                                    ? "#4CAF50"
                                    : "#ccc",
                                  transition: ".4s",
                                  borderRadius: "34px",
                                }}
                              />
                              <span
                                style={{
                                  position: "absolute",
                                  height: "20px",
                                  width: "20px",
                                  left: exam.status ? "28px" : "4px",
                                  bottom: "3px",
                                  backgroundColor: "white",
                                  transition: ".4s",
                                  borderRadius: "50%",
                                }}
                              />
                            </label>

                            {/* O'chirish */}
                            <button
                              onClick={() => deleteFinalExam(exam.id)}
                              className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600 hover:shadow-md"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3m4 0H5"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Mobile cards ── */}
              <div className="space-y-4 p-4 lg:hidden">
                {filteredExams.map((exam, index) => (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                            {index + 1}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {exam.name}
                          </h3>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {exam.group?.name || "—"}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-green-600"
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
                          Boshlanish: {formatDateTime(exam.startTime)}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-red-600"
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
                          Tugash: {formatDateTime(exam.endTime)}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setNavigateLoading(true);
                            navigate(`/superadmin/final-exam/edit/${exam.id}`);
                          }}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Tahrirlash
                        </button>
                        <button
                          disabled={!canEnterExam(exam.startTime)}
                          onClick={async () => {
                            if (!canEnterExam(exam.startTime)) return;
                            setNavigateLoading(true);
                            await updateStatus(exam.id);
                            navigate(
                              `/superadmin/final-exam/students/${exam.id}`
                            );
                          }}
                          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                            canEnterExam(exam.startTime)
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                              : "cursor-not-allowed bg-gray-200 text-gray-400"
                          }`}
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
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
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
