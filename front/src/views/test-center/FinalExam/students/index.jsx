import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../../config/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function SuperadminFinalExamEdit() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [reasonText, setReasonText] = useState([]);
  const [reasonStudentName, setReasonStudentName] = useState("");
  const [reasonModal, setReasonModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ballModal, setBallModal] = useState(false);
  const [ballStudent, setBallStudent] = useState(null);
  const [newBall, setNewBall] = useState("");
  const getMaxBall = (st) => {
    if (
      st?.finalExam?.isAmaliy === true &&
      st?.finalExam?.isAmaliyot === true
    ) {
      return 100;
    }
    if (st?.finalExam?.isAmaliy === true) {
      return 50;
    }
    return 50; // default (xavfsizlik uchun)
  };

  const navigate = useNavigate();
  const goToTests = (studentId) => {
    navigate(`/test-center/final-exam/students/tests/${studentId}`);
  };

  const updateBall = async (finalExamStudentId, ball) => {
    if (ball === undefined || ball === null || ball === "") {
      return toast.error("⚠️ Ball kiritilmadi!");
    }

    // ✅ MANA SHU QATOR YETISHMAYOTGAN EDI
    const intBall = parseInt(ball, 10);

    const maxBall = getMaxBall(
      students.find((s) => s.id === finalExamStudentId)
    );

    if (intBall < 0 || intBall > maxBall) {
      return toast.error(`⚠️ Ball 0 dan ${maxBall} gacha bo'lishi kerak!`);
    }

    try {
      await ApiCall(
        `/api/v1/final-exam-student/ball/${finalExamStudentId}/${intBall}`,
        "PUT"
      );

      toast.success("✅ Ball muvaffaqiyatli yangilandi!");

      setStudents((prev) =>
        prev.map((s) =>
          s.id === finalExamStudentId ? { ...s, ball: intBall } : s
        )
      );
    } catch (err) {
      toast.error("❌ Ball saqlanmadi!");
    }
  };

  const exportToExcel = () => {
    if (!students.length) {
      toast.error("Eksport uchun ma'lumot yo'q!");
      return;
    }

    const data = students.map((st, index) => {
      const status = getTestStatus(st).text;

      return {
        "№": index + 1,
        "F.I.Sh": st.student?.fullName,
        Guruh: st.student?.groupName || st.student?.group?.name,
        "Fan nomi": st.finalExam?.name,
        Urinishlar: `${st.attempt}/${st.finalExam?.attempts}`,
        "Boshlagan vaqt": st.startTime || "Boshlamagan",
        "Tugatgan vaqt": st.endTime || "-",
        "Test holati": status,
        "To'g'ri": st.correctCount ?? "-",
        Xato: st.wrongCount ?? "-",
        Ball: st.ball ?? "-",
        "O'tgan / O'tmagan":
          st.isPassed === true
            ? "O'tdi"
            : st.isPassed === false
            ? "O'tmadi"
            : "-",
        "Ruxsat sabablari": st.permissionTextList?.join("; ") || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Final Exam");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `final_exam_${new Date().toLocaleDateString()}.xlsx`
    );

    toast.success("📥 Excel muvaffaqiyatli yaratildi!");
  };
  const getTestStatus = (st) => {
    // 1) Hali boshlamagan
    if (!st.startTime) {
      return { text: "Hali boshlamagan", color: "bg-gray-200 text-gray-800" };
    }

    // 2) Test davomida
    if (st.startTime && !st.endTime) {
      return {
        text: "Test ishlamoqda",
        color: "bg-yellow-200 text-yellow-800",
      };
    }

    // 3) Tugagan → O'tdi / O'tmadi
    if (st.endTime) {
      if (st.isPassed === true) {
        return { text: "O'tdi", color: "bg-green-200 text-green-800" };
      }
      if (st.isPassed === false) {
        return { text: "O'tmadi", color: "bg-red-200 text-red-800" };
      }
    }

    return { text: "Noma'lum", color: "bg-gray-300 text-gray-700" };
  };

  const togglePermission = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/final-exam-student/exam-status/${selectedStudentId}`,
        "PUT"
      );

      toast.success("✅ Ruxsat muvaffaqiyatli yangilandi!");

      setStudents((prev) =>
        prev.map((s) => (s.id === selectedStudentId ? res.data : s))
      );
    } catch (err) {
      toast.error("❌ Xatolik! Holat o'zgartirilmadi.");
    } finally {
      setShowModal(false);
      setSelectedStudentId(null);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("ID topilmadi! URL noto'g'ri.");
      setLoading(false);
      return;
    }
    fetchExamStudents();
  }, [id]);

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("📥 Fayl yuklab olindi!");
    } catch (err) {
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  const handleFileUpload = async (examStudentId, file, text) => {
    if (!file) return toast.error("⚠️ Fayl tanlanmadi!");
    if (file.type !== "application/pdf") {
      return toast.error("❌ Faqat PDF fayl yuklash mumkin!");
    }

    try {
      setLoading(true);

      const form = new FormData();
      form.append("photo", file);
      form.append("prefix", "/final-exam");

      const uploadRes = await fetch(`${baseUrl}/api/v1/file/upload`, {
        method: "POST",
        body: form,
      });

      const attachmentId = await uploadRes.json();

      await ApiCall(
        `/api/v1/final-exam-student/${examStudentId}/${attachmentId}/${text}`,
        "PUT"
      );

      toast.success("✅ Fayl muvaffaqiyatli yuklandi!");
      fetchExamStudents();
    } catch (err) {
      toast.error("❌ Xatolik! Fayl yuklanmadi.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStudents = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/final-exam-student/${id}`, "GET");
      console.log(res.data);

      if (!Array.isArray(res.data) || res.data.length === 0) {
        setError("Ma'lumotlar topilmadi!");
      } else {
        const sorted = [...res.data].sort((a, b) => {
          const nameA = (a.student?.fullName || "").toLowerCase();
          const nameB = (b.student?.fullName || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setStudents(sorted);
      }
    } catch (err) {
      setError("Ma'lumot yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and status
  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.student?.fullName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "passed" && student.examPermission) ||
      (filterStatus === "failed" && !student.examPermission);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="font-medium text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">Xatolik</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchExamStudents}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Card */}
        <div className="mb-8 rounded-2xl border-l-4 border-blue-600 bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                👨‍🎓 Yakuniy Nazorat Talabalari
              </h1>
              <p className="text-lg text-gray-600">
                Barcha talabalar ro'yxati va ularning holatlari
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToExcel}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white shadow hover:bg-green-700"
              >
                📊 Excelga eksport qilish
              </button>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {students.length} ta talaba
              </p>
              <p className="text-gray-500">Jami ro'yxat</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Qidirish
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Talaba ismi bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pl-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
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
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Holat bo'yicha filtrlash
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Barcha talabalar</option>
                <option value="passed">O'tgan talabalar</option>
                <option value="failed">O'tmagan talabalar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="p-4 text-left font-semibold text-gray-700">
                    №
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Talaba
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Fan nomi
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Test holati
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Guruh
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Kirish holati
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Baholar
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    Fayl
                  </th>
                  <th className="p-4 text-center font-semibold text-gray-700">
                    Imtihonga ruxsat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((st, i) => (
                  <tr
                    key={st.id}
                    className="transition-colors duration-150 hover:bg-blue-50"
                  >
                    <td className="whitespace-nowrap p-4 font-medium text-gray-600">
                      {i + 1}
                    </td>
                    <td className="p-4">
                      <div
                        className="cursor-pointer font-semibold text-blue-700 transition-colors hover:text-blue-800 hover:underline"
                        onClick={() => {
                          setReasonStudentName(st.student?.fullName || "");
                          setReasonText(st.permissionTextList || []);
                          setReasonModal(
                            st.examPermission ? "allowed" : "denied"
                          );
                        }}
                      >
                        {st.student?.fullName || "-"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-4">
                      <span className="inline-flex items-center rounded-full text-sm font-semibold text-blue-800">
                        {st.finalExam?.curriculumSubject?.subject?.name || "-"}
                      </span>
                    </td>
                    <td
                      className="cursor-pointer whitespace-nowrap p-4"
                      onClick={() => {
                        if (st.finalExam?.isAmaliy) return; // Amaliy bo‘lsa navigate bo‘lmaydi

                        const s = getTestStatus(st).text;
                        if (
                          s === "Test ishlamoqda" ||
                          s === "O'tdi" ||
                          s === "O'tmadi"
                        ) {
                          navigate(
                            `/test-center/final-exam/students/tests/${st.id}`
                          );
                        }
                      }}
                    >
                      {st.finalExam?.isAmaliy ? (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-800">
                          Amaliy
                        </span>
                      ) : (
                        (() => {
                          const s = getTestStatus(st);
                          return (
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${s.color}`}
                            >
                              {s.text}
                            </span>
                          );
                        })()
                      )}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {st.student?.group?.name || "-"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {st.examPermission ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                          <svg
                            className="mr-1 h-4 w-4"
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
                          Ruxsat!
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                          <svg
                            className="mr-1 h-4 w-4"
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
                          Ruxsat berilmagan!
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {st.finalExam?.isAmaliy ? (
                        <div className="flex items-center gap-2">
                          {/* Agar baho bor bo‘lsa — shu bahoni tugma ko‘rinishida chiqaramiz */}
                          {st.ball !== null && st.ball !== undefined ? (
                            <button
                              onClick={() => {
                                setBallStudent(st);
                                setNewBall(st.ball || "");
                                setBallModal(true);
                              }}
                              className="rounded-lg bg-yellow-500 px-3 py-1 font-semibold text-white hover:bg-yellow-600"
                            >
                              {st.ball} ball
                            </button>
                          ) : (
                            /* Ball yo‘q — Baholash tugmasi chiqadi */
                            <button
                              onClick={() => {
                                setBallStudent(st);
                                setNewBall(st.ball || "");
                                setBallModal(true);
                              }}
                              className="rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white hover:bg-blue-700"
                            >
                              Baholash
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Amaliy bo‘lmasa oddiy chiqaramiz */
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {st.ball || "Baholanmagan"}
                        </span>
                      )}
                    </td>

                    <td className="whitespace-nowrap p-4">
                      <div className="flex justify-center gap-2">
                        {st.examPermission ? (
                          <>
                            {st.examAttachment ? (
                              <button
                                onClick={() =>
                                  handleDownload(
                                    st.examAttachment.id,
                                    st.examAttachment.name
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700"
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
                                Yuklab olish
                              </button>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Fayl yo'q
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {st.examAttachment && (
                              <button
                                onClick={() =>
                                  handleDownload(
                                    st.examAttachment.id,
                                    st.examAttachment.name
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700"
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
                                Yuklab olish
                              </button>
                            )}
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 font-medium text-white transition-colors duration-200 hover:bg-blue-700">
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
                                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                              </svg>
                              Yuklash
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(
                                    st.id,
                                    e.target.files[0],
                                    "Tekshirildi"
                                  )
                                }
                              />
                            </label>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap p-4">
                      <div className="flex justify-center">
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={st.examPermission === true}
                            readOnly
                            className="sr-only"
                          />
                          <div
                            onClick={() => {
                              if (!st.examPermission) return;
                              setSelectedStudentId(st.id);
                              setSelectedStudentName(
                                st.student?.fullName || ""
                              );
                              setShowModal(true);
                            }}
                            className={`h-8 w-14 rounded-full transition-colors duration-200 ${
                              st.examPermission
                                ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
                                : "cursor-not-allowed bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${
                                st.examPermission ? "left-7" : "left-1"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-4 p-4 lg:hidden">
            {filteredStudents.map((st, i) => (
              <div
                key={st.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="cursor-pointer text-lg font-semibold text-blue-700 hover:underline"
                        onClick={() => {
                          setReasonStudentName(st.student?.fullName || "");
                          setReasonText(st.permissionTextList || []);
                          setReasonModal(
                            st.examPermission ? "allowed" : "denied"
                          );
                        }}
                      >
                        {st.student?.fullName || "-"}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          {st.student?.group?.name || "-"}
                        </span>
                        {st.examPermission ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            O'tdi
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            O'tmadi
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-medium text-gray-500">#{i + 1}</span>
                  </div>

                  <div className="flex gap-2">
                    {st.examPermission ? (
                      <>
                        {st.examAttachment && (
                          <button
                            onClick={() =>
                              handleDownload(
                                st.examAttachment.id,
                                st.examAttachment.name
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700"
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
                            Yuklab olish
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {st.examAttachment && (
                          <button
                            onClick={() =>
                              handleDownload(
                                st.examAttachment.id,
                                st.examAttachment.name
                              )
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-green-700"
                          >
                            Yuklab olish
                          </button>
                        )}
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700">
                          Yuklash
                          <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(
                                st.id,
                                e.target.files[0],
                                "Tekshirildi"
                              )
                            }
                          />
                        </label>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-sm text-gray-600">
                      Imtihonga ruxsat:
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={st.examPermission === true}
                        readOnly
                        className="sr-only"
                      />
                      <div
                        onClick={() => {
                          if (!st.examPermission) return;
                          setSelectedStudentId(st.id);
                          setSelectedStudentName(st.student?.fullName || "");
                          setShowModal(true);
                        }}
                        className={`h-6 w-12 rounded-full transition-colors duration-200 ${
                          st.examPermission
                            ? "cursor-pointer bg-blue-600 hover:bg-blue-700"
                            : "cursor-not-allowed bg-gray-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                            st.examPermission ? "left-6" : "left-1"
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredStudents.length === 0 && (
          <div className="mt-6 rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Talabalar topilmadi
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== "all"
                ? "Qidiruv shartlariga mos talabalar topilmadi"
                : "Hali birorta talaba ro'yxatga qo'shilmagan"}
            </p>
          </div>
        )}
      </div>

      {/* Modals remain the same as your original code */}
      {reasonModal === "allowed" && (
        <div className="bg-black/75 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border-t-4 border-green-600 bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-green-700">
              ✅ Talabaga ruxsat berilgan
            </h2>
            <p className="mb-4 text-center text-lg font-semibold text-green-600">
              {reasonStudentName}
            </p>
            <p className="text-center text-lg font-medium text-green-500">
              Ushbu talaba imtihonga kirishga to'liq ruxsat olgan.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setReasonModal(null)}
                className="rounded-lg bg-green-500 px-5 py-3 font-semibold text-white transition hover:bg-green-600"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {reasonModal === "denied" && (
        <div className="bg-black/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl border-t-4 border-red-600 bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-center text-2xl font-bold text-red-600">
              ❗ Ruxsat berilmagan sabablari
            </h2>
            <p className="mb-3 text-center text-xl font-semibold">
              {reasonStudentName}
            </p>
            <div className="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
              {reasonText.filter((t) => t && t.trim() !== "").length > 0 ? (
                reasonText.map((txt, idx) => (
                  <p key={idx} className="mb-2">
                    • {txt}
                  </p>
                ))
              ) : (
                <p>Sabab ko'rsatilmagan.</p>
              )}
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setReasonModal(null)}
                className="rounded-lg bg-gray-300 px-5 py-3 font-semibold transition hover:bg-gray-400"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="bg-black/90 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg">
          <div className="mx-4 w-full max-w-md rounded-2xl border-t-4 border-red-600 bg-white p-8 shadow-2xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-red-600">
              ⚠️ Diqqat! Imtihonga ruxsat holatini o'zgartirmoqchimisiz?
            </h2>
            <p className="mb-6 text-center text-lg font-semibold text-red-500">
              "{selectedStudentName}" talabasining imtihonga ruxsat holatini
              o'zgartirmoqchimisiz?
            </p>
            <div className="mt-6 flex justify-center gap-5">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg bg-gray-300 px-5 py-3 font-semibold transition hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={togglePermission}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
      {ballModal && (
        <div className="bg-black/70 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border-t-4 border-blue-600 bg-white p-8 shadow-2xl">
            <h2 className="mb-4 text-center text-3xl font-bold text-blue-700">
              Bahoni kiritish
            </h2>

            <p className="mb-6 text-center text-xl font-semibold">
              {ballStudent?.student?.fullName}
            </p>

            <div className="mb-6">
              <label className="mb-2 block font-medium text-gray-700">
                Ball (0 - {getMaxBall(ballStudent)}):
              </label>

              <input
                type="number"
                value={newBall}
                onChange={(e) => {
                  let val = Number(e.target.value);
                  const maxBall = getMaxBall(ballStudent);

                  if (val < 0 || val > maxBall) {
                    toast.error(
                      `❌ Ball 0 dan ${maxBall} gacha bo'lishi kerak!`
                    );
                    return;
                  }
                  setNewBall(val);

                  setNewBall(val);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setBallModal(false)}
                className="rounded-lg bg-gray-300 px-5 py-3 font-semibold transition hover:bg-gray-400"
              >
                Bekor qilish
              </button>

              <button
                onClick={async () => {
                  const maxBall = getMaxBall(ballStudent);

                  if (newBall < 0 || newBall > maxBall) {
                    toast.error(
                      `❌ Ball 0 dan ${maxBall} gacha bo'lishi kerak!`
                    );
                    return;
                  }

                  await updateBall(ballStudent.id, newBall);
                  setBallModal(false);
                }}
                className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default SuperadminFinalExamEdit;
