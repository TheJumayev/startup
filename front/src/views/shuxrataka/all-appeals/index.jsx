import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";

const Duty = () => {
  const { id } = useParams();

  let groupId = id;
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [action, setAction] = useState("online");
  const [confirming, setConfirming] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [openResetModal, setOpenResetModal] = useState(false);
  const [studentToReset, setStudentToReset] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Student Explanation CRUD
  const [openExplanationModal, setOpenExplanationModal] = useState(false);
  const [studentExplanations, setStudentExplanations] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [selectedExplanationFile, setSelectedExplanationFile] = useState(null);
  const [editingExplanation, setEditingExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const statusColors = {
    1: "bg-yellow-100 text-yellow-800 border-yellow-200",
    2: "bg-orange-100 text-orange-800 border-orange-200",
    3: "bg-red-100 text-red-800 border-red-200",
  };

  const statusLabels = {
    1: "Ogohlantirish",
    2: "Hayfsan",
    3: "Qattiq hayfsan",
  };

  const handleExplanationFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF yuklash mumkin ❌");
      return;
    }

    setSelectedExplanationFile(file);
  };

  const fetchExplanations = async (studentId) => {
    try {
      setLoadingExplanation(true);
      const res = await ApiCall(
        `/api/v1/student-explanation/student/${studentId}`,
        "GET"
      );
      setStudentExplanations(res?.data || []);
    } catch (e) {
      toast.error("Yuklashda xatolik ❌");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const saveExplanation = async () => {
    if (!selectedStudent) return;

    try {
      if (!selectedExplanationFile && !editingExplanation) {
        toast.error("PDF yuklash majburiy ❌");
        return;
      }

      let fileId = editingExplanation?.file?.id;

      if (selectedExplanationFile) {
        const formData = new FormData();
        formData.append("photo", selectedExplanationFile);
        formData.append("prefix", "student_explanation");

        const uploadRes = await ApiCall(
          "/api/v1/file/upload",
          "POST",
          formData,
          { "Content-Type": "multipart/form-data" }
        );

        fileId = uploadRes.data;
      }

      const dto = {
        studentId: selectedStudent.id,
        explanationFileId: fileId,
        status: selectedStatus,
      };

      if (editingExplanation) {
        await ApiCall(
          `/api/v1/student-explanation/${editingExplanation.id}`,
          "PUT",
          dto
        );
        toast.success("Yangilandi ✅");
      } else {
        await ApiCall("/api/v1/student-explanation", "POST", dto);
        toast.success("Qo‘shildi ✅");
      }

      setSelectedExplanationFile(null);
      setEditingExplanation(null);
      fetchExplanations(selectedStudent.id);
    } catch (e) {
      toast.error("Xatolik ❌");
    }
  };

  const deleteExplanation = async (id) => {
    if (!window.confirm("O‘chirmoqchimisiz?")) return;

    await ApiCall(`/api/v1/student-explanation/${id}`, "DELETE");
    toast.success("O‘chirildi ✅");
    fetchExplanations(selectedStudent.id);
  };

  const resetStudentPassword = async () => {
    if (!studentToReset) return;

    setResetLoading(true);
    try {
      const dto = {
        login: studentToReset.studentIdNumber,
        password: studentToReset.studentIdNumber,
      };

      await ApiCall("/api/v1/student/password", "PUT", dto);
      toast.success("Parol muvaffaqiyatli tiklandi!");
      setOpenResetModal(false);
    } catch (err) {
      toast.error("Parolni tiklashda xatolik!");
    } finally {
      setResetLoading(false);
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

      const contentType = response.headers.get("Content-Type") || "";
      const fileExtension =
        contentType === "application/pdf"
          ? ".pdf"
          : contentType.includes("zip")
          ? ".zip"
          : "";

      const downloadName =
        fileName && fileName.includes(".")
          ? fileName
          : `fayl${fileExtension || ".pdf"}`;

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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin ❌");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fayl hajmi 5 MB dan katta bo‘lmasligi kerak ❌");
      return;
    }

    setSelectedFile(file);
  };
  const today = new Date().toISOString().split("T")[0];
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/groups/students/${groupId}`,
        "GET"
      );
      if (response && Array.isArray(response.data)) {
        setStudents(response.data);
        setFilteredStudents(response.data);
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async () => {
    setUpdating(true);
    try {
      await getStudentFromHemis();
      await fetchStudents();
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStudentFromHemis = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/groups/update-students/${groupId}`,
        "GET"
      );
      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto‘g‘ri.");
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      console.error("Xatolik (yangilash):", error);
    }
  };

  const [openReportModal, setOpenReportModal] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const openReport = () => {
    const { from, to } = getLastWeekRange();

    setFromDate(from);
    setToDate(to);
    setOpenReportModal(true);
  };

  const getLastWeekRange = () => {
    const today = new Date();
    const lastWeek = new Date();

    lastWeek.setDate(today.getDate() - 7);

    return {
      from: lastWeek.toISOString().split("T")[0],
      to: today.toISOString().split("T")[0],
    };
  };

  const downloadAttendanceReport = async () => {
    if (!fromDate || !toDate) {
      toast.error("Sanani tanlang ❗");
      return;
    }

    if (fromDate > toDate) {
      toast.error(
        "Boshlanish sanasi tugash sanasidan katta bo‘lishi mumkin emas ❗"
      );
      return;
    }

    setReportLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        baseUrl + "/api/v1/attendance-offline/report",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            groupId: groupId,
            fromDate: fromDate,
            toDate: toDate,
          }),
        }
      );

      if (!response.ok) throw new Error();

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const fileName = `Davomat_${fromDate}_${toDate}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Excel yuklandi ✅");
      setOpenReportModal(false);
    } catch (error) {
      toast.error("Xatolik yuz berdi ❌");
    } finally {
      setReportLoading(false);
    }
  };

  const downloadExcelStudents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        baseUrl + `/api/v1/hisobot-rektor/excel/${groupId}`,
        {
          method: "GET",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (!response.ok) throw new Error("Faylni yuklab bo‘lmadi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const today = new Date().toISOString().split("T")[0];
      const fileName = `Hisobot_Guruhlar_${today}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Xatolik:", error);
      navigate("/admin/login");
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredStudents(students);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = students.filter((student) => {
      return (
        student?.fullName?.toLowerCase().includes(searchLower) ||
        student?.studentIdNumber?.toLowerCase().includes(searchLower) ||
        student?.groupName?.toLowerCase().includes(searchLower) ||
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower) ||
        student.middleName?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    if (groupId) {
      fetchStudents();
    }
  }, [groupId]);

  const confirmAction = async () => {
    if (!selectedStudent) return;
    setConfirming(true);

    try {
      let res;
      if (action === "online") {
        let finalFileId = fileId;

        if (!finalFileId && selectedFile) {
          const formData = new FormData();
          formData.append("photo", selectedFile);
          formData.append("prefix", "student_online");

          const uploadRes = await ApiCall(
            "/api/v1/file/upload",
            "POST",
            formData,
            { "Content-Type": "multipart/form-data" }
          );

          if (uploadRes?.data) {
            finalFileId = uploadRes.data;
            setFileId(finalFileId);
          } else {
            toast.error("Fayl yuklashda xatolik ❌");
            setConfirming(false);
            return;
          }
        }

        res = await ApiCall(
          `/api/v1/online-student/online/${selectedStudent.id}/${finalFileId}`,
          "POST"
        );
      } else {
        res = await ApiCall(
          `/api/v1/online-student/remove/${selectedStudent.id}`,
          "PUT"
        );
      }

      if (res) {
        toast.success(
          action === "online"
            ? "Student online qilindi ✅"
            : "Student offline qilindi ✅"
        );
        await fetchStudents();
        setOpenModal(false);
        setSelectedFile(null);
        setFileId(null);
      } else {
        toast.error("Xatolik yuz berdi ❌");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server bilan xatolik ❌");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="max-w-8xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Guruhlar", to: "/office/groups" }]} />
        </div>

        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              {students[0]?.groupName || "Guruh"}
              <span className="ml-2 text-lg font-normal text-gray-500">
                ({filteredStudents.length} talaba)
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* EXCEL */}
            <button
              onClick={openReport}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              📊 Davomat
            </button>
            <button
              onClick={downloadExcelStudents}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              📊 Excel
            </button>

            <button
              onClick={updateStudent}
              disabled={loading || updating}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || updating
                  ? "cursor-not-allowed bg-gray-400 shadow-gray-200"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-200 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500"
              }`}
            >
              {loading || updating ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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
                  <svg
                    className="h-5 w-5"
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
                  Talabalarni yangilash
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="group relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-5 w-5 text-gray-400 transition-colors group-focus-within:text-blue-500"
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
            <input
              type="text"
              placeholder="Talaba ismi, familiyasi yoki ID raqami bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="block w-full rounded-xl border-0 bg-white py-4 pl-12 pr-12 text-gray-900 shadow-lg ring-1 ring-gray-200 transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch("")}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition-colors hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
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
          </div>

          {searchTerm && (
            <div className="animate-fade-in mt-3 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Topilgan talabalar:{" "}
                <span className="font-bold">{filteredStudents.length} ta</span>
              </span>
            </div>
          )}
        </div>

        {(loading || updating) && <LoadingOverlay text="Yuklanmoqda..." />}

        {!loading && filteredStudents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Talabalar topilmadi
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? "Qidiruv boʻyicha talabalar topilmadi. Boshqa so'z bilan urinib ko'ring."
                : "Talabalar ro'yxati bo'sh. Yangilash tugmasini bosing."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      №
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      FISH
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Telefon
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Otasining telefoni
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Onasining telefoni
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Talaba ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Semestr
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                      GPA
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.id || index}
                      className="group transition-colors hover:bg-blue-50/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td
                        className="cursor-pointer whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 hover:text-blue-600"
                        onClick={() =>
                          navigate(`/office/groups/group/${student.id}`)
                        }
                      >
                        <div className="flex items-center gap-3">
                          {student?.image ? (
                            <img
                              src={student.image}
                              alt={student.fullName}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 group-hover:ring-blue-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/40";
                              }}
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-xs font-medium text-gray-600">
                              {student?.fullName?.charAt(0) || "?"}
                            </div>
                          )}
                          <span>{student?.fullName || "-"}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {student?.phone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {student?.fatherPhone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {student?.motherPhone || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-600">
                        {student?.studentIdNumber || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {student?.semesterName || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            (student?.avgGpa || 0) >= 4.5
                              ? "bg-green-100 text-green-800"
                              : (student?.avgGpa || 0) >= 3.5
                              ? "bg-blue-100 text-blue-800"
                              : (student?.avgGpa || 0) >= 2.5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {student?.avgGpa || "0"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setAction(
                                student.isOnline ? "offline" : "online"
                              );
                              setOpenModal(true);
                            }}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md ${
                              student.isOnline
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-green-500 hover:bg-green-600"
                            }`}
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={
                                  student.isOnline
                                    ? "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    : "M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7.664V8c0 4.033-3.107 7.664-6.96 7.934A7.997 7.997 0 0112 20c-4.42 0-8-3.58-8-8s3.58-8 8-8c2.187 0 4.193.895 5.658 2.344L20 7.664z"
                                }
                              />
                            </svg>
                            {student.isOnline ? "Offline" : "Online"}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedStudent(student);
                              setOpenExplanationModal(true);
                              fetchExplanations(student.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-yellow-600 hover:shadow-md"
                          >
                            <svg
                              className="h-3.5 w-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            Intizomiy
                          </button>

                          <button
                            onClick={() => {
                              setStudentToReset(student);
                              setOpenResetModal(true);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
                            title="Parolni tiklash"
                          >
                            <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <Modal
          open={openReportModal}
          onClose={() => setOpenReportModal(false)}
          center
        >
          <h2 className="mb-4 text-lg font-bold">Davomat hisobotini yuklash</h2>

          <div className="mb-4 flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium">
                Boshlanish sanasi
              </label>
              <input
                type="date"
                max={today}
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);

                  // agar yangi fromDate toDate dan katta bo‘lsa, toDate ni ham tenglashtiramiz
                  if (toDate && e.target.value > toDate) {
                    setToDate(e.target.value);
                  }
                }}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Tugash sanasi</label>
              <input
                type="date"
                value={toDate}
                min={fromDate} // ❌ boshlanishdan kichik bo‘lmaydi
                max={today} // ❌ ertani tanlab bo‘lmaydi
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setOpenReportModal(false)}
              className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
              disabled={reportLoading}
            >
              Bekor qilish
            </button>

            <button
              onClick={downloadAttendanceReport}
              disabled={reportLoading}
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              {reportLoading ? "Yuklanmoqda..." : "Excel yuklash"}
            </button>
          </div>
        </Modal>

        {/* Explanation Modal */}
        <Modal
          open={openExplanationModal}
          onClose={() => {
            setOpenExplanationModal(false);
            setEditingExplanation(null);
            setSelectedExplanationFile(null);
          }}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-2xl w-full",
            closeButton: "hover:bg-gray-100 rounded-lg p-1",
          }}
        >
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-yellow-500"></div>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedStudent?.fullName}
              </h2>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                Intizomiy choralar
              </span>
            </div>

            {/* Form */}
            <div className="mb-8 rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 font-semibold text-gray-700">
                {editingExplanation
                  ? "Chorani tahrirlash"
                  : "Yangi chora qo'shish"}
              </h3>
              <div className="space-y-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(Number(e.target.value))}
                  className="w-full rounded-lg border-0 bg-white px-4 py-2.5 text-gray-900 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-yellow-500"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleExplanationFile}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                  {selectedExplanationFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {selectedExplanationFile.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={saveExplanation}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-700 px-4 py-2.5 font-medium text-white shadow-lg shadow-yellow-200 transition-all hover:from-yellow-700 hover:to-yellow-800"
                >
                  {editingExplanation ? "Yangilash" : "Qo'shish"}
                </button>
              </div>
            </div>

            {/* List */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-700">
                Mavjud choralar
              </h3>
              {loadingExplanation ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-200 border-t-yellow-600"></div>
                </div>
              ) : studentExplanations.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                  <p className="text-gray-500">
                    Hozircha hech qanday chora mavjud emas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentExplanations.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-yellow-200 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${
                              statusColors[item.status]
                            }`}
                          >
                            {statusLabels[item.status]}
                          </span>
                          <button
                            onClick={() =>
                              handleDownloadFile(
                                item.file?.id,
                                item.file?.originalName || "intizomiy.pdf"
                              )
                            }
                            className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
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
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            PDF ni yuklab olish
                          </button>
                        </div>
                        <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setEditingExplanation(item);
                              setSelectedStatus(item.status);
                            }}
                            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                            title="Tahrirlash"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteExplanation(item.id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100"
                            title="O'chirish"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Online/Offline Modal */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-md w-full",
            closeButton: "hover:bg-gray-100 rounded-lg p-1",
          }}
        >
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`h-10 w-1 rounded-full ${
                  action === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <h2 className="text-lg font-bold text-gray-800">Tasdiqlash</h2>
            </div>

            <p className="mb-4 text-gray-600">
              Siz{" "}
              <span className="font-semibold text-blue-600">
                {selectedStudent?.fullName}
              </span>{" "}
              ni{" "}
              <span
                className={`font-semibold ${
                  action === "online" ? "text-green-600" : "text-red-600"
                }`}
              >
                {action === "online" ? "online" : "offline"}
              </span>{" "}
              qilmoqchimisiz?
            </p>

            {action === "online" && (
              <div className="mb-4">
                {selectedFile ? (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="font-medium">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="ml-auto text-red-500 hover:text-red-700"
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
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      window.fileInputRef && window.fileInputRef.click()
                    }
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>PDF fayl yuklash</span>
                    </div>
                  </button>
                )}
              </div>
            )}

            <input
              type="file"
              accept="application/pdf"
              ref={(el) => (window.fileInputRef = el)}
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedFile(null);
                  setFileId(null);
                }}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                disabled={confirming}
              >
                Bekor qilish
              </button>

              {action === "online" ? (
                <button
                  onClick={async () => {
                    if (!selectedFile) {
                      window.fileInputRef && window.fileInputRef.click();
                    } else {
                      await confirmAction();
                    }
                  }}
                  disabled={confirming}
                  className={`rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-200 transition-all hover:from-green-700 hover:to-green-800 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                    </span>
                  ) : (
                    "Tasdiqlash"
                  )}
                </button>
              ) : (
                <button
                  onClick={confirmAction}
                  disabled={confirming}
                  className={`rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-200 transition-all hover:from-red-700 hover:to-red-800 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? "Yuborilmoqda..." : "Tasdiqlash"}
                </button>
              )}
            </div>
          </div>
        </Modal>

        {/* Reset Password Modal */}
        <Modal
          open={openResetModal}
          onClose={() => setOpenResetModal(false)}
          center
          classNames={{
            modal: "rounded-2xl p-6 max-w-md w-full",
            closeButton: "hover:bg-gray-100 rounded-lg p-1",
          }}
        >
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-1 rounded-full bg-blue-500"></div>
              <h2 className="text-lg font-bold text-gray-800">
                Parolni tiklash
              </h2>
            </div>

            <p className="mb-6 text-gray-600">
              Talaba{" "}
              <span className="font-semibold text-blue-600">
                {studentToReset?.fullName}
              </span>{" "}
              parolini{" "}
              <span className="inline-block rounded-lg bg-gray-100 px-2 py-1 font-mono font-semibold">
                {studentToReset?.studentIdNumber}
              </span>{" "}
              raqamiga teng qilib tiklashni tasdiqlaysizmi?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                onClick={() => setOpenResetModal(false)}
                disabled={resetLoading}
              >
                Bekor qilish
              </button>

              <button
                className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-200 transition-all hover:from-blue-700 hover:to-blue-800"
                onClick={resetStudentPassword}
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                    Tiklanmoqda...
                  </span>
                ) : (
                  "Tiklash"
                )}
              </button>
            </div>
          </div>
        </Modal>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Duty;
