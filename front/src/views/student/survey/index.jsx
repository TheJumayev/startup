import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { useLocation } from "react-router-dom";


function SurveyPage() {
  const [student, setStudent] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [teacherQuestions, setTeacherQuestions] = useState([]);
  const [booleanQuestions, setBooleanQuestions] = useState([]);
  const [teacherAnswers, setTeacherAnswers] = useState({});
  const [booleanAnswers, setBooleanAnswers] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const location = useLocation();
  const isExamSurvey = location.pathname.includes("/exam/survey");

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const loaclStudent = JSON.parse(localStorage.getItem("student"));
  // 🔹 Fetch student info
  useEffect(() => {
    if (loaclStudent) {
      setStudent(loaclStudent);
    } else {
      const fetchStudent = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");

          setStudent(res.data);
        } catch (e) {
          console.error(e);
          toast.error("Talaba ma'lumotlarini olishda xatolik!");
        }
      };
      fetchStudent();
    }
  }, [navigate]);

  // 🔹 Fetch teachers + questions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tch, qs] = await Promise.all([
          ApiCall("/api/v1/hemis-teacher", "GET"),
          ApiCall("/api/v1/survey-student/questions", "GET"),
        ]);
        setTeachers(
          (tch.data || []).map((t) => ({
            value: t.id,
            label: t.fullName,
          }))
        );
        setTeacherQuestions(qs.data.teacherQuestions || []);
        setBooleanQuestions(qs.data.booleanQuestions || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  // 🔹 Check if student already submitted
  useEffect(() => {

    checkSubmission();
  }, [student]);
  const checkSubmission = async () => {
    if (!student?.id) return;
    try {
      const res = await ApiCall(`/api/v1/survey-student/student/${student.id}`, "GET");

      if (res.data.exists) {
        setSubmittedData(res.data);

        // ⬅️ EXAM/SURVEY dan kelsa va ishlagan bo‘lsa ortga qaytarish
        if (isExamSurvey) {
          navigate(-1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle select for teacher questions
  const handleSelect = (qIndex, selectedOption) => {
    setTeacherAnswers((prev) => ({ ...prev, [qIndex]: selectedOption?.value }));
  };

  // 🔹 Handle boolean answer toggle
  const handleBoolean = (index, value) => {
    setBooleanAnswers((prev) => ({ ...prev, [index]: value }));
  };

  // 🔹 Submit survey
  const handleSubmit = async () => {
    if (Object.keys(booleanAnswers).length !== 3) {
      toast.warning("Iltimos, barcha 3 ta 'Ha/Yo‘q' savoliga javob bering!");
      return;
    }

    const payload = {
      student: { id: student.id },
      teacherQ1: teacherAnswers[0] ? { id: teacherAnswers[0] } : null,
      teacherQ2: teacherAnswers[1] ? { id: teacherAnswers[1] } : null,
      teacherQ3: teacherAnswers[2] ? { id: teacherAnswers[2] } : null,
      teacherQ4: teacherAnswers[3] ? { id: teacherAnswers[3] } : null,
      teacherQ5: teacherAnswers[4] ? { id: teacherAnswers[4] } : null,
      teacherQ6: teacherAnswers[5] ? { id: teacherAnswers[5] } : null,
      teacherQ7: teacherAnswers[6] ? { id: teacherAnswers[6] } : null,
      answer1: booleanAnswers[0],
      answer2: booleanAnswers[1],
      answer3: booleanAnswers[2],
    };

    try {
      const res = await ApiCall("/api/v1/survey-student/save", "POST", payload);

      toast.success("So'rovnoma muvaffaqiyatli yuborildi!");
      await checkSubmission()

      // ⬅️ Agar exam/survey bo‘lsa — submitdan keyin ortga qaytamiz
      if (isExamSurvey) {
        setTimeout(() => navigate(`/exam/subject/${student.id}`), 500);
      }
    } catch (e) {
      toast.error("Xatolik yuz berdi!");
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="border-r-transparent inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  // 🔹 If already submitted
  if (submittedData) {
    return (
      <div className="min-h-screen bg-blue-50 py-10 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            ✅ Siz allaqachon so‘rovnomada qatnashgansiz
          </h2>
          {teacherQuestions.map((q, i) => (
            <div key={i} className="mb-5 p-5 rounded-xl border bg-gray-50">
              <p className="text-lg font-semibold text-gray-800 mb-1">{q}</p>
              <p className="text-blue-700 font-bold">
                {submittedData[`teacherQ${i + 1}`] || "Tanlanmagan"}
              </p>
            </div>
          ))}
          {booleanQuestions.map((q, i) => (
            <div key={`b-${i}`} className="mb-5 p-5 rounded-xl border bg-gray-50">
              <p className="text-lg font-semibold text-gray-800 mb-1">{q}</p>
              <p
                className={`font-bold ${submittedData[`answer${i + 1}`] ? "text-green-600" : "text-red-600"
                  }`}
              >
                {submittedData[`answer${i + 1}`] ? "Ha" : "Yo‘q"}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const allAnswered =
    Object.keys(teacherAnswers).length === 7 &&
    Object.keys(booleanAnswers).length === 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-6">
      <div className="mx-auto max-w-5xl bg-white p-10 rounded-3xl shadow-2xl border border-indigo-100">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-indigo-700">
          🎓 Talabalar uchun so‘rovnoma
        </h2>

        {/* 🔹 Teacher Questions */}
        {teacherQuestions.map((q, index) => (
          <div
            key={index}
            className="mb-8 bg-indigo-50/70 rounded-2xl p-6 border border-indigo-100 shadow-sm hover:shadow-md transition"
          >
            <label className="block text-lg md:text-xl font-semibold mb-4 text-gray-800">
              {q}
            </label>
            <Select
              options={teachers}
              placeholder="O‘qituvchini tanlang..."
              isSearchable
              onChange={(selected) => handleSelect(index, selected)}
              classNamePrefix="react-select"
              value={
                teachers.find((t) => t.value === teacherAnswers[index]) || null
              }
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#c7d2fe",
                  borderRadius: "0.75rem",
                  padding: "4px",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#6366f1" },
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused
                    ? "#eef2ff"
                    : state.isSelected
                      ? "#c7d2fe"
                      : undefined,
                  color: "#1e1b4b",
                }),
              }}
            />
          </div>
        ))}

        {/* 🔹 Boolean (Yes/No) Questions */}
        <div className="mt-10">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-6">
            🔘 Qo‘shimcha savollar (Ha/Yo‘q)
          </h3>
          {booleanQuestions.map((q, i) => (
            <div
              key={`bool-${i}`}
              className="flex flex-col md:flex-row items-center justify-between mb-6 bg-indigo-50/70 rounded-2xl p-6 border border-indigo-100"
            >
              <p className="text-lg font-semibold text-gray-800 mb-3 md:mb-0">
                {q}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleBoolean(i, true)}
                  className={`px-6 py-2 rounded-lg font-medium ${booleanAnswers[i] === true
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                >
                  Ha
                </button>
                <button
                  type="button"
                  onClick={() => handleBoolean(i, false)}
                  className={`px-6 py-2 rounded-lg font-medium ${booleanAnswers[i] === false
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                >
                  Yo‘q
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className={`w-full mt-10 py-4 rounded-2xl text-lg font-semibold shadow-lg transition ${allAnswered
            ? "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
        >
          {allAnswered ? "✅ Yuborish" : "🔒 Barcha savollarga javob bering"}
        </button>
      </div>
    </div>
  );
}

export default SurveyPage;
