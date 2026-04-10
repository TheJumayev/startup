import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  PhoneIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

const StudentStatistics = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    // alert(token)
    if (!token) {
      navigate("/student/login");
      return;
    }
    // alert(token)

    fetchStudentAccount(token);
  }, []);

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Server error");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStudentAccount = async (token) => {
    try {
      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }

      if (res?.data?.id) {
        setStudentId(res.data.id);
        await fetchStatistics(res.data.id);
      }
    } catch (err) {
      console.error("Talaba ma'lumotini olishda xato:", err);
      navigate("/student/login");
    }
  };

  const fetchStatistics = async (id) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/attendance-offline/offline-student/${id}`,
        "GET"
      );
      console.log(`/api/v1/attendance-offline/offline-student/${id}`);
      setStats(res.data);
    } catch (err) {
      console.error("Statistikani olishda xato:", err);
    } finally {
      setLoading(false);
    }
  };

  // Unikal fanlar ro'yxatini olish
  const uniqueSubjects = useMemo(() => {
    if (!stats) return [];
    const subjects = stats
      .map((item) => item.scheduleList?.subject?.name)
      .filter(
        (subject, index, self) => subject && self.indexOf(subject) === index
      );
    return subjects;
  }, [stats]);

  // Filtrlash va qidirish
  const filteredStats = useMemo(() => {
    if (!stats) return [];

    return stats.filter((item) => {
      const subject = item.scheduleList?.subject?.name?.toLowerCase() || "";
      const matchesSearch =
        subject.includes(searchTerm.toLowerCase()) ||
        item.scheduleList?.employeeName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.comment?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        selectedSubject === "all" ||
        item.scheduleList?.subject?.name === selectedSubject;

      let matchesStatus = true;
      if (selectedStatus !== "all") {
        matchesStatus = item.isPresent === parseInt(selectedStatus);
      }

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [stats, searchTerm, selectedSubject, selectedStatus]);

  // Sortirovka
  const sortedStats = useMemo(() => {
    const sortableStats = [...filteredStats];
    sortableStats.sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "date":
          aValue = a.scheduleList?.lessonDate || 0;
          bValue = b.scheduleList?.lessonDate || 0;
          break;
        case "subject":
          aValue = a.scheduleList?.subject?.name || "";
          bValue = b.scheduleList?.subject?.name || "";
          break;
        case "status":
          aValue = a.isPresent || 0;
          bValue = b.isPresent || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sortableStats;
  }, [filteredStats, sortConfig]);

  const requestSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const getStatusInfo = (isPresent) => {
    switch (isPresent) {
      case 1:
        return {
          text: "Kelgan",
          class:
            "bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500",
          icon: "✅",
        };
      case 2:
        return {
          text: "Sababsiz qoldirgan",
          class: "bg-red-100 text-rose-800 border-l-4 border-rose-500",
          icon: "❌",
        };
      case 3:
        return {
          text: "Sababli qoldirgan",
          class: "bg-amber-100 text-amber-800 border-l-4 border-amber-500",
          icon: "⚠️",
        };
      default:
        return {
          text: "Noma'lum",
          class: "bg-gray-100 text-gray-800 border-l-4 border-gray-500",
          icon: "❓",
        };
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSubject("all");
    setSelectedStatus("all");
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="border-t-transparent absolute inset-0 animate-spin rounded-full border-4 border-blue-600"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Yuklanmoqda...</p>
          <p className="text-sm text-gray-500">Ma'lumotlar yuklanmoqda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-2 lg:px-8">
        {/* Talaba ma'lumotlari */}
        {stats && stats[0]?.student && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <img
                    src={stats[0].student.image}
                    alt={stats[0].student.fullName}
                    className="h-32 w-32 rounded-2xl border-4 border-white bg-white object-cover shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/128?text=No+Image";
                    }}
                  />
                  <div className="bg-emerald-500 absolute -top-2 -right-2 h-6 w-6 rounded-full border-2 border-white"></div>
                </div>
              </div>
            </div>

            <div className="px-8 pb-8 pt-20">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {stats[0].student.fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      <UserGroupIcon className="h-4 w-4" />
                      {stats[0].student.groupName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                      <AcademicCapIcon className="h-4 w-4" />
                      {stats[0].student.departmentName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                      <PhoneIcon className="h-4 w-4" />
                      {stats[0].student.phone}
                    </span>
                  </div>
                </div>

                <div className="mt-4 lg:mt-0">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">Mutaxassislik</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats[0].student.specialtyName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Batafsil ro'yxat */}
        <div className="my-4 overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="border-b border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                Batafsil davomat ro'yxati
              </h2>

              {/* Qidiruv va filtr */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fan, o'qituvchi yoki izoh bo'yicha qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 lg:w-80"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300"
                >
                  <FunnelIcon className="h-5 w-5" />
                  Filtr
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {(searchTerm ||
                  selectedSubject !== "all" ||
                  selectedStatus !== "all") && (
                  <button
                    onClick={clearFilters}
                    className="bg-rose-100 text-rose-700 hover:bg-rose-200 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                    Tozalash
                  </button>
                )}
              </div>
            </div>

            {/* Filtr paneli */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Fan bo'yicha
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">Barcha fanlar</option>
                    {uniqueSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Holat bo'yicha
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="all">Barcha holatlar</option>
                    <option value="2">Sababsiz qoldirgan</option>
                    <option value="3">Sababli qoldirgan</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Topilgan natijalar
                  </label>
                  <div className="rounded-lg bg-blue-50 p-2 text-center text-blue-800">
                    {filteredStats.length} ta yozuv
                  </div>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              overflowX: "auto",
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE
            }}
            className="relative"
          >
            <style>
              {`
      div::-webkit-scrollbar {
        display: none;
      }
    `}
            </style>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: "date", label: "Sana" },
                    { key: "subject", label: "Fan" },
                    { key: null, label: "Dars turi" },
                    { key: null, label: "O'qituvchi" },
                    { key: null, label: "Vaqt" },
                    { key: "status", label: "Holat" },
                    { key: null, label: "Izoh" },
                    { key: null, label: "Fayl" },
                  ].map((column) => (
                    <th
                      key={column.label}
                      onClick={() => column.key && requestSort(column.key)}
                      className={`px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${
                        column.key ? "cursor-pointer hover:bg-gray-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.key && (
                          <span className="text-gray-400">
                            {getSortIcon(column.key)}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedStats.length > 0 ? (
                  sortedStats.map((item, index) => {
                    const schedule = item.scheduleList;
                    const date = schedule?.lessonDate
                      ? new Date(
                          parseInt(schedule.lessonDate) * 1000
                        ).toLocaleDateString("uz-UZ", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Noma'lum";

                    const status = getStatusInfo(item.isPresent);

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-2 py-4">
                          <div className="flex items-center">
                            <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {date}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          <span className="font-medium text-gray-900">
                            {schedule?.subject?.name || "Noma'lum"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-600">
                          {schedule?.trainingTypeName || "Noma'lum"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4 text-sm text-gray-600">
                          {schedule?.employeeName || "Noma'lum"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                            {schedule?.start_time || ""} -{" "}
                            {schedule?.end_time || ""}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.class}`}
                          >
                            <span>{status.icon}</span>
                            {status.text}
                          </span>
                        </td>
                        <td className="max-w-xs truncate px-2 py-4 text-sm text-gray-600">
                          {item.comment || "-"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-4">
                          {item.file ? (
                            <button
                              onClick={() =>
                                handleDownload(item.file.id, item.file.name)
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg"
                            >
                              <DocumentArrowDownIcon className="h-4 w-4" />
                              Yuklab olish
                            </button>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="px-2 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FunnelIcon className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Ma'lumot topilmadi
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Sizning qidiruv bo'yicha hech qanday ma'lumot mavjud
                          emas.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Filtrlarni tozalash
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistika kartochkalari */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami darslar
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sababsiz</p>
                <p className="text-rose-600 text-3xl font-bold">
                  {stats?.filter((s) => s.isPresent === 2).length || 0}
                </p>
              </div>
              <div className="bg-rose-100 rounded-full p-3">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sababli</p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats?.filter((s) => s.isPresent === 3).length || 0}
                </p>
              </div>
              <div className="rounded-full bg-amber-100 p-3">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatistics;
