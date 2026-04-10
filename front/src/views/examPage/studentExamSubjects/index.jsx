import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall from "../../../config/index";
import { toast } from "react-toastify";

function StudentSubjects() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState("final");
  const [mustaqil, setMustaqil] = useState([]);
  // "final" | "mustaqil"

  const [filter, setFilter] = useState("all"); // "all", "passed", "failed", "not-taken"
  // 2) STUDENT SURVEY ishlaganmi tekshirish
  // useEffect(() => {
  //     const student = JSON.parse(localStorage.getItem("student"));
  //     if (!student) return;

  //     const checkSurvey = async () => {
  //         try {
  //             const res = await ApiCall(
  //                 `/api/v1/survey-student/student/${student.id}`,
  //                 "GET"
  //             );

  //             if (!res.data.exists) {
  //                 // ❌ Student survey ishlamagan → survey sahifasiga olib boramiz
  //                 navigate(`/exam/survey`);
  //             }
  //         } catch (e) {
  //             console.error(e);
  //         }
  //     };

  //     checkSurvey();
  // }, []);

  // 🔒 1) Student borligini tekshirish
  useEffect(() => {
    const student = JSON.parse(localStorage.getItem("student"));
    if (!student) {
      navigate("/exam/login");
      return;
    }
  }, []);

  // 📌 2) API dan ma'lumot olish
  const fetchSubjects = async () => {
    try {
      setLoading(true);

      const res = await ApiCall(
        `/api/v1/final-exam-student/studentSubjects/${id}`,
        "GET"
      );

      const mustaqilRes = await ApiCall(
        `/api/v1/mustaqil-exam-student/studentSubjects/${id}`,
        "GET"
      );

      if (!mustaqilRes.error) {
        console.log(mustaqilRes.data);

        setMustaqil(Array.isArray(mustaqilRes.data) ? mustaqilRes.data : []);
      }

      setSubjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Ma'lumot yuklab bo'lmadi!");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSubjects();
  }, [id, examType]);

  // Faqat status true bo'lgan fanlar
  const visibleSubjects =
    examType === "final"
      ? subjects.filter((s) => s?.finalExam?.status === true)
      : mustaqil.filter((s) => s?.mustaqilExam?.status === true);

  // Filtrlangan fanlar
  const filteredSubjects = visibleSubjects.filter((subject) => {
    if (filter === "all") return true;
    if (filter === "passed") return subject.isPassed === true;
    if (filter === "failed") return subject.isPassed === false;
    if (filter === "not-taken") return subject.isPassed === null;
    return true;
  });

  // Loader
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="border-t-transparent mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600"></div>
          <p className="text-lg font-medium text-gray-700">
            Ma'lumotlar yuklanmoqda...
          </p>
          <p className="mt-2 text-gray-500">Bu biroz vaqt olishi mumkin</p>
        </div>
      </div>
    );
  }

  // Hech narsa yo'q bo'lsa
  if (!visibleSubjects.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-md transform rounded-2xl bg-white p-8 text-center shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="mx-auto mb-4 h-20 w-20 text-gray-400">
            <svg
              fill="currentColor"
              viewBox="0 0 20 20"
              className="h-full w-full"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-800">
            Imtihonlar mavjud emas
          </h3>
          <p className="mb-6 text-gray-600">
            Hozircha siz uchun hech qanday final imtihoni yaratilmagan. Iltimos,
            keyinroq tekshiring.
          </p>
          <button
            onClick={() => navigate("/exam/login")}
            className="transform rounded-lg bg-blue-600 py-3 px-6 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const canStartTest = (item) => {
    const exam = item.finalExam || item.mustaqilExam;
    if (!exam) return false;

    if (exam.isAmaliy) return false;

    if (item.examPermission && item.isPassed === null) return true;

    if (
      item.examPermission &&
      item.isPassed === false &&
      item.attempt < exam.attempts &&
      item.correctCount !== exam.questionCount
    ) {
      return true;
    }

    return false;
  };

  const isExamEnded = (item) => {
    const end = item?.finalExam?.endTime;
    if (!end) return false;
    return new Date() > new Date(end);
  };
  const isExamEnded2 = (item) => {
    const end = item?.mustaqilExam?.endTime;
    if (!end) return false;
    return new Date() > new Date(end);
  };

  const student = JSON.parse(localStorage.getItem("student"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Student Info Card */}
          <div className="flex items-center gap-5 p-4">
            {/* Big Avatar with Gradient Border */}
            <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 p-1 shadow-md">
              <img
                src={student?.image}
                alt="student"
                className="h-full w-full rounded-full border-4 border-white object-cover"
              />
            </div>

            {/* Text Info */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-extrabold leading-tight text-gray-900">
                {student?.fullName}
              </h2>

              <div className="mt-1 h-[1px] w-32 bg-gray-200"></div>

              <p className="mt-2 text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Guruhi:</span>{" "}
                {student?.groupName}
              </p>

              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Yo‘nalish:</span>{" "}
                {student?.specialtyName}
              </p>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate("/exam/login")}
            className="rounded-xl bg-blue-600 py-3 px-6 font-semibold text-white shadow-md 
                   transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
          >
            Bosh sahifaga qaytish
          </button>
        </div>

        {/* Sarlavha qismi */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            {examType === "final"
              ? "Yakuniy Imtihon Fanlari"
              : "Mustaqil Ta’lim Imtihonlari"}
          </h1>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Quyida sizga ochilgan yakuniy imtihon fanlari ro'yxati keltirilgan.
            Ruxsat etilgan fanlarni boshlashingiz mumkin.
          </p>
        </div>
        {/* === EXAM TYPE MENU === */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex overflow-hidden rounded-xl bg-white shadow-md">
            <button
              onClick={() => setExamType("final")}
              className={`px-6 py-3 font-semibold transition-all
                ${
                  examType === "final"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              Yakuniy imtihon
            </button>

            <button
              onClick={() => setExamType("mustaqil")}
              className={`px-6 py-3 font-semibold transition-all
                ${
                  examType === "mustaqil"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              Mustaqil ta’lim
            </button>
          </div>
        </div>

        {/* Statistikalar */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border-l-4 border-blue-500 bg-white p-5 shadow-md">
            <div className="text-sm font-medium text-gray-500">Jami Fanlar</div>
            <div className="text-2xl font-bold text-gray-800">
              {visibleSubjects.length}
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-green-500 bg-white p-5 shadow-md">
            <div className="text-sm font-medium text-gray-500">O'tilgan</div>
            <div className="text-2xl font-bold text-gray-800">
              {visibleSubjects.filter((s) => s.isPassed === true).length}
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-red-500 bg-white p-5 shadow-md">
            <div className="text-sm font-medium text-gray-500">O'tilmagan</div>
            <div className="text-2xl font-bold text-gray-800">
              {visibleSubjects.filter((s) => s.isPassed === false).length}
            </div>
          </div>
          <div className="rounded-xl border-l-4 border-yellow-500 bg-white p-5 shadow-md">
            <div className="text-sm font-medium text-gray-500">Kutayotgan</div>
            <div className="text-2xl font-bold text-gray-800">
              {visibleSubjects.filter((s) => s.isPassed === null).length}
            </div>
          </div>
        </div>

        {/* Filtrlash */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Barchasi
          </button>
          <button
            onClick={() => setFilter("not-taken")}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              filter === "not-taken"
                ? "bg-yellow-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Kutayotgan
          </button>
          <button
            onClick={() => setFilter("passed")}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              filter === "passed"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            O'tilgan
          </button>
          <button
            onClick={() => setFilter("failed")}
            className={`rounded-lg px-4 py-2 font-medium transition-all ${
              filter === "failed"
                ? "bg-red-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            O'tilmagan
          </button>
        </div>

        {examType === "final" ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      №
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Fan nomi
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Kirish ruxsati
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Ball
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Holati
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Urinishlar soni
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition-all duration-200 hover:bg-blue-50"
                      >
                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {examType === "final"
                              ? item.finalExam?.curriculumSubject?.subject?.name
                              : item.mustaqilExam?.curriculumSubject?.subject
                                  ?.name || "-"}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {item.finalExam?.curriculumSubject?.subject?.code ||
                              ""}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {!item.permissionTextList ||
                            item.permissionTextList.length === 0 ? (
                              <div className="text-green-500">Ruxsat</div>
                            ) : (
                              <div className="text-red-500">
                                {item.permissionTextList}
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="text-sm font-bold text-gray-900">
                            {item.ball !== null && item.ball !== undefined
                              ? `${item.ball} ball`
                              : "-"}
                          </div>
                          {item.finalExam?.maxBall && (
                            <div className="text-xs text-gray-500">
                              Maksimal: {item.finalExam.maxBall} ball
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          {item.isPassed === null ? (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></span>
                              Kutayotgan
                            </span>
                          ) : item.isPassed === true ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                              O'tdi
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-red-500"></span>
                              O'ta olmadi
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                            {item.attempt} / {item.finalExam?.attempts}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-medium">
                          {isExamEnded(item) ? (
                            <div className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700">
                              Test ishlash vaqti tugagan!
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(`/exam/subject/test/${item.id}`)
                              }
                              disabled={!canStartTest(item)}
                              className={`inline-flex transform items-center rounded-lg px-5 py-2.5 font-medium transition-all duration-300 hover:scale-105
        ${
          !canStartTest(item)
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
        }`}
                            >
                              {item.finalExam?.isAmaliy
                                ? "Amaliy imtihon"
                                : // : item.isPassed !== true
                                item.isPassed !== null
                                ? "Qayta topshirish!"
                                : "Testni boshlash"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-lg text-gray-500">
                          Tanlangan filter bo'yicha hech qanday fan topilmadi
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      №
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Fan nomi
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Ball
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Holati
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Urinishlar soni
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-white"
                    >
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((item, index) => (
                      <tr
                        key={item.id}
                        className="transition-all duration-200 hover:bg-blue-50"
                      >
                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900">
                            {item.mustaqilExam?.curriculumSubject?.subject
                              ?.name || "-"}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {item.mustaqilExam?.curriculumSubject?.subject
                              ?.code || ""}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="text-sm font-bold text-gray-900">
                            {item.ball !== null && item.ball !== undefined
                              ? `${item.ball} ball`
                              : "-"}
                          </div>
                          {item.mustaqilExam?.maxBall && (
                            <div className="text-xs text-gray-500">
                              Maksimal: {item.mustaqilExam.maxBall} ball
                            </div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          {item.isPassed === null ? (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></span>
                              Kutayotgan
                            </span>
                          ) : item.isPassed === true ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                              O'tdi
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                              <span className="mr-1 h-2 w-2 rounded-full bg-red-500"></span>
                              O'ta olmadi
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                            {item.attempt} / {item.mustaqilExam?.attempts}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-right text-sm font-medium">
                          {isExamEnded2(item) ? (
                            <div className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700">
                              Test ishlash vaqti tugagan!
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(`/exam/mustaqil/test/${item.id}`)
                              }
                              disabled={!canStartTest(item)}
                              className={`inline-flex transform items-center rounded-lg px-5 py-2.5 font-medium transition-all duration-300 hover:scale-105
        ${
          !canStartTest(item)
            ? "cursor-not-allowed bg-gray-200 text-gray-500"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
        }`}
                            >
                              {item.mustaqilExam?.isAmaliy
                                ? "Amaliy imtihon"
                                : item.isPassed !== null
                                ? "Qayta topshirish!"
                                : "Testni boshlash"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-lg text-gray-500">
                          Tanlangan filter bo'yicha hech qanday fan topilmadi
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentSubjects;
