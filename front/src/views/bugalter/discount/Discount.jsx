import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ContractTemplate from "./ContractTemplate";
import { useContractPdf } from "./useContractPdf";

function Discount() {
  const [contractLoadingId, setContractLoadingId] = useState(null);
  const { downloadContract } = useContractPdf();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDiscount, setOpenDiscount] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  // yangi state
  const [searchId, setSearchId] = useState("");
  const openAddModal = () => {
    setStudentData({
      name: "",
      passport_pin: "",
      hemis_login: "",
      group: "",
      asos: "",
      description: "",
    });
    setDiscounts([{ name: "", discount: "" }]);
    setOpen(true);
  };
  const handleDownloadContract = async (student) => {
    try {
      setContractLoadingId(student.id); // 🔥 loading ichida qaysi ID borligini belgilash
      await downloadContract(student);   // sizning mavjud funksiyangiz
    } catch (error) {
      console.error(error);
    } finally {
      setContractLoadingId(null);        // 🔥 tugadi → loading o‘chadi
    }
  };

  const handleDownloadFile = async (fileId, fileName) => {
    if (!fileId) {
      toast.warning("Fayl topilmadi!");
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
      });

      if (!response.ok) {
        toast.error("Faylni yuklab bo'lmadi!");
        return;
      }

      const blob = await response.blob();

      // Fayl turini aniqlash (xavfsiz tekshiruv bilan)
      const contentType = response.headers.get("Content-Type") || "";
      const fileExtension =
        contentType === "application/pdf"
          ? ".pdf"
          : contentType.includes("zip")
            ? ".zip"
            : "";

      // Fayl nomini aniqlash
      const downloadName =
        fileName && fileName.includes(".")
          ? fileName
          : `fayl${fileExtension || ".pdf"}`;

      // Faylni yuklab olish
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Fayl yuklab olindi!");
    } catch (error) {
      console.error("Yuklab olishda xatolik:", error);
      toast.error("Faylni yuklab olishda xatolik yuz berdi.");
    }
  };

  const openEditModal = (student) => {
    setEditStudentId(student.id);
    setStudentData({
      name: student.name || "",
      passport_pin: student.passport_pin || "",
      hemis_login: student.hemis_login || "",
      group: student.groupName || "",
      asos: student.asos || "",
      description: student.description || "",
    });

    // ✅ mavjud chegirmalarni ham yuklash
    if (student.discountByYear && student.discountByYear.length > 0) {
      setDiscounts(
        student.discountByYear.map((d) => ({
          name: d.name,
          discount: d.discount,
        }))
      );
    } else {
      setDiscounts([{ name: "", discount: "" }]);
    }

    setOpenEdit(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Rostdan ham ushbu talabani o'chirmoqchimisiz?")) {
      return;
    }
    try {
      await ApiCall(`/api/v1/discount-student/${studentId}`, "DELETE");
      toast.success("Talaba muvaffaqiyatli o'chirildi!");
      fetchStudents(); // jadvalni yangilash
    } catch (err) {
      console.error("O'chirishda xatolik:", err);
      toast.error("Talabani o'chirish muvaffaqiyatsiz tugadi.");
    }
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...studentData,
        discountByYear: discounts.map((d) => ({
          name: d.name,
          discount: parseInt(d.discount),
        })),
      };
      const res = await ApiCall(
        `/api/v1/discount-student/${editStudentId}`,
        "PUT",
        payload
      );
      if (res.data) {
        toast.success("Talaba ma'lumotlari yangilandi!");
        fetchStudents();
        setOpenEdit(false);
      }
    } catch (err) {
      console.error("Yangilashda xatolik:", err);
      toast.error("Talaba yangilash muvaffaqiyatsiz.");
    }
  };

  // Qidiruvni boshqarish
  useEffect(() => {
    let filtered = students;

    // ID bo'yicha qidiruv
    if (searchId) {
      filtered = filtered.filter(
        (student) => String(student.id) === searchId.trim()
      );
    }

    // umumiy qidiruv (ism, login, guruh...)
    else if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.passport_pin
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.hemis_login
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.groupName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchId, searchTerm, students]);

  const exportToExcel = () => {
    if (!students || students.length === 0) {
      toast.warning("Eksport qilish uchun ma'lumot yo'q");
      return;
    }

    // Sarlavhalar
    const header = [
      "№",
      "Talaba",
      "Jshshir",
      "Hemis ID",
      "Guruh",
      "Jami berilgan imtiyoz",
      "2021-2022",
      "2022-2023",
      "2023-2024",
      "2024-2025",
      "2025-2026",
      "2026-2027",
      "2027-2028",
      "2028-2029",
      "2029-2030",
      "Asos raqami va sanasi",
      "Yig'ilish bayoni",
    ];

    // Ma'lumotlarni formatlash
    const data = students.map((s, idx) => {
      const discountsByYear = {};
      let totalDiscount = 0;

      if (s.discountByYear) {
        s.discountByYear.forEach((d) => {
          discountsByYear[d.name] = d.discount;
          totalDiscount += d.discount;
        });
      }

      return [
        idx + 1,
        s.name || "",
        s.passport_pin || "",
        s.hemis_login || "",
        s.groupName || "",
        totalDiscount,
        discountsByYear["2021-2022"] || "",
        discountsByYear["2022-2023"] || "",
        discountsByYear["2023-2024"] || "",
        discountsByYear["2024-2025"] || "",
        discountsByYear["2025-2026"] || "",
        discountsByYear["2026-2027"] || "",
        discountsByYear["2027-2028"] || "",
        discountsByYear["2028-2029"] || "",
        discountsByYear["2029-2030"] || "",
        s.asos || "", // Asos raqami va sanasi
        s.description || "", // Yig'ilish bayoni
      ];
    });

    // Jadvalni yaratish
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talabalar");

    // Faylni saqlash
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "talaba_chegirmalari.xlsx");
  };

  // Form state
  const [studentData, setStudentData] = useState({
    name: "",
    passport_pin: "",
    hemis_login: "",
    group: "",
    asos: "",
    description: "",
  });
  const [discounts, setDiscounts] = useState([{ name: "", discount: "" }]);

  // Add single discount modal state
  const [newDiscount, setNewDiscount] = useState({ name: "", discount: "" });

  // Generate years 2020-2021 → 2029-2030
  const generateYears = () => {
    const years = [];
    for (let start = 2020; start < 2030; start++) {
      years.push(`${start}-${start + 1}`);
    }
    return years;
  };
  const yearOptions = generateYears();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/discount-student", "GET");
      console.log(res.data);

      if (res.data) {
        setStudents(res.data);
        setFilteredStudents(res.data);
      }
    } catch (err) {
      console.error("Talabalarni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleDiscountChange = (index, e) => {
    const updated = [...discounts];
    updated[index][e.target.name] = e.target.value;
    setDiscounts(updated);
  };

  const addDiscountField = () => {
    setDiscounts([...discounts, { name: "", discount: "" }]);
  };

  const removeDiscountField = (index) => {
    const updated = discounts.filter((_, i) => i !== index);
    setDiscounts(updated);
  };

  const handleUploadDiscountFile = async (discountYearId, file) => {
    if (!file) {
      toast.error("Fayl tanlanmagan!");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "/discount-year");

      // 1️⃣ upload
      const res = await ApiCall("/api/v1/file/upload", "POST", formData);
      const fileId = res.data;

      if (!fileId) {
        toast.error("Fayl ID qaytmadi!");
        return;
      }

      // 2️⃣ discountYear ga biriktirish
      await ApiCall(
        `/api/v1/discount-student/discountYear/${discountYearId}/${fileId}`,
        "PUT"
      );

      toast.success("📎 PDF fayl biriktirildi!");
      fetchStudents();
    } catch (e) {
      console.error(e);
      toast.error("Fayl yuklashda xatolik!");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...studentData,
      discountByYear: discounts.map((d) => ({
        name: d.name,
        discount: parseInt(d.discount),
      })),
    };
    try {
      const res = await ApiCall("/api/v1/discount-student", "POST", payload);
      if (res.data) {
        toast.success("Talaba muvaffaqiyatli qo'shildi!");
        fetchStudents();
        setOpen(false);
        setStudentData({
          name: "",
          passport_pin: "",
          hemis_login: "",
          group: "",
          asos: "",
          description: "",
        });
        setDiscounts([{ name: "", discount: "" }]);
      }
    } catch (err) {
      console.error("Talaba qo'shishda xatolik:", err);
      toast.error("Talaba qo'shish muvaffaqiyatsiz tugadi.");
    }
  };

  const openAddDiscountModal = (studentId) => {
    setSelectedStudentId(studentId);
    setNewDiscount({ name: "", discount: "" });
    setOpenDiscount(true);
  };

  const handleSubmitDiscount = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newDiscount.name,
        discount: parseInt(newDiscount.discount),
      };
      const res = await ApiCall(
        `/api/v1/discount-student/${selectedStudentId}/add-discount`,
        "PUT",
        payload
      );
      if (res.data) {
        toast.success("Chegirma muvaffaqiyatli qo'shildi!");
        fetchStudents();
        setOpenDiscount(false);
      }
    } catch (err) {
      console.error("Chegirma qo'shishda xatolik:", err);
      toast.error("Chegirma qo'shish muvaffaqiyatsiz tugadi.");
    }
  };

  // --- FILE LOGIC ---
  const openFileModal = (studentId) => {
    setSelectedStudentId(studentId);
    setFile(null);
    setOpenFile(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = [
      "application/pdf",
      "application/x-pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      toast.warning("Iltimos, faqat PDF yoki ZIP fayllarni tanlang.");
    }
  };

  const handleSaveFile = async () => {
    if (!file) {
      toast.warning("Iltimos, fayl tanlang.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "/discount-file");

      // upload file
      const uploadResponse = await ApiCall(
        "/api/v1/file/upload",
        "POST",
        formData,
        { "Content-Type": "multipart/form-data" }
      );

      console.log("Yuklash javobi:", uploadResponse.data);

      if (uploadResponse.data) {
        const fileId = uploadResponse.data; // ✅ FIX

        // save file to student
        await ApiCall(
          `/api/v1/discount-student/${selectedStudentId}/${fileId}`,
          "PUT"
        );

        toast.success("Fayl muvaffaqiyatli biriktirildi!");
        fetchStudents();
        setOpenFile(false);
      } else {
        toast.error("Faylni yuklash muvaffaqiyatsiz tugadi.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Faylni yuklashda xatolik.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex">
      <div className="min-h-screen w-full">
        <div className="p-2">
          {/* Qidiruv paneli */}
          <div className="mb-6 rounded-xl bg-white p-4 shadow-md">
            {/* ID bo'yicha qidiruv */}
            <div className="justify-between gap-10 md:flex">
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-600">
                  ID bo'yicha qidiruv
                </label>
                <input
                  type="text"
                  placeholder="Talaba ID..."
                  value={searchId}
                  onChange={(e) =>
                    setSearchId(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-3 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mt-4 flex w-full items-center space-x-4">
                <button
                  onClick={exportToExcel}
                  className="flex items-center rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:bg-green-700"
                >
                  📥 Excel yuklab olish
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-white shadow-lg transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Yangi Talaba Qo'shish
                </button>
              </div>
            </div>
            {/* Umumiy qidiruv */}
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-600">
                Umumiy qidiruv
              </label>
              <input
                type="text"
                placeholder="Ism, JSHSHIR, Hemis ID yoki guruh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 py-2 pl-3 pr-3 transition-colors duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex w-full justify-between">
                <div>
                  <h3 className="text-xl font-semibold">
                    Talaba Chegirma Yozuvlari
                  </h3>
                  <p className="text-indigo-100">
                    {searchTerm
                      ? `Qidiruv natijalari: ${filteredStudents.length} ta talaba topildi`
                      : "Chegirma ma'lumotlari bilan barcha talabalar"}
                  </p>
                </div>
                <div>
                  <h1 className="text-2xl font-medium">
                    Jami talabalar: {students.length} ta
                  </h1>
                </div>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="flex items-center rounded-md bg-white/20 px-3 py-1 text-sm transition-colors duration-200 hover:bg-white/30"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Filterni tozalash
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      №
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Talaba Ma'lumoti
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Akademik Tafsilotlar
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Chegirmalar
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Jami
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Hujjatlar
                    </th>
                    <th className="py-2 px-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                      Harakatlar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {!loading && filteredStudents.length > 0 ? (
                    filteredStudents.map((s, idx) => (
                      <tr
                        key={s.id}
                        className="transition-colors duration-150 hover:bg-indigo-50"
                      >
                        <td className="whitespace-nowrap py-2 px-2 text-sm font-medium text-gray-900">
                          {s.id}
                        </td>

                        <td className="whitespace-nowrap py-2 px-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {s.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              PIN: {s.passport_pin}
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap py-2 px-2">
                          <div>
                            <div className="text-sm text-gray-900">
                              Login: {s.hemis_login}
                            </div>
                            <div className="text-sm text-gray-500">
                              Guruh: {s.groupName}
                            </div>
                          </div>
                        </td>

                        <td className="py-2 px-2">
                          <div className="space-y-2">
                            {s.discountByYear?.map((d) => (
                              <div
                                key={d.id}
                                className="flex items-center justify-between rounded-md bg-indigo-50 p-2"
                              >
                                <span className="text-xs font-medium text-indigo-800">
                                  {d.name}: {d.discount}
                                </span>

                                <div className="flex items-center gap-2">
                                  {/* 📤 Upload PDF */}
                                  <label className="cursor-pointer text-xs text-indigo-600 hover:underline">
                                    📎 PDF
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      hidden
                                      onChange={(e) =>
                                        handleUploadDiscountFile(d.id, e.target.files[0])
                                      }
                                    />
                                  </label>

                                  {/* 📥 Download PDF */}
                                  {d.attachment && (
                                    <button
                                      onClick={() => handleDownloadFile(d.attachment.id)}
                                      className="text-xs text-green-600 hover:underline"
                                    >
                                      ⬇ PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="whitespace-nowrap py-2 px-2 text-sm font-bold text-blue-600">
                          {s.discountByYear
                            ? s.discountByYear.reduce(
                              (sum, d) => sum + (d.discount || 0),
                              0
                            )
                            : 0}
                        </td>

                        <td className="whitespace-nowrap py-2 px-2 text-sm text-gray-500">
                          {s.file ? (
                            <div>
                              <button
                                onClick={() =>
                                  handleDownloadFile(s.file?.id, s.file?.name)
                                }
                                className="inline-flex items-center text-indigo-600 transition-colors duration-200 hover:text-indigo-900"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="mr-1 h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Faylni Yuklab Olish
                              </button>

                              <p className="text-xs text-gray-400">
                                {s.file.name.endsWith(".pdf")
                                  ? "PDF fayl"
                                  : s.file.name.endsWith(".zip")
                                    ? "ZIP fayl"
                                    : "Noma’lum format"}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">
                              Fayl biriktirilmagan
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap py-2 px-2 text-sm font-medium">
                          <div className="flex flex-wrap gap-2">
                            {/* Chegirma */}
                            <button
                              onClick={() => openAddDiscountModal(s.id)}
                              className="flex items-center rounded-md bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 transition-colors duration-200 hover:bg-indigo-200 hover:text-indigo-900"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-1 h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.967.744L14.146 7.2 17 7.5a1 1 0 01.78 1.625l-3.1 4.4-1.15 4.2a1 1 0 01-1.941-.002l-1.15-4.2-3.1-4.4A1 1 0 017 7.5l2.845-.3L12 2a1 1 0 011-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Chegirma
                            </button>

                            {/* Fayl */}
                            <button
                              onClick={() => openFileModal(s.id)}
                              className="flex items-center rounded-md bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 transition-colors duration-200 hover:bg-purple-200 hover:text-purple-900"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-1 h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Fayl
                            </button>
                            {s.discountByYear?.some(
                              (d) => d.name === "2025-2026" && d.discount > 0
                            ) && (
                                <button
                                  onClick={() => handleDownloadContract(s)}
                                  className="flex items-center rounded-md bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 min-w-[110px] justify-center"
                                  disabled={contractLoadingId === s.id} // 🔥 Bosilmaydi loading paytida
                                >
                                  {contractLoadingId === s.id ? (
                                    <svg
                                      className="animate-spin h-4 w-4 text-blue-700"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    "📄 Shartnoma"
                                  )}
                                </button>
                              )}



                            {/* Tahrirlash */}
                            <button
                              onClick={() => openEditModal(s)}
                              className="flex items-center rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors duration-200 hover:bg-green-200 hover:text-green-900"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="mr-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                                />
                              </svg>
                              Tahrirlash
                            </button>

                            {/* O'chirish */}
                            {/* <button
                              onClick={() => handleDeleteStudent(s.id)}
                              className="flex items-center rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors duration-200 hover:bg-red-200 hover:text-red-900"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="mr-1 h-4 w-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397M9.26 9l.346 9m4.788 0L14.74 9"
                                />
                              </svg>
                              O'chirish
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 px-6 text-center">
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                          </div>
                        ) : searchTerm ? (
                          <div className="text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="mt-4">
                              "{searchTerm}" bo'yicha hech narsa topilmadi
                            </p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-2 text-indigo-600 hover:text-indigo-800"
                            >
                              Barcha talabalarni ko'rsatish
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="mx-auto h-12 w-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <p className="mt-4">Talaba yozuvlari topilmadi</p>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Modal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-3xl",
            closeButton: "top-4 right-4 text-gray-500 hover:text-gray-700",
          }}
        >
          <h2 className="mb-6 text-2xl font-bold text-indigo-800">
            Talabani Tahrirlash
          </h2>
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  To'liq Ism
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentData.name}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Pasport PIN
                </label>
                <input
                  type="text"
                  name="passport_pin"
                  value={studentData.passport_pin}
                  onChange={(e) => {
                    // faqat raqam va harf qabul qilinsin
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setStudentData({ ...studentData, passport_pin: val });
                  }}
                  minLength={14}
                  maxLength={14}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Hemis Login
                </label>
                <input
                  type="text"
                  name="hemis_login"
                  value={studentData.hemis_login}
                  onChange={(e) => {
                    // faqat raqam va maksimal 12 ta belgi
                    const val = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 12);
                    setStudentData({ ...studentData, hemis_login: val });
                  }}
                  maxLength={12}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <input
                  type="text"
                  name="group"
                  value={studentData.group}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Asos
                </label>
                <input
                  type="text"
                  name="asos"
                  value={studentData.asos}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tavsif
                </label>
                <input
                  type="text"
                  name="description"
                  value={studentData.description}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                />
              </div>
              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800">
                    Yil bo'yicha chegirmalar
                  </h3>
                  <button
                    type="button"
                    onClick={addDiscountField}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1 h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Yil Qo'shish
                  </button>
                </div>

                {discounts.map((discount, index) => (
                  <div key={index} className="mb-3 flex items-end space-x-2">
                    <div className="flex-grow">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        O'quv Yili
                      </label>
                      <select
                        name="name"
                        value={discount.name}
                        onChange={(e) => handleDiscountChange(index, e)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Yilni Tanlang</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Chegirma (so'm)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={discount.discount}
                        onChange={(e) => handleDiscountChange(index, e)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    {discounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDiscountField(index)}
                        className="rounded-lg p-2 text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setOpenEdit(false)}
                className="mr-3 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Bekor Qilish
              </button>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                Saqlash
              </button>
            </div>
          </form>
        </Modal>

        {/* --- Add Student Modal --- */}
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-3xl",
            closeButton: "top-4 right-4 text-gray-500 hover:text-gray-700",
          }}
        >
          <h2 className="mb-6 text-2xl font-bold text-indigo-800">
            Yangi Talaba Qo'shish
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  To'liq Ism
                </label>
                <input
                  type="text"
                  name="name"
                  value={studentData.name}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Pasport PIN
                </label>
                <input
                  type="text"
                  name="passport_pin"
                  value={studentData.passport_pin}
                  onChange={(e) => {
                    // faqat raqam va 14 ta belgigacha
                    const val = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 14);
                    setStudentData({ ...studentData, passport_pin: val });
                  }}
                  maxLength={14}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Hemis Login
                  </label>
                  <input
                    type="text"
                    name="hemis_login"
                    value={studentData.hemis_login}
                    onChange={(e) => {
                      // faqat raqam va 12 ta belgigacha
                      const val = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 12);
                      setStudentData({ ...studentData, hemis_login: val });
                    }}
                    maxLength={12}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <input
                  type="text"
                  name="group"
                  value={studentData.groupName}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Asos
                </label>
                <input
                  type="text"
                  name="asos"
                  value={studentData.asos}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tavsif
                </label>
                <input
                  type="text"
                  name="description"
                  value={studentData.description}
                  onChange={handleStudentChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800">
                  Yil bo'yicha chegirmalar
                </h3>
                <button
                  type="button"
                  onClick={addDiscountField}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Yil Qo'shish
                </button>
              </div>

              {discounts.map((discount, index) => (
                <div key={index} className="mb-3 flex items-end space-x-2">
                  <div className="flex-grow">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      O'quv Yili
                    </label>
                    <select
                      name="name"
                      value={discount.name}
                      onChange={(e) => handleDiscountChange(index, e)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Yilni Tanlang</option>
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Chegirma (so'm)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      value={discount.discount}
                      onChange={(e) => handleDiscountChange(index, e)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  {discounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDiscountField(index)}
                      className="rounded-lg p-2 text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mr-3 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              >
                Bekor Qilish
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-indigo-700"
              >
                Talaba Qo'shish
              </button>
            </div>
          </form>
        </Modal>

        {/* --- Add Discount Modal --- */}
        <Modal
          open={openDiscount}
          onClose={() => setOpenDiscount(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-md",
            closeButton: "top-4 right-4 text-gray-500 hover:text-gray-700",
          }}
        >
          <h2 className="mb-6 text-2xl font-bold text-indigo-800">
            Chegirma Qo'shish
          </h2>
          <form onSubmit={handleSubmitDiscount} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                O'quv Yili
              </label>
              <select
                name="name"
                value={newDiscount.name}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Yilni Tanlang</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Chegirma
              </label>
              <input
                type="number"
                name="discount"
                value={newDiscount.discount}
                onChange={(e) =>
                  setNewDiscount({ ...newDiscount, discount: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setOpenDiscount(false)}
                className="mr-3 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100"
              >
                Bekor Qilish
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-6 py-2 text-white transition-colors duration-200 hover:bg-indigo-700"
              >
                Chegirma Qo'shish
              </button>
            </div>
          </form>
        </Modal>

        {/* --- Add File Modal --- */}
        <Modal
          open={openFile}
          onClose={() => setOpenFile(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-md",
            closeButton: "top-4 right-4 text-gray-500 hover:text-gray-700",
          }}
        >
          <h2 className="mb-6 text-2xl font-bold text-indigo-800">
            Fayl Biriktirish
          </h2>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              PDF yoki ZIP Fayl Tanlang
            </label>
            <div className="flex w-full items-center justify-center">
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors duration-200 hover:border-indigo-500 hover:bg-indigo-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-2 h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="text-xs text-gray-500">
                    {file
                      ? file.name
                      : "Yuklash uchun bosing yoki bu erga sudrab boring"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.zip,application/pdf,application/zip"
                />
              </label>
            </div>
          </div>
          <button
            onClick={handleSaveFile}
            disabled={saving}
            className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-white transition-colors duration-200 hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {saving ? (
              <>
                <svg
                  className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Yuklanmoqda...
              </>
            ) : (
              "Faylni Saqlash"
            )}
          </button>
        </Modal>
      </div>
      {/* <div className="p-4 border rounded-lg shadow-md bg-white hidden">
        <h2 className="text-lg font-bold mb-2">Shartnoma preview</h2>
        <div className="scale-[0.8] origin-top-left border p-2 bg-gray-50">
          <ContractTemplate />
        </div>
      </div> */}
      <div
        id="pdf-container"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <ContractTemplate />
      </div>
    </div>
  );
}

export default Discount;
