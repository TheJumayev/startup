import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import ApiCall from "../../../config";

function StudentHistory() {
  const navigate = useNavigate();
  const { id } = useParams(); // URL dan studentId olib keladi
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(null); // null = barchasi

  const statusOptions = [
    { id: null, label: "Barchasi" },
    { id: 0, label: "Ko'rib chiqilmoqda" },
    { id: 1, label: "Tasdiqlangan" },
    { id: 2, label: "Rad etilgan" },
  ];
  const qrUrl = `https://edu.bxu.uz/appeals/${id}`;

  useEffect(() => {
    if (id) {
      getStudentAppeals(id);
    }
  }, [id]);

  const getStudentAppeals = async (studentId) => {
    try {
      const response = await ApiCall(
        `/api/v1/appeal/student/${studentId}`,
        "GET",
        null
      );
      setAppeals(response.data || []);
    } catch (error) {
      console.error("Student appeals fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppeals =
    statusFilter === null
      ? appeals
      : appeals.filter((a) => a.status === statusFilter);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Ma’lumotlar yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 border-b pb-2 text-2xl font-bold text-gray-800">
        Talaba arizalari tarixi
      </h1>

      {/* 🔎 Filter tugmalari */}
      <div className="mb-6 flex flex-wrap gap-2">
        {statusOptions.map((s) => (
          <button
            key={s.id ?? "all"}
            onClick={() => setStatusFilter(s.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
              ${
                statusFilter === s.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filteredAppeals.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <p className="text-lg text-gray-500">Arizalar topilmadi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppeals.map((a) => (
            <div
              key={a.id}
              className="overflow-hidden rounded-xl border-l-4 border-blue-500 bg-white shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-gray-100 p-5">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                             ${
                               a.status === 0
                                 ? "bg-yellow-100 text-yellow-800"
                                 : a.status === 1
                                 ? "bg-green-100 text-green-800"
                                 : "bg-red-100 text-red-800"
                             }`}
                >
                  {a.status === 0
                    ? "Ko'rib chiqilmoqda"
                    : a.status === 1
                    ? "Tasdiqlangan"
                    : "Rad etilgan"}
                </span>

                <div className="mt-2 w-40 text-sm text-gray-500 md:mt-0">
                  {a.text1}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 text-center">
                  <h2 className="text-xl font-bold text-blue-700">A R I Z A</h2>
                </div>

                <div className="mt-4 whitespace-pre-line  p-4 text-gray-700">
                  {a.text2}
                </div>

                <div className="mt-24 flex flex-col items-start justify-between gap-2 text-sm text-gray-600 sm:flex-row sm:items-center">
                  <p>
                    Sana: {new Date(a.createdAt).toLocaleDateString("uz-UZ")}
                  </p>
                  <span className="cursor-pointer font-medium">
                    {a.student?.fullName}
                  </span>
                </div>

                <div className="mt-4 flex w-full justify-between">
                  <div className="w-3/4">
                    {a.responseText && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                        <h3 className="mb-2 font-semibold text-blue-800">
                          Admin javobi:
                        </h3>
                        <p className="text-blue-700">{a.responseText}</p>
                      </div>
                    )}
                  </div>

                  <div className="relative inline-block">
                    {/* QR Code */}
                    <QRCodeCanvas
                      value={`https://edu.bxu.uz/appeals/${a.id}`}
                      size={180} // kattaroq qildik
                      level="H" // ✅ yuqori correction level
                      includeMargin={true}
                    />

                    {/* Logo (overlay markazda oq fon bilan) */}
                    {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ">
                                 <img
                                   src={logo}
                                   alt="Logo"
                                   className="h-14 w-14 rounded-full object-contain"
                                 />
                               </div> */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentHistory;
