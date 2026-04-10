import React, { useEffect, useMemo, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";
import Select from "react-select";
import { FileSpreadsheet } from "lucide-react";

import {
  CalendarDays,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  Users,
  BookOpen,
  User,
  Building,
  Image as ImageIcon,
  FileText,
  Search,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function GroupsSchedule() {
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const navigate = useNavigate();

  /* ===============================
     FILTER STATE WITH LOCALSTORAGE
  =============================== */
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem("scheduleSelectedDate");
    return savedDate || new Date().toISOString().slice(0, 10);
  });

  const [groupFilter, setGroupFilter] = useState(() => {
    const saved = localStorage.getItem("scheduleGroupFilter");
    return saved ? JSON.parse(saved) : null;
  });

  const [pairFilter, setPairFilter] = useState(() => {
    const saved = localStorage.getItem("schedulePairFilter");
    return saved ? JSON.parse(saved) : null;
  });
  const [existingImages, setExistingImages] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState("");
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullscreenView, setFullscreenView] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem("scheduleSearchQuery") || "";
  });

  const [reportLoading, setReportLoading] = useState(false);
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const handleDownloadAllReport = async () => {
    if (!reportFromDate || !reportToDate) {
      toast.error("Iltimos, boshlang'ich va tugash sanalarini kiriting.");
      return;
    }
    if (new Date(reportFromDate) > new Date(reportToDate)) {
      toast.error(
        "Boshlang'ich sana tugash sanadan katta bo'lishi mumkin emas."
      );
      return;
    }

    setReportLoading(true);

    try {
      const token = localStorage.getItem("authToken"); // ✅ to'g'rilandi

      const response = await fetch(
        baseUrl + `/api/v1/attendance-offline/report/all`,
        {
          // ✅ baseUrl qo'shildi
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            fromDate: reportFromDate,
            toDate: reportToDate,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server xatosi:", response.status, errorText);
        toast.error(`Server xatosi ${response.status}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Davomat_${reportFromDate}_${reportToDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Hisobot yuklab olindi ✅");
      setShowReportModal(false);
      setReportFromDate("");
      setReportToDate("");
    } catch (err) {
      console.error("❌ Catch:", err);
      toast.error("Hisobot yuklab olishda xatolik ❌");
    } finally {
      setReportLoading(false);
    }
  };

  /* ===============================
     LOAD FROM BACKEND
  =============================== */
  const fetchSchedules = async (date) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/schedule-list-controller/admin/get-all/${date}`,
        "GET"
      );
      setSchedules(res?.data || []);
    } catch {
      toast.error("Dars jadvali yuklanmadi ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules(selectedDate);
  }, [selectedDate]);

  /* ===============================
     HANDLE DATE CHANGE WITH LOCALSTORAGE
  =============================== */
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    localStorage.setItem("scheduleSelectedDate", newDate);
  };

  const setToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    localStorage.setItem("scheduleSelectedDate", today);
  };

  /* ===============================
     FRONTEND FILTER OPTIONS
  =============================== */
  const groupOptions = useMemo(() => {
    const unique = [
      ...new Set(schedules.map((s) => s.groups?.name).filter(Boolean)),
    ];
    return unique.map((g) => ({ label: g, value: g }));
  }, [schedules]);

  const pairOptions = useMemo(() => {
    const unique = [
      ...new Set(schedules.map((s) => s.lessonPairName).filter(Boolean)),
    ];
    return unique.map((p) => ({ label: p, value: p }));
  }, [schedules]);

  /* ===============================
     FRONTEND FILTER LOGIC WITH SEARCH
  =============================== */
  const filteredSchedules = useMemo(() => {
    return schedules.filter((item) => {
      const byGroup = !groupFilter || item.groups?.name === groupFilter.value;
      const byPair = !pairFilter || item.lessonPairName === pairFilter.value;
      const bySearch =
        !searchQuery ||
        item.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.groups?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.auditoriumName?.toLowerCase().includes(searchQuery.toLowerCase());

      return byGroup && byPair && bySearch;
    });
  }, [schedules, groupFilter, pairFilter, searchQuery]);

  /* ===============================
     IMAGE VIEWER FUNCTIONS
  =============================== */
  const openImageViewer = (schedule) => {
    setActiveSchedule(schedule);
    setExistingImages(schedule.attachment || []);
    setDescription(schedule.sekretarDescription || "");
    setCurrentImageIndex(0);
    setOpenModal(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === existingImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? existingImages.length - 1 : prev - 1
    );
  };

  const downloadImage = (imageId) => {
    window.open(`${baseUrl}/api/v1/file/download/${imageId}`, "_blank");
  };

  /* ===============================
     DATE FORMATTING
  =============================== */
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const months = [
      "yan",
      "fev",
      "mar",
      "apr",
      "may",
      "iyn",
      "iyl",
      "avg",
      "sen",
      "okt",
      "noy",
      "dek",
    ];

    const weekdays = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

    return `${weekdays[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  /* ===============================
     RESET ALL FILTERS
  =============================== */
  const resetFilters = () => {
    setGroupFilter(null);
    setPairFilter(null);
    setSearchQuery("");
    localStorage.removeItem("scheduleSearchQuery");
    localStorage.removeItem("scheduleGroupFilter");
    localStorage.removeItem("schedulePairFilter");
  };

  /* ===============================
     SKELETON LOADER
  =============================== */
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-6 w-24 rounded-lg bg-gray-200"></div>
        <div className="h-6 w-16 rounded-lg bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        <div className="h-4 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <Breadcrumbs />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                📅 Kunlik dars jadvali
              </h1>
              <p className="mt-2 text-blue-100">{formatDate(selectedDate)}</p>
            </div>

            {/* DATE PICKER WITH TODAY BUTTON */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/30"
              >
                <FileSpreadsheet size={16} />
                Hisobot yuklab olish
              </button>
              <button
                onClick={setToToday}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/30"
              >
                <Calendar size={16} />
                Bugun
              </button>
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
                <CalendarDays size={20} className="text-blue-200" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="rounded bg-white/10 px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* SEARCH */}
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  localStorage.setItem("scheduleSearchQuery", value);
                }}
                placeholder="Fan, guruh, o'qituvchi yoki auditoriya bo'yicha qidirish..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* GROUP FILTER */}
            <Select
              value={groupFilter}
              onChange={(value) => {
                setGroupFilter(value);
                if (value) {
                  localStorage.setItem(
                    "scheduleGroupFilter",
                    JSON.stringify(value)
                  );
                } else {
                  localStorage.removeItem("scheduleGroupFilter");
                }
              }}
              options={groupOptions}
              placeholder="👥 Guruhni tanlang"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "2px",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />

            {/* PAIR FILTER */}
            <Select
              value={pairFilter}
              onChange={(value) => {
                setPairFilter(value);
                if (value) {
                  localStorage.setItem(
                    "schedulePairFilter",
                    JSON.stringify(value)
                  );
                } else {
                  localStorage.removeItem("schedulePairFilter");
                }
              }}
              options={pairOptions}
              placeholder="⏱ Juftlikni tanlang"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "2px",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />
          </div>

          {/* FILTER ACTIONS */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
              <div>
                Jami: {filteredSchedules.length} ta dars
                {(groupFilter || pairFilter || searchQuery) && (
                  <span className="ml-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                    {schedules.length - filteredSchedules.length} ta filtrlandi
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <div className={"flex items-center"}>
                <div className="rounded-full bg-green-800 px-3 py-1 text-xs font-medium text-gray-100">
                  H
                </div>
                -Erkin grafik belgilanmagan
              </div>
              <div className={"flex items-center"}>
                <div className="rounded-full bg-green-800 px-3 py-1 text-xs font-medium text-gray-100">
                  S
                </div>
                -Offline belgilanmagan
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Search className="text-blue-600" size={32} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Dars topilmadi
            </h3>
            <p className="text-gray-600">
              {schedules.length === 0
                ? "Tanlangan sanada dars jadvali mavjud emas."
                : "Tanlangan filtrlar bo'yicha dars mavjud emas. Iltimos, boshqa filtrlar bilan urinib ko'ring."}
            </p>
            {(groupFilter || pairFilter || searchQuery) && (
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSchedules.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* CARD HEADER */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5">
                    <Clock size={14} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {item.lessonPairName}
                    </span>
                  </div>
                  {item?.isOnlineChecked == 1 && (
                    <div className="rounded-full bg-green-800 px-3 py-1 text-xs font-medium text-gray-100">
                      H
                    </div>
                  )}

                  {item?.isChecked == 1 && (
                    <div className="rounded-full bg-green-800 px-3 py-1 text-xs font-medium text-gray-100">
                      S
                    </div>
                  )}

                  {/* IMAGE COUNTER */}
                  <button
                    onClick={() => openImageViewer(item)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      item.attachment?.length > 0
                        ? "bg-gray-100 "
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>{item.attachment?.length || 0} ta</span>
                  </button>
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3
                        onClick={() =>
                          navigate(`/office/offline-attendance/${item.id}`, {
                            state: {
                              scheduleItem: item,
                              selectedDate: selectedDate,
                            },
                          })
                        }
                        className="line-clamp-2 cursor-pointer font-semibold text-gray-900"
                      >
                        {item.subject?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.subject?.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.groups?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.employeeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.auditoriumName}
                      </span>
                    </div>
                  </div>

                  {/* TIME SECTION */}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        🕒 {item.start_time}
                      </span>
                      <span className="text-sm text-gray-500">dan</span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.end_time} gacha
                      </span>
                    </div>
                  </div>
                </div>

                {/* HOVER EFFECTS */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 transition-all duration-300 group-hover:from-blue-50/50 group-hover:to-indigo-50/50" />
              </div>
            ))}
          </div>
        )}

        {/* STATS FOOTER */}
        {filteredSchedules.length > 0 && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredSchedules.length}
                </div>
                <div className="text-sm text-gray-600">Jami darslar</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {
                    [
                      ...new Set(
                        filteredSchedules
                          .map((i) => i.groups?.name)
                          .filter(Boolean)
                      ),
                    ].length
                  }
                </div>
                <div className="text-sm text-gray-600">Guruhlar</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    [
                      ...new Set(
                        filteredSchedules
                          .map((i) => i.subject?.name)
                          .filter(Boolean)
                      ),
                    ].length
                  }
                </div>
                <div className="text-sm text-gray-600">Fanlar</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-amber-600">
                  {
                    [
                      ...new Set(
                        filteredSchedules
                          .map((i) => i.employeeName)
                          .filter(Boolean)
                      ),
                    ].length
                  }
                </div>
                <div className="text-sm text-gray-600">O'qituvchilar</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-black/50 absolute inset-0 backdrop-blur-sm"
            onClick={() => {
              setShowReportModal(false);
              setReportFromDate("");
              setReportToDate("");
            }}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => {
                setShowReportModal(false);
                setReportFromDate("");
                setReportToDate("");
              }}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <FileSpreadsheet size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Davomat hisoboti
                </h2>
                <p className="text-sm text-gray-500">
                  Barcha guruhlar bo'yicha Excel
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Boshlang'ich sana
                </label>
                <input
                  type="date"
                  value={reportFromDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setReportFromDate(e.target.value);
                    if (reportToDate && e.target.value > reportToDate) {
                      setReportToDate("");
                    }
                  }}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Tugash sana
                </label>
                <input
                  type="date"
                  value={reportToDate}
                  min={reportFromDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setReportToDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportFromDate("");
                  setReportToDate("");
                }}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDownloadAllReport}
                disabled={reportLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {reportLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {reportLoading ? "Yuklanmoqda..." : "Yuklab olish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE VIEWER MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          {/* BACKDROP */}
          <div
            className="bg-black/90 fixed inset-0 backdrop-blur-sm transition-opacity"
            onClick={() => setOpenModal(false)}
          />

          {/* MODAL CONTENT */}
          <div className="relative min-h-screen">
            {/* HEADER */}
            <div className=" sticky top-0 z-50  bg-gray-900 px-6 py-4 shadow-xl backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      <ImageIcon className="mr-2 inline" size={20} />
                      Darsga biriktirilgan ma'lumotlar
                    </h2>
                    <p className="mt-1 text-sm text-gray-300">
                      {activeSchedule?.subject?.name} •{" "}
                      {activeSchedule?.groups?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {existingImages.length > 0 && (
                    <>
                      <button
                        onClick={() => setFullscreenView(!fullscreenView)}
                        className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                      >
                        {fullscreenView ? "Oddiy ko'rinish" : "To'liq ekran"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div
              className={`mx-auto ${
                fullscreenView ? "max-w-full" : "max-w-7xl"
              } px-4 py-8 md:px-6`}
            >
              {/* IMAGE GALLERY */}
              {existingImages.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10">
                    <ImageIcon size={40} className="" />
                  </div>
                  <h3 className="mb-2 text-2xl font-semibold ">
                    Rasm mavjud emas
                  </h3>
                  <p className="text-gray-400">
                    Ushbu darsga hech qanday rasm biriktirilmagan
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* IMAGE NAVIGATION */}
                  {existingImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="bg-black/50 hover:bg-black/70 absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3  transition md:left-8"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="bg-black/50 hover:bg-black/70 absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3  transition md:right-8"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  {/* CURRENT IMAGE */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-black relative mb-4 overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src={`${baseUrl}/api/v1/file/getFile/${existingImages[currentImageIndex]?.id}`}
                        alt={`Rasm ${currentImageIndex + 1}`}
                        className={`${
                          fullscreenView ? "max-h-[85vh]" : "max-h-[60vh]"
                        } w-full object-contain`}
                      />

                      {/* IMAGE INFO OVERLAY */}
                      <div className="from-black/80 to-transparent absolute bottom-0 left-0 right-0 bg-gradient-to-t p-6">
                        <div className="flex items-center justify-between">
                          <div className="">
                            <p className="text-sm opacity-90">
                              {currentImageIndex + 1} / {existingImages.length}
                            </p>
                            <p className="text-xs opacity-75">
                              {existingImages[currentImageIndex]?.fileName ||
                                `Rasm ${currentImageIndex + 1}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* THUMBNAILS */}
                    {!fullscreenView && existingImages.length > 1 && (
                      <div className="mt-6 flex gap-2 overflow-x-auto pb-4">
                        {existingImages.map((img, index) => (
                          <button
                            key={img.id}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                              currentImageIndex === index
                                ? "border-blue-500 ring-2 ring-blue-500/30"
                                : "border-transparent opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={`${baseUrl}/api/v1/file/getFile/${img.id}`}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-20 w-32 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SCHEDULE INFO */}
              {!fullscreenView && (
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                    <h3 className="mb-3 text-lg font-semibold ">
                      📚 Dars ma'lumotlari
                    </h3>
                    <div className="space-y-2 ">
                      <p>
                        <strong>Fan:</strong> {activeSchedule?.subject?.name}
                      </p>
                      <p>
                        <strong>Guruh:</strong> {activeSchedule?.groups?.name}
                      </p>
                      <p>
                        <strong>O'qituvchi:</strong>{" "}
                        {activeSchedule?.employeeName}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                    <h3 className="mb-3 text-lg font-semibold ">
                      🕒 Vaqt va joy
                    </h3>
                    <div className="space-y-2 ">
                      <p>
                        <strong>Vaqti:</strong> {activeSchedule?.start_time} -{" "}
                        {activeSchedule?.end_time}
                      </p>
                      <p>
                        <strong>Auditoriya:</strong>{" "}
                        {activeSchedule?.auditoriumName}
                      </p>
                      <p>
                        <strong>Juftlik:</strong>{" "}
                        {activeSchedule?.lessonPairName}
                      </p>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                    <h3 className="mb-3 text-lg font-semibold ">
                      <FileText className="mr-2 inline" size={20} />
                      Izoh
                    </h3>
                    <div className="max-h-40 overflow-y-auto">
                      {description ? (
                        <p className="whitespace-pre-line leading-relaxed ">
                          {description}
                        </p>
                      ) : (
                        <p className="italic ">Izoh mavjud emas</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupsSchedule;
