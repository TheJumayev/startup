import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) fetchStudent(token);
  }, [token]);

  const fetchStudent = async (token) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");
      const groupId = res.data?.group?.id;
      if (groupId) fetchSubjects(groupId);
    } catch (error) {
      console.error("❌ Xatolik student ma'lumotlarini olishda:", error);
      toast.error("Student ma'lumotlarini olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async (groupId) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/curriculum/${groupId}`, "GET");
      console.log(res.data);

      setSubjects(res.data);
    } catch (error) {
      console.error("❌ Xatolik fanlarni olishda:", error);
      toast.error("Fanlarni olishda xatolik");
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
            Ma'lumotlar yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <ToastContainer />
      <h1 className="mb-6 border-b-4 border-blue-600 pb-2 text-2xl font-bold text-gray-800">
        Fanlar ro'yxati
      </h1>

      {subjects.length === 0 ? (
        <p className="text-gray-600">Hozircha fanlar topilmadi.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((item, index) =>
            item.curriculumSubject.map((subj, i) => (
              <div
                key={`${index}-${i}`}
                onClick={() => navigate(`/student/homeworks/${subj?.id}`)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-blue-50 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-blue-700">
                  {subj.subject?.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  O‘qituvchi:{" "}
                  <span className="font-medium text-gray-800">
                    {item.teacher?.name}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
