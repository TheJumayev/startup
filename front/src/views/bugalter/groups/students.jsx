import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

const Duty = () => {
  const { id } = useParams();

  let groupId = id;
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [requireFile, setRequireFile] = useState(false);
  const [openAchievementsModal, setOpenAchievementsModal] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [achievementLoading, setAchievementLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [action, setAction] = useState("online"); // NEW: "online" | "offline"
  const [confirming, setConfirming] = useState(false); // NEW: modal button state
  const [openActionModal, setOpenActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  // invalid | ielts | qabul | kurs | ichki | tashqi | talaba
  const [openOrderModal, setOpenOrderModal] = useState(false);
  const [orderType, setOrderType] = useState("");
  // "kurs" | "ichki" | "tashqi" | "talaba"

  const [orderNumber, setOrderNumber] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);

  const [actionText, setActionText] = useState("");
  const [actionDate, setActionDate] = useState("");
  const [actionFile, setActionFile] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fetchAchievements = async (studentId) => {
    try {
      const res = await ApiCall(
        `/api/v1/student-achievements/${studentId}`,
        "GET"
      );

      console.log("Achievements response:", res);

      const data = res?.data;

      if (Array.isArray(data)) {
        setAchievements(data);
      } else if (Array.isArray(data?.data)) {
        setAchievements(data.data);
      } else {
        setAchievements([]);
      }
    } catch (e) {
      console.error("Yutuqlarni olishda xatolik", e);
      setAchievements([]);
    }
  };

  const addAchievementLocal = () => {
    if (!newAchievement.trim()) return;

    setAchievements([...achievements, newAchievement.trim()]);
    setNewAchievement("");
  };

  const removeAchievementLocal = (index) => {
    const updated = achievements.filter((_, i) => i !== index);
    setAchievements(updated);
  };

  const saveAchievements = async () => {
    if (!selectedStudent) return;

    setAchievementLoading(true);
    try {
      await ApiCall(
        `/api/v1/student-achievements/${selectedStudent.id}`,
        "PUT",
        achievements
      );

      toast.success("Yutuqlar saqlandi ✅");
      setOpenAchievementsModal(false);
    } catch (e) {
      toast.error("Saqlashda xatolik ❌");
    } finally {
      setAchievementLoading(false);
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
    } finally {
      console.log("hi");
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [openResetModal, setOpenResetModal] = useState(false);
  const [studentToReset, setStudentToReset] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!openActionModal || !selectedStudent || !actionType) return;

    // reset
    setActionText("");
    setActionDate("");
    setActionFile(null);

    switch (actionType) {
      case "invalid":
        setActionText(selectedStudent.nogironText || "");
        break;

      case "ielts":
        setActionText(selectedStudent.ieltsText || "");
        setActionDate(selectedStudent.endDate || "");
        break;

      case "qabul":
        setActionText(selectedStudent.qabulBuyruqRaqami || "");
        break;

      case "kurs":
        setActionText(selectedStudent.kursdanOtganBuyruqRaqami || "");
        break;

      case "ichki":
        setActionText(selectedStudent.ichkiPerevodBuyruqRaqami || "");
        break;

      case "tashqi":
        setActionText(selectedStudent.tashqiPerevodBuyruqRaqami || "");
        break;

      case "talaba":
        setActionText(
          selectedStudent.talabalarSafidanChetlashganBuyruqRaqami || ""
        );
        break;

      case "work":
        // 🟡 text yo‘q, lekin eski file borligini bilamiz
        // actionFile qo‘ymaymiz (browser ruxsat bermaydi)
        break;

      default:
        break;
    }
  }, [openActionModal, actionType, selectedStudent]);

  const actionMeta = {
    invalid: {
      title: "Nogironlik hujjatini biriktirish",
      color: "bg-purple-600",
      icon: "♿",
    },
    ielts: {
      title: "IELTS sertifikatini biriktirish",
      color: "bg-green-600",
      icon: "📝",
    },
    qabul: {
      title: "Qabul buyrug‘i",
      color: "bg-gray-700",
      icon: "📄",
    },
    kurs: {
      title: "Kursdan o‘tganlik buyrug‘i",
      color: "bg-indigo-600",
      icon: "🎓",
    },
    ichki: {
      title: "Ichki perevod",
      color: "bg-cyan-600",
      icon: "🔁",
    },
    tashqi: {
      title: "Tashqi perevod",
      color: "bg-orange-600",
      icon: "🌍",
    },
    talaba: {
      title: "Talabalar safidan chetlatish",
      color: "bg-red-600",
      icon: "⛔",
    },
    work: {
      title: "Ish joyi hujjatini biriktirish",
      color: "bg-yellow-600",
      icon: "💼",
    },
  };

  const handleActionFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl ❌");
      return;
    }
    setActionFile(file);
  };

  const submitStudentAction = async () => {
    if (!selectedStudent || !actionType) return;

    setActionLoading(true);

    try {
      let dto = {};
      let uploadFileId = null;

      /* =====================================================
       1️⃣ FILE TALAB QILINADIGAN ACTION LAR
       ===================================================== */
      if (actionType === "invalid" || actionType === "ielts") {
        if (!actionFile) {
          toast.error("PDF fayl yuklanishi shart ❌");
          setActionLoading(false);
          return;
        }

        // work → faqat yangi file bo‘lsa upload qilinadi

        const formData = new FormData();
        formData.append("photo", actionFile);
        formData.append("prefix", actionType); // invalid | ielts | work

        const uploadRes = await ApiCall(
          "/api/v1/file/upload",
          "POST",
          formData,
          { "Content-Type": "multipart/form-data" }
        );

        uploadFileId = uploadRes.data;

        if (!uploadFileId) {
          toast.error("Fayl yuklashda xatolik ❌");
          setActionLoading(false);
          return;
        }
      }

      /* =====================================================
       2️⃣ ACTION TYPE BO‘YICHA DTO YIG‘ISH
       ===================================================== */
      switch (actionType) {
        case "invalid":
          dto = {
            nogironFile: { id: uploadFileId },
            nogironType: actionText,
            nogironText: actionText,
          };
          break;

        case "ielts":
          dto = {
            ieltsFile: { id: uploadFileId },
            ieltsText: actionText,
            endDate: actionDate,
          };
          break;

        case "qabul":
          dto = {
            qabulBuyruqRaqami: actionText,
          };
          break;

        case "kurs":
        case "ichki":
          dto = {
            kursdanOtganBuyruqRaqami: actionText,
          };
          break;

        case "tashqi":
          dto = {
            tashqiPerevodBuyruqRaqami: actionText,
          };
          break;

        case "talaba":
          dto = {
            talabalarSafidanChetlashganBuyruqRaqami: actionText,
          };
          break;

        /* =====================================================
         🆕 ISH JOYI (WORK)
         ===================================================== */
        case "work":
          // Agar yangi fayl TANLANMAGAN bo‘lsa
          if (!actionFile && selectedStudent?.workFile) {
            toast.success("Eski ish joyi hujjati saqlanib qoldi ✅");
            await fetchStudents();
            setOpenActionModal(false);
            setActionLoading(false);
            return;
          }

          // Agar yangi fayl TANLANGAN bo‘lsa
          if (actionFile) {
            const formData = new FormData();
            formData.append("photo", actionFile);
            formData.append("prefix", "work");

            const uploadRes = await ApiCall(
              "/api/v1/file/upload",
              "POST",
              formData,
              { "Content-Type": "multipart/form-data" }
            );

            const uploadFileId = uploadRes.data;

            await ApiCall(`/api/v1/student/work/${selectedStudent.id}`, "PUT", {
              isHaveWork: true,
              workFile: uploadFileId,
            });
          }

          break;
        default:
          throw new Error("Noma’lum amal turi");
      }

      /* =====================================================
       3️⃣ ODDIY ACTION LAR UCHUN UNIVERSAL API
       ===================================================== */
      if (actionType !== "work") {
        await ApiCall(
          `/api/v1/student/${actionType}/${selectedStudent.id}`,
          "PUT",
          dto
        );
      }

      /* =====================================================
       4️⃣ YAKUNIY ISHLAR
       ===================================================== */
      toast.success("Muvaffaqiyatli saqlandi ✅");
      await fetchStudents();

      setOpenActionModal(false);
      setActionText("");
      setActionDate("");
      setActionFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Xatolik yuz berdi ❌");
    } finally {
      setActionLoading(false);
    }
  };

  const resetStudentPassword = async () => {
    if (!studentToReset) return;

    setResetLoading(true);
    try {
      const dto = {
        login: studentToReset.studentIdNumber,
        password: studentToReset.studentIdNumber,
      };

      const res = await ApiCall("/api/v1/student/password", "PUT", dto);

      toast.success("Parol muvaffaqiyatli tiklandi!");

      setOpenResetModal(false);
    } catch (err) {
      toast.error("Parolni tiklashda xatolik!");
    } finally {
      setResetLoading(false);
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
      console.log("update", response);
      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto‘g‘ri.");
        console.log(response.data);
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      console.error("Xatolik (yangilash):", error);
    }
  };

  // Qidiruv funksiyasi
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

        // Fayl yuklanmagan bo‘lsa va tanlangan bo‘lsa, yuklaymiz
        if (!finalFileId && selectedFile) {
          const formData = new FormData();
          formData.append("photo", selectedFile);
          formData.append("prefix", "student_online");

          const uploadRes = await ApiCall(
            "/api/v1/file/upload",
            "POST",
            formData,
            {
              "Content-Type": "multipart/form-data",
            }
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

        // ✅ endi null emas, real fileId bor
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
  const actionBtn =
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:scale-105 hover:shadow-md";

  return (
    <div className="mx-auto max-w-7xl p-6">
      <ToastContainer />

      {/* Sarlavha va yangilash tugmasi */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-600 sm:text-3xl">
          {students[0]?.groupName} Guruh talabalari ro'yxati
        </h1>

        <div className="flex gap-2">
          {/* EXCEL */}
          <button
            onClick={downloadExcelStudents}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            📊 Excel
          </button>
          <button
            onClick={updateStudent}
            disabled={loading || updating}
            className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
              loading || updating
                ? "cursor-not-allowed bg-gray-400"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading || updating ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
              </span>
            ) : (
              "Talabalarni yangilash"
            )}
          </button>
        </div>
      </div>
      <div></div>
      {/* Qidiruv inputi */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Talaba ismi, familiyasi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-12 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
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
            </button>
          )}
        </div>
      </div>

      {/* Natijalar soni */}
      {searchTerm && (
        <div className="mb-4 text-center">
          <p className="text-lg text-gray-700">
            Topilgan talabalar:{" "}
            <span className="text-2xl font-bold text-blue-600">
              {filteredStudents.length} ta
            </span>
          </p>
        </div>
      )}

      {(loading || updating) && <LoadingOverlay text="Yuklanmoqda..." />}

      {!loading && filteredStudents.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            {searchTerm
              ? "Qidiruv boʻyicha talabalar topilmadi"
              : "Talabalar ro'yxati bo'sh. Yangilash tugmasini bosing."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    FISH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Talaba ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Semestr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rasm
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id || index}
                    className="cursor-pointer hover:bg-gray-50" // 🔑 hover va cursor
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student?.fullName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student?.studentIdNumber || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student?.semesterName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student?.avgGpa || "0"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student?.image ? (
                        <img
                          src={student.image}
                          alt={student.fullName || "Talaba"}
                          className="h-10 w-10 rounded-full border-2 border-blue-700 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/40";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                          Rasm yo'q
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("invalid");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-purple-600 hover:bg-purple-700`}
                        >
                          ♿ Nogiron
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("ielts");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-green-600 hover:bg-green-700`}
                        >
                          📝 IELTS
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("qabul");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-gray-700 hover:bg-gray-800`}
                        >
                          📄 Qabul
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("kurs");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-indigo-600 hover:bg-indigo-700`}
                        >
                          🎓 Kurs
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("ichki");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-cyan-600 hover:bg-cyan-700`}
                        >
                          🔁 Ichki
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("tashqi");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-orange-600 hover:bg-orange-700`}
                        >
                          🌍 Tashqi
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("talaba");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-red-600 hover:bg-red-700`}
                        >
                          ⛔ Chetlatish
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setActionType("work");
                            setOpenActionModal(true);
                          }}
                          className={`${actionBtn} bg-yellow-600 hover:bg-yellow-700`}
                        >
                          💼 Ish joyi
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            fetchAchievements(student.id);
                            setOpenAchievementsModal(true);
                          }}
                          className={`${actionBtn} bg-yellow-500 hover:bg-yellow-600`}
                        >
                          🏆 Yutuqlar
                        </button>

                        {/* Parolni tiklash */}
                        <button
                          onClick={() => {
                            setStudentToReset(student);
                            setOpenResetModal(true);
                          }}
                          title="Parolni tiklash"
                          className="ml-2 rounded-full p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
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

          <Modal
            open={openAchievementsModal}
            onClose={() => setOpenAchievementsModal(false)}
            center
          >
            <h2 className="mb-3 text-lg font-bold text-blue-700">
              🏆 {selectedStudent?.fullName} — Yutuqlari
            </h2>

            {/* Input */}
            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                placeholder="Yangi yutuq yozing..."
                className="flex-1 rounded border p-2"
              />
              <button
                onClick={addAchievementLocal}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                Qo‘shish
              </button>
            </div>

            {/* Yutuqlar ro‘yxati */}
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {Array.isArray(achievements) &&
                achievements.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-100 px-3 py-2"
                  >
                    <span className="text-sm">{item}</span>

                    <button
                      onClick={() => removeAchievementLocal(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✖
                    </button>
                  </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setOpenAchievementsModal(false)}
                className="rounded bg-gray-300 px-4 py-2"
              >
                Bekor
              </button>

              <button
                onClick={saveAchievements}
                disabled={achievementLoading}
                className="rounded bg-green-600 px-4 py-2 text-white"
              >
                {achievementLoading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </Modal>

          <Modal
            open={openActionModal}
            onClose={() => setOpenActionModal(false)}
            center
          >
            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold text-white ${actionMeta[actionType]?.color}`}
              >
                <span>{actionMeta[actionType]?.icon}</span>
                <span>{actionMeta[actionType]?.title}</span>
              </div>

              <h2 className="mt-3 text-lg font-bold text-gray-800">
                {selectedStudent?.fullName}
              </h2>
            </div>

            {actionType !== "work" && (
              <input
                type="text"
                placeholder={
                  actionType === "invalid"
                    ? "Nogironlik turi yoki izoh"
                    : actionType === "ielts"
                    ? "IELTS balli yoki izoh"
                    : "Buyruq raqamini kiriting"
                }
                className="mb-3 w-full rounded border p-2"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
              />
            )}

            {(actionType === "invalid" || actionType === "ielts") && (
              <>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleActionFile}
                />
              </>
            )}

            {actionType === "work" && (
              <>
                {selectedStudent?.workFile && (
                  <div className="mb-2 rounded border border-green-300 bg-green-50 p-2 text-sm text-green-700">
                    ✅ Oldin yuklangan ish joyi hujjati mavjud
                  </div>
                )}

                <p className="mb-2 text-sm text-gray-600">
                  Talabaning ish joyidan ma’lumotnoma (PDF)
                </p>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleActionFile}
                />
              </>
            )}
            {actionType === "ielts" && (
              <input
                type="date"
                className="mt-2 w-full rounded border p-2"
                value={actionDate}
                onChange={(e) => setActionDate(e.target.value)}
              />
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setOpenActionModal(false)}
                className="rounded bg-gray-300 px-4 py-2"
              >
                Bekor
              </button>

              <button
                onClick={submitStudentAction}
                disabled={actionLoading}
                className="rounded bg-blue-600 px-4 py-2 text-white"
              >
                {actionLoading ? "Yuborilmoqda..." : "Saqlash"}
              </button>
            </div>
          </Modal>

          <Modal open={openModal} onClose={() => setOpenModal(false)} center>
            <h2 className="mb-4 text-lg font-bold">Tasdiqlash</h2>
            <p className="mb-2">
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
              sifatida belgilamoqchimisiz?
            </p>
            {/* ✅ Fayl nomini ko‘rsatish */}
            {action === "online" && selectedFile && (
              <div className="mb-4 rounded border bg-gray-50 p-2 text-sm text-gray-700">
                Yuklangan fayl:{" "}
                <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}

            {/* Fayl inputi yashirin */}
            <input
              type="file"
              accept="application/pdf"
              ref={(el) => (window.fileInputRef = el)}
              onChange={(e) => handleFileUpload(e)}
              style={{ display: "none" }}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedFile(null);
                  setFileId(null);
                }}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                disabled={confirming}
              >
                Bekor qilish
              </button>

              {action === "online" ? (
                <button
                  onClick={async () => {
                    if (!selectedFile) {
                      // Agar fayl tanlanmagan bo‘lsa inputni ochamiz
                      window.fileInputRef && window.fileInputRef.click();
                    } else {
                      // Fayl tanlangan bo‘lsa confirmAction ishlaydi
                      await confirmAction();
                    }
                  }}
                  disabled={confirming}
                  className={`rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? "Yuborilmoqda..." : "Ha, tasdiqlayman"}
                </button>
              ) : (
                <button
                  onClick={confirmAction}
                  disabled={confirming}
                  className={`rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? "Yuborilmoqda..." : "Ha, tasdiqlayman"}
                </button>
              )}
            </div>
          </Modal>
          <Modal
            open={openResetModal}
            onClose={() => setOpenResetModal(false)}
            center
          >
            <h2 className="mb-4 text-lg font-bold">Parolni tiklash</h2>

            <p className="mb-4 text-gray-700">
              Talaba{" "}
              <span className="font-semibold text-blue-600">
                {studentToReset?.fullName}
              </span>{" "}
              parolini{" "}
              <span className="font-semibold">
                {studentToReset?.studentIdNumber}
              </span>
              &nbsp; raqamiga teng qilib tiklamoqchimisiz?
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                onClick={() => setOpenResetModal(false)}
                disabled={resetLoading}
              >
                Bekor qilish
              </button>

              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={resetStudentPassword}
                disabled={resetLoading}
              >
                {resetLoading ? "Yuborilmoqda..." : "Ha, tiklash"}
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default Duty;
