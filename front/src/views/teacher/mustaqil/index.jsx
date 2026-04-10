import React, { useState, useEffect } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [teacherId, setTeacherId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🔐 Tokenni decode qilib teacherId olish
  const fetchTeacherId = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Token topilmadi");
        setLoading(false);
        return;
      }
      const res = await ApiCall("/api/v1/auth/decode", "GET", null, {
        Authorization: `Bearer ${token}`,
      });
      setTeacherId(res.data.id);
    } catch (err) {
      console.error("Token decode xatolik:", err);
      setError("Tokenni decode qilib bo‘lmadi");
    }
  };

  // 📚 O‘qituvchi fanlarini olish
  const fetchTeacherSubjects = async (id) => {
    try {
      setLoading(true);

      const res = await ApiCall(`/api/v1/mustaqil-teacher/teacher/${id}`, "GET");
      const payload = res?.data;

      // ✅ har qanday holatda arrayga aylantirib yuboramiz
      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.content)
            ? payload.content
            : payload
              ? [payload] // agar bitta object kelsa ham, array qilib olamiz
              : [];

      setSubjects(list);
      setError(null);
    } catch (err) {
      console.error("Fanlarni yuklashda xatolik:", err);
      setError("Fanlarni yuklab bo‘lmadi");
      setSubjects([]); // ✅ xatoda ham array bo‘lsin
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    (async () => {
      await fetchTeacherId();
    })();
  }, []);

  useEffect(() => {
    if (teacherId) fetchTeacherSubjects(teacherId);
  }, [teacherId]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
      </div>
    );

  if (error)
    return (
      <div className="relative mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
        {error}
      </div>
    );

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h3 className="mb-4 text-xl font-semibold text-gray-800">
        O‘qituvchining biriktirilgan fanlari
      </h3>

      {subjects.length === 0 ? (
        <p className="italic text-gray-500">
          O‘qituvchiga hech qanday fan biriktirilmagan
        </p>
      ) : (
        subjects.map((groupItem, gIndex) => (
          <div
            key={groupItem.id}
            className="mb-8 rounded-lg border border-gray-200 shadow-sm"
          >
            {/* Guruh sarlavhasi */}
            <div className="flex items-center justify-between rounded-t-lg border-b bg-gray-50 p-3">
              <div>
                <h4 className="text-lg font-bold text-blue-700">
                  {groupItem.groups.name}
                </h4>
                <p className="text-sm text-gray-600">
                  {groupItem.groups.departmentName} —{" "}
                  {groupItem.groups.specialtyName}
                </p>
              </div>
              <span className="text-sm text-gray-400">
                {groupItem.groups.createAt.split("T")[0]}
              </span>
            </div>

            {/* Fanlar jadvali */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border">
                <thead className="bg-gray-100">
                  <tr>
                    {[
                      "№",
                      "Fan kodi",
                      "Fan nomi",
                      "Kafedra",
                      "Kredit",
                      "Akademik yuk",
                      "Nazorat turlari (ball)",
                      "Holati",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-2 text-left text-sm font-semibold text-gray-600"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {groupItem.curriculumSubject.map((cs, index) => (
                    <tr
                      key={cs.id}
                      onClick={() => navigate(`/teacher/mustaqil/${cs.id}`)}
                      className="cursor-pointer hover:bg-blue-50"
                    >
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {cs.subject?.code || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">
                        {cs.subject?.name || "Noma’lum fan"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {cs.department?.name?.replace(/['"]/g, "") || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {cs.credit || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-600">
                        {cs.totalAcload || 0} soat
                      </td>
                      <td
                        className="px-4 py-2 text-sm text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-wrap gap-1">
                          {cs.subjectExamTypes?.length ? (
                            cs.subjectExamTypes.map((exam, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                              >
                                {exam.max_ball} ball
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cs.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {cs.active ? "Faol" : "Nofaol"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Index;