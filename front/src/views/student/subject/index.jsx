import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";

const CurriculumSubjects = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchStudentData(token);
  }, [navigate]);

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");
      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      const studentData = res.data;
      setStudent(studentData);

      if (studentData?.id) {
        await fetchCurriculumSubjects(studentData.id);
      }
    } catch (err) {
      console.error("Xatolik student ma'lumotlarini olishda:", err);
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculumSubjects = async (studentId) => {
    try {
      const res = await ApiCall(
        `/api/v1/curriculum-subject/student/${studentId}`,
        "GET"
      );
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Xatolik curriculum-subject olishda:", err);
      setSubjects([]);
    }
  };

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

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        O‘quv reja fanlari
      </h1>

      {subjects.length === 0 ? (
        <p className="text-gray-600">Fanlar topilmadi</p>
      ) : (
        <table className="mb-6 w-full table-auto border-collapse rounded-lg border border-gray-200 shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">Fan kodi</th>
              <th className="border px-4 py-2 text-left">Fan nomi</th>
              <th className="border px-4 py-2 text-left">Kredit</th>
              <th className="border px-4 py-2 text-left">Umumiy yuklama</th>
              <th className="border px-4 py-2 text-left">Resurslar</th>
              <th className="border px-4 py-2 text-left">Kafedra</th>
              <th className="border px-4 py-2 text-left">Imtihonlar</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subj, idx) => (
              <tr
                key={subj.id ?? idx}
                className="cursor-pointer hover:bg-blue-50"
                onClick={() =>
                  navigate(`/student/subject/media-subject/${subj.id}`, {
                    state: { subjectName: subj.subject?.name },
                  })
                }
              >
                <td className="border px-4 py-2">
                  {subj.subject?.code || "—"}
                </td>
                <td className="border px-4 py-2">
                  {subj.subject?.name || "—"}
                </td>
                <td className="border px-4 py-2">{subj.credit || 0}</td>
                <td className="border px-4 py-2">
                  {subj.totalAcload || 0} soat
                </td>
                <td className="border px-4 py-2">{subj.resourceCount || 0}</td>
                <td className="border px-4 py-2">
                  {subj.department?.name || "—"}
                </td>
                <td className="border px-4 py-2">
                  {Array.isArray(subj.subjectExamTypes) &&
                  subj.subjectExamTypes.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {subj.subjectExamTypes.map((exam) => (
                        <li key={exam.id}>
                          {exam.examType || "Imtihon"} — {exam.max_ball} ball
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CurriculumSubjects;
