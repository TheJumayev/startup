import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";

function Dekan() {
  const [dekanGroup, setDekanGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupRes = await ApiCall(
          `/api/v1/dekan/connect-group/${adminId}`,
          "GET"
        );
        setDekanGroup(groupRes.data || {});
      } catch (err) {
        console.error("❌ Guruhlarni olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [adminId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-r-transparent inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!dekanGroup || !dekanGroup.group) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
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
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            Dekan uchun guruh topilmadi
          </h2>
          <p className="mt-2 text-gray-600">
            Iltimos, ma'muriyat bilan bog'laning
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
          <h1 className="text-2xl font-bold md:text-3xl">
            Dekanga Biriktirilgan Guruhlar
          </h1>
          <p className="mt-2 opacity-90">
            Barcha biriktirilgan guruhlar ro'yxati
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-md">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {dekanGroup.group.length}
                </h2>
                <p className="text-sm text-gray-600">Jami guruhlar</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {new Set(dekanGroup.group.map((g) => g.departmentName)).size}
                </h2>
                <p className="text-sm text-gray-600">Fakultetlar</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-md">
            <div className="flex items-center">
              <div className="rounded-lg bg-purple-100 p-3">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {new Set(dekanGroup.group.map((g) => g.specialtyName)).size}
                </h2>
                <p className="text-sm text-gray-600">Yo'nalishlar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Groups Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow-md">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Guruhlar ro'yxati
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-sm font-medium uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-3">№</th>
                  <th className="px-6 py-3">Guruh nomi</th>
                  <th className="px-6 py-3">Fakultet</th>
                  <th className="px-6 py-3">Yo'nalish</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dekanGroup.group.length > 0 ? (
                  dekanGroup.group.map((g, index) => (
                    <tr
                      key={g.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-800">
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800">
                              <span className="font-semibold">
                                {g.name.substring(0, 2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {g.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {g.departmentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {g.specialtyName}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="mx-auto max-w-md">
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
                          Biriktirilgan guruh yo'q
                        </h3>
                        <p className="mt-2 text-gray-500">
                          Hozircha sizga biriktirilgan guruhlar mavjud emas.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dekan;
