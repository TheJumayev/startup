import React, { useEffect, useState, useCallback } from "react";
import ApiCall from "../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

function CurriculumTable() {
  const [curriculums, setCurriculums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCurriculums = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `/api/v1/online-subject-lesson/2025-2026`;
      const response = await ApiCall(url, "GET");
      if (response?.data) {
        // Faqat active:true va atSemester:true bo'lganlarni olish
        const filtered = response.data.filter(
            (item) => item.active === true && item.atSemester === true
        );
        setCurriculums(filtered);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi.");
      setCurriculums([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurriculums();
  }, [fetchCurriculums]);

  // subject.name bo‘yicha filter
  const displayedCurriculums = curriculums.filter((c) =>
      c.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="min-h-screen p-4">
        <ToastContainer />
        <Breadcrumbs />

        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-700">
              O'quv Rejalar Ro'yxati
            </h1>
            <p className="mt-2 text-xl text-gray-700">
              Faqat faol va semestrda mavjud fanlar
            </p>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <input
                type="text"
                placeholder="Fan nomi bo‘yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 md:w-1/3"
            />
          </div>

          {/* Table */}
          {isLoading ? (
              <p className="text-center">Yuklanmoqda...</p>
          ) : displayedCurriculums.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                    {["№", "Fan kodi", "Fan nomi", "Bo'lim", "Kredit"].map(
                        (header) => (
                            <th
                                key={header}
                                className="px-1 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              {header}
                            </th>
                        )
                    )}
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {displayedCurriculums.map((curriculum, index) => (
                      <tr key={curriculum.id} className="hover:bg-gray-50">
                        <td className="px-1 py-2 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-1 py-2 text-sm font-medium text-gray-900">
                          {curriculum.subject?.code || "N/A"}
                        </td>
                        <td className="px-1 py-2 text-sm font-medium text-gray-900">
                          {curriculum.subject?.name || "N/A"}
                        </td>
                        <td className="px-1 py-2 text-sm text-gray-500">
                          {curriculum?.curriculum?.educationYearName || "N/A"}
                        </td>
                        <td className="px-1 py-2 text-sm text-gray-500">
                          {curriculum.credit || "N/A"}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          ) : (
              <p className="text-center text-gray-500">
                Hech qanday mos fan topilmadi.
              </p>
          )}
        </div>
      </div>
  );
}

export default CurriculumTable;
