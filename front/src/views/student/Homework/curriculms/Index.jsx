import React, { useEffect, useState } from "react";
import ApiCall from "../../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCurriculms(id);
    }
  }, [id]);

  const fetchCurriculms = async (id) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${id}`,
        "GET"
      );
      console.log("✅ Backend response:", res.data);
      setSubjects(res.data || []);
    } catch (error) {
      console.error("❌ Xatolik:", error);
      toast.error("Ma'lumotlarni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const sortedSubjects = [...subjects].sort((a, b) => {
    // Yuklangan (true) birinchi chiqadi
    if (a.isPresent === b.isPresent) return 0;
    return a.isPresent ? -1 : 1;
  });

  if (loading) {
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
  }

  const firstItem = subjects[0];
  const subj = firstItem?.curriculumSubject?.subject;
  const sem = firstItem?.semester ? firstItem.semester - 10 : null;

  return (
    <div className="mx-auto max-w-5xl p-4">
      <ToastContainer />

      {/* ==== FAN NOMI VA SEMESTR ==== */}
      {subj ? (
        <div className="mb-6 flex items-center justify-between border-b-4 border-blue-600 pb-2">
          <h1 className="text-2xl font-bold text-gray-800">{subj.name}</h1>
          <span className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">
            Semestr: {sem || "—"}
          </span>
        </div>
      ) : (
        <h1 className="mb-6 border-b-4 border-blue-600 pb-2 text-2xl font-bold text-gray-800">
          Mavzular ro‘yxati
        </h1>
      )}
      {/* ==== TABLE ==== */}
      {subjects.length === 0 ? (
        <div className="text-center text-gray-500">Mavzular topilmadi</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  №
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Mavzu nomi
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Vazifa
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  Amal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...subjects]
                .sort((a, b) =>
                  a.isPresent === b.isPresent ? 0 : a.isPresent ? -1 : 1
                )
                .map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-gray-800">
                      {item.isPresent ? "Yuklangan" : "Yuklanmagan"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() =>
                          navigate(`/student/homeworks/homework/${item.id}`)
                        }
                        className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm text-white transition hover:bg-blue-700"
                      >
                        Vazifani bajarish
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Index;
