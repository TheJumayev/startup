import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";
import { MdCreate } from "react-icons/md";

function Debts() {
  const { id } = useParams();
  const [groupIdLink, setGroupIdLink] = useState(null);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Sertifikatlar uchun state
  const [certsBySubjectId, setCertsBySubjectId] = useState({});

  // To'lov modali
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [amount, setAmount] = useState("");

  // Ball modali
  const [isBallModalOpen, setIsBallModalOpen] = useState(false);
  const [selectedDebtForBall, setSelectedDebtForBall] = useState(null);
  const [newBall, setNewBall] = useState("");

  // Fanlar modali
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  // const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [getModalData, setGetModalData] = useState([]);
  // Fan va mavzular uchun yangi state
  const [selectedCurriculumSubject, setSelectedCurriculumSubject] =
    useState(null);
  const [selectedLessons, setSelectedLessons] = useState(null);
  const [curriculumModalData, setCurriculumModalData] = useState(null);

  const [highlightSubjectName, setHighlightSubjectName] = useState(null);
  const [isEditPaymentModalOpen, setIsEditPaymentModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState(null);

  const fetchStudentForModal = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/curriculum-subject/student/${id}`,
        "GET"
      );

      if (res && Array.isArray(res.data)) {
        setGetModalData(res.data);

        // после того как сохранили список предметов, обходим каждый id
        res.data.forEach((item) => {
          if (item?.id) {
            fetchCurriculumForModal(item.id);
          }
        });
      } else {
        setGetModalData([]);
      }
    } catch (err) {
      console.error("⚠️ API xatosi:", err);
      toast.error("Talaba ma'lumotlarini olishda xatolik!");
    }
  };
  const fetchCurriculumForModal = async (curriculumSubjectId) => {
    try {
      const res = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${curriculumSubjectId}`,
        "GET"
      );
      if (res && res.data) {
        setCurriculumModalData((prev) => ({
          ...prev,
          [curriculumSubjectId]: res.data.length,
        }));
      } else {
        setCurriculumModalData((prev) => ({
          ...prev,
          [curriculumSubjectId]: 0,
        }));
      }
    } catch (err) {
      console.error("⚠️ API xatosi:", err);
      toast.error("Mavzularni olishda xatolik!");
    }
  };

  const openModal = async (debt) => {
    setSelectedDebt(debt);
    setAmount(debt.amount ? debt.amount : "");
    setHighlightSubjectName(debt.name);
    setIsModalOpen(true);

    await fetchStudentForModal();
    await fetchCurriculumForModal(debt.id);
  };

  const handleUpdate = async () => {
    if (!selectedDebt) return;

    if (!selectedCurriculumSubject || !selectedLessons) {
      toast.error("Fan va mavzular sonini tanlang!");
      return;
    }

    try {
      // 1. Создаём LearningStudentSubject
      const dto = {
        studentSubjectId: selectedDebt.id,
        curriculumSubjectId: selectedCurriculumSubject,
        requiredLessons: parseInt(selectedLessons, 10),
      };

      const learnRes = await ApiCall(
        "/api/v1/learning-student-subject",
        "POST",
        dto
      );

      if (learnRes.error) {
        toast.error("LearningStudentSubject saqlashda xatolik!");
        return;
      }

      // 2. Обновляем оплату
      const paymentRes = await ApiCall(
        `/api/v1/student-subject/payment/${selectedDebt.id}`,
        "PUT",
        {
          amount: amount,
          curriculumSubjectId: selectedCurriculumSubject,
          requiredLessons: parseInt(selectedLessons, 10),
        }
      );

      if (paymentRes.error) {
        toast.error("To'lovni yangilashda xatolik!");
        return;
      }

      toast.success("Ma'lumotlar muvaffaqiyatli saqlandi!");
      closeModal();
      fetchDebts();
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("So'rov yuborishda xatolik!");
    }
  };

  // === FAN QO‘SHISH FUNKSIYASI ===
  const handleSaveSubject = async () => {
    if (!selectedSubject) {
      toast.error("Iltimos, fan tanlang!");
      return;
    }

    // uniqueKey = id-semesterCode
    const [hemisId] = selectedSubject.split("-");
    const subj = subjects.find((s) => s.id.toString() === hemisId);

    if (!subj) {
      toast.error("Fan topilmadi!");
      return;
    }

    // DTO yasash
    const dto = {
      credit: subj.credit,
      examFinishCode: subj.examFinish?.code,
      examFinishName: subj.examFinish?.name,
      grade: subj.grade,
      hemisId: subj.id, // ❗️ fan id hemisId bo‘lib ketadi
      name: subj.name,
      passed: subj.passed,
      position: subj.position,
      subjectTypeCode: subj.subjectType?.code,
      subjectTypeName: subj.subjectType?.name,
      semesterCode: subj.semester?.code,
      semesterName: subj.semester?.name,
      totalAcload: subj.total_acload,
      totalPoint: subj.total_point,
      finishCreditStatus: subj.finish_credit_status,
    };

    try {
      const res = await ApiCall(`/api/v1/student/${student.id}`, "POST", dto);
      if (res && !res.error) {
        toast.success("Fan muvaffaqiyatli qo'shildi!");
        setIsSubjectsModalOpen(false);
        fetchDebts(); // jadvalni yangilash
      } else {
        toast.error("Ushbu fan ushbu semestr uchun allaqachon mavjud!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server bilan xatolik yuz berdi!");
    }
  };
  const openEditPaymentModal = (debt) => {
    setDebtToEdit(debt);
    setAmount(debt.amount || "");
    setIsEditPaymentModalOpen(true);
  };

  const closeEditPaymentModal = () => {
    setIsEditPaymentModalOpen(false);
    setDebtToEdit(null);
    setAmount("");
  };

  const handleEditPaymentUpdate = async () => {
    if (!debtToEdit) return;

    try {
      const res = await ApiCall(
        `/api/v1/student-subject/change-payment/${debtToEdit.id}/${amount}`,
        "PUT"
      );

      if (res && res.error === false) {
        toast.success("To'lov yangilandi!");
        closeEditPaymentModal();
        fetchDebts();
      } else {
        toast.error("Yangilashda xatolik!");
        console.log("⚠️ handleEditPaymentUpdate response:", res);
      }
    } catch (err) {
      console.error("❌ handleEditPaymentUpdate error:", err);
      toast.error("Server bilan xatolik yuz berdi!");
    }
  };

  // Talaba ma'lumotlarini olish
  const fetchStudent = async () => {
    try {
      const res = await ApiCall(`/api/v1/student/byid/${id}`, "GET");
      if (res && res.data) {
        // console.log(res.data);

        setGroupIdLink(res.data.group.id);
        setStudent(res.data);
      } else {
        setStudent(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Talaba ma'lumotlarini olishda xatolik!");
    }
  };

  // // Sertifikatlarni olish
  const fetchCertificatesForDebts = async (studentId, list) => {
    if (!Array.isArray(list) || list.length === 0) {
      setCertsBySubjectId({});
      return;
    }

    const requests = list.map(async (s) => {
      const subjectId = s?.id;
      if (!subjectId) return [null, null];

      try {
        const res = await ApiCall(
          `/api/v1/certificate/${studentId}/${subjectId}`,
          "GET"
        );
        if (!res.error && res.data) {
          const cert = res.data;
          const sid = cert.studentSubject?.id || subjectId;
          return [
            sid,
            {
              ...cert,
              ball: cert.ball ? parseFloat(cert.ball) : null,
            },
          ];
        }

        return [subjectId, null];
      } catch (err) {
        console.error(`❌ Sertifikat olishda xatolik (fan ${subjectId}):`, err);
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

  // Qarzdorliklarni olish
  const fetchDebts = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/student-subject/debt/${id}`,
        "GET"
      );

      if (response && Array.isArray(response.data)) {
        let data = response.data;

        setDebts(data);
        await fetchCertificatesForDebts(id, data);
      } else {
        setDebts([]);
        setCertsBySubjectId({});
      }
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("Ma'lumotlarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Fanlarni olish va modal ochish
  const fetchSubjects = async (id) => {
    try {
      const res = await ApiCall(`/api/v1/student/student-info/${id}`, "GET");
      if (res && Array.isArray(res.data)) {
        console.log(res.data);
        setSubjects(res.data);
        setIsSubjectsModalOpen(true);
        // console.log(res.data);
      } else {
        setSubjects([]);
        toast.info("Fanlar topilmadi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Fanlarni olishda xatolik!");
    }
  };

  useEffect(() => {
    fetchDebts();
    fetchStudent();
    fetchStudentForModal();
  }, [id]);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
    setAmount("");
  };

  // Ball modali
  const openBallModal = (debt) => {
    setSelectedDebtForBall(debt);

    // Если сертификат уже есть, подтаскиваем его
    const existingCert = certsBySubjectId[debt.id];
    if (existingCert) {
      setNewBall(existingCert.ball || "");
    } else {
      setNewBall("");
    }

    setIsBallModalOpen(true);
  };
  const closeBallModal = () => {
    setIsBallModalOpen(false);
    setSelectedDebtForBall(null);
    setNewBall("");
  };
  const handleBallUpdate = async () => {
    if (!selectedDebtForBall || newBall === "") {
      toast.error("Iltimos, ball kiriting!");
      return;
    }
    try {
      const studentId = selectedDebtForBall.student.id;
      const subjectId = selectedDebtForBall.id;
      const finalScore = parseFloat(newBall);

      const existingCert = certsBySubjectId[subjectId];

      let response;
      if (existingCert && existingCert.id) {
        // 🔄 Sertifikat bor → PUT orqali faqat ballni yangilaymiz
        response = await ApiCall(
          `/api/v1/certificate/${existingCert.id}/ball/${finalScore}`,
          "PUT"
        );
      } else {
        // 🆕 Sertifikat yo‘q → yangi POST qilamiz
        response = await ApiCall(
          `/api/v1/certificate/${studentId}/${subjectId}/${finalScore}`,
          "POST"
        );
      }

      if (!response.error) {
        toast.success("Ball muvaffaqiyatli yangilandi!");
        fetchDebts();
        closeBallModal();
      } else {
        toast.error("Ball yangilashda xatolik!");
      }
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("Ballni yangilash jarayonida xatolik yuz berdi!");
    }
  };

  return (
    <div className="min-h-screen p-1">
      <ToastContainer position="top-right" autoClose={3000} />
      <Breadcrumbs
        items={[
          { label: "Guruhlar", to: "/superadmin/groups" },
          { label: "Talabalar", to: `/superadmin/groups/${groupIdLink}` },
        ]}
      />

      {/* Sarlavha */}
      <div className="mb-6 flex justify-between rounded-lg bg-white p-4 shadow">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">
            Talaba Qarzdorliklari
          </h1>
          <p className="mt-1 text-gray-600">
            {student?.fullName
              ? `${student.fullName} - ${student.groupName}`
              : "Talaba ma'lumotlari"}
          </p>
        </div>
        <div>
          <button
            onClick={() => fetchSubjects(student?.studentIdNumber)}
            className="mt-3 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
          >
            Yangilash
          </button>
        </div>
      </div>

      {/* === FANLAR MODALI === */}
      {isSubjectsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-5xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Fanlarni tanlash
            </h2>

            {/* 🔎 Qidiruv input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Fan nomidan qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>

            <div className="max-h-[70vh] overflow-x-auto overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2"></th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      №
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Fan nomi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Turi
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Nazorat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Semestr
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">
                      Kredit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {subjects
                    .filter(
                      (s) =>
                        s.semester?.code <= (student?.semester || 0) &&
                        s.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((s, index) => {
                      const uniqueKey = `${s.id}-${s.semester?.code}`;
                      return (
                        <tr key={uniqueKey} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-center">
                            <input
                              type="radio"
                              name="subject"
                              checked={selectedSubject === uniqueKey}
                              onChange={() => setSelectedSubject(uniqueKey)}
                            />
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {s.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {s.subjectType?.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {s.examFinish?.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {s.semester?.name}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {s.credit}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setIsSubjectsModalOpen(false)}
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveSubject}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === QARZDORLIKLAR JADVALI === */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
        </div>
      ) : debts.length === 0 ? (
        <div className="rounded-lg bg-white p-6 text-center shadow">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Qarzdorlik topilmadi
          </h3>
          <p className="mt-2 text-gray-500">
            Talabaning hozircha qarzdorliklari mavjud emas.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            {/* Qarzdorliklar jadvali */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Fan nomi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Turi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Nazorat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Semestr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kredit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    To'lov
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ball
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {debts
                  .filter(
                    (debt) =>
                      !debt.passed &&
                      debt.semesterCode <= (student?.semester || 0)
                  )
                  .map((debt, index) => (
                    <tr key={debt.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {debt.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {debt.subjectTypeName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {debt.examFinishName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {debt.semesterName}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {debt.credit}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {debt.amount && debt.amount > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {debt.amount} so'm
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            To'lanmagan
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        {certsBySubjectId[debt.id] ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              certsBySubjectId[debt.id].ball < 59
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {certsBySubjectId[debt.id].ball}/100
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openModal(debt)}
                            className="border-transparent inline-flex items-center rounded-md border bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Ruhsat berish
                          </button>

                          {debt.amount > 0 && (
                            <>
                              <button
                                onClick={() => openBallModal(debt)}
                                className="border-transparent inline-flex items-center rounded-md border bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              >
                                Ball
                              </button>
                              <button
                                onClick={() => openEditPaymentModal(debt)}
                                className="border-transparent inline-flex items-center rounded-md border bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                              >
                                <MdCreate className="mr-1 h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {isEditPaymentModalOpen && (
        <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              To‘lovni tahrirlash
            </h2>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Summa (so‘m)
              </label>
              <input
                type="number"
                placeholder="To‘lov summasini kiriting"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeEditPaymentModal}
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleEditPaymentUpdate}
                className="rounded bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === TO'LOV MODALI === */}
      {isModalOpen && (
        <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              To'lovni kiritish
            </h2>

            {/* 1. Select из getModalData */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fan tanlash
              </label>
              <select
                value={selectedCurriculumSubject}
                onChange={(e) => setSelectedCurriculumSubject(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Fan tanlang...</option>
                {Array.isArray(getModalData) &&
                  getModalData.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      className={
                        item.subject?.name === highlightSubjectName
                          ? "bg-yellow-100 font-semibold"
                          : ""
                      }
                    >
                      {item.subject?.name}
                      {curriculumModalData?.[item.id] !== undefined
                        ? ` (${curriculumModalData[item.id]} ta mavzu)`
                        : "(0 ta mavzu)"}
                    </option>
                  ))}
              </select>
            </div>

            {/* 2. Select чисел */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mavzu soni (0–35)
              </label>
              <select
                value={selectedLessons}
                onChange={(e) => setSelectedLessons(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Qiymat tanlang...</option>
                {Array.from({ length: 36 / 5 + 1 }, (_, i) => i * 5).map(
                  (val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 3. Старый input */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Summa (so'm)
              </label>
              <input
                type="number"
                placeholder="To'lov summasini kiriting"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Кнопки */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleUpdate}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === BALL MODALI === */}
      {isBallModalOpen && (
        <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Ballni tahrirlash
            </h2>
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Talaba:</span>{" "}
                {selectedDebtForBall?.student?.fullName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Fan:</span>{" "}
                {selectedDebtForBall?.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Joriy ball:</span>{" "}
                {selectedDebtForBall?.ball || 0}/100
              </p>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yangi ball (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0-100 oralig'ida ball kiriting"
                value={newBall}
                onChange={(e) => setNewBall(e.target.value)}
                className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeBallModal}
                className="rounded bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleBallUpdate}
                className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Debts;
