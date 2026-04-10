import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const StudentSubjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 100;

  // 🔹 Получаем данные студента
  const fetchStudent = async (token) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");

      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      setStudent(res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Xatolik student ma'lumotlarini olishda:", error);
      toast.error("Student ma'lumotlarini olishda xatolik");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Получаем предметы по curriculumHemisId
  const fetchSubjects = async (curriculumId) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}&size=${PAGE_SIZE}`,
        "GET"
      );

      const content = res?.data?.content ?? [];

      // 🔹 Фильтруем только активные предметы
      const activeSubjects = content.filter(
        (item) => item.subject?.active === true
      );

      setSubjects(activeSubjects);
    } catch (err) {
      console.error("❌ Fanlarni olishda xatolik:", err);
      toast.error("Fanlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Token topilmadi. Iltimos, tizimga kiring.");
      return;
    }

    const load = async () => {
      const st = await fetchStudent(token);
      const curriculumId = st?.group?.curriculum;
      if (curriculumId) {
        await fetchSubjects(curriculumId);
      } else {
        toast.info("Talaba uchun curriculum ma'lumoti topilmadi");
      }
    };
    load();
  }, []);

  // 🔹 Обработка клика по предмету
  const handleSubjectClick = (item) => {
    const subjectId = item.subject?.id;
    const subjectName = item.subject?.subject?.name || "Noma'lum fan";
    const testCount = item.test_count ?? 0;

    if (testCount === 0) {
      toast.info("Bu fandan test mavjud emas");
      return;
    }

    navigate(`/student/test-knowledge/${subjectId}`, {
      state: { subjectName },
    });
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="mt-4 block text-lg text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </span>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <ToastContainer />
      <h1 className="mb-6 border-b-4 border-blue-600 pb-2 text-2xl font-bold text-gray-800">
        Bilimni sinab ko'rish
      </h1>

      {subjects.length === 0 ? (
        <p className="text-gray-500">Faol fanlar topilmadi</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  №
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Fan nomi
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  Testlar soni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {subjects.map((item, idx) => {
                const cs = item.subject;
                const subj = cs?.subject || {};
                return (
                  <tr
                    key={cs.id}
                    className="cursor-pointer transition hover:bg-blue-50"
                    onClick={() => handleSubjectClick(item)}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                      {subj.name || "Noma'lum fan"}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm font-semibold ${
                        (item.test_count ?? 0) > 0
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    >
                      {item.test_count ?? 0}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;
