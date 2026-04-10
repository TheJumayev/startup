/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";

const index = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  if (!token) {
    navigate("/student/login");
  }

  useEffect(() => {
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchStudentData(token);
  }, [navigate]);

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (response.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      const studentData = response.data;
      setStudent(studentData);

      if (studentData?.id) {
        await fetchSubjects(studentData.id);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (studentId) => {
    try {
      const response = await ApiCall(
        `/api/v1/online-subject-lesson/student/${studentId}`,
        "GET"
      );
      const data = response.data;
      console.log("Fetched subjects data:", data);

      const list = data.content || data;
      setSubjects(list);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-xl font-bold">📚 Mening fanlarim</h2>

      {subjects.length === 0 && (
        <div className="rounded border bg-white p-6 text-center text-gray-600 shadow">
          Hech qanday fan topilmadi
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subj) => (
          <div
            key={subj.id}
            className="cursor-pointer rounded border p-4 shadow hover:bg-blue-50"
            onClick={() => {
              console.log("Selected curriculumSubjectId:", subj.id);
              navigate(`/student/media-lessons/${subj.id}`);
              // 👉 Дальше можно будет сделать navigate(`/student/subject/${subj.id}`)
            }}
          >
            <div className="text-lg font-semibold text-blue-700">
              📘 {subj.subject?.name || "Noma'lum fan"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default index;
