import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdClose,
  MdArrowBack,
  MdMenuBook,
  MdAttachFile,
  MdFileDownload,
  MdUploadFile,
  MdRemoveCircle,
} from "react-icons/md";

const CurriculumDetail = () => {
  const { curriculmId } = useParams();
  const navigate = useNavigate();

  const [curriculum, setCurriculum] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    if (curriculmId) {
      fetchCurriculumDetail();
      fetchLessons();
    }
  }, [curriculmId]);

  useEffect(() => {
    if (error || successMsg) {
      const t = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [error, successMsg]);

  const fetchCurriculumDetail = async () => {
    try {
      setLoading(true);
      const r = await ApiCall(`/api/v1/curriculums/${curriculmId}`, "GET", null);
      if (r?.error) {
        setError("O'quv dasturini yuklashda xatolik");
        return;
      }
      setCurriculum(r.data);
    } catch (err) {
      console.error(err);
      setError("O'quv dasturini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const r = await ApiCall(
        `/api/v1/lessons/curriculm/${curriculmId}`,
        "GET",
        null
      );
      if (r?.error) {
        setLessons([]);
        return;
      }
      setLessons(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setSelectedFiles([]);
    setExistingAttachments([]);
    setEditingId(null);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (attId) => {
    setExistingAttachments((prev) => prev.filter((att) => att.id !== attId));
  };

  const handleRemoveAttachment = async (lessonId, attachmentId) => {
    if (!window.confirm("Haqiqatan ham bu faylni o'chirmoqchimisiz?")) return;
    try {
      setLoading(true);
      setError("");
      const res = await ApiCall(
        `/api/v1/lessons/${lessonId}/attachments/${attachmentId}`,
        "DELETE",
        null
      );
      if (res?.error) {
        setError(
          typeof res.data === "string"
            ? res.data
            : res.data?.message || "Faylni o'chirishda xatolik"
        );
        return;
      }
      setSuccessMsg("🗑️ Fayl o'chirildi");
      fetchLessons();
    } catch (err) {
      console.error(err);
      setError("❌ Faylni o'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.name.trim()) {
      setError("Dars nomi bo'sh bo'lishi mumkin emas");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // UPDATE
        if (selectedFiles.length > 0) {
          const fd = new FormData();
          fd.append("name", formData.name);
          fd.append("curriculmId", curriculmId);
          selectedFiles.forEach((f) => fd.append("files", f));
          const res = await ApiCall(
            `/api/v1/lessons/with-files/${editingId}`,
            "PUT",
            fd
          );
          if (res?.error) {
            setError(
              typeof res.data === "string"
                ? res.data
                : res.data?.message || "Yangilashda xatolik"
            );
            return;
          }
        } else {
          const payload = {
            name: formData.name,
            curriculmId: curriculmId,
            attachmentIds: existingAttachments.map((att) => att.id),
          };
          const res = await ApiCall(`/api/v1/lessons/${editingId}`, "PUT", payload);
          if (res?.error) {
            setError(
              typeof res.data === "string"
                ? res.data
                : res.data?.message || "Yangilashda xatolik"
            );
            return;
          }
        }
        setSuccessMsg("Dars yangilandi ✅");
      } else {
        // CREATE
        if (selectedFiles.length > 0) {
          const fd = new FormData();
          fd.append("name", formData.name);
          fd.append("curriculmId", curriculmId);
          selectedFiles.forEach((f) => fd.append("files", f));
          const res = await ApiCall("/api/v1/lessons/with-files", "POST", fd);
          if (res?.error) {
            setError(
              typeof res.data === "string"
                ? res.data
                : res.data?.message || "Yaratishda xatolik"
            );
            return;
          }
        } else {
          const payload = {
            name: formData.name,
            curriculmId: curriculmId,
            attachmentIds: [],
          };
          const res = await ApiCall("/api/v1/lessons", "POST", payload);
          if (res?.error) {
            setError(
              typeof res.data === "string"
                ? res.data
                : res.data?.message || "Yaratishda xatolik"
            );
            return;
          }
        }
        setSuccessMsg("Dars qo'shildi ✅");
      }

      resetForm();
      setShowForm(false);
      fetchLessons();
    } catch (err) {
      console.error(err);
      setError("Saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setFormData({ name: lesson.name || "" });
    setExistingAttachments(lesson.attachments || []);
    setSelectedFiles([]);
    setEditingId(lesson.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Darsni o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        setError("");
        const res = await ApiCall(`/api/v1/lessons/${id}`, "DELETE", null);
        if (res?.error) {
          setError(typeof res.data === "string" ? res.data : "O'chirishda xatolik");
          return;
        }
        setSuccessMsg("Dars o'chirildi ✅");
        fetchLessons();
      } catch (err) {
        console.error(err);
        setError("O'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredLessons = lessons.filter((l) =>
    (l.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${baseUrl}/api/v1/file/getFile/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔥 MUHIM
          },
        }
      );

      const blob = await response.blob();

      // 🔥 NOMNI TO‘G‘RILASH
      const realName = getRealName(fileName);
      const ext = getExtension(fileName);

      const finalName = realName.includes(".")
        ? realName
        : `file-${fileId.substring(0, 8)}${ext}`;

      // 🔥 DOWNLOAD
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = finalName;
      link.click();

      window.URL.revokeObjectURL(link.href);

      setSuccessMsg("📥 Fayl yuklab olindi");
    } catch (err) {
      console.error(err);
      setError("❌ Yuklab olishda xatolik");
    }
  };

  const getExtension = (fileName) => {
    if (!fileName) return "";
    const index = fileName.lastIndexOf(".");
    return index !== -1 ? fileName.substring(index) : "";
  };
  const getRealName = (fileName) => {
    if (!fileName) return "file";
    return fileName.split("__")[1] || fileName;
  };

  if (loading && !curriculum)
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Orqaga tugma */}
      <button
        onClick={() => navigate("/teacher/curriculum")}
        className="flex items-center gap-2 font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
      >
        <MdArrowBack className="h-5 w-5" /> O'quv dasturlarga qaytish
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📖 {curriculum?.name || "O'quv dasturi"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {curriculum?.groupName ? `Guruh: ${curriculum.groupName}` : ""}
            {curriculum?.subjectName ? ` • Fan: ${curriculum.subjectName}` : ""}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <MdMenuBook className="h-4 w-4" />
              {lessons.length} ta dars
            </span>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"
        >
          <MdAdd className="h-5 w-5" /> Yangi dars qo'shish
        </button>
      </div>

      {/* Success / Error messages */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search */}
      {lessons.length > 0 && (
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Darslarni qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MdClose className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Darsni tahrirlash" : "Yangi dars qo'shish"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dars nomi */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Dars nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: 1-dars: Kirish"
                />
              </div>

              {/* Mavjud fayllar (tahrirlashda) */}
              {editingId && existingAttachments.length > 0 && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Mavjud fayllar
                  </label>
                  <div className="space-y-2">
                    {existingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MdAttachFile className="h-4 w-4 flex-shrink-0 text-blue-500" />
                          <button
                            type="button"
                            onClick={() => handleDownload(att.id, att.name)}
                            className="truncate text-sm text-blue-600 hover:underline dark:text-blue-400"
                          >
                            {getRealName(att.name)}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(att.id)}
                          className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                          title="Faylni olib tashlash"
                        >
                          <MdRemoveCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fayl yuklash */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Fayllar biriktirish{" "}
                  <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4 transition-colors hover:border-green-400 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-green-500 dark:hover:bg-gray-600">
                  <MdUploadFile className="h-6 w-6 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Fayl tanlash uchun bosing</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Tanlangan fayllar */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MdAttachFile className="h-4 w-4 flex-shrink-0 text-green-500" />
                          <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                            {file.name}
                          </span>
                          <span className="flex-shrink-0 text-xs text-gray-400">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(i)}
                          className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                        >
                          <MdRemoveCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-green-500/50 disabled:opacity-50"
                >
                  {loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredLessons.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm ? "Darslar topilmadi" : "Bu o'quv dasturida hali darslar yo'q"}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Yangi dars qo'shish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      )}

      {/* Lessons list — cards */}
      {filteredLessons.length > 0 && (
        <div className="space-y-4">
          {filteredLessons.map((lesson, i) => (
            <div
              key={lesson.id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Lesson header */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-sm font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {lesson.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(lesson.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                  >
                    <MdEdit className="h-4 w-4" /> Tahrirlash
                  </button>
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  >
                    <MdDelete className="h-4 w-4" /> O'chirish
                  </button>
                </div>
              </div>

              {/* Fayllar */}
              {lesson.attachments && lesson.attachments.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  <p className="mb-2 flex items-center gap-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                    <MdAttachFile className="h-4 w-4" />
                    Biriktirilgan fayllar ({lesson.attachments.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lesson.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                      >
                        <MdAttachFile className="h-4 w-4 text-blue-500" />

                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {getRealName(att.name)}
                        </span>

                        <button
                          onClick={() => handleDownload(att.id, att.name)}
                          className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                          title="Yuklab olish"
                        >
                          <MdFileDownload className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleRemoveAttachment(lesson.id, att.id)}
                          className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          title="Faylni o'chirish"
                        >
                          <MdRemoveCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Jami */}
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Jami: <span className="font-semibold">{filteredLessons.length}</span> ta dars
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumDetail;

