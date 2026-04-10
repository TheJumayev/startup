import Select from "react-select";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FiDownload } from "react-icons/fi";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Breadcrumbs from "views/BackLink/BackButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ApiCall, { baseUrl } from "../../../config";
import { FiEdit, FiTrash2, FiPlus, FiUpload, FiX } from "react-icons/fi";
import { MdOutlineAddLink } from "react-icons/md";

function Index() {
  const [file, setFile] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [filterGroup, setFilterGroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedModalGroup, setSelectedModalGroup] = useState("");
  const [groupStudents, setGroupStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // 📄 PDF-ni yuklab olish (ochish)
  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "document.pdf";
      link.click();
      toast.success("📥 Fayl yuklab olindi");
    } catch (e) {
      console.error(e);
      toast.error("Faylni ochishda xatolik!");
    }
  };


  const handleFileUploadForTeacher = async (themeId, file) => {
    if (!file) {
      toast.error("Fayl tanlanmagan!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "/magistr-theme");
      const res = await ApiCall(`/api/v1/file/upload`, "POST", formData);
      const fileId = res.data;

      if (!fileId) {
        toast.error("Fayl ID qaytmadi!");
        return;
      }
      await ApiCall(
        `/api/v1/magistr-theme-teacher/file/${themeId}/${fileId}`,
        "PUT"
      );
      toast.success("Fayl muvaffaqiyatli biriktirildi!");
      fetchTeachers();
    } catch (error) {
      console.error(error);
      toast.error("Fayl yuklashda xatolik!");
    }
  };


  const filteredTeachers = teachers.filter((t) => {
    const matchGroup = filterGroup
      ? (t.student && t.student.groupName === filterGroup) ||
      (t.groups && t.groups.name === filterGroup)
      : true;

    const matchSearch = searchTerm
      ? (t.teacherName &&
        t.teacherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.themeName &&
        t.themeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.student?.fullName &&
        t.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    return matchGroup && matchSearch;
  });

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editTeacherName, setEditTeacherName] = useState("");
  const [editThemeName, setEditThemeName] = useState("");

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newThemeName, setNewThemeName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      selectedFile.type !== "application/vnd.ms-excel"
    ) {
      toast.error("Faqat Excel fayllar (.xls yoki .xlsx) yuklansin!");
      e.target.value = null;
      return;
    }
    setFile(selectedFile);
  };


  const openStudentModal = (teacher) => {
    setSelectedTeacher(teacher);

    // 🟢 Agar avvaldan guruh biriktirilgan bo‘lsa — avtomatik tanlaymiz
    setSelectedModalGroup(teacher.groups?.id || "");
    setSelectedStudent(teacher.student?.id || "");

    // 🟡 Agar guruh mavjud bo‘lsa — shu guruhdagi talabalarni yuklaymiz
    if (teacher.groups?.id) {
      handleGroupSelect(teacher.groups.id);
    } else {
      setGroupStudents([]);
    }

    setShowStudentModal(true);
  };


  // 🔹 Guruh tanlanganda — talabalarni yuklash
  const handleGroupSelect = async (groupId) => {
    setSelectedModalGroup(groupId);
    setLoadingStudents(true);
    try {
      const res = await ApiCall(`/api/v1/groups/students/${groupId}`, "GET");
      setGroupStudents(res.data);

    } catch (error) {
      toast.error("Talabalarni yuklashda xatolik!");
    } finally {
      setLoadingStudents(false);
    }
  };

  // 🔹 Saqlash (PUT so‘rov)
  const handleSaveStudent = async () => {
    if (!selectedModalGroup || !selectedStudent) {
      toast.error("Guruh va talaba tanlanishi kerak!");
      return;
    }

    try {
      await ApiCall(
        `/api/v1/magistr-theme-teacher/student/${selectedStudent}/${selectedTeacher.id}`,
        "PUT",
        {
          teacherName: selectedTeacher.teacherName,
          themeName: selectedTeacher.themeName,
        }
      );
      toast.success("Talaba muvaffaqiyatli biriktirildi!");
      setShowStudentModal(false);
      fetchTeachers();
    } catch (error) {
      console.error("Save student error:", error);
      toast.error("Biriktirishda xatolik!");
    }
  };

  const fetchContractAmount = async (studentIdNumber) => {
    try {
      const res = await ApiCall(`/api/v1/contract/student/${studentIdNumber}`, "GET");
      return res.data;
    } catch (error) {
      return null;
    }
  };


  const handleExportExcel = async () => {
    let exportData = teachers;

    if (filterGroup) {
      exportData = teachers.filter(
        (t) =>
          (t.student && t.student.groupName === filterGroup) ||
          (t.groups && t.groups.name === filterGroup) ||
          (!t.student && !t.groups && filterGroup === "")
      );
    }

    if (exportData.length === 0) {
      toast.error("Eksport qilish uchun ma'lumot yo‘q!");
      return;
    }

    setLoading(true);

    try {
      const data = [];

      for (let i = 0; i < exportData.length; i++) {
        const t = exportData[i];
        let jshshir = "-";

        // 🔹 Hemis ID mavjud bo‘lsa — backenddan JSHSHIR olish
        if (t?.student?.studentIdNumber) {
          try {
            const res = await ApiCall(
              `/api/v1/contract/excel/${t.student.studentIdNumber}`,
              "GET"
            );
            console.log("JSHSHIR:", res.data);
            jshshir = res.data || "-";
          } catch (err) {
            console.error("JSHSHIR olishda xatolik:", err);
            jshshir = "-";
          }
        }

        data.push({
          "№": i + 1,
          "O'qituvchi": t.teacherName || "-",
          Mavzu: t.themeName || "-",
          Talaba: t.student?.fullName || "-",
          "Kontrakt": t.contract?.payment ? `${t.contract.payment.toLocaleString("uz-UZ")} so‘m` : "-",
          "Hemis Id": t?.student?.studentIdNumber || "-",
          "JSHSHIR": jshshir, // 🆕 qo‘shildi
          Guruh:
            t.student?.groupName ||
            t.groups?.name ||
            (filterGroup ? filterGroup : "-"),
          Holati: t.student
            ? "✅ Faol"
            : !t.groups
              ? "❌ Guruh biriktirilmagan"
              : t.status
                ? "Faol"
                : "Nofaol",
          "Yaratilgan sana": t.createdAt
            ? new Date(t.createdAt).toLocaleString("uz-UZ")
            : "-",
        });
      }

      // 🔹 Excel fayl yaratish
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Magistr Mavzular");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

      saveAs(
        blob,
        filterGroup
          ? `Magistr_Mavzular_${filterGroup}_JSHSHIR.xlsx`
          : "Magistr_Mavzular_Barcha_JSHSHIR.xlsx"
      );

      toast.success("Excel JSHSHIR bilan muvaffaqiyatli yuklab olindi!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Eksport paytida xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };


  const handleUpload = async () => {
    if (!file) {
      toast.error("Excel fayl tanlanmagan!");
      return;
    }
    if (!selectedGroup) {
      toast.error("Guruh tanlanmagan!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "magistr-theme");

      // Faylni yuklaymiz
      const res = await axios.post(`${baseUrl}/api/v1/file/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const fileId = res.data.id || res.data;

      // ✅ Endi bir vaqtning o'zida guruhni ham yuboramiz:
      await axios.post(
        `${baseUrl}/api/v1/magistr-theme-teacher/${fileId}?groupId=${selectedGroup}`
      );

      toast.success("Excel yuklandi va guruh biriktirildi!");
      setFile(null);
      setSelectedGroup("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchTeachers();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };


  const fetchTeachers = async () => {
    try {
      const res = await ApiCall("/api/v1/magistr-theme-teacher", "GET");
      const list = res.data;

      // 🆕 har bir talaba uchun kontrakt olish
      const updatedList = await Promise.all(
        list.map(async (t) => {
          if (t.student?.studentIdNumber) {
            const contract = await fetchContractAmount(t.student.studentIdNumber);
            return { ...t, contract };
          }
          return { ...t, contract: null };
        })
      );

      setTeachers(updatedList);
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      const filtered = res.data.filter(
        (g) => g.name.startsWith("M") && g.name.includes("25")
      );
      setGroups(filtered);
    } catch (error) {
      console.error("Xatolik:", error);
    }
  };

  const handleGroupChange = async (teacherId, groupId) => {
    if (!groupId) return;
    try {
      await ApiCall(
        `/api/v1/magistr-theme-teacher/group/${groupId}/${teacherId}/`,
        "POST"
      );
      toast.success("Guruh biriktirildi!");
      fetchTeachers();
    } catch (error) {
      console.error("Group update error:", error);
      toast.error("Guruhni biriktirishda xatolik!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham o‘chirmoqchimisiz?")) return;
    try {
      await ApiCall(`/api/v1/magistr-theme-teacher/${id}`, "DELETE");
      toast.success("Mavzu o‘chirildi!");
      fetchTeachers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("O‘chirishda xatolik!");
    }
  };

  const saveEdit = async () => {
    if (!editItem) return;
    try {
      await ApiCall(`/api/v1/magistr-theme-teacher/${editItem.id}`, "PUT", {
        teacherName: editTeacherName,
        themeName: editThemeName,
      });

      toast.success("Ma'lumot yangilandi!");
      setEditItem(null);
      fetchTeachers();
    } catch (error) {
      console.error("Edit error:", error);
      toast.error("Yangilashda xatolik!");
    }
  };

  const startEdit = (item) => {
    setEditItem(item);
    setEditTeacherName(item.teacherName);
    setEditThemeName(item.themeName);
  };

  const handleAddNew = async () => {
    if (!newTeacherName || !newThemeName) {
      toast.error("O‘qituvchi va mavzu kiritilishi kerak!");
      return;
    }
    try {
      await ApiCall("/api/v1/magistr-theme-teacher/manually", "POST", {
        teacherName: newTeacherName,
        themeName: newThemeName,
      });
      toast.success("Yangi mavzu qo‘shildi!");
      setNewTeacherName("");
      setNewThemeName("");
      setShowAddModal(false);
      fetchTeachers();
    } catch (error) {
      console.error("Add error:", error);
      toast.error("Qo‘shishda xatolik!");
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchGroups();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <Breadcrumbs />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* File upload section */}
          <div className="flex flex-grow flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none">
              <span className="flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm">
                <FiUpload className="mr-2" />
                Excel fayl tanlash
              </span>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xls,.xlsx"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <div className="flex">
              <span className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-500">
                {file ? file.name : "Fayl tanlanmagan"}
              </span>
              <select
                className="rounded border px-3 py-2 text-sm ml-2"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">— Guruh tanlang —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleUpload}
                disabled={!file || loading}
                className={`ml-2 flex items-center rounded-md px-4 py-2 text-sm font-medium text-white ${file && !loading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-gray-400"
                  }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-1" />
                    Yuklash
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <FiPlus className="mr-1" />
            Mavzu qo'shish
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          {/* Guruh filter */}
          <select
            className="rounded border px-3 py-2 text-sm"
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
          >
            <option value="">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Qidiruv input */}
          <input
            type="text"
            placeholder="O‘qituvchi, mavzu yoki talaba bo‘yicha qidirish..."
            className="flex-grow rounded border px-3 py-2 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Excel Export */}
          <button
            onClick={handleExportExcel}
            className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <FiDownload className="mr-1" />
            Excel yuklab olish
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              Magistr mavzular va o'qituvchilar
            </h2>
            <span className="text-lg font-bold text-gray-600">
              Jami: {filteredTeachers.length} ta
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="w-auto px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    O'qituvchi
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mavzu
                  </th>
                  <th className="w-auto px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Talaba
                  </th>
                  <th className="w-32 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kontrakt
                  </th>

                  <th className="w-auto px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Guruh
                  </th>
                  <th className="w-44 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mavzuga biriktirish
                  </th>
                  <th className="w-28 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Holati
                  </th>
                  <th className="w-36 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Yaratilgan sana
                  </th>
                  <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-gray-900">
                        {t.teacherName}
                      </td>
                      <td className=" px-3 py-2 text-xs text-gray-900">
                        {t.themeName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {t.student ? t.student.fullName : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-700">
                        {t.contract ? `${t.contract.payment} so‘m` : "-"}
                      </td>

                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {t.student ? t.student.groupName : "-"}
                      </td>
                      <td className="text-black px-3 py-2 text-xs">
                        <select
                          className="rounded border px-2 py-1 text-xs"
                          value={
                            t.student && t.student.groupName
                              ? groups.find(
                                (g) => g.name === t.student.groupName
                              )?.id || ""
                              : t.groups
                                ? t.groups.id
                                : ""
                          }
                          onChange={(e) =>
                            handleGroupChange(t.id, e.target.value)
                          }
                        >
                          <option value="">- Guruh tanlang -</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs">
                        {t.student ? (
                          <span className="inline-flex rounded-full bg-green-100 px-2 text-[10px] font-semibold leading-5 text-green-800">
                            ✅ Faol
                          </span>
                        ) : !t.groups ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2 text-[10px] font-semibold leading-5 text-red-800">
                            ❌ Guruh biriktirilmagan
                          </span>
                        ) : (
                          <span
                            className={`inline-flex rounded-full px-2 text-[10px] font-semibold leading-5 ${t.status
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {t.status ? "Faol" : "Nofaol"}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">
                        {t.createdAt
                          ? new Date(t.createdAt).toLocaleString("uz-UZ")
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-xs font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openStudentModal(t)}
                            className="text-green-600 hover:text-green-900"
                            title="Talaba biriktirish"
                          >
                            <MdOutlineAddLink size={20} />
                          </button>
                          <button
                            onClick={() => startEdit(t)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Tahrirlash"
                          >
                            <FiEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:text-red-900"
                            title="O'chirish"
                          >
                            <FiTrash2 size={14} />
                          </button>
                          {/* PDF yuklash knopkasi */}
                          <button
                            className="text-indigo-600 hover:text-indigo-800"
                            onClick={() => document.getElementById(`file-${t.id}`).click()}
                            title="PDF yuklash"
                          >
                            <FiUpload size={16} />
                          </button>

                          <input
                            type="file"
                            id={`file-${t.id}`}
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              handleFileUploadForTeacher(t.id, file);
                            }}
                          />

                          {/* Agar PDF mavjud bo‘lsa — yuklab olish knopkasi */}
                          {t.attachment && (
                            <button
                              className="text-purple-600 hover:text-purple-800"
                              title="PDF-ni ochish"
                              onClick={() =>
                                handleDownloadFile(t.attachment.id, t.attachment.name)
                              }
                            >
                              <FiDownload size={16} />
                            </button>
                          )}


                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-3 py-2 text-center text-xs text-gray-500"
                    >
                      Ma'lumot yo'q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {showStudentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 opacity-75" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:h-screen sm:align-middle">&#8203;</span>

              <div className="inline-block w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Talabani biriktirish — {selectedTeacher?.teacherName}
                  </h3>
                  <button onClick={() => setShowStudentModal(false)}>
                    <FiX className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                  </button>
                </div>
                {/* Guruh tanlash */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Guruh</label>
                  <Select
                    value={groups.find((g) => g.id === selectedModalGroup) || null}
                    onChange={(option) => handleGroupSelect(option?.id || "")}
                    options={groups}
                    getOptionLabel={(g) => g.name}
                    getOptionValue={(g) => g.id}
                    placeholder="Guruh tanlang"
                    className="mt-1 text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />

                </div>

                {/* Talaba tanlash */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Talaba</label>
                  {loadingStudents ? (
                    <p className="text-sm text-gray-500">Yuklanmoqda...</p>
                  ) : (
                    <Select
                      value={groupStudents.find((s) => s.id === selectedStudent) || null}
                      onChange={(option) => setSelectedStudent(option?.id || "")}
                      options={groupStudents}
                      getOptionLabel={(s) => s.fullName}
                      getOptionValue={(s) => s.id}
                      placeholder={
                        selectedModalGroup ? "Talaba tanlang" : "Avval guruh tanlang"
                      }
                      isSearchable={true}
                      isDisabled={!selectedModalGroup}
                      className={`mt-1 text-sm ${!selectedModalGroup ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                      styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    />
                  )}
                </div>



                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveStudent}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Ma'lumotni tahrirlash
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            O'qituvchi
                          </label>
                          <input
                            type="text"
                            value={editTeacherName}
                            onChange={(e) => setEditTeacherName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Mavzu
                          </label>
                          <input
                            type="text"
                            value={editThemeName}
                            onChange={(e) => setEditThemeName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    onClick={saveEdit}
                    type="button"
                    className="border-transparent inline-flex w-full justify-center rounded-md border bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Saqlash
                  </button>
                  <button
                    onClick={() => setEditItem(null)}
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:h-screen sm:align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                          Mavzu qo'shish
                        </h3>
                        <button
                          onClick={() => setShowAddModal(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <FiX className="h-6 w-6" />
                        </button>
                      </div>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            O'qituvchi
                          </label>
                          <input
                            type="text"
                            value={newTeacherName}
                            onChange={(e) => setNewTeacherName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Mavzu
                          </label>
                          <input
                            type="text"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    onClick={handleAddNew}
                    type="button"
                    className="border-transparent inline-flex w-full justify-center rounded-md border bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Qo'shish
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Index;
