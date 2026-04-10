/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../config";

const VideoLessons = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {id: curriculumSubjectId } = useParams();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectInfo, setSubjectInfo] = useState(null);

  useEffect(() => {
    if (curriculumSubjectId) {
      fetchLessons(curriculumSubjectId);
    }
  }, [curriculumSubjectId]);

  const fetchLessons = async (id) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${id}`,
        "GET"
      );
      const data = response.data;
      console.log("data", data);

      const list = data.content || data;
      

      if (list.length > 0 && list[0].curriculumSubject) {
        const cs = list[0].curriculumSubject;
        setSubjectInfo({
          id: cs.id,
          name: cs.subject?.name || "Fan nomi yo'q",
        });
      }

      setLessons(list);
    } catch (error) {
      console.error("❌ Xatolik darslarni olishda:", error);
      setLessons([]);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        {subjectInfo?.name || "Fan nomi yo'q"}
      </h2>

      {lessons.length === 0 ? (
        <div className="rounded border bg-white p-6 text-center text-gray-600 shadow">
          Hozircha mavzular mavjud emas
        </div>
      ) : (
        <ul className="space-y-3">
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              className="cursor-pointer rounded border p-4 shadow hover:bg-blue-50"
              onClick={() =>
                navigate(`/student/subject/media-subject/lesson/${lesson.id}`, {
                  state: { lessonName: lesson.name, lessonIndex: index },
                })
              }
            >
              <span className="font-medium text-gray-800">
                {index + 1}. {lesson.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VideoLessons;
