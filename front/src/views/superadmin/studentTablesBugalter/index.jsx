import React, { useEffect, useState, useMemo } from "react";
import ApiCall, { baseUrl } from "../../../config/index";

function Kontrakt() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(""); // 🔍 faqat "Qidirish" bosilganda ishlaydi
  const token = localStorage.getItem("authToken");
  const handleDownload = async (hemisId) => {
    try {
      if (!hemisId) {
        alert("❌ Hemis ID topilmadi");
        return;
      }

      setLoading(true);
      const response = await fetch(`${baseUrl}/api/v1/contract/${hemisId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("❌ Contract yuklashda xatolik");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Contract_${hemisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Shartnoma yuklab olishda xatolik. Hisobchiga murojaat qiling!");
      console.error("Contract yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/contract", "GET", null);
      setStudents(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const searchLower = query.toLowerCase();

    // 1️⃣ Avval kurs filteriga mos bo‘lganlarni ajratamiz
    const courseFiltered =
      courseFilter === "all"
        ? students
        : students.filter((s) => s.level === courseFilter);

    // 2️⃣ Agar hali qidiruv bosilmagan bo‘lsa → faqat 100 ta yozuvni kursga mos holatda ko‘rsatamiz
    if (query === "") {
      return courseFiltered.slice(0, 100);
    }

    // 3️⃣ Aks holda, kurs + qidiruv bo‘yicha to‘liq filter qilamiz
    return courseFiltered.filter((student) => {
      const matchesSearch =
        student.fullName?.toLowerCase().includes(searchLower) ||
        student.passportNumber?.toLowerCase().includes(searchLower) ||
        String(student.hemisId || "")
          .toLowerCase()
          .includes(searchLower);

      return matchesSearch;
    });
  }, [students, query, courseFilter]);

  // To'lov holatiga qarab stil berish
  const getPaymentStatus = (payment, debt) => {
    if (debt > 0) return "debt";
    if (payment > 0) return "partial";
    return "paid";
  };

  const getPaymentStyles = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-50 text-green-700 border border-green-200";
      case "partial":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "debt":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  // Kurslar ro'yxatini unique qilib, son bo'yicha tartiblab olish
  const courseOptions = [
    "all",
    ...[...new Set(students.map((s) => s.level).filter(Boolean))].sort(
      (a, b) => parseInt(a) - parseInt(b) // "1-kurs" → 1 qilib solishtiryapti
    ),
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Sarlavha va amallar */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Kontraktlar ro'yxati
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Barcha talabalar kontraktlari va to'lov ma'lumotlari
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Yangilash
          </button>
        </div>
      </div>

      {/* Qidiruv va filter panel */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full max-w-md">
            <div className="flex rounded-lg border border-gray-300 bg-white shadow-sm">
              {/* Search icon */}
              <div className="flex items-center pl-3">
                <svg
                  className="h-5 w-5 text-gray-400"
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

              {/* Search input */}
              <input
                type="text"
                placeholder="Ism, Passport yoki Hemis raqam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && setQuery(search)}
                className="w-full py-3 px-2 placeholder-gray-500 outline-none"
              />

              {/* Clear button */}
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setQuery(""); // 🟢 qo‘shimcha — qidiruvni ham reset qiladi
                  }}
                  className="px-2 text-gray-400 hover:text-gray-600"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {/* Search button */}
              <button
                onClick={() => setQuery(search)}
                disabled={!search.trim()}
                className="rounded-r-lg bg-blue-500 px-4 text-white hover:bg-blue-600 disabled:bg-gray-300"
              >
                Qidirish
              </button>
            </div>
          </div>

          {/* Kurs filter select */}
          <div className="w-full lg:w-auto">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kurs bo'yicha filtrlash
            </label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              {courseOptions.map((course) => (
                <option key={course} value={course}>
                  {course === "all" ? "Barcha kurslar" : `${course}`}
                </option>
              ))}
            </select>
          </div>

          {/* Statistika */}
          <div className="flex w-full justify-between gap-4 lg:w-auto lg:justify-end">
            <div className="min-w-[100px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
              <div className="text-sm font-medium text-gray-600">Jami</div>
              <div className="text-lg font-bold text-gray-800">
                {students.length}
              </div>
            </div>
            <div className="min-w-[100px] rounded-lg border border-gray-200 bg-white px-4 py-3 text-center">
              <div className="text-sm font-medium text-gray-600">
                Ko'rsatilmoqda
              </div>
              <div className="text-lg font-bold text-gray-800">
                {filteredStudents.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jadval */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-2 text-red-500">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">{error}</h3>
          <button
            onClick={fetchStudents}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-600"
          >
            Qayta urinish
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-2 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    F.I.Sh
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kurs
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Passport
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hemis Id
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    To'lov
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qarzdorlik
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qo'shimcha
                  </th>
                  <th className="px-2 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Yaratilgan sana
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, index) => (
                    <tr
                      key={student.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-2 py-4 text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-center justify-between">
                          {student.fullName}
                          <button
                            onClick={() =>
                              handleDownload(student.passportNumber)
                            }
                            className="rounded-md bg-blue-500 px-1 py-1 text-sm font-medium text-white transition hover:bg-blue-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5" // ✅ to‘g‘risi: strokeWidth
                              stroke="currentColor"
                              className="h-5 w-5" // ✅ to‘g‘risi: className
                            >
                              <path
                                strokeLinecap="round" // ✅ to‘g‘risi: strokeLinecap
                                strokeLinejoin="round" // ✅ to‘g‘risi: strokeLinejoin
                                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-center text-sm text-gray-500">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          {student.level}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-center font-mono text-sm text-gray-500">
                        {student.passportNumber}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-center font-mono text-sm text-gray-500">
                        {student.hemisId}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-center text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            student.payment > 0
                              ? "border border-green-200 bg-green-50 text-green-700"
                              : "border border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {student.payment?.toLocaleString("uz-UZ") || 0} so'm
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-2 py-4 text-center text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            student.debt > 0
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : "border border-gray-200 bg-gray-50 text-gray-700"
                          }`}
                        >
                          {student.debt?.toLocaleString("uz-UZ") || 0} so'm
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-2 py-4 text-center text-sm text-gray-500">
                        {student.extra || "-"}
                      </td>
                      <td className="whitespace-nowrap px-2 py-4 text-center text-sm text-gray-500">
                        {student.createdAt
                          ? new Date(student.createdAt).toLocaleDateString(
                              "uz-UZ"
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="mb-4 h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <h3 className="mb-1 text-lg font-medium text-gray-900">
                          Ma'lumot topilmadi
                        </h3>
                        <p className="text-gray-500">
                          Qidiruv shartlariga mos ma'lumotlar topilmadi
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kontrakt;
