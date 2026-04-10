import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Breadcrumbs from "views/BackLink/BackButton";

const DebtsTable = () => {
  const [data, setData] = useState({
    items: [],
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  // Talabalarni guruhlash funksiyasi
  const groupByStudent = (debts) => {
    const grouped = {};
    debts.forEach((debt) => {
      const studentId = debt.student?.id;
      if (!grouped[studentId]) {
        grouped[studentId] = {
          student: debt.student,
          debts: [],
          totalDebts: 0,
          totalCredits: 0,
        };
      }
      grouped[studentId].debts.push(debt);
      grouped[studentId].totalDebts += 1;
      grouped[studentId].totalCredits += debt.credit || 0;
    });
    return Object.values(grouped);
  };

  // Saralash funksiyasi
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Saralangan ma'lumotlarni olish
  const getSortedData = (studentGroups) => {
    if (!sortConfig.key) return studentGroups;

    return [...studentGroups].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  };

  // Filtrlash funksiyasi
  const getFilteredData = (studentGroups) => {
    if (!searchTerm) return studentGroups;

    const term = searchTerm.toLowerCase();
    return studentGroups.filter(
      (group) =>
        group.student?.fullName?.toLowerCase().includes(term) ||
        group.student?.groupName?.toLowerCase().includes(term)
    );
  };

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await ApiCall(`/api/v1/student-subject/debts`, "GET");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
      setData({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  // Modalni yopish funksiyasi
  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  // Modal tashqarisini bosganda yopish
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Student guruhlarini olish
  const studentGroups = groupByStudent(data.items || []);
  const filteredStudents = getFilteredData(studentGroups);
  const sortedStudents = getSortedData(filteredStudents);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="border-t-transparent h-12 w-12 animate-spin rounded-full border-4 border-blue-500"></div>
        <span className="mt-4 text-lg font-medium text-gray-600">
          Ma'lumotlar yuklanmoqda...
        </span>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
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
        </div>
        <h3 className="text-xl font-semibold text-gray-700">
          Qarzdor fanlar topilmadi
        </h3>
        <p className="mt-2 text-gray-500">
          Hech qanday talaba qarzdor fanlarga ega emas
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumbs />
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Qarzdor Talabalar Fanlari
          </h2>

          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Talaba yoki guruh nomi boʻyicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-64"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: "index", label: "№", sortable: false },
                  { key: "student", label: "Talaba", sortable: true },
                  { key: "groupName", label: "Guruh", sortable: true },
                  {
                    key: "totalDebts",
                    label: "Qarzdor fanlar",
                    sortable: true,
                  },
                  { key: "totalCredits", label: "Jami kredit", sortable: true },
                ].map(({ key, label, sortable }) => (
                  <th
                    key={key}
                    onClick={() => sortable && handleSort(key)}
                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 ${
                      sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      {label}
                      {sortable && (
                        <svg
                          className={`ml-1 h-4 w-4 ${
                            sortConfig.key === key
                              ? "text-blue-500"
                              : "text-gray-300"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {sortConfig.key === key &&
                          sortConfig.direction === "ascending" ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          )}
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedStudents.map((studentData, index) => (
                <tr
                  key={studentData.student.id}
                  onClick={() => {
                    setSelectedStudent(studentData);
                    setShowModal(true);
                  }}
                  className="cursor-pointer transition-colors duration-150 hover:bg-blue-50"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                    {index + 1}
                  </td>
                  <td className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700">
                    <img
                      src={studentData.student?.image || "/default-avatar.png"}
                      alt={studentData.student?.fullName}
                      className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <span className="font-medium">
                      {studentData.student?.fullName}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {studentData.student?.groupName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      {studentData.totalDebts} ta fan
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                    {studentData.totalCredits} kredit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedStudent && (
        <div
          className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="w-full max-w-4xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedStudent.student.fullName} — Qarzdor fanlari
              </h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      №
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Fan nomi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Semestr
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Kredit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                      Holati
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedStudent.debts.map((debt, index) => (
                    <tr key={debt.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-700">
                        {index + 1}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        {debt.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {debt.semesterName}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                        {debt.credit}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {debt.passed ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            O'tgan
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                            O'tolmagan
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Yopish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtsTable;
