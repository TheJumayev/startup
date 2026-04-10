import React, { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";

const Duty = () => {
  const { groupId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);

  // === Fetch group info ===
  const getGroup = async () => {
    try {
      const response = await ApiCall(`/api/v1/groups/${groupId}`, "GET");
      if (response && !response.error) {
        setGroup(response.data);
      }
    } catch (err) {
      console.error("Group fetch error:", err);
    }
  };

  // === Fetch all students + weekdays in one go ===
  const fetchStudentsAndWeekdays = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch students first
      const response = await ApiCall(`/api/v1/online-student/group/${groupId}`, "GET");
      if (!response || !Array.isArray(response.data)) {
        setStudents([]);
        toast.error("Talabalar ro‘yxatini olishda xatolik ❌");
        return;
      }

      const studentList = response.data;

      // 2️⃣ Prepare weekday requests for all students
      const weekdayRequests = studentList.map(async (student) => {
        const url = `/api/v1/online-student-weekday/student/${student.student.id}?activeOnly=true`;
        try {
          const res = await ApiCall(url, "GET");
          const arr = Array.isArray(res?.data) ? res.data : [];

          // Extract weekday names (like "JUMA", "SHANBA")
          const weekdayNames = arr.map((item) => item.weekday?.day).filter(Boolean);
          return { ...student, weekdays: weekdayNames };
        } catch (error) {
          console.error("❌ Weekday fetch error for", student.student.fullName, error);
          return { ...student, weekdays: [] };
        }
      });

      // 3️⃣ Wait for all weekday requests to complete
      const fullStudents = await Promise.all(weekdayRequests);

      // 🔠 Sort alphabetically by student full name
      fullStudents.sort((a, b) =>
          (a.student?.fullName || "").localeCompare(b.student?.fullName || "", "uz", {
            sensitivity: "base",
          })
      );

      // 4️⃣ Update state once with full merged data
      setStudents(fullStudents);
    } catch (err) {
      console.error("Students fetch error:", err);
      toast.error("Talabalar ro‘yxatini olishda xatolik ❌");
    } finally {
      setLoading(false);
    }
  };

  // === Run on mount ===
  useEffect(() => {
    if (groupId) {
      fetchStudentsAndWeekdays();
      getGroup();
    }
  }, [groupId]);

  return (
      <div className="mx-auto max-w-7xl p-6">
        <ToastContainer />
        {loading && <LoadingOverlay text="Yuklanmoqda..." />}

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-blue-600 sm:text-3xl">
            {group?.name} Online Guruh talabalari ro'yxati
          </h1>
        </div>

        {/* Table */}
        {!loading && students.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">Guruh boʻyicha talabalar topilmadi</p>
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
                      Rasm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Online dars kunlari
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {students.map((student, index) => (
                      <tr key={student.id || index} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {student?.student?.fullName || "-"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {student?.student?.image ? (
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

                        {/* ✅ Student weekdays */}
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {student.weekdays && student.weekdays.length > 0 ? (
                              student.weekdays.map((day, i) => (
                                  <span
                                      key={i}
                                      className="inline-block rounded-full bg-blue-100 px-1 py-1 text-xs font-medium text-blue-700 mr-1"
                                  >
                            {day}
                          </span>
                              ))
                          ) : (
                              <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}
      </div>
  );
};

export default Duty;
