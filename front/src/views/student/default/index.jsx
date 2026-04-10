import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config/index";
import Banner from "./components/Banner";
import ModalForcePasswordChange from "../profile/CheckPassword";


const Dashboard = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [debts, setDebts] = useState([]); // fan qarzdorliklari
  const [loading, setLoading] = useState(true);
  const id = searchParams.get("id");

  const [forceModal, setForceModal] = useState(false);

  // ✅ Tokenni olib studentni yuklash
  const checkLogin = async () => {
    const token = localStorage.getItem("authToken");

    // Token umuman yo‘q bo‘lsa
    if (!token) {
      navigate("/student/login");
      return false;
    }
  };

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/student/login");
        return false;
      }
      return true;  // <-- TUSHURILGAN TRUE
    };

  }, []);

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (
        response?.error === "INVALID_TOKEN" ||
        response?.error === true || // общий boolean-ответ
        response?.status === 401 ||
        response?.status === 403
      ) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      const studentData = response.data;

      setStudent(studentData);
      if (
        studentData.password === studentData.studentIdNumber ||
        studentData.password === studentData.passportNumber ||
        studentData.password === String(studentData.hemisId)
      ) {
        setForceModal(true);
      }


      if (studentData?.id) {
        fetchStudentDebts(studentData.id);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      localStorage.removeItem("authToken");
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDebts = async (studentId) => {
    try {
      const response = await ApiCall(
        `/api/v1/student-subject/debt/${studentId}`,
        "GET"
      );

      let data = response.item;
      if (Array.isArray(data)) {
        setDebts(data);
      } else if (data?.content && Array.isArray(data.content)) {
        setDebts(data.content);
      } else {
        setDebts([]); // noto‘g‘ri format bo‘lsa bo‘sh array
      }
    } catch (error) {
      console.error("Error fetching student debts:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div>
      <ModalForcePasswordChange
        open={forceModal}
        student={student}
        onSuccess={() => setForceModal(false)}
      />
      {/* Student banner */}
      <div className="grid grid-cols-1 gap-5">
        {student && (
          <Banner name={`${student.first_name} ${student.second_name}`} />
        )}
      </div>

      {/* Qarzdor fanlar jadvali */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">
          Qarzdor fanlar ro‘yxati
        </h3>
        {debts.length === 0 ? (
          <p className="text-sm text-gray-500">Qarzdor fanlar yo‘q 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">
                    №
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">
                    Fan kodi
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">
                    Fan nomi
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">
                    Kredit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-600">
                    Holati
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {debts.map((subject, index) => (
                  <tr key={subject.id || index}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {subject.subject?.code || "N/A"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {subject.subject?.name || "Noma’lum fan"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {subject.credit || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${subject.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {subject.active ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
