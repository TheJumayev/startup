/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VideoLessons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: curriculumSubjectId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const requiredLessons = location.state?.requiredLessons ?? null;
  const learningStudentSubjectId =
    location.state?.learningStudentSubjectId || null;
  const debtsId = location.state?.debtsId || null;
  const studentSubjectId = location.state?.studentSubjectId;
  const studentId = location.state?.studentId;

  const [subjectInfo, setSubjectInfo] = useState(null);
  const cert = location.state?.cert;

  const [testPassed, setTestPassed] = useState(
    location.state?.testPassed || cert?.ball >= 59
  );

  // 🔹 читаем из localStorage при первом рендере
  useEffect(() => {
    if (studentId && curriculumSubjectId) {
      const certKey = `cert-${studentId}-${curriculumSubjectId}`;
      const savedCert = localStorage.getItem(certKey);
      if (savedCert) {
        try {
          const parsed = JSON.parse(savedCert);
          if (parsed?.ball >= 59) {
            setTestPassed(true);
          }
        } catch (e) {
          console.error("❌ Ошибка парсинга сертификата:", e);
        }
      }
    }
  }, [studentId, curriculumSubjectId]);

  // 🔹 проверка сертификата
  useEffect(() => {
    if (studentId && curriculumSubjectId) {
      if (location.state?.refresh) {
        checkCertStatus(studentId); // всегда при refresh
      } else if (!testPassed) {
        checkCertStatus(studentId); // только если ещё не знаем
      }
    }
  }, [studentId, curriculumSubjectId, testPassed, location.state?.refresh]);

  const checkCertStatus = async (studentId) => {
    try {
      const res = await ApiCall(
        `/api/v1/certificate/${studentId}/${curriculumSubjectId}`,
        "GET"
      );
      console.log("VideoLesson → cert response", res.data);

      if (res?.data?.ball && res.data.ball >= 59) {
        setTestPassed(true);
        // ✅ сохраняем в локалку
        const certKey = `cert-${studentId}-${curriculumSubjectId}`;
        localStorage.setItem(certKey, JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("❌ Error fetching certificate:", err);
    }
  };

  useEffect(() => {
    if (curriculumSubjectId) {
      fetchLessons(curriculumSubjectId);
    }
    if (debtsId) {
      fetchCompletedLessons(debtsId);
    }
  }, [curriculumSubjectId, debtsId]);

  const fetchLessons = async (id) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${id}`,
        "GET"
      );
      const data = response.data;
      const list = data.content || data;

      if (list.length > 0 && list[0].curriculumSubject) {
        const cs = list[0].curriculumSubject;
        setSubjectInfo({
          id: cs.id,
          name: cs.subject?.name || "❌ Нет имени",
        });
      }

      setLessons(requiredLessons ? list.slice(0, requiredLessons) : list);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedLessons = async (learningId) => {
    try {
      const res = await ApiCall(
        `/api/v1/learning-student-subject/student-subject/${learningId}`,
        "GET"
      );
      const log = res.data.lessons;
      if (log) {
        setCompletedLessons(log.map((l) => l.id));
      }
    } catch (err) {
      console.error("Error fetching completed lessons:", err);
      setCompletedLessons([]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="mt-4 block text-lg text-gray-600">
            Mavzular yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  const allCompleted =
    lessons.length > 0 && lessons.length === completedLessons.length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" />
      <h2 className="mb-6 text-xl font-bold">📘 Mavzular ro'yxati</h2>

      {requiredLessons !== null && (
        <div className="mb-6 rounded-lg bg-blue-50 p-4 text-blue-800 shadow">
          {requiredLessons === 0 ? (
            <span className="font-bold">
              Sizga testa o'tish ruxsat etilgan ✅
            </span>
          ) : (
            <>
              Sizga <span className="font-bold">{requiredLessons}</span> ta
              mavzu ruxsat etilgan
            </>
          )}
        </div>
      )}

      {/* ⚡ Mavzular ro'yxati */}
      {requiredLessons === 0 ? (
        ""
      ) : (
        <ul className="space-y-3">
          {lessons.length > 0 ? (lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);

            return (
              <li
                key={lesson.id}
                className={`rounded border p-4 shadow hover:bg-blue-50 ${
                  isCompleted ? "border-green-300 bg-green-50" : ""
                }`}
                onClick={() =>
                  navigate(`/student/media-lessons/lesson/${lesson.id}`, {
                    state: {
                      lessonName: lesson.name,
                      lessonIndex: index,
                      curriculumSubjectId,
                      studentId,
                      learningStudentSubjectId,
                      requiredLessons,
                      debtsId,
                      fromDarsKurish: !!debtsId,
                    },
                  })
                }
              >
                <div className="flex cursor-pointer items-center justify-between">
                  <span className="font-medium text-gray-800">
                    {index + 1}. {lesson.name}
                  </span>
                  {isCompleted && (
                    <span className="text-sm font-semibold text-green-600">
                      ✅ Yakunlangan
                    </span>
                  )}
                </div>
              </li>
            );
          })) : (
            <li className="rounded border p-4 text-center text-gray-600 shadow">
              Mavzular topilmadi.
            </li>
          )}
        </ul>
      )}

      {/* ⚡ Кнопка для теста */}
      {requiredLessons !== null && !testPassed && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => {
              if (requiredLessons !== 0 && !allCompleted) {
                toast.warning("⚠️ Hamma darsni tugating!");
              } else {
                if (subjectInfo?.name) {
                  localStorage.setItem("subjectName", subjectInfo.name);
                }
                navigate(`/student/test/${curriculumSubjectId}`, {
                  state: {
                    subjectName: subjectInfo?.name || "Fan nomi yo'q",
                    subjectId: subjectInfo?.id || curriculumSubjectId,
                    studentSubjectId,
                  },
                });
              }
            }}
            className={`rounded px-6 py-3 font-semibold transition-colors ${
              requiredLessons === 0 || allCompleted
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-white"
            }`}
          >
            🚀 Test o'tish
          </button>
        </div>
      )}

      {requiredLessons !== null && testPassed && (
        <div className="mt-8 text-center font-semibold text-green-600">
          ✅ Siz bu testni allaqachon o'tgansiz
        </div>
      )}
    </div>
  );
};

export default VideoLessons;
