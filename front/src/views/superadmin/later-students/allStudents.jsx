import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast } from "react-toastify";

function AllStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [search, setSearch] = useState("");

  const loadLateStudents = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/attendance-offline/laters", "GET");
      setStudents(res?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Kech qolgan studentlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLateStudents();
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const filteredStudents = students.filter((s) =>
    s.student?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const downloadExcel = () => {
    if (filteredStudents.length === 0) {
      toast.warning("Yuklash uchun ma'lumot yo'q");
      return;
    }

    const data = filteredStudents.map((s, index) => ({
      "№": index + 1,
      Student: s.student?.fullName,
      Fan: s.scheduleList?.subject?.name,
      "Dars boshlanish": s.scheduleList?.start_time,
      "Dars tugash": s.scheduleList?.end_time,
      "Kechikkan vaqt": formatDateTime(s.lateTime),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Kech qolganlar");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, "kech_qolgan_studentlar.xlsx");
  };
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="text-2xl">⏰</span>
                <span>Kech qolganlar</span>
              </h1>
              <p className="mt-1 text-sm text-red-600">
                {students.length} ta student
              </p>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                📱 Mobil
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                💻 Jadval
              </button>
            </div>
            <button
              onClick={downloadExcel}
              className="ml-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              📥 Excel
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <input
          type="text"
          placeholder="Student qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200"></div>
            <div className="border-t-transparent absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-blue-500"></div>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Mobile Grid View */}
          {viewMode === "grid" && (
            <div className="space-y-3 p-4">
              {filteredStudents.map((s, index) => (
                <div
                  key={s.id}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Student Header */}
                  <div className="flex items-center gap-3 border-b border-gray-50 p-4">
                    <div className="relative">
                      <img
                        src={
                          s.student?.image || "https://via.placeholder.com/48"
                        }
                        alt=""
                        className="h-14 w-14 rounded-full border-2 border-blue-100 object-cover"
                      />
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                        {index + 1}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {s.student?.fullName}
                      </h3>
                      <p className="mt-0.5 text-base text-blue-500">
                        {s.student?.group.name}
                      </p>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-3 p-4">
                    {/* Subject */}
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <span className="text-lg text-blue-600">📚</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Fan</p>
                        <p className="text-sm font-medium text-gray-900">
                          {s.scheduleList?.subject?.name || "Noma'lum"}
                        </p>
                      </div>
                    </div>

                    {/* Lesson Time */}
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-50">
                        <span className="text-lg text-green-600">📅</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Dars vaqti</p>
                        <p className="text-sm font-medium text-gray-900">
                          {s.scheduleList?.start_time &&
                          s.scheduleList?.end_time ? (
                            <>
                              <span>{s.scheduleList.start_time}</span>
                              <span className="mx-1 text-gray-400">→</span>
                              <span>{s.scheduleList.end_time}</span>
                            </>
                          ) : (
                            "Belgilanmagan"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Late Time */}
                    <div className="flex items-start gap-2">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50">
                        <span className="text-lg text-orange-600">⏰</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Kechikkan vaqt</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-sm font-semibold text-orange-600">
                            {formatDateTime(s.lateTime)}
                          </p>
                          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
                            {formatTime(s.lateTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Date Badge */}
                    <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-2">
                      <span className="text-xs text-gray-400">
                        {formatDate(s.lateTime)}
                      </span>
                      <span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-600">
                        Kech qolgan
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop Table View */}
          {viewMode === "table" && (
            <div className="overflow-x-auto p-4">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Student
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Guruhi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Fan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Dars vaqti
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                          Kechikkan vaqt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredStudents.map((s, index) => (
                        <tr
                          key={s.id}
                          className="group transition-colors hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                              {index + 1}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  s.student?.image ||
                                  "https://via.placeholder.com/40"
                                }
                                alt=""
                                className="h-10 w-10 rounded-full border-2 border-gray-200 object-cover transition-colors group-hover:border-blue-200"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {s.student?.fullName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {s.student?.group.name}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {s.scheduleList?.subject?.name || "Noma'lum"}
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {s.scheduleList?.start_time &&
                              s.scheduleList?.end_time ? (
                                <>
                                  <span className="font-medium">
                                    {s.scheduleList.start_time}
                                  </span>
                                  <span className="mx-1 text-gray-400">-</span>
                                  <span>{s.scheduleList.end_time}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">
                                  Belgilanmagan
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                                <span>⏰</span>
                                <span>{formatDateTime(s.lateTime)}</span>
                              </span>
                              <span className="mt-0.5 text-xs text-gray-400">
                                {formatDate(s.lateTime)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Kech qolganlar yo'q!
              </h3>
              <p className="max-w-xs text-center text-sm text-gray-500">
                Barcha talabalar darsga o'z vaqtida kelishyapti. Ajoyib natija!
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AllStudents;
