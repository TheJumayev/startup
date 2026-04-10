import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import Select from "react-select";

function Index() {
  const [groups, setGroups] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [mobileView, setMobileView] = useState("list"); // 'list' yoki 'table'

  const [groupId, setGroupId] = useState(null);
  const [scheduleId, setScheduleId] = useState(null);
  const [showLateModal, setShowLateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const openLateModal = (attendance) => {
    setSelectedStudent(attendance);
    setShowLateModal(true);
  };
  const [lessonInfo, setLessonInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  // GROUPLARNI YUKLASH
  const loadGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      const options = (res?.data || []).map((g) => ({
        value: g.id,
        label: g.name,
      }));
      setGroups(options);
    } catch {
      toast.error("Guruhlarni yuklashda xatolik");
    }
  };

  // GROUP TANLANGANDA SCHEDULE KELADI
  const fetchSchedule = async (groupId) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/schedule-list-controller/group/${groupId}`,
        "GET"
      );
      const options = (response?.data || []).map((s) => ({
        value: s.id,
        label: `${s.subject?.name} | ${s.start_time}`,
        data: s,
      }));
      setScheduleList(options);
    } catch (error) {
      console.error(error);
      toast.error("Dars jadvalini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // SCHEDULE TANLANGANDA DAVOMAT KELADI
  const loadAttendance = async (id) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/attendance-offline/offline/${id}`,
        "GET"
      );
      const data = res.data || [];
      setAttendanceList(data);
      if (data.length > 0 && data[0].scheduleList) {
        setLessonInfo(data[0].scheduleList);
      }
    } catch {
      toast.error("Davomatni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const confirmLate = async () => {
    if (!selectedStudent) return;

    try {
      await ApiCall(
        `/api/v1/attendance-offline/later/${selectedStudent.id}`,
        "PUT",
        {
          studentId: selectedStudent.student?.id,
        }
      );

      toast.success("Student kech qoldi deb belgilandi");

      setShowLateModal(false);
      setSelectedStudent(null);

      if (scheduleId) {
        loadAttendance(scheduleId.value);
      }
    } catch (error) {
      console.error(error);
      toast.error("Kech qolganini belgilashda xatolik");
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return { text: "Bor", color: "bg-green-100 text-green-800" };
      case 2:
        return { text: "Yo'q", color: "bg-red-100 text-red-800" };
      case 3:
        return { text: "Sababli", color: "bg-yellow-100 text-yellow-800" };
      default:
        return { text: "Belgilanmagan", color: "bg-gray-100 text-gray-800" };
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredAttendance = attendanceList.filter((a) =>
    a.student?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";

    return new Date(timestamp).toLocaleString("uz-UZ", {
      timeZone: "Asia/Tashkent",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (showLateModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLateModal]);

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">📋 Davomat</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            {attendanceList.length} ta student
          </p>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="space-y-3 border-b bg-white p-4">
        {/* GROUP SELECT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Guruh
          </label>
          <Select
            options={groups}
            placeholder="Guruhni tanlang..."
            value={groupId}
            isSearchable
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "42px",
                borderRadius: "10px",
                borderColor: "#e5e7eb",
                boxShadow: "none",
                "&:hover": { borderColor: "#3b82f6" },
              }),
            }}
            onChange={(selected) => {
              setGroupId(selected);
              setScheduleId(null);
              setScheduleList([]);
              setAttendanceList([]);
              fetchSchedule(selected.value);
            }}
          />
        </div>

        {/* SCHEDULE SELECT */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Dars
          </label>
          <Select
            options={scheduleList}
            placeholder="Darsni tanlang..."
            value={scheduleId}
            isSearchable
            isDisabled={!groupId}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: "42px",
                borderRadius: "10px",
                borderColor: "#e5e7eb",
                backgroundColor: !groupId ? "#f3f4f6" : "white",
                boxShadow: "none",
                "&:hover": { borderColor: "#3b82f6" },
              }),
            }}
            onChange={(selected) => {
              setScheduleId(selected);
              loadAttendance(selected.value);
            }}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Student qidirish
          </label>
          <input
            type="text"
            placeholder="Student ismini yozing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* VIEW TOGGLE (Mobile/Desktop) */}
        {attendanceList.length > 0 && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setMobileView("list")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mobileView === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              📱 Mobil
            </button>
            <button
              onClick={() => setMobileView("table")}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                mobileView === "table"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              💻 Jadval
            </button>
          </div>
        )}
      </div>

      {/* LESSON INFO CARD */}
      {lessonInfo && (
        <div className="mx-4 mt-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-blue-600">📚</span>
            <h3 className="font-medium text-gray-900">
              {lessonInfo?.subject?.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-blue-600">👨‍🏫</span>
            <span>{lessonInfo?.employeeName}</span>
          </div>
          {lessonInfo?.time && (
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-600">⏰</span>
              <span>{formatDateTime(lessonInfo.time)}</span>
            </div>
          )}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* CONTENT */}
      {!loading && attendanceList.length > 0 && (
        <>
          {/* MOBILE CARD VIEW */}
          {mobileView === "list" ? (
            <div className="space-y-3 p-4">
              {filteredAttendance.map((a, index) => {
                const status = getStatusText(a.isPresent);
                return (
                  <div
                    key={a.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                  >
                    {/* Student Header */}
                    <div className="flex items-center gap-3 border-b border-gray-50 p-4">
                      <img
                        className="h-12 w-12 rounded-full border-2 border-gray-200 object-cover"
                        src={
                          a.student?.image || "https://via.placeholder.com/48"
                        }
                        alt=""
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-gray-900">
                          {a.student?.fullName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          ID: {a.student?.id || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-3 p-4">
                      {/* Status Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Holat</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>

                      {/* Time Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Dars vaqti
                        </span>
                        <span className="text-sm font-medium">
                          {a.scheduleList?.start_time
                            ? `${a.scheduleList.start_time} - ${a.scheduleList.end_time}`
                            : "-"}
                        </span>
                      </div>

                      {/* Late Status Row */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Kechikish</span>
                        {a.isLate ? (
                          <span className="flex items-center gap-1 text-orange-600">
                            <span>⏰</span>
                            <span className="text-sm font-medium">
                              Kech qoldi
                            </span>
                          </span>
                        ) : (
                          <button
                            onClick={() => openLateModal(a)}
                            className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 transition-colors active:bg-orange-100"
                          >
                            Kech qoldi
                          </button>
                        )}
                      </div>

                      {/* Late Time */}
                      {a.lateTime && (
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                          <span className="text-sm text-gray-600">
                            Kechikkan vaqt
                          </span>
                          <span className="text-sm font-medium text-orange-600">
                            {formatDateTime(a.lateTime)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DESKTOP TABLE VIEW (Horizontal scroll) */
            <div className="overflow-x-auto p-4">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Rasm
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Holat
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Vaqt
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Kechikish
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredAttendance.map((a, index) => {
                        const status = getStatusText(a.isPresent);
                        return (
                          <tr key={a.id} className="hover:bg-gray-50">
                            <td className="whitespace-nowrap px-4 py-3">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={
                                  a.student?.image ||
                                  "https://via.placeholder.com/40"
                                }
                                alt=""
                              />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {a.student?.fullName}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                              >
                                {status.text}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                              {a.scheduleList?.start_time
                                ? `${a.scheduleList.start_time} - ${a.scheduleList.end_time}`
                                : "-"}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              {a.isLate ? (
                                <span className="flex items-center gap-1 text-sm text-orange-600">
                                  <span>⏰</span>
                                  <span>Kech qoldi</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => openLateModal(a)}
                                  className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-100"
                                >
                                  Kech qoldi
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && attendanceList.length === 0 && groupId && scheduleId && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <div className="mb-4 text-6xl">📭</div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">
            Davomat topilmadi
          </h3>
          <p className="text-center text-sm text-gray-500">
            Ushbu dars uchun davomat ma'lumotlari mavjud emas
          </p>
        </div>
      )}
      {showLateModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          {/* Modal */}
          <div className="w-[90%] max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Kech qolganini tasdiqlash
            </h3>

            <p className="text-sm leading-relaxed text-gray-600">
              Haqiqatan ham{" "}
              <span className="font-semibold text-red-600">
                {selectedStudent?.student?.fullName}
              </span>{" "}
              kech qoldi deb belgilansinmi?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLateModal(false)}
                className="rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                Bekor qilish
              </button>

              <button
                onClick={confirmLate}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white transition hover:bg-orange-600"
              >
                Ha, belgilash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
