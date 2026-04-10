import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../../config/index";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../../components/loading/LoadingOverlay";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";
import QRCode from "qrcode";

const Duty = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [action, setAction] = useState("online"); // NEW: "online" | "offline"
  const [confirming, setConfirming] = useState(false); // NEW: modal button state
  const [view, setView] = useState("students"); // "students" | "groups"
  const [groups, setGroups] = useState([]);
  // 🟢 startDate — bugundan 7 kun oldingi sana
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 10))
  );
  // 🟢 endDate — bugungi sana
  const [endDate, setEndDate] = useState(new Date());

  const downloadExcel = async (groupId) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/attendance/excel/${groupId}`, {
        method: "GET",
      });

      const blob = await res.blob();
      saveAs(blob, `attendance_${groupId}.xlsx`);
    } catch (err) {
      console.error(err);
    }
  };

  const exportToExcel = async (
    startDate,
    endDate,
    filteredStudents,
    groupName
  ) => {
    try {
      setLoading(true); // ✅ Yuklanish boshlandi
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Davomat jadvali");

      // === Kun nomlari ===
      const getDayName = (date) => {
        const days = [
          "Yakshanba" + " " + groupName,
          "Dushanba" + " " + groupName,
          "Seshanba" + " " + groupName,
          "Chorshanba" + " " + groupName,
          "Payshanba" + " " + groupName,
          "Juma" + " " + groupName,
          "Shanba" + " " + groupName,
        ];
        return days[date.getDay()];
      };

      // === Sana oralig‘idagi barcha kunlar (aniq vaqt zonasi bilan) ===
      const normalizeDate = (d) => {
        const date = new Date(d);
        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12,
          0,
          0
        ); // 🟢 tushki 12 soat — UTC muammosiz
      };

      const start = normalizeDate(startDate);
      const end = normalizeDate(endDate);

      const allDays = [];
      for (
        let temp = new Date(start);
        temp <= end;
        temp.setDate(temp.getDate() + 1)
      ) {
        allDays.push(new Date(temp));
      }

      // === Haftalarga bo‘lish (har 7 kun yoki shanbagacha) ===
      const weeks = [];
      let currentWeek = [];
      allDays.forEach((date, idx) => {
        currentWeek.push(date);
        const isSaturday = date.getDay() === 6;
        const isLastDay = idx === allDays.length - 1;
        if (isSaturday || isLastDay) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      let currentRow = 1;

      // === Har hafta uchun jadval chizish ===
      for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
        const weekDays = weeks[weekIndex];

        // 1️⃣ Sarlavha: №, F.I.SH, Telefon
        worksheet.mergeCells(`A${currentRow}:A${currentRow + 1}`);
        worksheet.getCell(`A${currentRow}`).value = "№";
        worksheet.getCell(`A${currentRow}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        worksheet.mergeCells(`B${currentRow}:B${currentRow + 1}`);
        worksheet.getCell(`B${currentRow}`).value = "F.I.SH";
        worksheet.getCell(`B${currentRow}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        worksheet.mergeCells(`C${currentRow}:C${currentRow + 1}`);
        worksheet.getCell(`C${currentRow}`).value = "📞 Telefon";
        worksheet.getCell(`C${currentRow}`).alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        // 🔹 Haftalik fanlar joylashuvi
        const daySubjectsMap = {};
        weekDays.forEach(
          (d) => (daySubjectsMap[d.toISOString().split("T")[0]] = new Set())
        );

        // 🔹 Fanlarni yig‘ish
        filteredStudents.forEach((studentObj) => {
          (studentObj.lessons ?? []).forEach((lesson) => {
            const date = new Date(lesson.date);
            if (isNaN(date)) return;
            if (date < weekDays[0] || date > weekDays[weekDays.length - 1])
              return;

            const dateKey = date.toISOString().split("T")[0];
            const subject = lesson.subjectName || "Fan yo‘q";
            const pair = lesson.lessonPairName || "";
            const start = lesson.start_time?.slice(0, 5) || "";
            const end = lesson.end_time?.slice(0, 5) || "";
            const key = `${subject} (${pair} ${start}–${end})`;

            if (daySubjectsMap[dateKey]) {
              daySubjectsMap[dateKey].add(key);
            }
          });
        });

        // === Ustunlarni chizish (kun + sana) ===
        let colIndex = 4; // 📅 Darslar 4-ustundan boshlanadi
        weekDays.forEach((date) => {
          const dateKey = date.toISOString().split("T")[0];
          const subjects = Array.from(daySubjectsMap[dateKey]);
          if (subjects.length === 0) return;

          const startCol = worksheet.getColumn(colIndex).letter;
          const endCol = worksheet.getColumn(
            colIndex + subjects.length - 1
          ).letter;

          const formattedDate = date.toLocaleDateString("uz-UZ", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
          const dayName = getDayName(date);

          worksheet.mergeCells(
            `${startCol}${currentRow}:${endCol}${currentRow}`
          );
          worksheet.getCell(
            `${startCol}${currentRow}`
          ).value = `${dayName} - ${formattedDate}`;
          worksheet.getCell(`${startCol}${currentRow}`).alignment = {
            horizontal: "center",
            vertical: "middle",
          };

          subjects.forEach((subject, sIdx) => {
            const cell = worksheet.getCell(
              `${worksheet.getColumn(colIndex + sIdx).letter}${currentRow + 1}`
            );
            cell.value = subject;
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            worksheet.getColumn(colIndex + sIdx).width = 35;
          });

          colIndex += subjects.length;
        });

        // === Talabalar qatori ===
        let studentStartRow = currentRow + 2;
        for (let i = 0; i < filteredStudents.length; i++) {
          const studentObj = filteredStudents[i];
          const student = studentObj.student;
          const lessons = studentObj.lessons ?? [];

          // 🟢 1. JSHSHIR orqali telefonni olish
          let phone = "-";
          if (student?.studentIdNumber) {
            try {
              // 1️⃣ JSHSHIRdan tekshirish (agar kerak bo‘lsa)
              const jshshirRes = await ApiCall(
                `/api/v1/contract/excel/${student.studentIdNumber}`,
                "GET"
              );

              if (jshshirRes.data) {
                // 2️⃣ Telefonni tashqi API’dan olish
                const phoneRes = await fetch(
                  `https://qabul.bxu.uz/api/v1/abuturient/student-online/${jshshirRes.data}`
                );

                const phoneData = await phoneRes.json();
                phone = phoneData.phoneNumber;
              }
            } catch (err) {
              console.error("Telefon olishda xatolik:", err);
              phone = "-";
            }
          }

          // 🟢 2. Talaba ma’lumotlarini joylash
          worksheet.getCell(`A${studentStartRow}`).value = i + 1;
          worksheet.getCell(`B${studentStartRow}`).value = student.fullName;
          worksheet.getCell(`C${studentStartRow}`).value = phone;

          let currentCol2 = 4;
          weekDays.forEach((date) => {
            const dateKey = date.toISOString().split("T")[0];
            const subjects = Array.from(daySubjectsMap[dateKey]);

            subjects.forEach((subjectText, sIdx) => {
              const cell = worksheet.getCell(
                studentStartRow,
                currentCol2 + sIdx
              );

              const match = lessons.find((lesson) => {
                const d = new Date(lesson.date);
                if (isNaN(d)) return false;
                const key = d.toISOString().split("T")[0];
                if (key !== dateKey) return false;

                const subj = `${lesson.subjectName || "Fan yo‘q"} (${
                  lesson.lessonPairName || ""
                } ${lesson.start_time?.slice(0, 5) || ""}–${
                  lesson.end_time?.slice(0, 5) || ""
                })`;

                return subj === subjectText;
              });

              if (!match) cell.value = "📘 Dars mavjud emas";
              else if (match.present === true) cell.value = "✅ Qatnashdi";
              else if (match.present === false) cell.value = "❌ Qatnashmadi";
              else cell.value = "⚪ Belgilanmadi";

              cell.alignment = {
                horizontal: "center",
                vertical: "middle",
                wrapText: true,
              };
            });

            currentCol2 += subjects.length;
          });

          studentStartRow++;
        }

        // === Chegaralar ===
        const totalRows = filteredStudents.length + 2;
        for (let r = currentRow; r < currentRow + totalRows; r++) {
          const row = worksheet.getRow(r);
          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            if (r - currentRow < 2) cell.font = { bold: true };
          });
        }

        // Haftalar orasiga bo‘sh qator
        currentRow += filteredStudents.length + 4;
      }

      // === Saqlash ===
      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);
      const buffer = await workbook.xlsx.writeBuffer();

      saveAs(
        new Blob([buffer]),
        `${groupName}_talabalar_davomat_${startStr}_to_${endStr}.xlsx`
      );
      toast.success("✅ Excel fayl muvaffaqiyatli yaratildi!");
    } catch (error) {
      console.error("Excel yaratishda xatolik:", error);
      toast.error("❌ Excel yaratishda xatolik yuz berdi!");
    } finally {
      setLoading(false); // ✅ Yuklanish tugadi
    }
  };

  const handleDownload = async (file) => {
    try {
      if (!file?.id) {
        alert("❌ Fayl ID topilmadi");
        return;
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `${baseUrl}/api/v1/file/getFile/${file.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("❌ Faylni yuklab bo‘lmadi");
      }

      // Faylni blob ko‘rinishida olish
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Fayl nomini olish (name maydonidan)
      const fileName = file.name || "downloaded_file.pdf";

      // Yuklab olishni boshlash
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // URL ni tozalash
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Xatolik yuz berdi: " + error.message);
    }
  };
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/online-student/group/${groupId}`,
        "GET"
      );
      const studentsList = Array.isArray(response.data) ? response.data : [];

      // 🔁 Har bir talaba uchun fanlarni olish
      const studentsWithLessons = await Promise.all(
        studentsList.map(async (item) => {
          const student = item.student;
          try {
            const res = await ApiCall(
              `/api/v1/attendance/student/${student.id}`,
              "GET"
            );
            setGroupName(student?.group?.name);

            return { ...item, lessons: res.data || [] }; // fanlar qo‘shildi
          } catch (err) {
            console.error(`Xatolik (${student.fullName}) fan olishda:`, err);
            return { ...item, lessons: [] };
          }
        })
      );

      setStudents(studentsWithLessons);
      setFilteredStudents(studentsWithLessons);
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
  const getGroupsFromHemis = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/online-subject-lesson/group/${groupId}`,
        "GET"
      );
      if (Array.isArray(response.data)) {
        setGroups(response.data);
        setFilteredGroups(response.data);
      } else {
        setGroups([]);
        setFilteredGroups([]);
      }
    } catch (error) {
      console.error("Xatolik (groups):", error);
      toast.error("Guruh yoki curriculum topilmadi ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      if (view === "students") {
        setFilteredStudents(students);
      } else if (view === "groups") {
        setFilteredGroups(groups);
      }
      return;
    }

    const searchLower = term.toLowerCase();

    if (view === "students") {
      const filtered = students.filter((item) => {
        const s = item.student || {}; // ichki student obyekt
        return (
          s.fullName?.toLowerCase().includes(searchLower) ||
          s.studentIdNumber?.toLowerCase().includes(searchLower) ||
          s.group?.name?.toLowerCase().includes(searchLower) ||
          s.firstName?.toLowerCase().includes(searchLower) ||
          s.secondName?.toLowerCase().includes(searchLower) ||
          s.thirdName?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredStudents(filtered);
    }

    if (view === "groups") {
      const filtered = groups.filter((g) =>
        g.subject?.name?.toLowerCase().includes(searchLower)
      );
      setFilteredGroups(filtered);
    }
  };

  // 🔹 отдельное состояние для отфильтрованных предметов
  const [filteredGroups, setFilteredGroups] = useState([]);

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
        res = await ApiCall(
          `/api/v1/online-student/${selectedStudent.id}`,
          "POST"
        );
      } else {
        res = await ApiCall(
          `/api/v1/online-student/remove/${selectedStudent.id}`,
          "PUT"
        );
      }

      if (true) {
        toast.success(
          action === "online"
            ? "Student online qilindi ✅"
            : "Student offline qilindi ✅"
        );
        await fetchStudents();
        setOpenModal(false);
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
  const generateQRcode = async () => {
    const url = `https://edu.bxu.uz/online-groups/${groupId}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(url, { width: 300 });
      const link = document.createElement("a");
      link.href = qrDataUrl;
      link.download = `online-group-${groupId}.png`;
      link.click();
      toast.success("QR code muvaffaqiyatli yuklab olindi ✅");
    } catch (error) {
      console.error("QR code xatolik:", error);
      toast.error("QR code yaratishda xatolik ❌");
    }
  };
  return (
    <div className="mx-auto max-w-7xl p-6">
      <ToastContainer />
      <Breadcrumbs
        items={[{ label: "Guruhlar", to: "/office/online-group" }]}
      />
      {/* Sarlavha va yangilash tugmasi */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-600 sm:text-3xl">
          {groupName} Online Guruh talabalari ro'yxati
        </h1>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => {
            setView("students");
            fetchStudents();
          }}
          className={`rounded px-4 py-2 ${
            view === "students"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Talabalar
        </button>
        <button
          onClick={() => {
            setView("groups");
            getGroupsFromHemis();
          }}
          className={`rounded px-4 py-2 ${
            view === "groups"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Fanlar
        </button>

        <button
          onClick={generateQRcode}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          QR code yuklab olish
        </button>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Boshlanish sana:
          </label>
          <input
            type="date"
            value={startDate.toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)} // ❗ faqat bugungacha tanlash mumkin
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Tugash sana:
          </label>
          <input
            type="date"
            value={endDate.toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)} // ❗ ertangi sanani tanlash bloklanadi
            min={startDate.toISOString().slice(0, 10)} // ❗ tugash sana boshlanish sanadan oldin bo‘la olmaydi
            onChange={(e) => setEndDate(new Date(e.target.value))}
            className="rounded border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() =>
            exportToExcel(startDate, endDate, filteredStudents, groupName)
          }
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          Davomat yuklab olish
        </button>
        <button
          onClick={() => downloadExcel(groupId)}
          className="mt-6 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          Hisobot yuklab olish
        </button>
      </div>
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
            placeholder={
              view === "students"
                ? "Talaba ismi, familiyasi bo'yicha qidirish..."
                : "Fan nomi bo'yicha qidirish..."
            }
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
            {view === "students" ? "Topilgan talabalar:" : "Topilgan fanlar:"}{" "}
            <span className="text-2xl font-bold text-blue-600">
              {view === "students"
                ? filteredStudents.length
                : filteredGroups.length}{" "}
              ta
            </span>
          </p>
        </div>
      )}

      {(loading || updating) && <LoadingOverlay text="Yuklanmoqda..." />}
      {view === "students" && (
        <>
          {!loading && filteredStudents.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                {searchTerm
                  ? "Qidiruv bo'yicha talabalar topilmadi"
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
                      <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        FISH
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Telefon
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
                      <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Asosni yuklab olish
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
                        <td
                          className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                          onClick={() =>
                            navigate(
                              `/office/online-group/student/${student.student.id}`,
                              {
                                state: { studentId: student.student.id }, // agar kerak bo‘lsa student ma’lumotini state bilan jo‘natamiz
                              }
                            )
                          }
                        >
                          {index + 1}
                        </td>
                        <td
                          className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900"
                          onClick={() =>
                            navigate(
                              `/office/online-group/student/${student.student.id}`,
                              {
                                state: { studentId: student.student.id }, // agar kerak bo‘lsa student ma’lumotini state bilan jo‘natamiz
                              }
                            )
                          }
                        >
                          {student?.student.fullName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {student?.student.phone || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {student?.student.studentIdNumber || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {student?.student.semesterName || "-"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {student?.student.avgGpa || "0"}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
                          <button
                            className="hover:text-blue-600"
                            onClick={() => handleDownload(student.file)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="h-6 w-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                              />
                            </svg>
                          </button>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {student?.student.image ? (
                            <img
                              src={student.student.image}
                              alt={student.student.fullName || "Talaba"}
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
                          {student.student.isOnline ? (
                            <button
                              onClick={() => {
                                setSelectedStudent(student.student);
                                setAction("offline"); // <<< set action
                                setOpenModal(true);
                              }}
                              className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                            >
                              Offline qilish
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedStudent(student.student);
                                setAction("online"); // <<< set action
                                setOpenModal(true);
                              }}
                              className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                            >
                              Online qilish
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
                center
              >
                <h2 className="mb-4 text-lg font-bold">Tasdiqlash</h2>
                <p className="mb-6">
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

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                    disabled={confirming}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={confirmAction}
                    disabled={confirming}
                    className={`rounded px-4 py-2 text-white ${
                      action === "online"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-red-600 hover:bg-red-700"
                    } ${confirming ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    {confirming ? "Yuborilmoqda..." : "Ha, tasdiqlayman"}
                  </button>
                </div>
              </Modal>
            </div>
          )}
        </>
      )}
      {view === "groups" && (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fan nomi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kredit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Umumiy yuklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    O‘quv yili
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hemis ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredGroups.map(
                  (
                    g,
                    i // ✅ filteredGroups вместо groups
                  ) => (
                    <tr
                      key={g.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() =>
                        navigate(`/office/curriculum-subject/${g.id}`)
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {i + 1}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {g.subject?.name || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {g.credit ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {g.totalAcload ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {g.curriculum?.educationYearName || "-"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {g.hemisId || "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Duty;
