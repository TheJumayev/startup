import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Debts() {
  const { id } = useParams();
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);

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

  // Talaba ma'lumotlarini olish
  const fetchStudent = async () => {
    try {
      const res = await ApiCall(`/api/v1/student/byid/${id}`, "GET");
      if (res && res.data) {
        setStudent(res.data);
      } else {
        setStudent(null);
      }
    } catch (err) {
      console.error(err);
      toast.error("Talaba ma'lumotlarini olishda xatolik!");
    }
  };

  // Sertifikatlarni olish
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
          `/api/v1/certificate/${studentId}/${subjectId}/`,
          "GET"
        );
        if (!res.data) return [subjectId, null];
        return [subjectId, { ...res.data, ball: Number(res.data.ball) }];
      } catch (err) {
        console.error(`Sertifikat olishda xatolik (fan ${subjectId}):`, err);
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

  useEffect(() => {
    fetchDebts();
    fetchStudent();
  }, [id]);

  // To'lov modali
  const openModal = (debt) => {
    setSelectedDebt(debt);
    setAmount(debt.amount ? debt.amount : "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDebt(null);
    setAmount("");
  };

  const handleUpdate = async () => {
    if (!selectedDebt) return;
    try {
      const response = await ApiCall(
        `/api/v1/student-subject/payment/${selectedDebt.id}`,
        "PUT",
        { amount }
      );
      if (!response.error) {
        toast.success("Qarzdorlik muvaffaqiyatli to'landi");
        closeModal();
        fetchDebts();
      } else {
        toast.error("Yangilashda xatolik!");
      }
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("PUT so'rovida xatolik!");
    }
  };

  // Ball modali
  const openBallModal = (debt) => {
    setSelectedDebtForBall(debt);
    setNewBall(debt.ball || "");
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

      const response = await ApiCall(
        `/api/v1/certificate/${studentId}/${subjectId}/${finalScore}`,
        "POST"
      );

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
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sarlavha */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h1 className="text-2xl font-bold text-blue-600">
          Talaba Qarzdorliklari
        </h1>
        <p className="mt-1 text-gray-600">
          {student?.fullName
            ? `${student.fullName} - ${student.groupName}`
            : "Talaba ma'lumotlari"}
        </p>
      </div>

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
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {certsBySubjectId[debt.id].ball}/100
                          </span>
                        ) : debt.ball ? (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                            {debt.ball}/100
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
                            To'lov
                          </button>
                          {debt.amount > 0 && !certsBySubjectId[debt.id] && (
                            <button
                              onClick={() => openBallModal(debt)}
                              className="border-transparent inline-flex items-center rounded-md border bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                            >
                              Ball
                            </button>
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

      {/* To'lov modali */}
      {isModalOpen && (
        <div className="fixed inset-0 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              To'lovni kiritish
            </h2>
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
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleUpdate}
                className="border-transparent inline-flex items-center rounded-md border bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ball modali */}
      {isBallModalOpen && (
        <div className="fixed inset-0 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50">
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
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleBallUpdate}
                className="border-transparent inline-flex items-center rounded-md border bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
