import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestPage = () => {
  const { id: subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const subjectName = location.state?.subjectName || "Fan nomi yo‘q";

  // 🔹 Перемешивание массива
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // 🔹 Получаем тесты
  const fetchTests = async (sId) => {
    setLoading(true);
    try {
      const res = await ApiCall(
        `/api/v1/test-curriculum-subject/test-student/${sId}`,
        "GET"
      );
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
      } else {
        toast.info("❌ Bu fandan test mavjud emas");
      }
    } catch (err) {
      console.error("fetchTests error:", err);
      toast.error("Testlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subjectId) {
      toast.error("SubjectId topilmadi!");
      return;
    }
    fetchTests(subjectId);

    // 🔹 Очистка состояния при выходе со страницы
    return () => {
      setTests([]);
      setAnswers({});
      setFinished(false);
      setCorrectCount(0);
    };
  }, [subjectId]);

  const handleSelect = (testId, option) => {
    setAnswers((prev) => ({ ...prev, [testId]: option }));
  };

  const handleFinish = () => {
    if (tests.length === 0) return;

    let correct = 0;
    tests.forEach((t) => {
      if (answers[t.id] && answers[t.id] === t.correct) {
        correct++;
      }
    });

    setCorrectCount(correct);
    setFinished(true);
  };

  const handleGoBack = () => {
    navigate("/student/test-knowledge");
  };

  if (loading)
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

  return (
    <div className="mx-auto min-h-screen max-w-[88rem] gap-6 bg-gray-100 p-4 lg:flex">
      <ToastContainer />
      <div className="w-full rounded-lg bg-white p-6 shadow-lg lg:w-8/12">
        <h1 className="mb-6 border-b-4 border-blue-600 pb-2 text-xl font-extrabold text-gray-800 md:text-3xl">
          Fan: <span className="text-blue-600">{subjectName}</span>
        </h1>

        <h1 className="mb-6 text-lg font-bold text-blue-600 md:text-2xl">
          Bilimni sinash test tizimi
        </h1>

        {tests.length === 0 && !loading ? (
          <p className="text-gray-500">Testlar mavjud emas</p>
        ) : (
          <div className="space-y-6">
            {tests.map((t, index) => (
              <div key={t.id} className="rounded-lg border p-4 shadow">
                <h3 className="mb-3 font-semibold">
                  {index + 1}. {t.question}
                </h3>

                <div className="space-y-2">
                  {t.options.map((opt, idx) => {
                    const isSelected = answers[t.id] === opt;
                    const isCorrect = t.correct === opt;
                    const showResult = finished;

                    return (
                      <label
                        key={idx}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <input
                          type="radio"
                          name={`test-${t.id}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleSelect(t.id, opt)}
                          disabled={finished}
                        />
                        <span
                          className={`${
                            showResult
                              ? isCorrect
                                ? "font-semibold text-green-600"
                                : isSelected
                                ? "text-red-600"
                                : ""
                              : ""
                          }`}
                        >
                          {opt}
                        </span>

                        {/* Галочка / крестик */}
                        {showResult && isCorrect && (
                          <span className="ml-2 text-green-600">✔</span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="ml-2 text-red-600">✖</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Кнопки */}
        {!finished && tests.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleFinish}
              disabled={!tests.every((t) => answers[t.id])}
              className={`mt-6 rounded px-16 py-4 text-2xl text-white ${
                tests.every((t) => answers[t.id])
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-gray-400"
              }`}
            >
              Yakunlash
            </button>
          </div>
        )}

        {finished && (
          <div className="mt-6 flex justify-end">
            <div>
              <p className="text-lg font-semibold text-green-700">
                Natija: {correctCount} / {tests.length} to‘g‘ri javob
              </p>
              <button
                onClick={handleGoBack}
                className="mt-6 rounded bg-blue-600 px-10 py-4 text-lg text-white hover:bg-blue-700"
              >
                Orqaga qaytish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPage;
