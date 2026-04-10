import React, { useEffect, useState, useMemo } from "react";
import ApiCall from "../../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiBookOpen,
  FiCheckCircle,
  FiLock,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";

const Index = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [uiStatuses, setUiStatuses] = useState({});

  /* =======================
     LOAD STUDENT
  ======================= */
  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (res?.error) {
        navigate("/");
        return;
      }
      setStudentId(res.data.id);
    } catch (error) {
      console.error(error);
    }
  };

  /* =======================
     LOAD SUBJECTS
  ======================= */
  useEffect(() => {
    if (id) fetchCurriculms(id);
  }, [id]);

  const fetchCurriculms = async (id) => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/mustaqil-talim-create/${id}`, "GET");
      setSubjects(res.data || []);
    } catch {
      toast.error("Ma'lumotlarni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     SORT SUBJECTS (STABLE)
  ======================= */
  const sorted = useMemo(() => {
    return [...subjects].sort((a, b) => a.position - b.position);
  }, [subjects]);

  /* =======================
     LOAD UI STATUSES (ONCE)
  ======================= */
  useEffect(() => {
    if (!studentId || sorted.length === 0) return;

    if (Object.keys(uiStatuses).length === sorted.length) return;

    const loadStatuses = async () => {
      const result = {};

      for (const item of sorted) {
        try {
          const res = await ApiCall(
            `/api/v1/complete-mustaqil/is-completed/${studentId}/${item.id}`,
            "GET"
          );

          result[item.id] =
            Array.isArray(res?.data) && res.data.length > 0
              ? "Yakunlangan"
              : "Bajarilmagan";
        } catch {
          result[item.id] = "Bajarilmagan";
        }
      }

      setUiStatuses(result);
    };

    loadStatuses();
  }, [studentId, sorted]);

  /* =======================
     OPEN RULE (MAIN LOGIC)
  ======================= */
  const canOpen = (index) => {
    if (index === 0) return true;
    const prevLesson = sorted[index - 1];
    return uiStatuses[prevLesson.id] === "Yakunlangan";
  };

  /* =======================
     RENDER LOADING
  ======================= */
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="relative mb-6 inline-block">
            <div className="h-16 w-16 rounded-full border-4 border-blue-100"></div>
            <div className="border-t-transparent absolute top-0 left-0 h-16 w-16 animate-spin rounded-full border-4 border-blue-600"></div>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Mavzular yuklanmoqda
          </h3>
          <p className="text-gray-500">Iltimos, biroz kuting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-center" theme="colored" />

      {/* HEADER */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <FiBookOpen className="text-xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Mustaqil Ta'lim
              </h1>
              <p className="text-gray-600">
                O'zingizning tezligingizda o'rganing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-100 p-3">
                <FiCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {
                    Object.values(uiStatuses).filter((s) => s === "Yakunlangan")
                      .length
                  }
                </div>
                <div className="text-gray-500">Yakunlangan mavzular</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-100 p-3">
                <FiBookOpen className="text-2xl text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {sorted.length}
                </div>
                <div className="text-gray-500">Jami mavzular</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-100 p-3">
                <FiClock className="text-2xl text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {sorted.length -
                    Object.values(uiStatuses).filter((s) => s === "Yakunlangan")
                      .length}
                </div>
                <div className="text-gray-500">Bajarilayotgan mavzular</div>
              </div>
            </div>
          </div>
        </div>

        {/* LESSONS LIST */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">
              Mavzular ro'yxati
            </h2>
            <p className="text-sm text-gray-600">
              Ketma-ketlikda o'ting, oldingi mavzu yakunlangandan keyingina
              keyingisiga o'tishingiz mumkin
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {sorted.map((item, index) => {
              const uiStatus = uiStatuses[item.id];
              const openable = canOpen(index);
              const isCompleted = uiStatus === "Yakunlangan";
              const isPending = uiStatus === "Bajarilmagan";

              return (
                <div
                  key={item.id}
                  className={`p-6 transition-all duration-300 ${
                    openable ? "hover:bg-blue-50" : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* NUMBER AND ICON */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl
                        ${
                          isCompleted
                            ? "bg-green-100"
                            : openable
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-lg font-bold
                          ${
                            isCompleted
                              ? "text-green-700"
                              : openable
                              ? "text-blue-700"
                              : "text-gray-400"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      {/* STATUS ICON */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <FiCheckCircle className="text-2xl text-green-500" />
                        ) : !openable ? (
                          <FiLock className="text-2xl text-gray-400" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-blue-400"></div>
                        )}
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <div>
                          <h3
                            className={`mb-1 text-lg font-semibold
                            ${openable ? "text-gray-800" : "text-gray-400"}`}
                          >
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium
                              ${
                                isCompleted
                                  ? "bg-green-100 text-green-800"
                                  : openable
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isCompleted
                                ? "✅ Yakunlangan"
                                : openable
                                ? "📖 Bajarilmoqda"
                                : "🔒 Bloklangan"}
                            </span>

                            {!openable && index > 0 && (
                              <span className="text-sm text-gray-500">
                                Oldingi mavzuni yakunlang
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* START BUTTON */}
                          {openable && !isCompleted && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/student/mustaqil-talim/work/${item.id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 
                                py-2.5 text-white shadow-md transition-all hover:bg-blue-700 
                                hover:shadow-lg"
                            >
                              Boshlash
                              <FiChevronRight />
                            </button>
                          )}

                          {/* REVIEW BUTTON */}
                          {isCompleted && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/student/mustaqil-talim/work/${item.id}`
                                )
                              }
                              className="to-emerald-600 hover:to-emerald-700 inline-flex items-center gap-2 rounded-lg bg-green-600 
                                px-5 py-2.5 text-white shadow-md transition-all 
                                hover:bg-green-700 hover:shadow-lg"
                            >
                              Ko'rib chiqish
                              <FiCheckCircle />
                            </button>
                          )}

                          {/* TEST BUTTON */}
                          {isCompleted && item.testActive && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/student/mustaqil-talim/test/${item.id}`
                                )
                              }
                              className="to-violet-600 hover:to-violet-700 inline-flex items-center gap-2 rounded-lg bg-purple-600 
                                px-5 py-2.5 text-white shadow-md transition-all 
                                hover:bg-purple-700 hover:shadow-lg"
                            >
                              Testni yechish
                              <FiBookOpen />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PROGRESS BAR (for completed) */}
                      {isCompleted && (
                        <div className="mt-4">
                          <div className="mb-1 flex justify-between text-sm text-gray-600">
                            <span>Progress</span>
                            <span>100%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div className="to-emerald-500 h-full rounded-full bg-gradient-to-r from-green-400"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EMPTY STATE */}
          {sorted.length === 0 && (
            <div className="p-12 text-center">
              <div className="mb-4 text-6xl">📚</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                Hozircha mavzular mavjud emas
              </h3>
              <p className="mb-6 text-gray-600">
                Ushbu mustaqil ta'lim bo'yicha hali hech qanday mavzu
                qo'shilmagan
              </p>
              <button
                onClick={() => navigate(-1)}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
              >
                Orqaga qaytish
              </button>
            </div>
          )}
        </div>

        {/* FOOTER NOTES */}
        <div className="mt-8 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <h4 className="mb-2 flex items-center gap-2 font-bold text-gray-800">
            <FiBookOpen /> Ko'rsatmalar:
          </h4>
          <ul className="space-y-1 pl-5 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Mavzular ketma-ketlikda ochiladi
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Har bir mavzuni yakunlaganingizdan keyin testni yechishingiz
              mumkin
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Yakunlangan mavzularni har doim ko'rib chiqishingiz mumkin
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Index;
