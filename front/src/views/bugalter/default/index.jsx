import React, { useState, useEffect } from "react";
import ApiCall, { baseUrl } from "../../../config/index";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Upload,
  FileText,
  Calendar,
  Download,
  Trash2,
  Plus,
  Loader,
} from "lucide-react";

const Contract = () => {
  const [file, setFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contractFiles, setContractFiles] = useState([]);
  const [fullPageLoading, setFullPageLoading] = useState(false);

  // Fayllarni olish
  const fetchContractFiles = async () => {
    try {
      const response = await ApiCall(
        "/api/v1/contract-file",
        "GET",
        null,
        null,
        true
      );
      setContractFiles(response.data);
    } catch (error) {
      console.error("Error fetching contract files:", error);
      toast.error("Fayllarni yuklashda xatolik yuz berdi");
    }
  };

  useEffect(() => {
    fetchContractFiles();
  }, []);

  // Fayl yuklash va UUID olish
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("prefix", "/contract");

    try {
      const response = await ApiCall(
        "/api/v1/file/upload",
        "POST",
        formData,
        null,
        true
      );
      if (!response?.data) throw new Error("UUID qaytmadi");
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Faylni yuklashda xatolik yuz berdi");
      throw error;
    }
  };

  const handleDownload = async (id, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Faylni yuklab olishda xatolik");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "contract.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Fayl muvaffaqiyatli yuklab olindi");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Faylni yuklab olishda xatolik yuz berdi");
    }
  };

  // Form submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setFullPageLoading(true);

      const uuid = await uploadImage(file);
      await ApiCall(`/api/v1/contract-file/${uuid}`, "GET", null, null, true);

      toast.success("Kontrakt fayli muvaffaqiyatli saqlandi va import qilindi");
      closeModal();
      setFile(null);
      await fetchContractFiles();
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Kontrakt faylini saqlashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
      setFullPageLoading(false);
    }
  };

  const handleFileChange = (event) => setFile(event.target.files[0]);
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setModalIsOpen(false);
    setFile(null);
  };

  // Fayl nomini `_` dan keyin chiqarish
  const getFileNameAfterUnderscore = (fileName) => {
    return fileName.split("_")[1] || fileName;
  };

  // Fayl hajmini formatlash
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="relative min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* ✅ Butun sahifa loadingi - z-indexni baland qilamiz */}
      {fullPageLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white bg-opacity-90">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-700">
            Fayl yuklanmoqda...
          </p>
          <p className="mt-2 text-sm text-gray-500">Iltimos kuting</p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-800">
              <FileText className="text-blue-600" size={28} />
              Kontrakt Fayllari
            </h1>
            <p className="mt-2 text-gray-600">
              Barcha kontrakt fayllaringizni boshqaring va yangilarini yuklang
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 px-6 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl"
          >
            <Plus size={20} />
            Yangi Fayl
          </button>
        </div>
      </div>

      {/* Jadval */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Fayl nomi
                  </div>
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Yuklangan vaqt
                  </div>
                </th>

                <th className="py-4 px-6 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contractFiles
                ?.sort(
                  (a, b) => new Date(b?.createdAt) - new Date(a?.createdAt)
                )
                ?.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors duration-150 hover:bg-blue-50"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getFileNameAfterUnderscore(item?.file?.name)}
                          </p>
                          <p className="text-sm text-gray-500">.xlsx</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-700">
                          {new Date(item?.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleDownload(item?.file?.id, item?.file?.name)
                          }
                          className="rounded-lg p-2 text-green-600 transition-colors duration-200 hover:bg-green-50"
                          title="Yuklab olish"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Yangilangan bo'sh holat - "Hali mavjud emas" */}
        {contractFiles.length === 0 && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <FileText className="text-gray-400" size={48} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              Hali mavjud emas
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-500">
              Hozircha hech qanday kontrakt fayli mavjud emas. Birinchi kontrakt
              faylini yuklash uchun "Yangi Fayl" tugmasini bosing.
            </p>
            <button
              onClick={openModal}
              className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 py-2.5 px-6 font-medium text-white transition-all duration-200 hover:bg-blue-700"
            >
              <Plus size={18} />
              Birinchi Faylni Yuklash
            </button>
          </div>
        )}
      </div>

      {/* ✅ Rodal modal - z-indexni aniq belgilaymiz */}
      <Rodal
        visible={modalIsOpen}
        onClose={closeModal}
        width={500}
        height={380}
        customStyles={{
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          zIndex: 100, // ✅ Rodal uchun z-index
        }}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Upload className="text-blue-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Kontrakt fayli qo'shish
            </h2>
          </div>

          <form onSubmit={handleFormSubmit} className="flex flex-1 flex-col">
            <div className="mb-6">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Excel fayl tanlang (.xlsx)
              </label>
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 hover:border-blue-400">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".xlsx"
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-3 text-gray-400" size={48} />
                  <p className="font-medium text-gray-600">
                    {file
                      ? file.name
                      : "Faylni tanlash uchun bosing yoki bu yerga sudrab keling"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Faqat .xlsx formatidagi fayllar qabul qilinadi
                  </p>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-start gap-3 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={isLoading || !file}
                className="flex items-center gap-2 rounded-xl bg-blue-600 py-2.5 px-6 font-medium text-white transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Yuklash
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      </Rodal>
    </div>
  );
};

export default Contract;
