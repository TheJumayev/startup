import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "components/loading/LoadingOverlay";

function Lessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Semestr formatlash
  const formatSemester = (semester) => (semester ? semester - 10 : "N/A");
  // 🔹 Darslarni olish
  const fetchLessons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${id}`,
        "GET"
      );
      console.log(response.data);

      let lessonsData = [];
      if (response && response.data) {
        if (Array.isArray(response.data)) lessonsData = response.data;
        else if (Array.isArray(response.data?.content))
          lessonsData = response.data.content;
      }
      if (lessonsData.length > 0) {
        setSubjectData(lessonsData[0]);
      }
      setLessons(lessonsData);
    } catch (err) {
      console.error("❌ Xatolik:", err);
      toast.error("Darslarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const subjectName =
    lessons[0]?.curriculumSubject?.subject?.name || "Fan topilmadi";

  if (loading) return <LoadingOverlay text="Yuklanmoqda..." />;

  return (
    <div className="min-h-screen p-4">
      <ToastContainer />
      <div className="mx-auto max-w-6xl">
        {/* Fan haqida qisqacha */}
        {subjectData && (
          <div className="mb-4 rounded-lg bg-white p-4 shadow">
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-500">Kredit</p>
                <p className="font-medium">
                  {subjectData.curriculumSubject?.credit || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Kafedra</p>
                <p className="font-medium">
                  {subjectData.curriculumSubject?.department?.name ||
                    "Noma’lum"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Akademik yuk</p>
                <p className="font-medium">
                  {subjectData.curriculumSubject?.totalAcload || "N/A"} soat
                </p>
              </div>
              <div>
                <p className="text-gray-500">Semestr</p>
                <p className="font-medium">
                  {formatSemester(subjectData.semester)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Jadval */}
        {lessons.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow">
            Darslar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    №
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Mavzu nomi
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-sm">
                {lessons.map((lesson, index) => (
                  <tr key={lesson.id || index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-800">
                      {lesson.name}
                    </td>
                    <td className="px-3 py-2 text-gray-600">

                      <button
                        disabled={lesson?.isPresent !== true}
                        onClick={() =>
                          navigate(
                            `/teacher/homework-check/lessons/${lessons[index].id}`
                          )
                        }
                        className={`rounded-lg px-6 py-2 text-white transition ${lesson?.isPresent
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-400 cursor-not-allowed"
                          }`}                      >
                        Tekshirish
                      </button>

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
}

export default Lessons;
