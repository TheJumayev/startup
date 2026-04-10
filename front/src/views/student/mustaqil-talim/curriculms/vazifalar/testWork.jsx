import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ApiCall from "../../../../../config/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TestPage = () => {
  const { id: mustaqilId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tests, setTests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const subjectName = location.state?.subjectName || "Fan nomi yo'q";

  // localStorage key (agar oldin ishlatilgan bo'lsa)
  const LS_KEY = `mustaqil_test_${mustaqilId}`;

  /* =======================
     HELPERS
  ======================= */
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  /* =======================
     FETCH TESTS
  ======================= */
  const fetchTests = async () => {
    try {
      setLoading(true);

      const res = await ApiCall(
        `/api/v1/mustaqil-talim-create/tests/${mustaqilId}`,
        "GET"
      );

      if (!Array.isArray(res.data) || res.data.length === 0) {
        toast.info("📝 Ushbu mustaqil ta'lim uchun test mavjud emas");
        setTests([]);
        return;
      }

      const prepared = shuffle(res.data).map((t) => ({
        id: t.id,
        question: t.question,
        correct: t.answer1, // faqat hisoblash uchun
        options: shuffle([t.answer1, t.answer2, t.answer3, t.answer4]),
      }));

      setTests(prepared);

      // LocalStoragedan oldingi javoblarni olish
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        setAnswers(JSON.parse(saved));
      } else {
        // Boshlang'ich holat
        const initial = {};
        prepared.forEach((t) => {
          initial[t.id] = null;
        });
        setAnswers(initial);
      }
    } catch (e) {
      console.error(e);
      toast.error("❌ Testlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mustaqilId) {
      toast.error("Mustaqil ta'lim ID topilmadi");
      return;
    }
    fetchTests();

    // sahifadan chiqishda localStorage tozalash
    return () => {
      if (finished) {
        localStorage.removeItem(LS_KEY);
      }
    };
  }, [mustaqilId, finished]);

  /* =======================
     SELECT ANSWER
  ======================= */
  const selectAnswer = (testId, option) => {
    if (finished) return;
    const updated = {
      ...answers,
      [testId]: option,
    };
    setAnswers(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  /* =======================
     FINISH TEST
  ======================= */
  const finishTest = () => {
    if (!allAnswered) {
      toast.warning("❗ Avval barcha savollarga javob bering");
      return;
    }

    let correct = 0;
    tests.forEach((t) => {
      if (answers[t.id] === t.correct) correct++;
    });

    toast.success(
      `✅ Test yakunlandi. Siz ${correct} / ${tests.length} ta savolga to‘g‘ri javob berdingiz`,
      {
        autoClose: 2500,
        onClose: () => {
          setFinished(true);
          localStorage.removeItem(LS_KEY);
          navigate(-1);
        },
      }
    );
  };

  /* =======================
     RENDER
  ======================= */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md text-center">
          <div className="relative inline-block">
            <div className="h-20 w-20 rounded-full border-4 border-blue-100"></div>
            <div className="border-t-transparent absolute top-0 left-0 h-20 w-20 animate-spin rounded-full border-4 border-blue-600"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-800">
            Testlar yuklanmoqda
          </h3>
          <p className="mt-2 text-gray-500">Biroz kuting...</p>
        </div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-6xl">📭</div>
          <h2 className="mb-3 text-2xl font-bold text-gray-800">
            Testlar topilmadi
          </h2>
          <p className="mb-6 text-gray-600">
            Ushbu mustaqil ta'lim uchun testlar mavjud emas
          </p>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }
  const answeredCount = Object.values(answers).filter((a) => a !== null).length;

  const allAnswered = answeredCount === tests.length;

  return (
    <div className="min-h-screen ">
      <ToastContainer
        position="top-center"
        theme="colored"
        toastClassName="rounded-lg"
      />

      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mustaqil ta'lim testi
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(answers).filter((a) => a !== null).length}/
                  {tests.length}
                </div>
                <div className="text-sm text-gray-500">Javob berilgan</div>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-gray-600 transition hover:text-blue-600"
              >
                ← Orqaga
              </button>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-4">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                style={{
                  width: `${
                    (Object.values(answers).filter((a) => a !== null).length /
                      tests.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {tests.map((t, index) => (
            <div
              key={t.id}
              className="mb-6 rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                  <span className="text-lg font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {t.question}
                  </h3>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                        answers[t.id]
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {answers[t.id]
                        ? "✓ Javob tanlangan"
                        : "○ Javob tanlanmagan"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {t.options.map((opt, i) => {
                  const selected = answers[t.id] === opt;
                  const letters = ["A", "B", "C", "D"];

                  return (
                    <label
                      key={i}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                        selected
                          ? "scale-[1.02] border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                      } ${finished ? "cursor-default" : ""}`}
                    >
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-bold ${
                          selected
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {letters[i]}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-800">{opt}</span>
                      </div>
                      <input
                        type="radio"
                        name={`test-${t.id}`}
                        disabled={finished}
                        checked={selected}
                        onChange={() => selectAnswer(t.id, opt)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {!finished && tests.length > 0 && (
            <div className="sticky bottom-6 mt-8 rounded-xl border-2 border-blue-100 bg-white p-6 shadow-xl">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">
                    Testni yakunlash
                  </h4>
                  <p className="mt-1 text-gray-600">
                    {tests.every((t) => answers[t.id])
                      ? "✅ Barcha testlarga javob berildi"
                      : `⚠️ ${
                          tests.length -
                          Object.values(answers).filter((a) => a !== null)
                            .length
                        } ta testga javob berilmagan`}
                  </p>
                </div>
                <button
                  onClick={finishTest}
                  disabled={!allAnswered}
                  className={`min-w-[200px] rounded-lg px-8 py-3 text-lg font-semibold transition-all
    ${
      allAnswered
        ? "bg-green-500 text-white shadow-lg hover:bg-green-600 hover:shadow-xl"
        : "cursor-not-allowed bg-gray-300 text-gray-500"
    }`}
                >
                  {allAnswered
                    ? "Testni yakunlash"
                    : `⚠️ ${
                        tests.length - answeredCount
                      } ta testga javob bering`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPage;
