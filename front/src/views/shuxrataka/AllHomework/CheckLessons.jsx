import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { FiEdit2, FiDownload, FiSearch } from "react-icons/fi";
import { FaTrash, FaFileExcel, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

Modal.setAppElement("#root");

function CheckLessons() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [score, setScore] = useState("");

  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredResponses(responses);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = responses.filter((item) =>
        item.student?.fullName?.toLowerCase().includes(term) ||
        item.student?.groupName?.toLowerCase().includes(term) ||
        item.homework?.lesson.name?.toLowerCase().includes(term)
      );
      setFilteredResponses(filtered);
    }
  }, [searchTerm, responses]);

  const exportToExcel = () => {
    if (responses.length === 0) {
      toast.warn("Eksport uchun ma'lumot yo'q!");
      return;
    }

    const data = responses.map((item, index) => ({
      "№": index + 1,
      "Talaba": item.student?.fullName || "Noma'lum talaba",
      "Guruh": item.student?.groupName || "Noma'lum guruh",
      "Mavzu nomi": item.homework?.lesson.name || "Noma'lum mavzu",
      "Test natijasi": item?.ball ? `${item.ball} ball` : "Test ishlanmagan",
      "Fayl holati": item.attachment ? "Yuklangan" : "Yo'q",
      "Yuborilganmi": item.isSend ? "Ha" : "Yo'q",
      "Baho": item.score != null ? `${item.score}/100` : "Baholanmagan",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Topshiriqlar");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Topshiriqlar_statistikasi.xlsx`);
    toast.success("Excel fayl muvaffaqiyatli yaratildi!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu javobni o'chirmoqchimisiz?")) return;
    try {
      await ApiCall(`/api/v1/response-homework/${id}`, "DELETE");
      toast.success("✅ Javob muvaffaqiyatli o'chirildi!");
      fetchResponses();
    } catch (err) {
      console.error(err);
      toast.error("❌ O'chirishda xatolik!");
    }
  };

  const handleDownload = async (fileId, fileName = "homework.pdf") => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Faylni yuklab bo'lmadi");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("❌ Yuklab olishda xatolik:", err);
      toast.error("Faylni yuklab bo'lmadi!");
    }
  };

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/response-homework/all`, "GET");
      console.log(res.data);
      setResponses(res.data || []);
      setFilteredResponses(res.data || []);
    } catch (error) {
      console.error("❌ Xatolik:", error);
      toast.error("Ma'lumotlarni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const openModal = (item) => {
    setSelectedItem(item);
    setScore(item?.score ?? "");
    setModalOpen(true);
  };

  const handleSaveScore = async () => {
    if (!score || score < 1 || score > 100) {
      toast.warn("1 dan 100 gacha ball kiriting!");
      return;
    }

    try {
      await ApiCall(
        `/api/v1/response-homework/${selectedItem.student.id}/${selectedItem.homework.id}`,
        "PUT",
        { score: parseInt(score) }
      );
      toast.success("✅ Baho muvaffaqiyatli saqlandi!");
      setModalOpen(false);
      setScore("");
      fetchResponses();
    } catch (err) {
      console.error(err);
      toast.error("❌ Baho saqlashda xatolik!");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <ToastContainer />

      {/* Sarlavha va filtrlash qismi */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Topshiriqlarni Tekshirish</h1>
            <p className="text-blue-100">Talabalar topshiriqlarini boshqarish va nazorat qilish</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Talaba, guruh yoki mavzu bo'yicha qidirish..."
                className="w-full rounded-lg border-0 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center justify-center gap-2 rounded-lg bg-white hover:bg-gray-100 px-4 py-2.5 text-sm font-medium text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white"
            >
              <FaFileExcel className="h-4 w-4" />
              Excelga eksport
            </button>
          </div>
        </div>
      </div>

      {/* Jadval qismi */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : responses.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Ushbu dars uchun topshiriqlar topilmadi</h3>
          <p className="text-gray-500">Talabalar topshiriq yuborganidan so'ng bu yerda ko'rinadi</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Talaba
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guruh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mavzu nomi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test natijasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Talaba javobi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ball
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResponses.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.student?.fullName || "Noma'lum talaba"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.student?.groupName || "Noma'lum guruh"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {item.homework?.lesson.name || "Noma'lum mavzu"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item?.ball ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.ball} ball
                        </span>
                      ) : (
                        <span className="text-gray-400">Test ishlanmagan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.attachment ? (
                        <button
                          onClick={() =>
                            handleDownload(
                              item.attachment.id,
                              item.attachment.name || "homework.pdf"
                            )
                          }
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <FiDownload className="h-4 w-4" />
                          Yuklab olish
                        </button>
                      ) : (
                        <span className="text-gray-400">Fayl yo'q</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.isSend ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="h-3 w-3" />
                          Yuborilgan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <FaTimesCircle className="h-3 w-3" />
                          Yuborilmagan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {item.score !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">
                            {item.score} / 100
                          </span>
                          <button
                            onClick={() => openModal(item)}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors"
                            title="Tahrirlash"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openModal(item)}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                        >
                          <FiEdit2 size={14} />
                          Baholash
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                        title="O'chirish"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredResponses.length === 0 && responses.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              Qidiruv bo'yicha hech narsa topilmadi
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {selectedItem?.student?.fullName} uchun baho
          </h2>

          {selectedItem?.homework?.lesson?.name && (
            <p className="text-gray-600 text-sm mb-4">
              Mavzu: {selectedItem.homework.lesson.name}
            </p>
          )}

          {selectedItem?.score != null && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Joriy baho:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedItem.score} / 100
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yangi baho (1-100)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ball kiriting"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSaveScore}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Saqlash
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CheckLessons;