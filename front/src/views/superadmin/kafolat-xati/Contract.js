import React, { useState, useEffect } from "react";
import ApiCall, { baseUrl } from "../../../config/index";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Download,
  Trash2,
  Search,
  Calendar,
  Loader,
  Eye,
  FileText,
  ChevronDown,
  Filter,
  User,
  Users,
  FileSpreadsheet,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const KafolatXati = () => {
  const [allData, setAllData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [contractCache, setContractCache] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [contractsLoading, setContractsLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
  });

  // Fetch data
  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const res = await ApiCall("/api/v1/kafolat-xati", "GET");
      const data = res.data || [];

      setAllData(data);
      setFiltered(data);

      const groupsList = [
        ...new Set(data.map((i) => i.student.groupName).filter(Boolean)),
      ];
      setGroups(groupsList);
    } catch (err) {
      console.error(err);
      toast.error("❌ Ma'lumotlarni yuklab bo'lmadi!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const confirmed = filtered.filter((item) => item.status).length;
    const pending = filtered.filter((item) => !item.status).length;

    setStats({
      total: filtered.length,
      confirmed,
      pending,
    });
  }, [filtered]);

  useEffect(() => {
    fetchAll();
  }, []);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");

  // Filter logic
  const applyFilters = () => {
    let list = [...allData];

    if (search.trim() !== "") {
      list = list.filter((x) =>
        x.student.fullName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedGroup) {
      list = list.filter((x) => x.student.groupName === selectedGroup);
    }

    if (selectedDate) {
      list = list.filter(
        (x) => x.createdAt && x.createdAt.startsWith(selectedDate)
      );
    }

    // ✅ STATUS FILTER
    if (selectedStatus !== "ALL") {
      list = list.filter(
        (x) =>
          selectedStatus === "CONFIRMED" ? x.status === true : x.status !== true // 👈 null, undefined, false ham kirsin
      );
    }

    setFiltered(list);
  };

  useEffect(() => {
    applyFilters();
  }, [allData, search, selectedGroup, selectedDate, selectedStatus]);

  // Get contract
  const getContract = async (studentIdNumber) => {
    if (contractCache[studentIdNumber]) {
      return contractCache[studentIdNumber];
    }

    try {
      const res = await ApiCall(
        `/api/v1/contract-amount/student/${studentIdNumber}`,
        "GET"
      );

      const data = res.data;
      setContractCache((prev) => ({
        ...prev,
        [studentIdNumber]: data,
      }));

      return data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (allData.length > 0) {
      loadContracts();
    }
  }, [allData]);


  const loadContracts = async () => {
    try {
      setContractsLoading(true);

      const promises = allData
        .filter((i) => i.student?.studentIdNumber)
        .map((i) => getContract(i.student.studentIdNumber));

      await Promise.all(promises);
    } finally {
      setContractsLoading(false);
    }
  };


  // Download file
  const handleDownload = async (attachmentId, title) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/file/getFile/${attachmentId}`
      );
      if (!response.ok) throw new Error("Xatolik");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("❌ Yuklab bo'lmadi");
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;

    try {
      await ApiCall(`/api/v1/kafolat-xati/${id}`, "DELETE");
      toast.success("🗑 Muvaffaqiyatli o'chirildi!");
      fetchAll();
    } catch (err) {
      toast.error("❌ O'chirib bo'lmadi");
    }
  };

  // Download Excel
  const downloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Kafolat Xatlari");

      sheet.columns = [
        { header: "№", key: "id", width: 5 },
        { header: "Talaba", key: "student", width: 30 },
        { header: "Guruh", key: "group", width: 15 },
        { header: "Sana", key: "date", width: 15 },
        { header: "Shartnoma summasi", key: "amount", width: 18 },
        { header: "To'lov", key: "payment", width: 18 },
        { header: "Qarzdorlik", key: "debt", width: 18 },
        { header: "Imtiyoz", key: "discount", width: 18 },
        { header: "PNFL", key: "passportNumber", width: 24 },
        { header: "Holati", key: "status", width: 15 },
      ];

      let index = 1;
      for (let item of filtered) {
        const contract = contractCache[item.student.studentIdNumber] ?? {
          amount: 0,
          payment: 0,
          debt: 0,
          discount: 0,
          passportNumber: "",
        };

        sheet.addRow({
          id: index++,
          student: item.student.fullName,
          group: item.student.groupName,
          date: new Date(item.date).toLocaleDateString(),
          amount: contract.amount || 0,
          payment: contract.payment || 0,
          debt: contract.debt || 0,
          discount: contract.discount || 0,
          passportNumber: contract.passportNumber || 0,
          status: item.status ? "Tasdiqlangan" : "Kutilmoqda",
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(
        new Blob([buffer]),
        `Kafolat_Xatlari_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      if (contractsLoading) {
        toast.info("⏳ Iltimos, barcha shartnomalar yuklanishini kuting");
        return;
      }

      toast.success("📊 Excel fayli yuklab olindi!");
    } catch (err) {
      toast.error("❌ Excel yaratishda xatolik!");
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setSelectedGroup("");
    setSelectedDate("");
    setSelectedStatus("PENDING");
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        toastClassName="shadow-lg"
      />

      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              📑 Kafolat Xatlari
            </h1>
            <p className="mt-2 text-gray-600">
              Barcha kafolat xatlari va ularning holati
            </p>
          </div>

          <button
            onClick={downloadExcel}
            disabled={contractsLoading}
            className={`flex items-center gap-2 rounded-xl px-5 py-3 text-white shadow-lg transition-all
    ${
      contractsLoading
        ? "cursor-not-allowed bg-gray-400"
        : "bg-green-600 hover:bg-green-700"
    }`}
          >
            {contractsLoading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Maʼlumotlar yuklanmoqda…</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={20} />
                <span className="font-semibold">Excelga yuklash</span>
              </>
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jami xatlar</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tasdiqlangan
                </p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {stats.confirmed}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-3">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Kutilayotgan
                </p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            // onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-md transition-shadow hover:shadow-lg"
          >
            <Filter size={18} />
            <span>Filtrlar</span>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>

          {(search || selectedGroup || selectedDate) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <X size={18} />
              <span>Filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl bg-white p-6 shadow-lg md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Talaba qidirish
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Ism yoki familiya..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Group filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guruhni tanlash
              </label>
              <div className="relative">
                <Users
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <select
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Barcha guruhlar</option>
                  {groups.map((g, idx) => (
                    <option key={idx} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
              </div>
            </div>

            {/* Date filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Yaratilingan sana bo'yicha
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            {/* Status filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Holati bo'yicha
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">Barchasi</option>
                <option value="PENDING">Kutilmoqda</option>
                <option value="CONFIRMED">Tasdiqlangan</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Kafolat xatlari ro'yxati
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({filtered.length} ta)
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader className="mb-4 animate-spin text-blue-600" size={48} />
            <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertCircle className="mb-4 text-gray-400" size={64} />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              Ma'lumot topilmadi
            </h3>
            <p className="text-gray-500">
              {search || selectedGroup || selectedDate
                ? "Filtrlar bo'yicha ma'lumot topilmadi"
                : "Hozircha kafolat xatlari mavjud emas"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    №
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Talaba
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Guruh
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Yaratilingan sana
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Shartnoma
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Holati
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 font-medium text-gray-700">
                        {idx + 1}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.student.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.student.studentIdNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
                        {item.student.groupName}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString("uz-UZ")
                          : "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleTimeString(
                              "uz-UZ",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : ""}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {contractCache[item.student.studentIdNumber] ? (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Summa:
                            </span>
                            <span className="font-medium">
                              {contractCache[
                                item.student.studentIdNumber
                              ].amount?.toLocaleString() || 0}{" "}
                              so'm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              To'lov:
                            </span>
                            <span className="font-medium text-green-600">
                              {contractCache[
                                item.student.studentIdNumber
                              ].payment?.toLocaleString() || 0}{" "}
                              so'm
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Qarzdorlik:
                            </span>
                            <span className="font-medium text-red-600">
                              {contractCache[
                                item.student.studentIdNumber
                              ].debt?.toLocaleString() || 0}{" "}
                              so'm
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="italic text-gray-400">
                          Yuklanmoqda...
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium ${
                          item.status
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {item.status ? (
                          <>
                            <CheckCircle size={14} />
                            Tasdiqlangan
                          </>
                        ) : (
                          <>
                            <Clock size={14} />
                            Kutilmoqda
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setPreviewOpen(true);
                          }}
                          className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-700 transition-colors hover:bg-blue-100"
                          title="Ko'rish"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Ko'rish</span>
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-red-700 transition-colors hover:bg-red-100"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                          <span className="hidden sm:inline">O'chirish</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewOpen && selectedItem && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  📄 Kafolat Xati
                </h2>
                <p className="mt-1 text-gray-600">
                  {selectedItem.student.fullName}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-6 flex justify-end">
                  <p className="w-1/3 text-justify text-gray-700">
                    {selectedItem.text1}
                  </p>
                </div>

                <div className="mb-2 text-center">
                  <div className="text-black">
                    <h3 className="text-lg font-bold">Kafolat xati</h3>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="indent-8 leading-relaxed text-gray-800">
                    {selectedItem.text2}
                  </p>
                </div>

                <div className="mt-8 border-t border-gray-300 pt-6">
                  <div className="flex items-end justify-between">
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {selectedItem.text3}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-700">{selectedItem.date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-700">Holati:</p>
                    <p
                      className={`text-lg font-semibold ${
                        selectedItem.status
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {selectedItem.status
                        ? "✅ Tasdiqlangan"
                        : "⏳ Tasdiqlanmagan"}
                    </p>
                  </div>

                  {!selectedItem.status && (
                    <button
                      onClick={async () => {
                        try {
                          await ApiCall(
                            `/api/v1/kafolat-xati/status/${selectedItem.id}`,
                            "GET"
                          );
                          toast.success("✅ Kafolat xati tasdiqlandi!");
                          setPreviewOpen(false);
                          fetchAll();
                        } catch (err) {
                          toast.error("❌ Statusni o'zgartirib bo'lmadi");
                        }
                      }}
                      className="to-emerald-600 hover:to-emerald-700 flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-700"
                    >
                      <CheckCircle size={20} />
                      Tasdiqlash
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-gray-200 p-6">
              <button
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KafolatXati;
