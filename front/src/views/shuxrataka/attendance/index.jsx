// src/pages/.../Debts.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";

export default function Attendance() {
  const { studentId } = useParams();
  const id = studentId;

  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);

  // Filters & search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPara, setSelectedPara] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [availableGroups, setAvailableGroups] = useState([]);

  // NEW: Date selection (default = today)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  });

  // Modals
  const [openAbsentModal, setOpenAbsentModal] = useState(false);
  const [absentLessonId, setAbsentLessonId] = useState(null);
  const [absentComment, setAbsentComment] = useState("Sababsiz qatnashmadi.");

  const [openModal, setOpenModal] = useState(false);
  const [selectedWeekDayId, setSelectedWeekDayId] = useState(null);
  const [comment, setComment] = useState("To'liq qatnashdi.");

  // Convert selected date → Unix timestamp (set to 11:00 AM)
  const getSelectedDateTimestamp = () => {
    const date = new Date(selectedDate);
    date.setHours(11, 0, 0, 0); // 11:00 AM local time
    return Math.floor(date.getTime() / 1000);
  };

  const handleAttendance = async (
    onlineStudentWeekDayId,
    present,
    customComment
  ) => {
    try {
      const body = {
        id: onlineStudentWeekDayId,
        present: present,
        comment: customComment || "To'liq qatnashdi.",
      };
      const res = await ApiCall("/api/v1/attendance", "POST", body);

      if (res?.data) {
        toast.success(
          present ? "Davomat belgilandi: Ha ✅" : "Davomat belgilandi: Yo‘q ❌"
        );
      } else {
        toast.error("Davomatni saqlashda xatolik!");
      }
    } catch (err) {
      console.error("Xatolik tafsilotlari:", err);
      if (err.response) {
        console.error("Server javobi:", err.response.data);
        console.error("Status kodi:", err.response.status);
      }
      toast.error("Server bilan xatolik!");
    } finally {
      setOpenModal(false);
      setSelectedWeekDayId(null);
      setComment("To'liq qatnashdi.");
      fetchStudent(); // reload
    }
  };

  const openAttendanceModal = (weekDayId) => {
    setSelectedWeekDayId(weekDayId);
    setComment("To'liq qatnashdi.");
    setOpenModal(true);
  };

  // Fetch lessons for the selected date
  const fetchStudent = async () => {
    try {
      const valueTimestamp = getSelectedDateTimestamp();
      const res = await ApiCall(
        `/api/v1/attendance/weekday/${valueTimestamp}`,
        "GET"
      );

      console.log("Fetched for timestamp:", valueTimestamp, "→", res.data);

      if (res && !res.error) {
        let data = [];

        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.data)) data = res.data.data;
        else if (res.data && Array.isArray(res.data.content))
          data = res.data.content;
        else if (res.data && Array.isArray(res.data.items))
          data = res.data.items;

        setLessons(data);
        setFilteredLessons(data);

        const groups = [
          ...new Set(
            (data || [])
              .map(
                (lesson) =>
                  lesson.onlineStudentWeekDay?.onlineStudent?.student
                    ?.groupName || ""
              )
              .filter(Boolean)
          ),
        ];
        setAvailableGroups(groups);
      } else {
        setLessons([]);
        setFilteredLessons([]);
        setAvailableGroups([]);
      }
    } catch (error) {
      console.error("Fetch lessons error:", error);
      toast.error("Ma'lumotlarni olishda xatolik!");
      setLessons([]);
      setFilteredLessons([]);
      setAvailableGroups([]);
    }
  };

  // Upload/sync from HEMIS then reload
  const fetchStudentUpload = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/attendance/get-today-lessons`, "GET");
      // const res = await ApiCall(`/api/v1/attendance/get-week-lessons`, "GET");
      console.log("fetchStudentUpload", res);
      toast.success("Ma'lumotlar yangilandi!");
    } catch (error) {
      console.error("Fetch student upload error:", error);
      toast.error("Bugungi darslarni olishda xatolik!");
    } finally {
      setLoading(false);
      fetchStudent();
    }
  };

  // Apply filters & search
  useEffect(() => {
    if (!Array.isArray(lessons)) {
      setFilteredLessons([]);
      return;
    }

    let result = lessons;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (lesson) =>
          lesson.onlineStudentWeekDay?.onlineStudent?.student?.fullName
            ?.toLowerCase()
            .includes(term) ||
          lesson.subjectName?.toLowerCase().includes(term) ||
          lesson.employeeName?.toLowerCase().includes(term)
      );
    }

    if (selectedPara !== "all") {
      result = result.filter(
        (lesson) => lesson.lessonPairName === selectedPara
      );
    }

    if (selectedGroup !== "all") {
      result = result.filter(
        (lesson) =>
          lesson.onlineStudentWeekDay?.onlineStudent?.student?.groupName ===
          selectedGroup
      );
    }

    setFilteredLessons(result);
  }, [searchTerm, selectedPara, selectedGroup, lessons]);

  // Load lessons when date changes
  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const safeFilteredLessons = Array.isArray(filteredLessons)
    ? filteredLessons
    : [];

  return (
    <div className="min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={2500} />
      <Breadcrumbs />

      {/* Top header */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Darslar (sana bo‘yicha)
            </h1>
            <p className="text-gray-600">Talabalar davomatini boshqarish</p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row">
            {/* Date selector */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sana (bugungacha)
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={fetchStudentUpload}
              disabled={loading}
              className={`mt-6 flex items-center justify-center rounded-lg px-4 py-2.5 font-medium transition-colors sm:mt-auto ${loading
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-600 text-white hover:bg-blue-700"
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
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  Yangilash
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Qidirish (FIO, Fan, O‘qituvchi)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Qidirish..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Para
            </label>
            <select
              value={selectedPara}
              onChange={(e) => setSelectedPara(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Barcha paralar</option>
              <option value="1-juftlik">1-juftlik</option>
              <option value="2-juftlik">2-juftlik</option>
              <option value="3-juftlik">3-juftlik</option>
              <option value="4-juftlik">4-juftlik</option>
              <option value="5-juftlik">5-juftlik</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Guruh
            </label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Barcha guruhlar</option>
              {availableGroups.map((group, index) => (
                <option key={index} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading && lessons.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
            <span className="mt-3 block text-gray-600">
              Ma‘lumotlar yuklanmoqda...
            </span>
          </div>
        </div>
      ) : safeFilteredLessons.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Hech qanday dars topilmadi
          </h3>
          <p className="mt-2 text-gray-500">
            Tanlangan sana bo‘yicha darslar mavjud emas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    FIO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    O‘qituvchi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Para
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vaqt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Guruh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {safeFilteredLessons.map((lesson, idx) => (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {
                        lesson.onlineStudentWeekDay?.onlineStudent?.student
                          ?.fullName
                      }
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lesson.subjectName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lesson.employeeName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lesson.lessonPairName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {lesson.start_time} - {lesson.end_time}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {
                        lesson.onlineStudentWeekDay?.onlineStudent?.student
                          ?.groupName
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {lesson.present === null ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openAttendanceModal(lesson.id)}
                            className="rounded-md bg-green-100 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-200"
                          >
                            Qatnashdi
                          </button>
                          <button
                            onClick={() => {
                              setAbsentLessonId(lesson.id);
                              setAbsentComment("Sababsiz qatnashmadi.");
                              setOpenAbsentModal(true);
                            }}
                            className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
                          >
                            Qatnashmadi
                          </button>
                        </div>
                      ) : lesson.present === true ? (
                        <div>{lesson.comment || "Qatnashdi"}</div>
                      ) : (
                        <div>Qatnashmadi</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Qatnashdi modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        center
        classNames={{ modal: "rounded-lg p-6 md:max-w-md" }}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-800">Davomat izohi</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // yangi qatorga tushmasligi uchun
              handleAttendance(selectedWeekDayId, true, comment);
            }
          }}
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          placeholder="To'liq qatnashdi."
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setOpenModal(false)}
            className="rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => handleAttendance(selectedWeekDayId, true, comment)}
            className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Saqlash
          </button>
        </div>
      </Modal>

      {/* ❌ Qatnashmadi modal */}
      <Modal
        open={openAbsentModal}
        onClose={() => setOpenAbsentModal(false)}
        center
        classNames={{ modal: "rounded-lg p-6 md:max-w-md" }}
      >
        <h2 className="mb-4 text-xl font-bold text-gray-800">Qatnashmadi</h2>
        <textarea
          value={absentComment}
          onChange={(e) => setAbsentComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // yangi qatorga tushmasligi uchun
              if (!absentLessonId) return setOpenAbsentModal(false);
              handleAttendance(absentLessonId, false, absentComment);
              setOpenAbsentModal(false);
            }
          }}
          rows={3}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          placeholder="Sababi (ixtiyoriy)..."
        />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setOpenAbsentModal(false)}
            className="rounded-lg bg-gray-200 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => {
              if (!absentLessonId) return setOpenAbsentModal(false);
              handleAttendance(absentLessonId, false, absentComment);
              setOpenAbsentModal(false);
            }}
            className="rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white hover:bg-red-700"
          >
            Tasdiqlash
          </button>
        </div>
      </Modal>
    </div>
  );
}
