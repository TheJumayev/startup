import React, { useState, useEffect, useRef, useMemo } from "react";
import ApiCall, { baseUrl } from "../../../config";
import * as XLSX from "xlsx";

function Select({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q.toLowerCase())
  );
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const fn = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          setOpen(!open);
          setQ("");
        }}
        className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors hover:border-blue-300"
      >
        <span
          className={selected ? "font-medium text-gray-800" : "text-gray-400"}
        >
          {selected?.label || placeholder}
        </span>
        <span className="ml-2 text-xs text-gray-400">▼</span>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qidirish..."
            className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  value === o.value
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DalolatnomaManagement() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [dalolatnomalar, setDalolatnomalar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    groupId: "",
    attachementId: "",
    description: "",
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // 🔥 Qidiruv uchun state
  const [searchGroupId, setSearchGroupId] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);

  // Guruhlarni yuklash
  useEffect(() => {
    ApiCall("/api/v1/groups", "GET").then((r) => {
      if (!r.error) setGroups(r.data || []);
    });
  }, []);

  // Dalolatnomalarni yuklash
  const fetchDalolatnomalar = () => {
    ApiCall("/api/v1/dalolatnoma", "GET").then((r) => {
      if (!r.error) setDalolatnomalar(r.data || []);
    });
  };

  useEffect(() => {
    fetchDalolatnomalar();
  }, []);

  // 🔥 Guruh bo'yicha filterlangan dalolatnomalar
  const filteredDalolatnomalar = useMemo(() => {
    if (!searchGroupId) {
      return dalolatnomalar;
    }
    return dalolatnomalar.filter((item) => item.groups?.id === searchGroupId);
  }, [dalolatnomalar, searchGroupId]);

  // 🔥 Qidiruvni tozalash
  const clearSearch = () => {
    setSearchGroupId(null);
    setIsFiltering(false);
  };

  // 🔥 Qidiruvni amalga oshirish
  const handleSearch = () => {
    if (!selectedGroup) {
      alert("Iltimos, qidirish uchun guruhni tanlang!");
      return;
    }
    setSearchGroupId(selectedGroup);
    setIsFiltering(true);
  };

  // Guruh tanlanganda formani yangilash
  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId);
    setFormData((prev) => ({ ...prev, groupId }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🔥 FAQAT PDF
    if (file.type !== "application/pdf") {
      alert("Faqat PDF fayl yuklash mumkin!");
      e.target.value = ""; // inputni tozalash
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.groupId) {
      alert("Iltimos, guruhni tanlang!");
      return;
    }

    if (!selectedFile && !formData.attachementId) {
      alert("Fayl tanlang!");
      return;
    }

    try {
      setSaving(true);

      let attachmentId = formData.attachementId;

      // 🔥 FAQAT SHU YERDA FILE UPLOAD
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("photo", selectedFile);
        formDataUpload.append("prefix", "/dalolatnoma");

        const uploadRes = await ApiCall(
          "/api/v1/file/upload",
          "POST",
          formDataUpload
        );

        attachmentId = uploadRes.data;

        if (!attachmentId) {
          alert("Fayl yuklanmadi!");
          return;
        }
      }

      // 🔥 DALOLATNOMA CREATE
      const payload = {
        groupId: formData.groupId,
        attachementId: attachmentId,
        description: formData.description || null,
      };

      let res;
      if (editingId) {
        res = await ApiCall(`/api/v1/dalolatnoma/${editingId}`, "PUT", payload);
      } else {
        res = await ApiCall("/api/v1/dalolatnoma", "POST", payload);
      }

      if (!res.error) {
        alert("Muvaffaqiyatli saqlandi!");

        setFormData({
          groupId: "",
          attachementId: "",
          description: "",
        });

        setSelectedFile(null);
        setSelectedGroup(null);
        setEditingId(null);

        fetchDalolatnomalar();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error(error);
      alert("Xatolik yuz berdi!");
    } finally {
      setSaving(false);
    }
  };

  // Tahrirlash uchun ma'lumotlarni formaga olish
  const handleEdit = (dalolatnoma) => {
    setEditingId(dalolatnoma.id);
    setSelectedGroup(dalolatnoma.groups?.id);
    setFormData({
      groupId: dalolatnoma.groups?.id || "",
      attachementId: dalolatnoma.attachment?.id || "",
      description: dalolatnoma.description || "",
    });
    // Sahifaning yuqorisiga scroll
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // O'chirish
  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu dalolatnomani o'chirmoqchimisiz?")) return;

    try {
      const res = await ApiCall(`/api/v1/dalolatnoma/${id}`, "DELETE");
      if (!res.error) {
        fetchDalolatnomalar();
        // Agar tahrirlanayotgan bo'lsa, tozalash
        if (editingId === id) {
          setEditingId(null);
          setFormData({
            groupId: "",
            attachementId: "",
            description: "",
          });
          setSelectedGroup(null);
        }
        // Agar filterlangan bo'lsa va o'chirilgan element filterda bo'lsa
        if (searchGroupId) {
          const updatedFiltered = filteredDalolatnomalar.filter(
            (item) => item.id !== id
          );
          if (updatedFiltered.length === 0) {
            clearSearch();
          }
        }
      }
    } catch (error) {
      console.error(error);
      fetchDalolatnomalar();
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);

      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();

      // 🔥 PDF qilib majburiy beramiz
      const file = new Blob([blob], { type: "application/pdf" });

      const fileURL = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName?.endsWith(".pdf")
        ? fileName
        : `${fileName || "document"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      alert("Faylni yuklab bo‘lmadi");
    }
  };

  // Formani tozalash
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      groupId: "",
      attachementId: "",
      description: "",
    });
    setSelectedGroup(null);
  };

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));
  const selectedGroupName = groups.find((g) => g.id === selectedGroup)?.name;

  // Fayl nomini olish (attachment ob'ektidan)
  const getFileName = (attachment) => {
    if (!attachment) return "Fayl mavjud emas";
    return attachment.fileName || attachment.originalName || "Fayl";
  };

  // 🔥 Qidiruv uchun guruh nomini olish
  const getSearchGroupName = () => {
    if (!searchGroupId) return null;
    const group = groups.find((g) => g.id === searchGroupId);
    return group?.name || "Noma'lum guruh";
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dalolatnomalar</h1>
        <p className="mt-1 text-sm text-gray-400">
          Guruh uchun dalolatnoma yaratish va boshqarish
        </p>
      </div>

      {/* Form Card */}
      <div className="mb-8 rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {editingId ? "Dalolatnoma tahrirlash" : "Yangi dalolatnoma qo'shish"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guruh tanlash */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Guruh <span className="text-red-500">*</span>
            </label>
            <Select
              options={groupOptions}
              value={selectedGroup}
              onChange={handleGroupChange}
              placeholder="Guruhni tanlang..."
            />
          </div>

          {/* Fayl yuklash */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Fayl <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="application/pdf" // 🔥 FAQAT PDF
                disabled={uploading}
                className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-1.5 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
              />
              {uploading && (
                <span className="text-sm text-gray-400">Yuklanmoqda...</span>
              )}
            </div>
            {selectedFile && (
              <p className="mt-1 text-xs text-blue-600">
                Tanlangan fayl: {selectedFile.name}
              </p>
            )}
          </div>

          {/* Izoh */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Izoh
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows="3"
              placeholder="Dalolatnoma haqida qisqacha izoh..."
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-blue-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all ${
                saving || uploading
                  ? "cursor-default bg-gray-400"
                  : "cursor-pointer bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Saqlash"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="cursor-pointer rounded-lg border-2 border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 🔥 Qidiruv bo'limi */}
      <div className="mb-6 rounded-xl border-2 border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
              Guruh bo'yicha qidirish
            </label>
            <Select
              options={groupOptions}
              value={selectedGroup}
              onChange={setSelectedGroup}
              placeholder="Guruhni tanlang..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              disabled={!selectedGroup}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all ${
                !selectedGroup
                  ? "cursor-default bg-gray-100 text-gray-400"
                  : "cursor-pointer bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Qidirish
            </button>
            {isFiltering && (
              <button
                onClick={clearSearch}
                className="cursor-pointer rounded-lg border-2 border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                Tozalash
              </button>
            )}
          </div>
        </div>

        {/* 🔥 Qidiruv natijasi haqida ma'lumot */}
        {isFiltering && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
              Filter faol
            </span>
            <span className="text-gray-600">
              Guruh: <strong>{getSearchGroupName()}</strong>
            </span>
            <span className="text-gray-500">
              | Topildi: {filteredDalolatnomalar.length} ta dalolatnoma
            </span>
          </div>
        )}
      </div>

      {/* Dalolatnomalar ro'yxati */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Dalolatnomalar ro'yxati
            {isFiltering && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (filterlangan)
              </span>
            )}
          </h2>
          <span className="text-sm text-gray-400">
            Jami: {filteredDalolatnomalar.length} ta
          </span>
        </div>

        {filteredDalolatnomalar.length === 0 ? (
          <div className="rounded-xl border-2 border-gray-100 bg-white py-12 text-center text-sm text-gray-400">
            {isFiltering
              ? "Bu guruh uchun hech qanday dalolatnoma mavjud emas"
              : "Hech qanday dalolatnoma mavjud emas"}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDalolatnomalar.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border-2 border-gray-100 bg-white p-5 transition-all hover:border-gray-200 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {item.groups?.name || "Guruh aniqlanmagan"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("uz-UZ")
                          : ""}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {item.description || "Izoh mavjud emas"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                      <span className="text-xs text-gray-500">
                        {getFileName(item.attachment)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        item.attachment?.id &&
                        handleDownload(
                          item.attachment.id,
                          getFileName(item.attachment)
                        )
                      }
                      className="cursor-pointer rounded-lg border-2 border-green-200 bg-white px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50"
                    >
                      Yuklab olish
                    </button>

                    <button
                      onClick={() => handleEdit(item)}
                      className="cursor-pointer rounded-lg border-2 border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-600"
                    >
                      Tahrirlash
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="cursor-pointer rounded-lg border-2 border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
