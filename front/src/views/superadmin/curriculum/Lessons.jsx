import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import LoadingOverlay from "components/loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

function Lessons() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch lessons for the curriculum
  const fetchLessons = async () => {
    try {
      setIsLoading(true);
      const response = await ApiCall(`/api/v1/lessons/${id}`, "GET");
      setLessons(response.data || []);
    } catch (err) {
      console.error("Error fetching lessons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update lessons from HEMIS
  const updateLessonsFromHemis = async () => {
    try {
      setIsUpdating(true);
      await getLessonFromHemis();
      await fetchLessons();
    } catch (err) {
      console.error("Error updating lessons:", err);
    } finally {
      setIsUpdating(false);
    }
  };
  const getLessonFromHemis = async () => {
    try {
      const response = await ApiCall(`/api/v1/lessons/update/${id}`, "GET");
      console.log("update", response);
      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto‘g‘ri.");
        console.log(response.data);
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      console.error("Xatolik (yangilash):", error);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [id]);

  // Format semester to display (subtract 10 as per your requirement)
  const formatSemester = (semester) => {
    return semester ? semester - 10 : "N/A";
  };

  return (
    <div className="min-h-screen p-4">
      <ToastContainer />
      <Breadcrumbs
        items={[{ label: "O'quv reja ro'yxati", to: "/superadmin/curriculum" }]}
      />

      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-800">
            {" "}
            {lessons[0]?.curriculum?.subject?.name
              ? lessons[0]?.curriculum?.subject?.name + " " + "fani"
              : "Fan topilmadi!"}
          </h1>
          <button
            onClick={updateLessonsFromHemis}
            disabled={isUpdating}
            className={`rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
              isUpdating ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {isUpdating ? "Yangilanmoqda..." : "HEMISdan yangilash"}
          </button>
        </div>

        {isLoading || isUpdating ? (
          <LoadingOverlay text="Yangilanmoqda... " />
        ) : lessons.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Nomi
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Mavzu yuki
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Semestr
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Kafedra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Holati
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {lesson.name || "N/A"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {lesson.topic_load || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {formatSemester(lesson.semester)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {lesson.curriculum?.departments?.[0]?.name || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          lesson.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {lesson.active ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Darslar topilmadi!
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hozircha hech qanday dars mavjud emas. Yangilash tugmasini bosib
              sinab ko'ring.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Lessons;
