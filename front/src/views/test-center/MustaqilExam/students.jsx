import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall from "../../../config";
import {
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

function SuperadminMustaqilExamStudents() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState(null);
  const [ballValue, setBallValue] = useState(0);

  const exportToExcel = () => {
    if (!rows || rows.length === 0) {
      alert("Export qilish uchun ma'lumot yo'q");
      return;
    }

    const data = rows.map((row, index) => ({
      "№": index + 1,
      Talaba: row?.student?.fullName || "",
      Guruh: row.group || "",
      Holat: row.testStatus || "",
      Ball: row.ball ?? "",
      "Mavzular soni": row.scores ?? 0,
      Ruxsat: row.examPermission ? "Ha" : "Yo'q",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Talabalar");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, `Mustaqil_Imtihon_${exam?.subjectName || "Exam"}.xlsx`);
  };

  useEffect(() => {
    if (!id) return;

    const fetchExam = async () => {
      try {
        const res = await ApiCall(`/api/v1/mustaqil-exam/${id}`, "GET");
        setExam(res.data);
      } catch (e) {
        console.error("Imtihon ma'lumotini olishda xatolik", e);
      }
    };

    fetchExam();
  }, [id]);

  const saveBall = async () => {
    if (!selectedStudent) return;

    if (ballValue < 0 || ballValue > 25) {
      alert("Ball 0 dan 25 gacha bo'lishi kerak");
      return;
    }

    try {
      setSaving(true);
      await ApiCall(
        `/api/v1/mustaqil-exam-student/ball/${selectedStudent.finalExamStudentId}/${ballValue}`,
        "PUT"
      );

      setRows((prev) =>
        prev.map((r) =>
          r.finalExamStudentId === selectedStudent.finalExamStudentId
            ? { ...r, ball: ballValue }
            : r
        )
      );

      setOpenModal(false);
      setSelectedStudent(null);
      setBallValue(0);
    } catch (e) {
      console.error(e);
      alert("Ball saqlashda xatolik!");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Imtihon ID topilmadi");
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await ApiCall(
          `/api/v1/mustaqil-exam-student/permission/${id}`,
          "PUT"
        );

        setRows(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setError("Talabalar holatini olishda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Kirgan":
        return "bg-green-100 text-green-800";
      case "Kirmagan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Orqaga
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-green-700"
          >
            📊 Excel yuklab olish
          </button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📘 Mustaqil Imtihon - Talabalar Holati
            </h1>
            {exam && (
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  <AcademicCapIcon className="h-4 w-4" />
                  {exam.subjectName || "Imtihon"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                  <ClockIcon className="h-4 w-4" />
                  {exam.isAmaliy ? "Amaliy" : "Test"}
                </span>
              </div>
            )}
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="grid grid-cols-2 gap-4 text-center md:flex md:gap-6">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {rows.length}
                </div>
                <div className="text-sm text-gray-600">Jami talabalar</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {rows.filter((r) => r.examPermission).length}
                </div>
                <div className="text-sm text-gray-600">Ruxsat berilgan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-white shadow">
          <div className="text-center">
            <div className="border-r-transparent inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600"></div>
            <p className="mt-4 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-2xl bg-red-50 p-8 text-center shadow">
          <XCircleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-red-800">
            Xatolik yuz berdi
          </h3>
          <p className="mt-2 text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* Table Section */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    №
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Talaba
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Guruh
                  </th>
                  <th className="px6 py-4 text-left text-sm font-semibold text-white">
                    Holat
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Baho
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Mavzular
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Ruxsat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="mx-auto max-w-md">
                        <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                          Ma'lumot topilmadi
                        </h3>
                        <p className="mt-2 text-gray-600">
                          Ushbu imtihonga birorta talaba qo'shilmagan
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, index) => (
                    <tr key={index} className="transition hover:bg-blue-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <UserIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                if (!row.examPermission) return;
                                if (exam?.isAmaliy) return; // 🔒 AMALIY BO'LSA O'TMAYDI

                                navigate(
                                  `/test-center/mustaqi-exam/student/test-view/${row.finalExamStudentId}`
                                );
                              }}
                              className={`text-left font-medium ${
                                row.examPermission
                                  ? "text-blue-600 hover:text-blue-800 hover:underline"
                                  : "cursor-not-allowed text-gray-500"
                              }`}
                            >
                              {row?.student?.fullName}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                          {row.group}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(
                            row.testStatus
                          )}`}
                        >
                          {row.testStatus === "Kirgan" && (
                            <CheckCircleIcon className="h-4 w-4" />
                          )}
                          {row.testStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {row.ball !== undefined && row.ball !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {row.ball}
                            </span>
                            <span className="text-sm text-gray-500">/25</span>
                            {exam?.isAmaliy && (
                              <button
                                onClick={() => {
                                  setSelectedStudent(row);
                                  setBallValue(row.ball ?? 0);
                                  setOpenModal(true);
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ) : exam?.isAmaliy ? (
                          <button
                            onClick={() => {
                              if (!row.examPermission) {
                                toast.error("Mavzulari to'liq o'qilmagan!");
                                return; // 🔴 shu yerda to‘xtaydi
                              }

                              setSelectedStudent(row);
                              setBallValue(0);
                              setOpenModal(true);
                            }}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow transition
    ${
      row.examPermission
        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        : "cursor-not-allowed bg-gray-400"
    }`}
                          >
                            Ball berish
                          </button>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {row.scores || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {row.examPermission ? (
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700">
                              Ruxsat berilgan
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircleIcon className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-700">
                              Ruxsat yo'q
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ball Modal */}
      {openModal && selectedStudent && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="animate-scaleIn w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Talabaga ball berish
              </h3>
              <p className="mt-2 text-gray-600">
                {selectedStudent?.student?.fullName} - {selectedStudent.group}
              </p>
            </div>

            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-gray-700">
                Ball (0 - 25 oralig'ida qo'yiladi)
              </label>
              <div className="mb-8">
                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ballValue}
                    onChange={(e) => {
                      let val = e.target.value;

                      // 🔒 faqat raqam (0–9)
                      if (!/^[0-9][0-9]?$/.test(val) && val !== "") return;

                      const num = Number(val);

                      // 🔒 25 dan oshmasin
                      if (num > 25) return;

                      setBallValue(num);
                    }}
                    placeholder="1–25"
                    className="w-32 rounded-xl border-2 border-blue-500 px-4 py-3 text-center text-3xl font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedStudent(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Bekor qilish
              </button>
              <button
                onClick={saveBall}
                disabled={saving}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-medium text-white shadow transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="border-t-transparent h-4 w-4 animate-spin rounded-full border-2 border-white"></div>
                    Saqlanmoqda...
                  </span>
                ) : (
                  "Saqlash"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}

export default SuperadminMustaqilExamStudents;
