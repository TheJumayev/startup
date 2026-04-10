import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiFileText,
  FiDownload,
  FiUpload,
  FiArrowUp,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import Modal from "react-modal";

Modal.setAppElement("#root");

// 🔹 O'qituvchi yoki talaba fayliga qarab rang o'zgaradigan variant
const DownloadButton = ({ fileUrl, fileName, variant = "blue", label }) => {
  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl, { method: "GET" });
      if (!response.ok) throw new Error("Faylni yuklab bo'lmadi");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "document.pdf";
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("✅ Fayl muvaffaqiyatli yuklab olindi!");
    } catch {
      toast.error("❌ Yuklab olishda xatolik!");
    }
  };

  const colorClass =
    variant === "green"
      ? "bg-green-50 text-green-700 hover:bg-green-100"
      : "bg-blue-50 text-blue-600 hover:bg-blue-100";

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${colorClass}`}
    >
      <FiDownload className="h-4 w-4" />
      <span>{label || "Faylni yuklab olish"}</span>
    </button>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const token = localStorage.getItem("authToken");
  const [homeworkStatuses, setHomeworkStatuses] = useState({});
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [ball, setBall] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const storageKey = "activeTest";

  const startTest = (homework) => {
    if (!homework?.haveTest) {
      toast.error("Bu vazifada test mavjud emas!");
      return;
    }

    const allQuestions = homework.testHomework || [];
    if (allQuestions.length === 0) {
      toast.warn("Test savollari mavjud emas!");
      return;
    }

    // 🧠 10 ta random savol tanlaymiz
    const random10 = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);

    // 🌀 Har bir savoldagi javob variantlarini aralashtiramiz
    const randomizedQuestions = random10.map((q) => {
      const options = [q.answer1, q.answer2, q.answer3, q.answer4].filter(
        Boolean
      );
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      return { ...q, options };
    });

    setSelectedHomework(homework);
    setQuestions(randomizedQuestions);
    setAnswers({});
    setIsStarted(true);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
  };

  const handleAnswer = (qId, option) => {
    const updated = { ...answers, [qId]: option };
    setAnswers(updated);
    const stored = JSON.parse(localStorage.getItem(storageKey));
    stored.answers = updated;
    localStorage.setItem(storageKey, JSON.stringify(stored));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = async () => {
    let total = 0;
    questions.forEach((q) => {
      if (answers[q.id]?.trim() === q.answer1?.trim()) {
        total += q.ball || 1;
      }
    });

    setBall(total);
    setIsFinished(true);

    toast.success(`✅ Test yakunlandi! Sizning natijangiz: ${total} ball`);

    try {
      const dto = {
        studentId,
        homeworkId: selectedHomework.id,
        ball: total,
      };

      // 🔹 Backenddan tekshiramiz mavjudmi
      const check = await ApiCall(
        `/api/v1/response-homework/one-homework/${studentId}/${selectedHomework.id}`,
        "GET"
      );

      if (check?.data?.id) {
        const responseId = check.data.id;
        await ApiCall(`/api/v1/response-homework/${responseId}`, "PUT", dto);
        toast.success("🔄 Test natijasi yangilandi!");
      } else {
        await ApiCall(`/api/v1/response-homework`, "POST", dto);
        toast.success("🧠 Test natijasi saqlandi!");
      }

      // 🔹 Yangi statusni qayta yuklaymiz
      await fetchHomeworkStatus(studentId, selectedHomework.id);
    } catch (err) {
      toast.error("❌ Test natijasini saqlashda xatolik!");
      console.error("Natijani yuborishda xatolik:", err);
    }
  };
  const fetchHomeworkStatus = async (studentId, homeworkId) => {
    try {
      const res = await ApiCall(
        `/api/v1/response-homework/one-homework/${studentId}/${homeworkId}`,
        "GET"
      );

      const data = res.data;
      console.log(data);

      setHomeworkStatuses((prev) => ({
        ...prev,
        [homeworkId]: data,
      }));

      // 🟢 Agar baho mavjud bo‘lsa – testni yakunlangan holatda ko‘rsatamiz
      if (data?.ball) {
        setIsFinished(true);
        setBall(data.ball);
        setIsStarted(false);
      }

      return data;
    } catch {
      setHomeworkStatuses((prev) => ({
        ...prev,
        [homeworkId]: null,
      }));
      return null;
    }
  };

  const fetchStudentData = async () => {
    if (!token) {
      navigate("/student/login");
      return;
    }

    try {
      const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");
      if (res?.data?.id) {
        setStudentId(res.data.id);
      } else {
        toast.error("Student topilmadi!");
        navigate("/student/login");
      }
    } catch (err) {
      console.error("❌ Studentni olishda xatolik:", err);
      localStorage.clear();
      navigate("/student/login");
    }
  };

  const fetchHomeworks = async (lessonId) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/teacher-homework/by-lesson/${lessonId}`,
        "GET"
      );
      console.log(res.data);

      const list = res.data || [];
      if (studentId) {
        const updated = await Promise.all(
          list.map(async (hw) => {
            const status = await fetchHomeworkStatus(studentId, hw.id);
            if (status)
              return { ...hw, isSend: true, score: status.score ?? null };
            return { ...hw, isSend: false, score: null };
          })
        );
        setHomeworks(updated);
      } else {
        setHomeworks(list);
      }
    } catch {
      toast.error("❌ Topshiriqlarni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    if (id && studentId) {
      fetchHomeworks(id);
    }
  }, [id, studentId]);

  const handleFileUpload = (e) => {
    const selected = e.target.files[0];
    if (!selected) {
      toast.warn("Fayl tanlanmadi");
      return;
    }
    setFile(selected);
    
    toast.info(`📁 Tanlangan fayl yuklandi!`);
  };

  const handleSubmitHomework = async () => {
    if (!file) {
      toast.error("Iltimos, fayl tanlang!");
      return;
    }
    if (!studentId) {
      toast.error("Student aniqlanmadi!");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "response-homework");

      const uploadRes = await fetch(`${baseUrl}/api/v1/file/upload`, {
        method: "POST",
        body: formData,
      });


      if (!uploadRes.ok) throw new Error("Faylni yuklab bo‘lmadi");
      const uploadData = await uploadRes.json();
      console.log(uploadData);

      const fileId =
        uploadData ||
        uploadData?.data?.id ||
        uploadData?.fileId ||
        (typeof uploadData === "string" ? uploadData : null);

      if (!fileId) {
        toast.error("Fayl ID topilmadi!");
        return;
      }

      const dto = {
        studentId,
        homeworkId: selectedHomework.id,
        fileId,
      };
      // 🔹 Avval mavjudligini tekshiramiz
      const check = await ApiCall(
        `/api/v1/response-homework/one-homework/${studentId}/${selectedHomework.id}`,
        "GET"
      );

      if (check?.data?.id) {
        const responseId = check.data.id;
        await ApiCall(`/api/v1/response-homework/${responseId}`, "PUT", dto);
        toast.success("🔄 Vazifa fayli yangilandi!");
      } else {
        // 🆕 Aks holda yangi yaratamiz
        await ApiCall("/api/v1/response-homework", "POST", dto, null, true);
        toast.success("✅ Vazifa muvaffaqiyatli topshirildi!");
      }

      setHomeworks((prev) =>
        prev.map((hw) =>
          hw.id === selectedHomework.id ? { ...hw, isSend: true } : hw
        )
      );

      await fetchHomeworkStatus(studentId, selectedHomework.id);
      setModalOpen(false);
      setFile(null);
    } catch (error) {
      console.error("❌ Xatolik:", error);
      toast.error("Topshiriq yuborishda xatolik yuz berdi!");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="mx-auto max-w-7xl p-2 sm:p-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {homeworks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-6 text-center sm:p-8">
          <FiFileText className="mx-auto mb-3 h-8 w-8 text-gray-400 sm:h-10 sm:w-10" />
          <h3 className="text-sm font-medium text-gray-700 sm:text-base">
            Topshiriqlar mavjud emas
          </h3>
        </div>
      ) : (
        homeworks.map((hw, i) => {
          const status = homeworkStatuses[hw.id];
          const isSend = hw.isSend || status?.isSend || false;
          const score = hw.score ?? status?.score ?? null;

          return (
            <div
              key={i}
              className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm sm:mb-6 sm:rounded-2xl"
            >
              <div className="flex justify-between border-b bg-blue-50 px-4 py-2 sm:px-6 sm:py-3">
                <h2 className="text-sm font-semibold text-gray-800 sm:text-base">
                  Topshiriq
                </h2>
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700 sm:px-3 sm:text-sm">
                  Faol
                </span>
              </div>

              <div className="space-y-3 p-4 sm:space-y-4 sm:p-6">
                {/* TEST BOSHLASH */}
                {hw.haveTest && !isStarted && !isFinished && (
                  <button
                    onClick={() => {
                      // setSelectedHomework(hw);
                      startTest(hw);
                    }}
                    className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto sm:px-4 sm:text-base"
                  >
                    🧠 Testni boshlash
                  </button>
                )}

                {/* TEST JARAYONI */}
                {isStarted && !isFinished && (
                  <div className="space-y-4">
                    {/* TEST STATISTIKASI */}
                    <div className="rounded-lg bg-blue-50 p-3 sm:p-4">
                      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                          <h2 className="text-lg font-bold text-blue-800 sm:text-xl">
                            Test – {currentQuestionIndex + 1}/{questions.length}
                          </h2>
                          <p className="text-xs text-blue-600 sm:text-sm">
                            Javob berilgan: {Object.keys(answers).length}/
                            {questions.length}
                          </p>
                        </div>
                        <button
                          onClick={finishTest}
                          disabled={
                            Object.keys(answers).length < questions.length
                          }
                          className={`w-full rounded px-4 py-2 text-sm text-white sm:w-auto sm:text-base ${Object.keys(answers).length < questions.length
                            ? "cursor-not-allowed bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                          ✅ Yakunlash
                        </button>
                      </div>
                    </div>

                    {/* ASOSIY KONTENT */}
                    <div className="flex flex-col gap-4 lg:flex-row">
                      {/* SAVOL QISMI */}
                      <div className="lg:flex-1">
                        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <h3 className="text-base font-semibold text-gray-800 sm:text-lg">
                              {currentQuestionIndex + 1}.{" "}
                              {currentQuestion?.question}
                            </h3>
                            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                              {currentQuestion?.ball} ball
                            </span>
                          </div>

                          <div className="space-y-2">
                            {currentQuestion?.options?.map((ans, i) => (
                              <label
                                key={i}
                                className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-50"
                              >
                                <input
                                  type="radio"
                                  name={currentQuestion?.id}
                                  value={ans}
                                  checked={answers[currentQuestion?.id] === ans}
                                  onChange={() =>
                                    handleAnswer(currentQuestion?.id, ans)
                                  }
                                  className="h-4 w-4 text-blue-600"
                                />
                                <span className="text-sm sm:text-base">
                                  {ans}
                                </span>
                              </label>
                            ))}
                          </div>

                          {/* NAVIGATSIYA */}
                          <div className="mt-4 flex justify-between border-t border-gray-200 pt-3">
                            <button
                              onClick={prevQuestion}
                              disabled={currentQuestionIndex === 0}
                              className={`flex items-center gap-2 rounded px-3 py-2 text-sm sm:px-4 ${currentQuestionIndex === 0
                                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                              <FiArrowLeft className="h-4 w-4" />
                              Oldingi
                            </button>
                            <button
                              onClick={nextQuestion}
                              disabled={
                                currentQuestionIndex === questions.length - 1
                              }
                              className={`flex items-center gap-2 rounded px-3 py-2 text-sm sm:px-4 ${currentQuestionIndex === questions.length - 1
                                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                            >
                              Keyingi
                              <FiArrowRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* TEST RAQAMLARI */}
                      <div className="lg:w-64">
                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-800 sm:text-base">
                            Savollar ro'yxati
                          </h4>
                          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
                            {questions.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToQuestion(index)}
                                className={`h-8 w-8 rounded text-xs font-medium transition-all sm:h-10 sm:w-10 sm:text-sm ${currentQuestionIndex === index
                                  ? "bg-blue-600 text-white ring-2 ring-blue-300"
                                  : answers[questions[index].id]
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                              >
                                {index + 1}
                              </button>
                            ))}
                          </div>

                          {/* LEGENDA */}
                          <div className="mt-3 space-y-1 text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded bg-blue-600"></div>
                              <span>Joriy savol</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded bg-green-500"></div>
                              <span>Javob berilgan</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded border border-gray-300 bg-gray-100"></div>
                              <span>Javob berilmagan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NATIJA */}
                {isFinished && (
                  <div className="rounded-lg bg-green-50 p-4 text-center sm:p-6">
                    <h2 className="mb-3 text-xl font-bold text-green-600 sm:text-2xl">
                      🎉 Sizning natijangiz: {ball} ball
                    </h2>
                  </div>
                )}

                {/* TOPshiriq TAVSIFI */}
                <p className="text-sm text-gray-700 sm:text-base">
                  {hw.description}
                </p>

                {hw.videoUrl && (
                  <div dangerouslySetInnerHTML={{ __html: hw.videoUrl }} />
                )}

                {/* O'QITUVCHI FAYLI */}
                {hw.attachment && (
                  <DownloadButton
                    fileUrl={`${baseUrl}/api/v1/file/getFile/${hw.attachment.id}`}
                    fileName={hw.attachment.name}
                    variant="blue"
                    label="Vazifa fayli"
                  />
                )}

                {/* STATUS VA ACTIONS */}
                <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center">
                  <div className="text-xs sm:text-sm">
                    {status.isSend ? (
                      <span className="text-gray-700">
                        {status.score !== null ? (
                          <>
                            Baho: <b>{status.score}/100</b>
                          </>
                        ) : (
                          <>Baholanmagan</>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        Topshiriq hali topshirilmagan
                      </span>
                    )}
                  </div>

                  <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
                    {status.isSend && status?.attachment?.id && (
                      <DownloadButton
                        fileUrl={`${baseUrl}/api/v1/file/getFile/${status.attachment.id}`}
                        fileName={status.attachment.name || "javob_fayli"}
                        variant="green"
                        label="Javob fayli"
                      />
                    )}

                    {status.isSend ? (
                      <button
                        disabled
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-400 px-3 py-2 text-xs font-medium text-white sm:w-auto sm:px-5 sm:text-sm"
                      >
                        <FiUpload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Bajarilgan</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedHomework(hw);
                          setModalOpen(true);
                        }}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-2 text-xs font-medium text-white hover:from-blue-700 hover:to-indigo-700 sm:w-auto sm:px-5 sm:text-sm"
                      >
                        <FiUpload className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Topshiriqni bajarish</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        shouldCloseOnOverlayClick={false}
        className="relative mx-auto flex w-11/12 flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-xl outline-none sm:w-96 sm:p-6"
        overlayClassName="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      >
        <h2 className="mb-4 text-center text-base font-semibold text-gray-800 sm:text-lg">
          📤 Topshiriqni yuklash
        </h2>
        <input
          type="file"
          accept="*/*"
          onChange={handleFileUpload}
          className="mb-4 w-full rounded-lg border border-gray-300 p-2 text-sm"
        />
        <div className="flex w-full justify-between gap-2">
          <button
            onClick={() => setModalOpen(false)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 sm:px-4"
          >
            Bekor qilish
          </button>
          <button
            disabled={uploading}
            onClick={handleSubmitHomework}
            className={`flex-1 rounded-lg px-3 py-2 text-sm text-white sm:px-4 ${uploading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {uploading ? "Yuklanmoqda..." : "Yuborish"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
