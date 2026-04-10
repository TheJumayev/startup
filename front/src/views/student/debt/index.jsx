import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config/index";
import { toast, ToastContainer } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [debts, setDebts] = useState([]);
  const [certsBySubjectId, setCertsBySubjectId] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("debts");
  const [semesterNow, setSemesterNow] = useState(null);
  const token = localStorage.getItem("authToken");

  if (!token) {
    navigate("/student/login");
  }

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchStudentData(token);
  }, [navigate]);

  const fetchStudentData = async (token) => {
    console.log(token);

    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      if (response?.error === true) {
        localStorage.removeItem("authToken");
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      console.log("account", response);
      setSemesterNow(response.data?.semester);
      const studentData = response.data;

      setStudent(studentData);

      if (studentData?.id) {
        await fetchStudentDebts(studentData.id);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDebts = async (studentId) => {
    try {
      const response = await ApiCall(
        `/api/v1/student-subject/debt/${studentId}`,
        "GET"
      );
      console.log(response.data);

      let data = response.data;
      console.log("debts", data);
      const list = Array.isArray(data) ? data : data?.content ?? [];
      console.log(list);

      setDebts(list);

      await fetchCertificatesForDebts(studentId, list);
    } catch (error) {
      console.error("Error fetching student debts:", error);
      setDebts([]);
      setCertsBySubjectId({});
    }
  };

  const handleDownload = async (certId, number) => {
    try {
      const res = await fetch(baseUrl + `/api/v1/certificate/file/${certId}`, {
        method: "GET",
      });
      console.log(res);

      if (!res.ok) {
        const text = await res.text(); // прочитаем сообщение бэка
        throw new Error("Download failed: " + text);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${number || certId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("❌ Download error:", e);
    }
  };

  const fetchCertificatesForDebts = async (studentId, list) => {
    if (!Array.isArray(list) || list.length === 0) {
      setCertsBySubjectId({});
      return;
    }
    console.log("studentId", studentId);

    const requests = list.map(async (s) => {
      const subjectId = s?.id;
      console.log("Fetching cert for subjectId:", subjectId);
      if (!subjectId) return [null, null];

      try {
        const res = await ApiCall(
          `/api/v1/certificate/${studentId}/${subjectId}`,
          "GET"
        );
        console.log("cert object:", res.data);

        if (!res.data) return [subjectId, null];

        // ⚡ сохраняем в localStorage
        const certKey = `cert-${studentId}-${subjectId}`;
        localStorage.setItem(certKey, JSON.stringify(res.data));

        // ball ni raqam qilib olish
        return [subjectId, { ...res.data, ball: Number(res.data.ball) }];
      } catch (err) {
        return [subjectId, null];
      }
    });

    const pairs = await Promise.all(requests);
    const map = {};
    for (const [sid, cert] of pairs) {
      if (sid) map[sid] = cert;
    }
    setCertsBySubjectId(map);
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
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Talaba Sahifasi
              </h1>
              <p className="mt-1 text-gray-600">
                Barcha fanlar va natijalaringizni bir joyda ko'ring
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center">
                <div className="mr-4">
                  <p className="text-sm text-gray-500">Guruh</p>
                  <p className="font-medium">
                    {student?.groupName || "Noma'lum"}
                  </p>
                </div>
                <div className="mx-4 h-10 w-px bg-gray-300"></div>
                <div>
                  <p className="text-sm text-gray-500">Talaba</p>
                  <p className="font-medium">
                    {student?.fullName || "Noma'lum"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Jami Fanlar
                </h2>
                <p className="text-2xl font-bold text-gray-700">
                  {
                    debts.filter(
                      (s) => Number(s.semesterCode) <= Number(semesterNow)
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-3">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Yakunlangan
                </h2>
                <p className="text-2xl font-bold text-gray-700">
                  {debts.filter((d) => d.passed).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="flex items-center">
              <div className="rounded-lg bg-amber-100 p-3">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Qarzdor Fanlar
                </h2>
                <p className="text-2xl font-bold text-gray-700">
                  {
                    debts.filter(
                      (d) => !d.passed && d.semesterCode <= semesterNow
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab("debts")}
                className={`py-4 px-6 text-center text-sm font-medium ${
                  activeTab === "debts"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Qarzdor Fanlar
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`py-4 px-6 text-center text-sm font-medium ${
                  activeTab === "completed"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Yakunlangan Fanlar
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "debts" ? (
              <>
                <h3 className="mb-6 text-lg font-semibold text-gray-800">
                  Qarzdor fanlar ro'yxati
                </h3>
                {debts.filter((s) => !s.passed).length === 0 ? (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">
                      Qarzdor fanlar yo'q!
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Barcha fanlardan o'ttingiz. Tabriklaymiz! 🎉
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {debts
                      .filter(
                        (s) =>
                          !s.passed &&
                          Number(s.semesterCode) <= Number(semesterNow)
                      )
                      .map((s, index) => {
                        const cert = certsBySubjectId[s?.id];
                        return (
                          <div
                            key={s.id ?? index}
                            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {s.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {s.examFinishName}
                              </p>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Turi</p>
                                <p className="text-sm font-medium">
                                  {s.subjectTypeName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Semestr</p>
                                <p className="text-sm font-medium">
                                  {s.semesterName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Kredit</p>
                                <p className="text-sm font-medium">
                                  {s.credit}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Holat</p>
                                <div className="text-sm font-medium">
                                  {Number(s.semesterCode) ===
                                  Number(semesterNow) ? (
                                    <span className="text-amber-600">
                                      Hali semestr yakunlanmagan!
                                    </span>
                                  ) : s.payed ? (
                                    <span className="text-green-600">
                                      To'langan
                                    </span>
                                  ) : (
                                    <span className="text-red-600">
                                      To'lanmagan
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-2">
                              {/* 🔹 Agar fan hozirgi semestrga tegishli bo‘lsa */}
                              {Number(s.semesterCode) === Number(semesterNow) &&
                              s.payed !== true ? (
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-blue-100 px-4 py-3 text-center">
                                  <p className="text-sm font-medium text-blue-700">
                                    Hali fan yakunlanmagan
                                  </p>
                                </div>
                              ) : s.payed ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      localStorage.setItem(
                                        "subjectName",
                                        s.name
                                      );
                                      const res = await ApiCall(
                                        `/api/v1/learning-student-subject/student-subject/${s.id}`,
                                        "GET"
                                      );

                                      if (res && res.data) {
                                        const curriculumSubjectId =
                                          res.data.curriculumSubject?.id;
                                        const studentSubjectId =
                                          res.data.studentSubject?.id;
                                        const requiredLessons =
                                          res.data.requiredLessons ?? 0;
                                        const learningStudentSubjectId =
                                          res.data.id;
                                        const debtsId = s.id;

                                        if (!curriculumSubjectId) {
                                          toast.error(
                                            "Fan ma'lumotlari topilmadi!"
                                          );
                                          return;
                                        }

                                        navigate(
                                          `/student/media-lessons/${curriculumSubjectId}`,
                                          {
                                            state: {
                                              requiredLessons,
                                              learningStudentSubjectId,
                                              debtsId,
                                              studentSubjectId,
                                              studentId: student.id,
                                              cert,
                                              testPassed:
                                                !!cert && cert.ball >= 59,
                                            },
                                          }
                                        );
                                      } else {
                                        toast.info(
                                          "Dars topilmadi! Adminga murojat qiling!"
                                        );
                                      }
                                    } catch (err) {
                                      console.error("Xatolik:", err);
                                      toast.error("Server bilan aloqa xatosi!");
                                    }
                                  }}
                                  className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700"
                                >
                                  ▶️ Dars ko‘rish
                                </button>
                              ) : (
                                <div className="flex flex-col items-center gap-2 rounded-lg bg-yellow-100 px-4 py-3 text-center">
                                  <p className="text-sm font-medium text-yellow-700">
                                    Testga kirish uchun to'lovni amalga oshiring
                                  </p>
                                </div>
                              )}

                              {/* 🔹 Sertifikat tugmasi o‘sha joyida qoladi */}
                              {cert && cert.ball >= 59 && (
                                <button
                                  onClick={() =>
                                    handleDownload(cert.id, cert.number)
                                  }
                                  className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-all hover:bg-green-700"
                                >
                                  📄 Sertifikatni yuklab olish
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="mb-6 text-lg font-semibold text-gray-800">
                  Yakunlangan fanlar ro'yxati
                </h3>
                {debts.filter((s) => s.passed).length === 0 ? (
                  <div className="py-12 text-center">
                    <svg
                      className="mx-auto h-16 w-16 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="mt-4 text-xl font-medium text-gray-900">
                      Yakunlangan fanlar yo'q
                    </h3>
                    <p className="mt-2 text-gray-500">
                      Hali hech qanday fanni yakunlamagansiz
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {debts
                      .filter((s) => s.passed)
                      .map((s, index) => {
                        const cert = certsBySubjectId[s?.id];
                        return (
                          <div
                            key={s.id ?? index}
                            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                          >
                            <div className="mb-4 flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {s.name}
                              </h3>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-500">Turi</p>
                                <p className="text-sm font-medium">
                                  {s.subjectTypeName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Semestr</p>
                                <p className="text-sm font-medium">
                                  {s.semesterName}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Kredit</p>
                                <p className="text-sm font-medium">
                                  {s.credit}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Holat</p>
                                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                  Yakunlangan
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
