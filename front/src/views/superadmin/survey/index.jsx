import React, { useEffect, useState } from "react";
import { MdPerson } from "react-icons/md";
import ApiCall from "../../../config";
import Breadcrumbs from "views/BackLink/BackButton";
import { FaThumbsUp, FaUserGraduate, FaQuestionCircle } from "react-icons/fa";

const StatisticSurvey = () => {
  const [teacherStats, setTeacherStats] = useState([]);
  const [booleanStats, setBooleanStats] = useState([]);
  const [questionStats, setQuestionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch all 3 statistic endpoints
  const getStatistics = async () => {
    try {
      const [teacherRes, boolRes, questionRes] = await Promise.all([
        ApiCall("/api/v1/survey-student/statistic", "GET"),
        ApiCall("/api/v1/survey-student/boolean-summary", "GET"),
        ApiCall("/api/v1/survey-student/question-statistic", "GET"),
      ]);
      setTeacherStats(teacherRes.data || []);
      setBooleanStats(boolRes.data || []);
      setQuestionStats(questionRes.data || []);
    } catch (e) {
      console.error("Error fetching statistics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatistics();
  }, []);

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );
  }

  const totalVotes = teacherStats.reduce((acc, t) => acc + t.voteCount, 0);

  return (
      <div className="flex w-full flex-col gap-8 p-6">
        <Breadcrumbs title="So‘rovnoma statistikasi" />

        {/* ==================== 1️⃣ Teacher Statistics ==================== */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
            <FaUserGraduate className="text-indigo-600 text-3xl" />
            O‘qituvchilar bo‘yicha natijalar
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-indigo-100">
              <tr>
                <th className="p-3 text-indigo-900 font-semibold">#</th>
                <th className="p-3 text-indigo-900 font-semibold">O‘qituvchi</th>
                <th className="p-3 text-indigo-900 font-semibold">Ovozlar soni</th>
                <th className="p-3 text-indigo-900 font-semibold text-right">
                  Foiz (%)
                </th>
              </tr>
              </thead>
              <tbody>
              {teacherStats.map((t, i) => {
                const percent = totalVotes
                    ? ((t.voteCount / totalVotes) * 100).toFixed(1)
                    : 0;
                return (
                    <tr
                        key={i}
                        className={`border-b hover:bg-indigo-50 ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="p-3 text-gray-700">{i + 1}</td>
                      <td className="p-3 text-gray-900 font-medium flex items-center gap-2">
                        <MdPerson className="text-indigo-600" /> {t.teacherName}
                      </td>
                      <td className="p-3 text-gray-800">{t.voteCount}</td>
                      <td className="p-3 text-right font-semibold text-indigo-700">
                        {percent}%
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          <p className="text-right mt-4 text-gray-600 text-sm">
            Umumiy ovozlar soni: <b>{totalVotes}</b>
          </p>
        </div>

        {/* ==================== 2️⃣ Boolean Question Summary ==================== */}
        {booleanStats.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
                <FaThumbsUp className="text-indigo-600 text-3xl" />
                Qo‘shimcha savollar statistikasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {booleanStats.map((item, i) => (
                    <div
                        key={i}
                        className="bg-indigo-50 rounded-2xl p-6 shadow hover:shadow-lg transition text-center border border-indigo-100"
                    >
                      <p className="font-medium text-gray-800 mb-2">{item.question}</p>
                      <p
                          className={`text-2xl font-bold ${
                              item.percent >= 50 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {item.percent}%
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        "Ha" javoblar ulushi
                      </p>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* ==================== 3️⃣ Question-wise Teacher Statistics ==================== */}
        {questionStats.length > 0 && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
              <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-3">
                <FaQuestionCircle className="text-indigo-600 text-3xl" />
                Har bir savol bo‘yicha statistik natijalar
              </h2>

              {questionStats.map((q, i) => (
                  <div
                      key={i}
                      className="mb-8 border border-indigo-100 rounded-2xl p-6 bg-indigo-50/50 hover:bg-indigo-50 transition"
                  >
                    <p className="font-semibold text-gray-800 mb-4 text-lg">
                      {q.questionText}
                    </p>

                    {q.results && q.results.length > 0 ? (
                        <table className="w-full border-collapse text-left">
                          <thead>
                          <tr className="bg-indigo-100">
                            <th className="p-3 text-indigo-900 font-semibold">#</th>
                            <th className="p-3 text-indigo-900 font-semibold">
                              O‘qituvchi
                            </th>
                            <th className="p-3 text-indigo-900 font-semibold text-right">
                              Ovozlar soni
                            </th>
                          </tr>
                          </thead>
                          <tbody>
                          {q.results.slice(0, 5).map((t, idx) => (
                              <tr
                                  key={idx}
                                  className={`border-b hover:bg-indigo-100 ${
                                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                  }`}
                              >
                                <td className="p-3 text-gray-700">{idx + 1}</td>
                                <td className="p-3 text-gray-900 font-medium flex items-center gap-2">
                                  <MdPerson className="text-indigo-600" /> {t.teacherName}
                                </td>
                                <td className="p-3 text-right font-semibold text-indigo-700">
                                  {t.count}
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 italic">
                          Ushbu savol bo‘yicha ma’lumot yo‘q
                        </p>
                    )}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};

export default StatisticSurvey;
