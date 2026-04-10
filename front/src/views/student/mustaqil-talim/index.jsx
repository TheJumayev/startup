import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Index = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (token) fetchStudent(token);
  }, [token]);

  const fetchStudent = async (token) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      setGroupId(res.data?.group?.id);
      const gId = res.data?.group?.id;
      setStudentId(res.data?.id);
      if (gId) fetchSubjects(gId);
    } catch (error) {
      console.error("❌ Xatolik student ma'lumotlarini olishda:", error);
      toast.error("Student ma'lumotlarini olishda xatolik");
    } finally {
      setLoading(false);
    }
  };
  const downloadCertificate = async (groupId, curriculumSubjectId) => {
    try {
      const res = await axios.get(
        baseUrl +
          `/api/v1/mustaqil-talim-certificate/certificate/${groupId}/${curriculumSubjectId}/${studentId}`,
        {
          responseType: "arraybuffer",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const blob = new Blob([res.data], { type: "image/png" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast.error("Sertifikat yuklab olinmadi");
    }
  };
  const fetchSubjects = async (groupId) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/mustaqil-teacher/${groupId}`, "GET");
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
                onClick={() => navigate(`/student/mustaqil-talim/${subj?.id}`)}
                className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:bg-blue-50 hover:shadow-md"
              >
                <h2 className="text-lg font-semibold text-blue-700">
                  {subj.subject?.name}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  O'qituvchi:{" "}
                  <span className="font-medium text-gray-800">
                    {item.teacher?.name}
                  </span>
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 MUHIM
                    downloadCertificate(groupId, subj?.id);
                  }}
                  className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
                >
                  📄 Sertifikatni yuklab olish
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
