import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { FiDelete, FiEdit2, FiTrash } from "react-icons/fi";

Modal.setAppElement("#root");

function CheckLessons() {
  const { id } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [score, setScore] = useState("");

  // 🔹 Faylni yuklab olish (button orqali)
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

  // 🔹 Ma'lumotlarni yuklash
  const fetchResponses = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/response-homework/check/${id}`, "GET");
      setResponses(res.data || []);
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

  // 🔹 Modalni ochish
  const openModal = (item) => {
    setSelectedItem(item);
    setScore(item?.score ?? "");
    setModalOpen(true);
  };

  const handleDelete = async (responseId) => {
    if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;

    try {
      await ApiCall(`/api/v1/response-homework/${responseId}`, "DELETE");
      toast.success("🗑️ Topshiriq muvaffaqiyatli o'chirildi!");
      fetchResponses(); // ro'yxatni yangilash
    } catch (error) {
      console.error(error);
      toast.error("❌ O'chirishda xatolik!");
    }
  };


  // 🔹 Bahoni saqlash
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
    <div className="p-4">
      <ToastContainer />
      <h1 className="mb-4 text-2xl font-bold text-gray-800">
        Topshiriqlarni tekshirish
      </h1>

      {loading ? (
        <div className="text-center text-gray-600">Yuklanmoqda...</div>
      ) : responses.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow">
          Ushbu dars uchun topshiriqlar topilmadi.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  №
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Talaba
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Guruh
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Test natijasi
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Fayl
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Holat
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-600">
                  Ball
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {responses.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-3 py-2 text-gray-700">{index + 1}</td>
                  <td className="px-3 py-2 text-gray-800">
                    {item.student?.fullName || "Noma’lum talaba"}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {item.student?.groupName || "Noma’lum guruh"}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {item?.ball ? `${item.ball} ball` : "Test ishlanmagan"}
                  </td>
                  <td className="px-3 py-2 text-blue-600">
                    {item.attachment ? (
                      <button
                        onClick={() =>
                          handleDownload(
                            item.attachment.id,
                            item.attachment.name || "homework.pdf"
                          )
                        }
                        className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
                      >
                        Yuklab olish
                      </button>
                    ) : (
                      <span className="text-gray-400">Fayl yo'q</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {item.isSend ? (
                      <span className="rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        Yuborilgan
                      </span>
                    ) : (
                      <span className="rounded bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
                        Yuborilmagan
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {item.score !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {item.score} / 100
                        </span>
                        <button
                          onClick={() => openModal(item)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Tahrirlash"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        {/* Delete tugma */}
                        <button
                          onClick={() => handleDelete(item.id)}      // 🔥 MUHIM: responseId = item.id
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900 transition"
                          title="O'chirish"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(item)}
                          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                          Baholash
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-900 transition"
                          title="O'chirish"
                        >
                          <FiTrash size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center"
      >
        <h2 className="mb-4 text-center text-lg font-semibold text-gray-800">
          {selectedItem?.student?.fullName} uchun baho
        </h2>

        {selectedItem?.score != null && (
          <p className="mb-2 text-center text-gray-500">
            Joriy baho:{" "}
            <span className="font-semibold text-gray-700">
              {selectedItem.score} / 100
            </span>
          </p>
        )}

        <input
          type="number"
          min="1"
          max="100"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mb-4 w-full rounded border border-gray-300 px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="1 - 100"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setModalOpen(false)}
            className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-400"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSaveScore}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Saqlash
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default CheckLessons;
