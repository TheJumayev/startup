import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useEffect, useMemo, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast } from "react-toastify";
import {
  Search,
  Download,
  AlertCircle,
  FileText,
  Users,
  Phone,
  User,
  BookOpen,
  Hash,
  Loader2,
  AlertTriangle,
  Ban,
  XCircle,
  FileDown,
} from "lucide-react";

function StudentExplanation() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(0);

  useEffect(() => {
    getAll();
  }, []);

  const getAll = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/student-explanation", "GET");
      setData(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      toast.error("❌ Ma'lumotlarni olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          name: "Ogohlantirish xati",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertTriangle,
          bg: "bg-yellow-50",
        };
      case 2:
        return {
          name: "Hayfsan",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: Ban,
          bg: "bg-orange-50",
        };
      case 3:
        return {
          name: "Qattiq hayfsan",
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XCircle,
          bg: "bg-red-50",
        };
      default:
        return {
          name: "Noma'lum",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          bg: "bg-gray-50",
        };
    }
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.warning("Export qilish uchun ma'lumot yo'q");
      return;
    }

    // 🔥 Excel uchun formatlash
    const excelData = filteredData.map((item, index) => {
      const s = item.student || {};
      const statusInfo = getStatusInfo(item?.status);

      return {
        "№": index + 1,
        "F.I.O": s.fullName || "",
        "Qisqa ism": s.shortName || "",
        Guruh: s?.group?.name || "",
        "Student ID": s.studentIdNumber || "",
        Telefon: s.phone || "",
        "Ota telefon": s.fatherPhone || "",
        "Ona telefon": s.motherPhone || "",
        Status: statusInfo.name,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Studentlar");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "student_tushuntirish_xatlari.xlsx");

    toast.success("Excel muvaffaqiyatli yuklandi");
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("📥 Fayl yuklab olindi");
    } catch (error) {
      console.error("❌ Yuklab olishda xatolik:", error);
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((item) => {
      // ✅ STATUS FILTER birinchi ishlaydi
      if (statusFilter !== 0 && item?.status !== statusFilter) return false;

      // ✅ Agar search yo‘q bo‘lsa faqat status filter ishlaydi
      if (!q) return true;

      const s = item?.student || {};
      const groupName = s?.group?.name || s?.groupName || "";
      const statusInfo = getStatusInfo(item?.status);

      const haystack = [
        s?.fullName,
        s?.shortName,
        s?.studentIdNumber,
        s?.phone,
        s?.fatherPhone,
        s?.motherPhone,
        groupName,
        statusInfo.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data, search, statusFilter]);
  const stats = useMemo(() => {
    const total = filteredData.length;
    const count1 = filteredData.filter((x) => x?.status === 1).length;
    const count2 = filteredData.filter((x) => x?.status === 2).length;
    const count3 = filteredData.filter((x) => x?.status === 3).length;

    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

    return {
      total,
      count1,
      count2,
      count3,
      pct1: pct(count1),
      pct2: pct(count2),
      pct3: pct(count3),
    };
  }, [filteredData]);

  return (
    <div className="mt-5 min-h-screen">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Tushuntirish Xatlari
            </h1>
            <p className="mt-1 text-gray-600">
              Barcha studentlar uchun tushuntirish xatlari ro'yxati
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish: FIO, Guruh, ID, Telefon..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 shadow-lg transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-96"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-64"
              >
                <option value={0}>Hammasi</option>
                <option value={1}>Ogohlantirish xati</option>
                <option value={2}>Hayfsan</option>
                <option value={3}>Qattiq hayfsan</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            Excel yuklab olish
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Card */}
          <div className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Jami studentlar
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span className="font-medium">
                {loading ? "Yuklanmoqda..." : "Filtrlangan"}
              </span>
            </div>
          </div>

          {/* Status 1 Card */}
          <div className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ogohlantirish xati
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.count1}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Jami: {stats.total} ta</span>
              <span className="font-semibold text-yellow-600">
                {stats.pct1}%
              </span>
            </div>
          </div>

          {/* Status 2 Card */}
          <div className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hayfsan</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.count2}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3">
                <Ban className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Jami: {stats.total} ta</span>
              <span className="font-semibold text-orange-600">
                {stats.pct2}%
              </span>
            </div>
          </div>

          {/* Status 3 Card */}
          <div className="rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Qattiq hayfsan
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.count3}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Jami: {stats.total} ta</span>
              <span className="font-semibold text-red-600">{stats.pct3}%</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-2xl bg-white shadow-xl">
          {/* Table Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Studentlar ro'yxati
              </h2>
              <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                {filteredData.length} ta
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      №
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>F.I.O</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>Guruh</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span>Student ID</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Telefon</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Ota tel</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Ona tel</span>
                      </div>
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-4 py-2 text-left text-sm font-semibold text-gray-600">
                      <div className="flex items-center gap-2">
                        <FileDown className="h-4 w-4" />
                        <span>Fayl</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="h-12 w-12 text-gray-400" />
                          <p className="text-lg font-medium text-gray-600">
                            Hech narsa topilmadi
                          </p>
                          <p className="text-sm text-gray-500">
                            Qidiruv so'rovini o'zgartirib ko'ring
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => {
                      const s = item.student || {};
                      const statusInfo = getStatusInfo(item?.status);
                      const StatusIcon = statusInfo.icon;

                      return (
                        <tr
                          key={item.id}
                          className="transition-colors hover:bg-gray-50"
                        >
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                            {index + 1}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <div className="flex items-center">
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-medium text-white">
                                {s.fullName
                                  ? s.fullName.charAt(0).toUpperCase()
                                  : "?"}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">
                                  {s.fullName || "Noma'lum"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {s.shortName || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                            {s?.group?.name || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {s.studentIdNumber || "-"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                            {s.phone || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                            {s.fatherPhone || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-600">
                            {s.motherPhone || "-"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-2">
                            {item.file ? (
                              <button
                                onClick={() =>
                                  handleDownload(item.file.id, item.file.name)
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              >
                                <Download className="h-4 w-4" />
                                Yuklab olish
                              </button>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentExplanation;
