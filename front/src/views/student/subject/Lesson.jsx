/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import PdfViewer from "./PdfViewer";

const Lesson = () => {
  const { id: lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [lessonName, setLessonName] = useState("");
  const [lessonIndex, setLessonIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const curriculumSubjectId = location.state?.curriculumSubjectId;
  const requiredLessons = location.state?.requiredLessons || null;
  const debtsId = location.state?.debtsId || null;

  const isFromDarsKurish = location.state?.fromDarsKurish === true;

  useEffect(() => {
    if (!lessonId) return;
    fetchLessonFiles(lessonId);

    if (location.state?.lessonName) {
      setLessonName(location.state.lessonName);
      setLessonIndex(location.state.lessonIndex ?? null);
    } else {
      fetchLessonInfo(lessonId);
    }
  }, [lessonId, location.state]);

  const fetchLessonFiles = async (id) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/lessons-file/by-lesson/${id}`,
        "GET"
      );
      const data = response.data;
      setFiles(data.content || data);
    } catch (error) {
      console.error("Error fetching lesson files:", error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonInfo = async (id) => {
    try {
      const res = await ApiCall(`/api/v1/lessons/${id}`, "GET");
      if (res?.data) {
        setLessonName(res.data.name || "");
      }
    } catch (err) {
      console.error("Error fetching lesson info:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="mt-4 block text-lg text-gray-600">
            Materiallar yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        ❌ Ushbu dars uchun hech qanday material mavjud emas
      </div>
    );
  }

  // проверка: есть ли PDF
  const hasPdf = files.some((f) =>
    f.attachment?.name?.toLowerCase().endsWith(".pdf")
  );

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Заголовок всегда */}
      <h2 className="mb-6 text-xl font-bold">
        📖 {lessonIndex !== null ? `${lessonIndex + 1}-mavzu: ` : ""}
        {lessonName || "❌ Noma'lum mavzu"}
      </h2>

      <div className="space-y-8">
        {files.map((lf) => {
          // 👉 Если должник → только PDF
          if (isFromDarsKurish) {
            if (lf.attachment?.name?.toLowerCase().endsWith(".pdf")) {
              return (
                <div key={lf.id} className="rounded border p-4 shadow">
                  <PdfViewer
                    fileUrl={`${baseUrl}/api/v1/file/getFile/${lf.attachment.id}`}
                  />
                </div>
              );
            }
            return null;
          }

          // 👉 иначе (онлайн студент) → видео + файлы
          return (
            <div key={lf.id} className="rounded border p-4 shadow">
              {lf.videoUrl && (
                <div
                  className="mb-4 flex w-full justify-center"
                  dangerouslySetInnerHTML={{ __html: lf.videoUrl }}
                />
              )}

              {lf.attachment &&
                (lf.attachment.name?.toLowerCase().endsWith(".pdf") ? (
                  <PdfViewer
                    fileUrl={`${baseUrl}/api/v1/file/getFile/${lf.attachment.id}`}
                  />
                ) : lf.attachment.name?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={`${baseUrl}/api/v1/file/getFile/${lf.attachment.id}`}
                    alt={lf.attachment.name}
                    className="max-w-full rounded"
                  />
                ) : (
                  <a
                    href={`${baseUrl}/api/v1/file/getFile/${lf.attachment.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    📎 {lf.attachment.name}
                  </a>
                ))}
            </div>
          );
        })}
      </div>

      {/* ✅ Если только видео → показываем кнопку Yakunlash */}
      {!hasPdf && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => navigate(`/student/subject`)}
            className="rounded bg-green-600 px-6 py-2 font-semibold text-white hover:bg-green-700"
          >
            ✅ Yakunlash
          </button>
        </div>
      )}
    </div>
  );
};

export default Lesson;
