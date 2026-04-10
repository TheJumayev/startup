import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config/index";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function GroupDetail() {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examLoads, setExamLoads] = useState({});
  const [examLoading, setExamLoading] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  // Search state
  const [studentSearch, setStudentSearch] = useState("");
  const [examSearch, setExamSearch] = useState("");

  useEffect(() => {
    fetchGroup();
    fetchGroupStudents();
    fetchExam();
  }, []);

  const showError = (message) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showSuccess = (message) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const fetchGroup = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/groups/${groupId}`,
        "GET",
        null,
        null,
        true
      );
      setGroup(response.data);
    } catch (error) {
      console.error("Error fetching group:", error);
      showError("Guruh ma'lumotlarini yuklashda xatolik yuz berdi");
    }
  };

  const fetchExam = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/exam/${groupId}`,
        "GET",
        null,
        null,
        true
      );

      const examsData = response.data;
      setExams(examsData);

      // 🔹 Har bir imtihon uchun eski yuklamani saqlaymiz yoki backenddan kelganini qo‘yamiz
      setExamLoads((prev) => {
        const updatedLoads = { ...prev };
        examsData.forEach((exam) => {
          if (exam.acload != null && exam.acload !== "") {
            // backenddan kelgan qiymat mavjud bo‘lsa, uni ishlatamiz
            updatedLoads[exam.id] = exam.acload;
          } else if (updatedLoads[exam.id] == null) {
            // aks holda eski qiymat yoki bo‘sh qoldiramiz
            updatedLoads[exam.id] = "";
          }
        });
        return updatedLoads;
      });
    } catch (error) {
      console.error("Error fetching exams:", error);
      showError("Imtihonlar ro'yxatini yuklashda xatolik yuz berdi");
    }
  };

  const fetchGroupStudents = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/groups/students/${groupId}`,
        "GET",
        null,
        null,
        true
      );
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      showError("Talabalar ro'yxatini yuklashda xatolik yuz berdi");
    }
  };

  const updateGroupStudents = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/groups/update-students/${groupId}`,
        "GET",
        null,
        null,
        true
      );
      setStudents(response.data);
      showSuccess("Talabalar ro'yxati muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Error updating students:", error);
      showError("Talabalar ro'yxatini yangilashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const updateGroupExamList = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/exam/update/${groupId}`,
        "GET",
        null,
        null,
        true
      );
      setExams(response.data);
      showSuccess("Imtihonlar ro'yxati muvaffaqiyatli yangilandi");
    } catch (error) {
      console.error("Error updating exams:", error);
      showError("Imtihonlar ro'yxatini yangilashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = (examId) => {
    if (pageLoading) return;
    setSelectedExam(examId === selectedExam ? null : examId);
  };

  const openSelectedExam = async () => {
    console.log("openSelectedExam() ishga tushdi"); // test log

    if (!selectedExam) {
      showError("Iltimos, imtihonni tanlang");
      return;
    }

    const acload = examLoads[selectedExam];
    console.log("acload:", acload); // test log

    if (acload == null || acload === "" || isNaN(acload) || acload <= 0) {
      showError("Iltimos, yuklama miqdorini kiriting");
      return;
    }

    setPageLoading(true);
    setExamLoading(true);

    try {
      const response = await ApiCall(
        `/api/v1/exam/start/${selectedExam}/${acload}`,
        "GET",
        null,
        null,
        true
      );

      console.log("✅ Imtihon natijalari:", response.data);
      setExamResults(response.data);
      setShowModal(true);
      showSuccess("Imtihon natijalari muvaffaqiyatli yuklandi");
    } catch (error) {
      console.error("❌ Imtihon natijalarini yuklashda xatolik:", error);
      showError("Imtihon natijalarini yuklashda xatolik yuz berdi");
    } finally {
      setExamLoading(false);
      setPageLoading(false);
    }
  };

  const handleLoadChange = (examId, value) => {
    if (pageLoading) return;
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setExamLoads((prev) => ({ ...prev, [examId]: parsed }));
    } else if (value === "") {
      setExamLoads((prev) => ({ ...prev, [examId]: "" }));
    }
  };

  // Filter students based on search
  const filteredStudents = students.filter((student) =>
    student.fullName?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filter exams based on search
  const filteredExams = exams.filter(
    (exam) =>
      exam.subjectName?.toLowerCase().includes(examSearch.toLowerCase()) ||
      exam.employeeName?.toLowerCase().includes(examSearch.toLowerCase())
  );

  // Loading Overlay komponenti
  const LoadingOverlay = () => {
    if (!pageLoading) return null;

    return (
      <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
        <div className="rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <span className="text-lg font-medium">Yuklanmoqda...</span>
          </div>
        </div>
      </div>
    );
  };

  const ResultsModal = () => {
    if (!showModal) return null;

    const totalStudents = examResults.length;
    const eligibleStudents = examResults.filter(
      (result) => result.isAttendance && result.isGrade && result.isContract
    ).length;

    const downloadAsPDF = () => {
      if (pageLoading) {
        showError("Iltimos, yuklash tugagunicha kuting");
        return;
      }

      setPageLoading(true);

      try {
        const now = new Date();
        const formattedDateTime = now.toLocaleString("uz-UZ", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const container = document.createElement("div");
        container.style.width = "100%";
        container.style.fontFamily = "Arial, sans-serif";
        container.style.overflow = "hidden";
        const dateTimeElement = document.createElement("p");
        dateTimeElement.textContent = `Sana va vaqt: ${formattedDateTime}`;
        dateTimeElement.style.textAlign = "center";
        dateTimeElement.style.margin = "0 0 10px 0";
        dateTimeElement.style.fontSize = "14px";
        dateTimeElement.style.color = "#555555";
        container.appendChild(dateTimeElement);
        const title = document.createElement("h1");
        title.textContent = `Imtihon natijalari - ${group?.name || ""}`;
        title.style.textAlign = "center";
        title.style.fontSize = "20px";
        title.style.margin = "0 0 15px 0";
        title.style.fontWeight = "600";
        title.style.color = "#000000";
        container.appendChild(title);
        let im = exams.find((item) => item.id == selectedExam);
        const fan = document.createElement("p");
        fan.textContent = `Fan: ${im?.subjectName || ""}`;
        fan.style.textAlign = "center";
        fan.style.margin = "0 0 20px 0";
        fan.style.fontSize = "14px";
        fan.style.color = "#333333";
        container.appendChild(fan);
        const stats = document.createElement("p");
        stats.textContent = `Guruh talabalari soni: ${totalStudents} ta, ${eligibleStudents} tasi imtihonga qatnashishi mumkin`;
        stats.style.textAlign = "center";
        stats.style.margin = "0 0 20px 0";
        stats.style.fontSize = "14px";
        stats.style.color = "#333333";
        container.appendChild(stats);
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.fontSize = "12px";
        table.style.borderCollapse = "collapse";
        const thead = document.createElement("thead");
        thead.innerHTML = `
          <tr style="background-color: #f8f9fa;">
              <th style="padding: 8px; border: 1px solid #dee2e6;">#</th>
              <th style="padding: 8px; border: 1px solid #dee2e6;">Talaba</th>
              <th style="padding: 8px; border: 1px solid #dee2e6;">Davomat</th>
              <th style="padding: 8px; border: 1px solid #dee2e6;">Baholar</th>
              <th style="padding: 8px; border: 1px solid #dee2e6;">Kontrakt</th>
              <th style="padding: 8px; border: 1px solid #dee2e6;">Holati</th>
          </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        examResults.forEach((result, index) => {
          const row = document.createElement("tr");
          row.style.pageBreakInside = "avoid";
          row.style.backgroundColor = index % 2 === 0 ? "#ffffff" : "#f8f9fa";

          row.innerHTML = `
              <td style="padding: 8px; border: 1px solid #dee2e6;">${
                index + 1
              }</td>
              <td style="padding: 8px; border: 1px solid #dee2e6;">${
                result.student.fullName
              }</td>
              <td style="padding: 8px; border: 1px solid #dee2e6;">${
                result.attendance
              } <br> 
                  <span style="color: ${
                    !result.isAttendance ? "#dc3545" : "#28a745"
                  };">
                      ${!result.isAttendance ? "Qatnashmagan" : "Qatnashgan"}
                  </span>
              </td>
              <td style="padding: 8px; border: 1px solid #dee2e6;">${
                result.grade
              } <br> 
                  <span style="color: ${
                    result.isGrade ? "#28a745" : "#dc3545"
                  };">
                      ${result.isGrade ? "O'tdi" : "O'ta olmadi"}
                  </span>
              </td>
              <td style="padding: 8px; border: 1px solid #dee2e6;">${
                result.contract
              } <br> 
                  <span style="color: ${
                    result.isContract ? "#28a745" : "#dc3545"
                  };">
                      ${result.isContract ? "To'langan" : "To'lanmagan"}
                  </span>
              </td>
              <td style="padding: 8px; border: 1px solid #dee2e6;">
                  <span style="color: ${
                    result.isAttendance && result.isGrade && result.isContract
                      ? "#28a745"
                      : "#dc3545"
                  };">
                      ${
                        result.isAttendance &&
                        result.isGrade &&
                        result.isContract
                          ? "Imtihonga kirishi mumkin"
                          : "Imtihonga kira olmaydi"
                      }
                  </span>
              </td>
          `;
          tbody.appendChild(row);
        });
        table.appendChild(tbody);
        container.appendChild(table);

        const opt = {
          margin: [15, 15, 15, 15],
          filename: `imtihon_natijalari_${group?.name || "group"}.pdf`,
          image: { type: "jpeg", quality: 1 },
          html2canvas: {
            scale: 2,
            logging: false,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 1200,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "landscape",
            hotfixes: ["px_scaling"],
            compress: false,
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        html2pdf()
          .set(opt)
          .from(container)
          .save()
          .then(() => {
            container.remove();
            showSuccess("PDF fayl muvaffaqiyatli yuklab olindi");
          })
          .catch((error) => {
            console.error("PDF generation error:", error);
            showError(
              "PDF yaratishda xatolik yuz berdi. Iltimos, qayta urunib ko'ring."
            );
          });
      } catch (error) {
        console.error("PDF yaratishda xatolik:", error);
        showError("PDF yaratishda kutilmagan xatolik yuz berdi");
      } finally {
        setPageLoading(false);
      }
    };

    return (
      <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
        <div className="w-full max-w-6xl rounded-lg bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Imtihon natijalari</h2>
              <p className="text-gray-600">
                Guruh talabalari soni: {totalStudents} ta, {eligibleStudents}{" "}
                tasi imtihonga qatnashishi mumkin
              </p>
            </div>
            <button
              onClick={() => !pageLoading && setShowModal(false)}
              disabled={pageLoading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[60vh] overflow-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">#</th>
                  <th className="border p-2">Talaba</th>
                  <th className="border p-2">Rasm</th>
                  <th className="border p-2">Davomat</th>
                  <th className="border p-2">Baholar</th>
                  <th className="border p-2">Kontrakt</th>
                  <th className="border p-2">Holati</th>
                </tr>
              </thead>
              <tbody>
                {examResults.map((result, index) => (
                  <tr
                    key={result.student.id}
                    className="border hover:bg-gray-50"
                  >
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 font-medium">
                      {result.student.fullName}
                    </td>
                    <td className="border p-2">
                      <img
                        src={
                          result.student.imageFile
                            ? `${baseUrl}/api/v1/file/getFile/${result.student.imageFile.id}`
                            : result.student.image || "/default-avatar.png"
                        }
                        className="h-10 w-10 rounded-full object-cover"
                        alt="Student"
                      />
                    </td>
                    <td className="border p-2">
                      {result.attendance}
                      <span
                        className={`block text-sm ${
                          !result.isAttendance
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {!result.isAttendance ? "Qatnashmagan" : "Qatnashgan"}
                      </span>
                    </td>
                    <td className="border p-2">
                      {result.grade}
                      <span
                        className={`block text-sm ${
                          result.isGrade ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.isGrade ? "O'tdi" : "O'ta olmadi"}
                      </span>
                    </td>
                    <td className="border p-2">
                      {result.contract}
                      <span
                        className={`block text-sm ${
                          result.isContract ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.isContract ? "To'langan" : "To'lanmagan"}
                      </span>
                    </td>
                    <td className="border p-2">
                      {result.isAttendance &&
                      result.isGrade &&
                      result.isContract ? (
                        <span className="font-medium text-green-600">
                          Imtihonga kirishi mumkin
                        </span>
                      ) : (
                        <span className="font-medium text-red-600">
                          Imtihonga kira olmaydi
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={downloadAsPDF}
              disabled={pageLoading}
              className="flex items-center rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              PDF yuklab olish
            </button>
            <button
              onClick={() => !pageLoading && setShowModal(false)}
              disabled={pageLoading}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600 disabled:opacity-50"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen p-4">
      {/* Loading Overlay */}
      <LoadingOverlay />

      <div
        className={`mx-auto max-w-7xl ${
          pageLoading ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Guruh Ma'lumotlari
              </h1>
              <p className="mt-1 text-lg text-gray-600">Guruh: {group?.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={updateGroupStudents}
                disabled={loading || pageLoading}
                className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {loading ? "Yuklanmoqda..." : "Talabalar yangilash"}
              </button>
              <button
                onClick={updateGroupExamList}
                disabled={loading || pageLoading}
                className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Yuklanmoqda..." : "Imtihonlar yangilash"}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Students Table */}
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Talabalar Ro'yxati</h2>
              <span className="rounded bg-blue-100 px-2 py-1 text-sm text-blue-800">
                {filteredStudents.length} ta
              </span>
            </div>

            {/* Search Input for Students */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Talaba nomi bo'yicha qidirish..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">#</th>
                    <th className="border p-2 text-left">Rasm</th>
                    <th className="border p-2 text-left">FISH</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr
                        key={student.id}
                        onClick={() =>
                          !pageLoading &&
                          navigate("/superadmin/exams/student/" + student.id)
                        }
                        className={`cursor-pointer border hover:bg-blue-50 ${
                          pageLoading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2">
                          <img
                            src={
                              student.imageFile
                                ? `${baseUrl}/api/v1/file/getFile/${student.imageFile.id}`
                                : student.image || "/default-avatar.png"
                            }
                            alt={student.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </td>
                        <td className="border p-2 font-medium">
                          {student.fullName}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">
                        {studentSearch
                          ? "Talaba topilmadi"
                          : "Talabalar topilmadi"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Exams Table */}
          <div className="rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Imtihonlar Jadvali</h2>
              <span className="rounded bg-green-100 px-2 py-1 text-sm text-green-800">
                {filteredExams.length} ta
              </span>
            </div>

            {/* Search Input for Exams */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Fan yoki o'qituvchi nomi bo'yicha qidirish..."
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
              />
            </div>

            <div className="overflow-x-auto rounded-xl bg-white shadow">
              <table className="min-w-full border border-gray-200 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">№</th>
                    <th className="border p-2 text-left">Imtihon nomi</th>
                    <th className="border p-2 text-left">O'qituvchi</th>
                    <th className="border p-2 text-left">Boshlanish</th>
                    <th className="border p-2 text-left">Tugash</th>
                    <th className="border p-2">Tanlash</th>
                    <th className="border p-2 text-left">Yuklama</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam, index) => (
                      <tr key={exam.id} className="border hover:bg-gray-50">
                        <td className="border p-2">{index + 1}</td>
                        <td className="border p-2 font-medium">
                          {exam.subjectName}
                        </td>

                        <td className="border p-2">{exam.employeeName}</td>
                        <td className="border p-2 text-sm">
                          {new Date(exam.startTime).toLocaleDateString("ru-RU")}
                          <br />
                          {new Date(exam.startTime).toLocaleTimeString(
                            "ru-RU",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        <td className="border p-2 text-sm">
                          {new Date(exam.endTime).toLocaleDateString("ru-RU")}
                          <br />
                          {new Date(exam.endTime).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="border text-center">
                          <input
                            type="checkbox"
                            checked={selectedExam === exam.id}
                            onChange={() => handleExamSelect(exam.id)}
                            disabled={pageLoading}
                            className="cursor-pointer disabled:opacity-50"
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            type="number"
                            min="0"
                            className={`w-16 rounded border px-2 py-1 text-center ${
                              pageLoading
                                ? "pointer-events-none opacity-50"
                                : ""
                            }`}
                            value={examLoads[exam.id] || ""} // ✅ shu joy avtomatik to‘ladi
                            onChange={(e) =>
                              handleLoadChange(exam.id, e.target.value)
                            }
                            disabled={pageLoading}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center text-gray-500">
                        {examSearch
                          ? "Imtihon topilmadi"
                          : "Imtihonlar topilmadi"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <button
                onClick={openSelectedExam}
                disabled={
                  !selectedExam ||
                  examLoading ||
                  pageLoading ||
                  !examLoads[selectedExam] ||
                  examLoads[selectedExam] <= 0
                }
                className="w-full rounded-lg bg-green-500 py-2 text-white hover:bg-green-600 disabled:opacity-50"
              >
                {examLoading ? "Yuklanmoqda..." : "Imtihonni ochish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ResultsModal />
    </div>
  );
}

export default GroupDetail;
