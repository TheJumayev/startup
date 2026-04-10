import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherTest = () => {
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [testedTeachers, setTestedTeachers] = useState([]);

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [tests, setTests] = useState([]);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [score, setScore] = useState(null);
  const [percent, setPercent] = useState(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const MAX_TESTS = 50;

  useEffect(() => {
    fetchTeachers();
    fetchGroups();
    fetchTestedTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await ApiCall("/api/v1/teacher", "GET");
      const data = res.data || [];
      setTeachers(
        data.map((t) => ({
          value: t.id,
          label: t.name || "Noma'lum o‘qituvchi",
        }))
      );
    } catch {
      toast.error("O‘qituvchilarni yuklashda xatolik!");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      const arr = Array.isArray(res.data)
        ? res.data
        : res.data?.content || res.data?.data || [];
      setGroups(
        arr.map((g) => ({
          value: g.id,
          label: g.name ?? g.groupName ?? "Noma’lum guruh",
          curriculumId: g.curriculum ?? null,
        }))
      );
    } catch {
      toast.error("Guruhlarni yuklashda xatolik!");
    }
  };

  const fetchSubjectsByGroup = async (curriculumId) => {
    if (!curriculumId) return;
    setLoading(true);
    try {
      const res = await ApiCall(
        `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}&size=100`,
        "GET"
      );
      const list = res.data?.content || [];
      setSubjects(
        list.map((s) => ({
          value: s.subject?.id,
          label: `${
            s.subject?.subject?.name || s.subject?.name || "Noma’lum fan"
          } (${s.test_count || 0} ta test)`,
          curriculumSubjectId: s.subject?.id,
          testCount: s.test_count || 0,
        }))
      );
    } catch {
      toast.error("Fanlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestedTeachers = async () => {
    try {
      const res = await ApiCall("/api/v1/test-teacher", "GET");
      console.log(res.data);

      setTestedTeachers(res.data || []);
    } catch {
      toast.error("Testdan o‘tgan o‘qituvchilarni yuklashda xatolik!");
    }
  };

  useEffect(() => {
    if (selectedGroup?.curriculumId) {
      fetchSubjectsByGroup(selectedGroup.curriculumId);
    } else {
      setSubjects([]);
    }
  }, [selectedGroup]);

  // 🔹 Тесты (макс 50)
  const fetchTests = async (curriculumSubjectId) => {
    setLoading(true);
    try {
      const res = await ApiCall(
        `/api/v1/test-curriculum-subject/test/${curriculumSubjectId}`,
        "GET"
      );
      let list = Array.isArray(res.data) ? res.data.slice(0, MAX_TESTS) : [];
      list = list.map((t) => {
        const opts = shuffleArray([t.answer1, t.answer2, t.answer3, t.answer4]);
        return { ...t, options: opts, correct: t.answer1 };
      });
      setTests(list);
      setAnswers({});
      setFinished(false);
      setShowTest(true);
    } catch (e) {
      console.error(e);
      toast.error("Testlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const startTest = () => {
    if (!selectedTeacher || !selectedSubject) {
      toast.warning("O‘qituvchi va fan tanlanishi kerak!");
      return;
    }
    fetchTests(selectedSubject.curriculumSubjectId);
    setModalOpen(false);
  };

  const handleSelect = (testId, option) => {
    setAnswers((prev) => ({ ...prev, [testId]: option }));
  };

  useEffect(() => {
    if (tests.length > 0) {
      const allAnswered = tests.every((t) => answers[t.id]);
      setCanSubmit(allAnswered);
    }
  }, [answers, tests]);

  // 🔹 Обновлённый кусок TeacherTest
  const handleFinish = async () => {
    let correctCount = 0;
    tests.forEach((t) => {
      if (answers[t.id] && answers[t.id] === t.correct) correctCount++;
    });

    const percentBall = ((correctCount / tests.length) * 100).toFixed(1);
    const ball = Math.round(percentBall);
    setPercent(percentBall);
    setScore(ball);
    setFinished(true);

    toast.success(`Test yakunlandi! Ball: ${ball} / 100`);

    // 🔹 Отправляем на backend
    try {
      const dto = {
        teacherId: selectedTeacher.value,
        curriculumSubjectId: selectedSubject.curriculumSubjectId,
        ball: ball,
        percentBall: percentBall,
      };

      await ApiCall("/api/v1/test-teacher", "POST", dto);
      toast.success("Natijalar saqlandi!");
      fetchTestedTeachers();
    } catch (err) {
      console.error("POST /api/v1/test-teacher error:", err);
      toast.error("Natijalarni saqlashda xatolik!");
    }
  };

  // 🔹 Новая функция для возврата
  const resetTest = () => {
    setShowTest(false);
    setTests([]);
    setAnswers({});
    setSelectedTeacher(null);
    setSelectedSubject(null);
    setSelectedGroup(null);
    setFinished(false);
    setScore(null);
    setPercent(null);
  };

  // ---------- UI ----------
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
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      {/* ---------- TEST BARCHASI YOPILMAGUNCHA ---------- */}
      {!showTest ? (
        <>
          {/* Верхняя панель */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              O‘qituvchi test boshqaruvi
            </h1>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
            >
              O‘qituvchiga test qo‘yish
            </button>
          </div>

          {/* Список учителей, которые уже прошли тест */}
          <div className="rounded-xl bg-white p-5 shadow">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Testdan o‘tgan o‘qituvchilar
            </h2>
            {testedTeachers.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Hozircha testdan o‘tgan o‘qituvchilar yo‘q
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        №
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        O‘qituvchi
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Fan
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Ball
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Foiz (%)
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Sana
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {testedTeachers.map((t, i) => (
                      <tr
                        key={t.id || i}
                        className="border-t transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm">{i + 1}</td>
                        <td className="px-4 py-2 text-sm">
                          {t.teacher?.name ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {t.curriculumSubject?.subject?.name ??
                            t.curriculumSubject?.name ??
                            "—"}
                        </td>
                        <td className="px-4 py-2 text-sm">{t.ball ?? "—"}</td>
                        <td className="px-4 py-2 text-sm">
                          {t.percentBall ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleString("uz-UZ")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        // ---------- TEST BOSHLANGACH ----------
        <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
          <h1 className="mb-4 text-2xl font-bold text-blue-700">
            Fan: {selectedSubject.label}
          </h1>
          <div className="space-y-6">
            {tests.map((t, i) => (
              <div key={t.id} className="rounded-lg border p-4 shadow">
                <h3 className="mb-3 font-semibold">
                  {i + 1}. {t.question}
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

          {!finished && tests.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleFinish}
                disabled={!canSubmit}
                className={`mt-6 rounded px-10 py-3 text-lg text-white ${
                  canSubmit ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
                }`}
              >
                Yakunlash
              </button>
            </div>
          )}

          {finished && (
            <div className="mt-6 text-center">
              <p className="mb-4 text-xl font-bold text-green-600">
                ✅ Test yakunlandi! Ball: {score} / 100 ({percent}%)
              </p>
              <button
                onClick={resetTest}
                className="rounded bg-blue-600 px-8 py-3 text-lg text-white transition hover:bg-blue-700"
              >
                Testni yopish
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------- MODAL ---------- */}
      {modalOpen && (
        <div className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="mb-6 border-b pb-3 text-xl font-bold text-gray-800">
              O‘qituvchiga test qo‘yish
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  O‘qituvchi
                </label>
                <Select
                  options={teachers}
                  value={selectedTeacher}
                  onChange={setSelectedTeacher}
                  placeholder="O‘qituvchini tanlang"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <Select
                  options={groups}
                  value={selectedGroup}
                  onChange={(val) => {
                    setSelectedGroup(val);
                    setSelectedSubject(null);
                  }}
                  placeholder="Guruhni tanlang"
                  isClearable
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fan (testlar soni)
                </label>
                <Select
                  options={subjects}
                  value={selectedSubject}
                  onChange={setSelectedSubject}
                  isDisabled={!selectedGroup}
                  isLoading={loading}
                  placeholder={
                    selectedGroup ? "Fan tanlang" : "Avval guruhni tanlang"
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={startTest}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm text-white hover:bg-green-700"
              >
                Testni boshlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherTest;
