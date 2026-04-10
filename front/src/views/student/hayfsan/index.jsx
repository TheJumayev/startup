import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import {
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  AcademicCapIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

const StudentExplanations = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [explanations, setExplanations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }

    fetchStudentAccount(token);
  }, []);

  const fetchStudentAccount = async (token) => {
    try {
      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }

      if (res?.data?.id) {
        setStudentInfo(res.data);
        setStudentId(res.data.id);
        await fetchExplanations(res.data.id);
      }
    } catch (err) {
      console.error("Talaba ma'lumotini olishda xato:", err);
      setError("Talaba ma'lumotlarini yuklashda xatolik yuz berdi");
      navigate("/student/login");
    }
  };

  const fetchExplanations = async (id) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/student-explanation/student/${id}`,
        "GET"
      );
      console.log("Student explanations:", res);
      setExplanations(res);
      setError(null);
    } catch (err) {
      console.error("Tushuntirish xatlarini olishda xato:", err);
      setError("Tushuntirish xatlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    if (!fileId) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Server error");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Faylni yuklab olishda xato:", error);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Noma'lum";
    try {
      return new Date(dateTimeString).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateTimeString;
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 1:
        return {
          label: "Kutilmoqda",
          color: "bg-yellow-100 text-yellow-800",
          icon: <ClockIcon className="h-4 w-4" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          description: "Ushbu tushuntirish xati tekshirilmoqda",
        };
      case 2:
        return {
          label: "Tasdiqlangan",
          color: "bg-green-100 text-green-800",
          icon: <CheckCircleIcon className="h-4 w-4" />,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
          description: "Ushbu tushuntirish xati tasdiqlangan",
        };
      case 3:
        return {
          label: "Rad etilgan",
          color: "bg-red-100 text-red-800",
          icon: <XCircleIcon className="h-4 w-4" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          description: "Ushbu tushuntirish xati rad etilgan",
        };
      default:
        return {
          label: "Noma'lum",
          color: "bg-gray-100 text-gray-800",
          icon: <InformationCircleIcon className="h-4 w-4" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          description: "Holat noma'lum",
        };
    }
  };

  const getFilteredExplanations = () => {
    if (filter === "all") return explanations;
    if (filter === "pending") {
      return explanations.filter((exp) => exp.status === 1);
    }
    if (filter === "approved") {
      return explanations.filter((exp) => exp.status === 2);
    }
    if (filter === "rejected") {
      return explanations.filter((exp) => exp.status === 3);
    }
    return explanations;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
            <div className="border-t-transparent absolute inset-0 animate-spin rounded-full border-4 border-blue-600"></div>
          </div>
          <p className="text-lg font-medium text-gray-700">Yuklanmoqda...</p>
          <p className="text-sm text-gray-500">
            Tushuntirish xatlari yuklanmoqda
          </p>
        </div>
      </div>
    );
  }

  const filteredExplanations = getFilteredExplanations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Student Info Card */}
        {studentInfo && (
          <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="absolute -bottom-12 left-8">
                <div className="relative">
                  <img
                    src={
                      studentInfo.image ||
                      "https://via.placeholder.com/96?text=Student"
                    }
                    alt={studentInfo.fullName}
                    className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/96?text=No+Image";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="px-8 pb-6 pt-16">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {studentInfo.fullName}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                      <AcademicCapIcon className="h-4 w-4" />
                      {studentInfo.groupName}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                      <UserIcon className="h-4 w-4" />
                      {studentInfo.departmentName}
                    </span>
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-600">
                      Jami tushuntirish xatlari
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {explanations.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header and Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Tushuntirish xatlari
          </h2>


        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            <p className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" />
              {error}
            </p>
          </div>
        )}

        {/* Explanations List */}
        {filteredExplanations.length > 0 ? (
          <div className="space-y-4">
            {filteredExplanations.map((explanation) => {
              const statusInfo = getStatusInfo(explanation.status);

              return (
                <div
                  key={explanation.id}
                  className={`overflow-hidden rounded-xl border-l-4 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
                    explanation.status === 1
                      ? "border-yellow-500"
                      : explanation.status === 2
                      ? "border-green-500"
                      : explanation.status === 3
                      ? "border-red-500"
                      : "border-gray-500"
                  }`}
                >
                  <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          Tushuntirish xati
                        </h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Left Column - Main Content */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            Yuborilgan vaqt:
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatDateTime(explanation.createdAt)}
                          </span>
                        </div>

                        <div className={`rounded-lg p-3 ${statusInfo.bgColor}`}>
                          <p className={`text-sm ${statusInfo.textColor}`}>
                            {statusInfo.description}
                          </p>
                        </div>
                      </div>

                      {/* Right Column - File Download */}
                      <div className="space-y-3">
                        {explanation.file && (
                          <div className="rounded-lg bg-gray-50 p-4">
                            <p className="mb-3 text-sm font-medium text-gray-700">
                              Biriktirilgan fayl:
                            </p>
                            <button
                              onClick={() =>
                                handleDownload(
                                  explanation.file.id,
                                  explanation.file.name
                                )
                              }
                              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg"
                            >
                              <DocumentArrowDownIcon className="h-5 w-5" />
                              {explanation.file.name || "Faylni yuklab olish"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Timeline/Info */}
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                explanation.status === 1
                                  ? "bg-yellow-500"
                                  : explanation.status === 2
                                  ? "bg-green-500"
                                  : explanation.status === 3
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span className="text-xs text-gray-600">
                              {explanation.status === 1 &&
                                "Tushuntirish xatingiz tekshirilmoqda"}
                              {explanation.status === 2 &&
                                "Tushuntirish xatingiz tasdiqlandi"}
                              {explanation.status === 3 &&
                                "Tushuntirish xatingiz rad etildi"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            ID: {explanation.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white p-12 text-center shadow-xl">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Tushuntirish xatlari mavjud emas
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {filter === "all"
                ? "Sizda hali hech qanday tushuntirish xati mavjud emas."
                : filter === "pending"
                ? "Sizda kutilayotgan tushuntirish xatlari mavjud emas."
                : filter === "approved"
                ? "Sizda tasdiqlangan tushuntirish xatlari mavjud emas."
                : "Sizda rad etilgan tushuntirish xatlari mavjud emas."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExplanations;
