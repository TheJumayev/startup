import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";

const DebtsTable = () => {
  const [data, setData] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    items: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDebts = async (page = 0, size = 20) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student-subject/debts?page=${page}&size=${size}`,
        "GET"
      );
      console.log(response);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching debts:", error);
      setData({ ...data, items: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < data.totalPages) {
      fetchDebts(newPage, data.size);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-6 text-center shadow">
        <p className="text-gray-500">Qarzdor fanlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold text-gray-800">
        Qarzdor Talabalar Fanlari
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "№",
                "Talaba",
                "Guruh",
                "Fan nomi",
                "Turi",
                "Nazorat",
                "Semestr",
                "Kredit",
                "Akademik yuk",
                "O'tganmi",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-600"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.items.map((debt, index) => (
              <tr key={debt.id}>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {data.page * data.size + index + 1}
                </td>
                <td className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700">
                  <img
                    src={debt.student?.image}
                    alt={debt.student?.fullName}
                    className="h-8 w-8 rounded-full border"
                  />
                  <span>{debt.student?.fullName}</span>
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.student?.groupName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.name || "Noma’lum"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.subjectTypeName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.examFinishName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.semesterName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.credit}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {debt.totalAcload}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      debt.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {debt.passed ? "O‘tgan" : "O‘tolmagan"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => handlePageChange(data.page - 1)}
          disabled={data.page === 0}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Oldingi
        </button>
        <span className="text-sm text-gray-600">
          Sahifa {data.page + 1} / {data.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(data.page + 1)}
          disabled={data.page >= data.totalPages - 1}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm disabled:opacity-50"
        >
          Keyingi
        </button>
      </div>
    </div>
  );
};

export default DebtsTable;
