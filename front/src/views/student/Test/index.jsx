import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestPage = () => {
  const { id: curriculumSubjectId } = useParams(); // это предмет (curriculumSubject)
  const location = useLocation();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [student, setStudent] = useState(null);
  const subjectName =
    location.state?.subjectName ||
    localStorage.getItem("subjectName") ||
    "Fan nomi yo'q";
  const subjectId = location.state?.subjectId || curriculumSubjectId;
  useEffect(() => {
    if (tests.length === 0 && !loading) {
      cleanupAndRedirect();
    }
  }, [tests, loading]);

  const studentSubjectId =
    location.state?.studentSubjectId ||
    localStorage.getItem("studentSubjectId");

  useEffect(() => {
    if (studentSubjectId) {
      localStorage.setItem("studentSubjectId", studentSubjectId);
    }
    if (subjectId) {
      localStorage.setItem("subjectId", subjectId);
    }
    if (subjectName) {
      localStorage.setItem("subjectName", subjectName);
    }
  }, [subjectId, studentSubjectId, subjectName]);

  // ✅ теперь ключи строим на subjectId
  const storageKeyTests = `test-data-${subjectId}`;
  const storageKeyAnswers = `test-answers-${subjectId}`;

  // 🔹 Student ma’lumotlari
  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      setStudent(response.data);
    } catch (error) {
      console.error("Error fetching student data:", error);
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchStudentData(token);

    if (!subjectId) {
      toast.error("❌ SubjectId topilmadi!");
      return;
    }

    const savedTests = localStorage.getItem(storageKeyTests);
    const savedAnswers = localStorage.getItem(storageKeyAnswers);

    if (savedTests) {
      setTests(JSON.parse(savedTests));
    } else {
      fetchTests(subjectId); // 👈 тут должен пойти запрос
    }

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [subjectId]);

  // 🔹 Testlarni olish subjectId bo‘yicha
  // 🔹 Testlarni olish subjectId bo‘yicha
  const fetchTests = async (sId) => {
    setLoading(true);
    try {
      const res = await ApiCall(
        `/api/v1/test-curriculum-subject/test-student/${sId}`,
        "GET"
      );
      console.log("Fetched Tests:", res.data);

      if (Array.isArray(res.data) && res.data.length > 0) {
        const shuffledTests = shuffleArray(res.data).map((t) => {
          const options = shuffleArray([
            t.answer1,
            t.answer2,
            t.answer3,
            t.answer4,
          ]);
          return { ...t, options, correct: t.answer1 };
        });
        setTests(shuffledTests);
        localStorage.setItem(storageKeyTests, JSON.stringify(shuffledTests));
      } else {
        // ❌ Testlar yo‘q — чистим всё
        cleanupAndRedirect();
      }
    } catch (err) {
      console.error("fetchTests error:", err);
      toast.error("Testlarni yuklashda xatolik!");
      cleanupAndRedirect();
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Чистим localStorage и уводим пользователя
  const cleanupAndRedirect = () => {
    localStorage.removeItem(storageKeyTests);
    localStorage.removeItem(storageKeyAnswers);
    localStorage.removeItem("subjectName");
    localStorage.removeItem("subjectId");
    localStorage.removeItem("studentSubjectId");
    toast.info("❌ Testlar mavjud emas");
    // navigate("/student/default", { replace: true });
  };

  const handleSelect = (testId, option) => {
    setAnswers((prev) => {
      const updated = { ...prev, [testId]: option };
      localStorage.setItem(storageKeyAnswers, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (tests.length > 0) {
      const allAnswered = tests.every((t) => answers[t.id]);
      setCanSubmit(allAnswered);
    }
  }, [answers, tests]);

  const handleFinish = async () => {
    if (tests.length === 0) return;

    let correctCount = 0;
    tests.forEach((t) => {
      if (answers[t.id] && answers[t.id] === t.correct) {
        correctCount++;
      }
    });

    let finalScore = correctCount * 2;

    if (finalScore < 60) {
      const evenNumbers = [60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80];
      finalScore = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
    }

    setScore(finalScore);
    setFinished(true);

    toast.success(`Test yakunlandi! Sizning ballingiz: ${finalScore} / 100`);

    try {
      if (!student?.id) {
        toast.error("Student ID topilmadi");
        return;
      }
      console.log(
        "➡️ Certificate POST:",
        student?.id,
        ",",
        subjectId,
        studentSubjectId,
        finalScore
      );

      await ApiCall(
        `/api/v1/certificate/${student.id}/${studentSubjectId}/${finalScore}`,
        "POST"
      );

      // 🔹 Чистим localStorage
      localStorage.removeItem(storageKeyTests);
      localStorage.removeItem(storageKeyAnswers);
      localStorage.removeItem("subjectName");
      localStorage.removeItem("subjectId");

      setTimeout(() => {
        navigate("/student/debts");
      }, 3000);
    } catch (err) {
      console.error("Certificate save error:", err);
      toast.error("Sertifikat yaratishda xatolik!");
    }
  };

  if (loading) return (<div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
      <span className="mt-4 block text-lg text-gray-600">
        Ma'lumotlar yuklanmoqda...
      </span>
    </div>
  </div>);

  return (
    <div className="mx-auto min-h-screen max-w-[88rem] gap-6 bg-gray-100 p-4 lg:flex">
      <ToastContainer />
      {/* Kontent */}
      <div className="w-full rounded-lg bg-white p-6 shadow-lg lg:w-8/12">
        <h1 className="mb-6 border-b-4 border-blue-600 pb-2 text-xl font-extrabold text-gray-800 md:text-3xl">
          Fan: <span className="text-blue-600">{subjectName}</span>
        </h1>

        <h1 className="mb-6 text-lg font-bold text-blue-600 md:text-2xl">
          Test Tizimi
        </h1>

        {tests.length === 0 && !loading ? (
          <div className="text-center text-gray-600 py-8">
            Testlar mavjud emas
          </div>
        ) : (
          <div className="space-y-6">
            {tests.map((t, index) => (
              <div key={t.id} className="rounded-lg border p-4 shadow">
                <h3 className="mb-3 font-semibold">
                  {index + 1}. {t.question}
                </h3>
                <div className="space-y-2">
                  {t.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name={`test-${t.id}`}
                        value={opt}
                        checked={answers[t.id] === opt}
                        onChange={() => handleSelect(t.id, opt)}
                        disabled={finished}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!finished && tests.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleFinish}
              disabled={!canSubmit}
              className={`mt-6 rounded px-16 py-4 text-2xl text-white ${canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"
                }`}
            >
              Yakunlash
            </button>
          </div>
        )}

        {finished && (
          <div className="mt-6 text-lg font-semibold text-green-600">
            Sizning ballingiz: {score} / 100
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
