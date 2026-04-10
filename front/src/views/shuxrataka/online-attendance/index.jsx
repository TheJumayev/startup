import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft,
  Calendar,
  Loader2,
  Filter,
  Users,
  BookOpen,
  Clock,
  User,
  ChevronRight,
  Building,
  Search,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

/* ===============================
   MAIN COMPONENT
=============================== */
const Attendance = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);

  // Get date from localStorage or default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem("attendanceSelectedDate");
    return savedDate || new Date().toISOString().slice(0, 10);
  });

  /* FILTER STATE */
  const [groupFilter, setGroupFilter] = useState(null);
  const [pairFilter, setPairFilter] = useState(null);
  const [timeFilter, setTimeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* ===============================
     LOAD ONLINE SCHEDULE LIST WITH DATE
  =============================== */
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/attendance-offline/schedule-list/online/${selectedDate}`,
        "GET"
      );
      setScheduleList(res?.data || []);
    } catch {
      toast.error("Juftliklarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  /* ===============================
     HANDLE DATE CHANGE
  =============================== */
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // Save to localStorage
    localStorage.setItem("attendanceSelectedDate", newDate);
  };

  /* ===============================
     TIME SLOT OPTIONS
  =============================== */
  const timeOptions = [
    { label: "🌅 Ertalab (08:00-12:00)", value: "morning" },
    { label: "🌇 Kechki (12:00-18:00)", value: "afternoon" },
    { label: "🌃 Kech (18:00-23:00)", value: "evening" },
  ];

  /* ===============================
     SELECT OPTIONS
  =============================== */
  const groupOptions = useMemo(() => {
    const unique = [
      ...new Set(scheduleList.map((i) => i.groups?.name).filter(Boolean)),
    ];
    return unique.map((g) => ({ label: g, value: g }));
  }, [scheduleList]);

  const pairOptions = useMemo(() => {
    const unique = [
      ...new Set(scheduleList.map((i) => i.lessonPairName).filter(Boolean)),
    ];
    return unique.map((p) => ({ label: p, value: p }));
  }, [scheduleList]);

  /* ===============================
     FILTERED LIST WITH TIME FILTER
  =============================== */
  const filteredList = useMemo(() => {
    return scheduleList.filter((item) => {
      // Group filter
      const byGroup = !groupFilter || item.groups?.name === groupFilter.value;

      // Pair filter
      const byPair = !pairFilter || item.lessonPairName === pairFilter.value;

      // Time filter
      let byTime = true;
      if (timeFilter && item.start_time) {
        const hour = parseInt(item.start_time.split(":")[0]);
        if (timeFilter.value === "morning") byTime = hour >= 8 && hour < 12;
        if (timeFilter.value === "afternoon") byTime = hour >= 12 && hour < 18;
        if (timeFilter.value === "evening") byTime = hour >= 18 && hour <= 23;
      }

      // Search filter
      const bySearch =
        !searchQuery ||
        item.subject?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.groups?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.auditoriumName?.toLowerCase().includes(searchQuery.toLowerCase());

      return byGroup && byPair && byTime && bySearch;
    });
  }, [scheduleList, groupFilter, pairFilter, timeFilter, searchQuery]);

  /* ===============================
     FORMAT DATE FOR DISPLAY
  =============================== */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ];

    const weekdays = [
      "Yakshanba",
      "Dushanba",
      "Seshanba",
      "Chorshanba",
      "Payshanba",
      "Juma",
      "Shanba",
    ];

    return `${weekdays[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  /* ===============================
     SKELETON LOADER
  =============================== */
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-6 w-24 rounded-lg bg-gray-200"></div>
        <div className="h-4 w-16 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        <div className="h-4 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>
  );

  /* ===============================
     LOADING
  =============================== */
  if (loading && scheduleList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Dars jadvali yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  /* ===============================
     RESET ALL FILTERS
  =============================== */
  const resetFilters = () => {
    setGroupFilter(null);
    setPairFilter(null);
    setTimeFilter(null);
    setSearchQuery("");
  };

  /* ===============================
     TODAY BUTTON FUNCTION
  =============================== */
  const setToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    localStorage.setItem("attendanceSelectedDate", today);
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="rounded-full bg-white/20 p-2 transition hover:bg-white/30"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold md:text-3xl">
                  📊 Online talabalar davomati
                </h1>
              </div>
              <p className="mt-2 text-blue-100">{formatDate(selectedDate)}</p>
            </div>

            {/* DATE PICKER WITH TODAY BUTTON */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={setToToday}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/30"
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
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtrlar</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* SEARCH */}
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fan, guruh, o'qituvchi yoki auditoriya bo'yicha qidirish..."
                className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* GROUP FILTER */}
            <Select
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
              placeholder="👥 Guruh"
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
              onChange={setPairFilter}
              options={pairOptions}
              placeholder="⏱ Juftlik"
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

            {/* TIME FILTER */}
            <Select
              value={timeFilter}
              onChange={setTimeFilter}
              options={timeOptions}
              placeholder="🕒 Vaqt oralig'i"
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

          {/* FILTER ACTIONS & STATS */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Jami: {filteredList.length} ta dars
              {(groupFilter || pairFilter || timeFilter || searchQuery) && (
                <span className="ml-2 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  {scheduleList.length - filteredList.length} ta filtrlandi
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {(groupFilter || pairFilter || timeFilter || searchQuery) && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw size={16} />
                  Barcha filtrlarni tozalash
                </button>
              )}
              <button
                onClick={loadSchedules}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                <RefreshCw size={16} />
                Yangilash
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading && scheduleList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Search className="text-gray-600" size={32} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Dars topilmadi
            </h3>
            <p className="text-gray-600">
              {scheduleList.length === 0
                ? "Tanlangan sanada dars jadvali mavjud emas."
                : "Tanlangan filtrlar bo'yicha dars topilmadi. Iltimos, filtrlarni o'zgartiring."}
            </p>
            {(groupFilter || pairFilter || timeFilter || searchQuery) && (
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition-colors hover:bg-blue-700"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/office/online-attendance/${item.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* CARD HEADER */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5">
                    <Clock size={14} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {item.lessonPairName || "Juftlik"}
                    </span>
                  </div>

                  {/* ONLINE BADGE */}
                  {item?.isOnlineChecked == 2 ? (
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-green-800">
                      +
                    </div>
                  ) : (
                    <div className="rounded-full bg-green-800 px-3 py-1 text-xs font-medium text-gray-100">
                      -
                    </div>
                  )}
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="line-clamp-2 font-semibold text-gray-900">
                        {item.subject?.name || "Noma'lum fan"}
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
                        {item.groups?.name || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.employeeName || "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.auditoriumName || "—"}
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

                {/* ARROW INDICATOR */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:right-4 group-hover:opacity-100">
                  <ChevronRight className="text-blue-500" size={24} />
                </div>

                {/* FOOTER - STATS */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Davomat uchun</span>
                    <span className="flex items-center gap-1 font-medium text-blue-600">
                      Batafsil <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATS FOOTER */}
        {filteredList.length > 0 && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50/50 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-blue-600">
                  {filteredList.length}
                </div>
                <div className="text-sm text-gray-600">Jami darslar</div>
              </div>
              <div className="rounded-xl bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {
                    [
                      ...new Set(
                        filteredList.map((i) => i.groups?.name).filter(Boolean)
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
                        filteredList.map((i) => i.subject?.name).filter(Boolean)
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
                        filteredList.map((i) => i.employeeName).filter(Boolean)
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
    </div>
  );
};

export default Attendance;
