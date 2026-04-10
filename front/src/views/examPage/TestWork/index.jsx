import Modal from "react-modal";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall from "../../../config/index";
import { toast } from "react-toastify";

export default function TestSolveAll() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [duration, setDuration] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [student, setStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);

  const questionRefs = useRef({});
  const timerRef = useRef(null);
  Modal.setAppElement("#root");
  const [resultModal, setResultModal] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [wrongCount, setWrongCount] = useState(0);
  const [ball, setBall] = useState(0);
  const [passed, setPassed] = useState(false);
  const [examSubject, setExamSubject] = useState([]);

  // ================================
  // 🔵 Studentni local storagedan olish
  // ================================
  useEffect(() => {
    const init = async () => {
      const studentData = localStorage.getItem("student");

      if (!studentData) {
        toast.error("Talaba ma'lumotlari topilmadi!");
        navigate("/exam/login");
        return;
      }

      setStudent(JSON.parse(studentData));

      // 1) Testni boshlaymiz — startTime backendda yaratiladi
      await loadQuestions();

      // 2) Endi vaqtni hisoblaymiz
      await fetchSubjects();
    };

    init();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/final-exam-student/one-exam/${id}`,
        "GET"
      );
      console.log(res.data);
      setExamSubject(res.data);
      const exam = res.data.finalExam;
      const examStudent = res.data;
      const durationMinutes = exam.duration; // 30
      setDuration(durationMinutes);
      // TEST START TIME (student uchun)
      const start = new Date(examStudent.startTime).getTime();

      // TEST END TIME
      const end = start + durationMinutes * 60 * 1000;

      // HOZIRGI VAQT
      const now = Date.now();

      let remaining = Math.floor((end - now) / 1000);

      if (remaining < 0) remaining = 0;

      setTimeLeft(remaining);
    } catch (err) {
      toast.error("Ma'lumot yuklab bo'lmadi!");
    }
  };

  // ================================
  // 🔵 Savollarni backenddan olish
  // ================================
  const loadQuestions = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/final-exam-student/start-test/${id}`,
        "GET"
      );

      // console.log("Savollar:", res.data);
      setQuestions(res.data);
    } catch (e) {
      toast.error("Savollar yuklanmadi!");
      navigate("/exam/login");
    }
  };

  // ================================
  // ⏳ TIMER
  // ================================
  useEffect(() => {
    if (timeLeft === null) return;
    if (isNaN(timeLeft)) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);

          // 🔴 examPermission bo'lsa ham, bo'lmasa ham yakunlash
          finishTest();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ================================
  // 🟢 Variantni tanlash
  // ================================
  const handleSelect = async (testId, optionIndex) => {
    await fetchSubjects();

    // 🔴 Agarda examPermission = false bo'lsa → hech narsa qilmay testni yakunlaymiz
    if (examSubject?.examPermission === false) {
      await finishTest();
      return;
    }

    // 🔴 FinalExam yopilgan bo'lsa → yakunlash
    if (examSubject?.finalExam?.status === false) {
      await finishTest();
      return;
    }

    // 🟢 UI yangilash
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === testId ? { ...q, selectedAnswer: optionIndex } : q
      )
    );

    try {
      await ApiCall(
        `/api/v1/final-exam-student-test/${testId}/${optionIndex}`,
        "GET"
      );
    } catch (err) {
      toast.error("Javobni saqlashda xatolik!");
    }
  };

  // ================================
  // 🟣 Testni yakunlash
  // ================================
  const finishTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await ApiCall(
        `/api/v1/final-exam-student-test/finish-exam/${id}`,
        "GET"
      );
      setCorrectCount(res.data.correctCount);
      setWrongCount(res.data.wrongCount);
      setBall(res.data.ball);
      setPassed(res.data.isPassed);
      setResultModal(true);
    } catch (err) {
      console.log(err);
      toast.error("Testni yakunlab bo'lmadi!");
      setIsSubmitting(false);
    }
  };

  const scrollToQuestion = (qId) => {
    if (questionRefs.current[qId]) {
      questionRefs.current[qId].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const answeredCount = questions.filter((q) => q.selectedAnswer).length;

  if (!student || !questions.length || timeLeft === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-14 w-14 animate-spin rounded-full border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen select-none gap-6 bg-gray-100 py-6 px-4">
      {/* LEFT PANEL — Student Info */}
      <div className="fixed left-4 top-4 h-[calc(100vh-2rem)] w-64 overflow-y-auto rounded-xl border bg-white p-4 shadow-xl">
        <h3 className="text-md mb-3 border-b pb-2 font-bold text-gray-700">
          Talaba ma'lumotlari
        </h3>

        <div className="mb-4 text-center">
          <img
            src={student.image || "/default-avatar.png"}
            className="mx-auto h-24 w-24 rounded-full border-2 object-cover"
          />
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <b>F.I.Sh:</b> {student.fullName}
          </p>
          <p>
            <b>ID:</b> {student.studentIdNumber}
          </p>
          <p>
            <b>Guruh:</b> {student.groupName}
          </p>
          <p>
            <b>Kurs:</b> {student.level}
          </p>
          <p>
            <b>Fan nomi:</b> {examSubject?.finalExam?.name}
          </p>
          <p>
            <b>Urunishlar soni:</b> {examSubject?.attempt}/
            {examSubject?.finalExam?.attempts}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-lg bg-blue-50 p-3 text-center font-bold text-blue-700">
            Savollar: {questions.length} ta
          </div>

          <div className="rounded-lg bg-green-50 p-3 text-center font-bold text-green-700">
            Javob berilgan: {answeredCount} ta
          </div>
          <div className="rounded-lg bg-red-50 p-3 text-center font-bold text-red-700">
            Qolgan vaqt: {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Navigator */}
      <div className="w-50 fixed right-4 top-4 h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border bg-white p-4 shadow-xl">
        <h3 className="mb-3 border-b pb-2 text-sm font-bold text-gray-600">
          Savollar navigatori
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => scrollToQuestion(q.id)}
              className={`h-10 w-10 rounded-lg font-bold ${
                q.selectedAnswer
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER — Questions */}
      <div className="mx-auto ml-[280px] mr-[200px] w-full max-w-4xl rounded-xl bg-white p-6 shadow-lg">
        <div className="space-y-8">
          {questions.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => (questionRefs.current[item.id] = el)}
              className="border-b pb-8"
            >
              <h2 className="mb-4 text-lg font-semibold">
                <span className="mr-2 inline-block h-8 w-8 rounded-full bg-blue-100 text-center text-blue-700">
                  {idx + 1}
                </span>
                {item.question}
              </h2>

              {item.answers.map((ans, optionIndex) => (
                <label
                  key={ans}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                    item.selectedAnswer === optionIndex + 1
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <input
                    type="radio"
                    name={`q_${item.id}`}
                    checked={item.selectedAnswer === optionIndex + 1}
                    onChange={() => handleSelect(item.id, optionIndex + 1)}
                  />
                  <span>
                    <b>{String.fromCharCode(65 + optionIndex)}.</b> {ans}
                  </span>
                </label>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 border-t pt-6 text-center">
          <button
            onClick={finishTest}
            disabled={isSubmitting || answeredCount !== questions.length}
            className={`
    w-full rounded-xl px-8 py-3 text-lg text-white
    ${
      answeredCount !== questions.length
        ? "cursor-not-allowed bg-gray-400"
        : "bg-green-600 hover:bg-green-700"
    }
  `}
          >
            Testni Yakunlash
          </button>

          <p className="mt-3 text-sm text-gray-600">
            Javob berilgan savollar: {answeredCount} / {questions.length}
          </p>
        </div>
      </div>
      <Modal
        isOpen={resultModal}
        className="mx-auto mt-40 w-[500px] max-w-full rounded-2xl border bg-white p-8 text-center shadow-2xl"
        overlayClassName="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-start"
      >
        <h2 className="mb-5 text-3xl font-bold">Test yakunlandi!</h2>

        <p className="mb-2 text-xl">
          To'g'ri javoblar: <b className="text-green-600">{correctCount}</b>
        </p>

        <p className="mb-2 text-xl">
          Xato javoblar: <b className="text-red-600">{wrongCount}</b>
        </p>

        <p className="mb-2 text-xl">
          Ball: <b className="text-blue-600">{ball}</b>
        </p>

        <p className="mb-6 text-xl">
          Holat:
          <b className={`ml-2 ${passed ? "text-green-600" : "text-red-600"}`}>
            {passed ? "O'tdi" : "O'tmadi"}
          </b>
        </p>

        <button
          onClick={() => navigate(-1)}
          className="w-full rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
        >
          OK
        </button>
      </Modal>
    </div>
  );
}
