import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import ApiCall from "../../../config";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

function MustaqilExamPage() {
  const [exams, setExams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const userId = JSON.parse(localStorage.getItem("user"))?.id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    curriculumSubjectId: null,
    groupId: null,
    attempts: 1,
    status: true,
    startTime: "",
    endTime: "",
    isAmaliy: false,
    userId,
  });

  /* ================= FETCH EXAMS ================= */
  const fetchExams = async () => {
    try {
      const res = await ApiCall("/api/v1/mustaqil-exam", "GET");
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Imtihonlarni yuklashda xatolik:", error);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  /* ================= OPEN CREATE ================= */
  const openCreate = () => {
    setEditExam(null);
    setForm({
      name: "",
      curriculumSubjectId: null,
      groupId: null,
      attempts: 1,
      status: true,
      startTime: "",
      endTime: "",
      isAmaliy: false,
      userId,
    });
    setSubjects([]);
    setOpen(true);
  };

  /* ================= OPEN EDIT ================= */
  const openEdit = (exam) => {
    setEditExam(exam);
    setForm({
      name: exam.name,
      curriculumSubjectId: exam.curriculumSubject?.id,
      groupId: exam.group?.id,
      attempts: exam.attempts,
      status: exam.status,
      startTime:
        exam.startTime?.split("T")[0] +
        "T" +
        exam.startTime?.split("T")[1]?.slice(0, 5),
      endTime:
        exam.endTime?.split("T")[0] +
        "T" +
        exam.endTime?.split("T")[1]?.slice(0, 5),
      isAmaliy: exam.isAmaliy,
      userId,
    });
    setOpen(true);
  };

  /* ================= LOAD GROUPS ================= */
  useEffect(() => {
    if (!open) return;
    ApiCall("/api/v1/groups", "GET").then((res) =>
      setGroups(Array.isArray(res.data) ? res.data : [])
    );
  }, [open]);

  /* ================= GROUP CHANGE ================= */
  const handleGroupChange = async (group) => {
    setForm({ ...form, groupId: group.value });
    const res = await ApiCall(
      `/api/v1/curriculum-subject/filter?curriculumHemisId=${group.curriculumHemisId}&size=200`,
      "GET"
    );
    setSubjects(res.data?.content || []);
  };

  /* ================= SAVE ================= */
  const handleSubmit = async () => {
    if (!form.groupId || !form.curriculumSubjectId) {
      alert("Guruh va fan tanlanishi shart");
      return;
    }

    setLoading(true);
    try {
      if (editExam) {
        await ApiCall(`/api/v1/mustaqil-exam/${editExam.id}`, "PUT", form);
      } else {
        await ApiCall("/api/v1/mustaqil-exam", "POST", form);
      }
      setOpen(false);
      fetchExams();
    } catch (e) {
      alert(e?.response?.data || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan o'chirmoqchimisiz?")) return;
    try {
      await ApiCall(`/api/v1/mustaqil-exam/${id}`, "DELETE");
      fetchExams();
    } catch (error) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTimeOnly = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter exams based on search term
  const filteredExams = exams.filter(
    (exam) =>
      exam.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.group?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.curriculumSubject?.subject?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Get status badge color
  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          <CheckCircleIcon className="h-3 w-3" />
          Faol
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
        <XCircleIcon className="h-3 w-3" />
        Nofaol
      </span>
    );
  };

  // Get exam type badge
  const getTypeBadge = (isAmaliy) => {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
          isAmaliy
            ? "bg-purple-100 text-purple-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        <AcademicCapIcon className="h-3 w-3" />
        {isAmaliy ? "Amaliy" : "Test"}
      </span>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              📚 Mustaqil Imtihonlar
            </h1>
            <p className="mt-1 text-gray-600">
              Barcha mustaqil imtihonlarni boshqarish paneli
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-blue-800"
          >
            <PlusIcon className="h-5 w-5" />
            Yangi Imtihon
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Jami Imtihonlar
              </p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Faol Imtihonlar
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {exams.filter((e) => e.status).length}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Amaliy Imtihonlar
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {exams.filter((e) => e.isAmaliy).length}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Imtihon, guruh yoki fan nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pl-12 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

      {/* Exams Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Imtihon Nomi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Guruh
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Fan
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Vaqti
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Urinish
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Holat / Turi
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">
                        Imtihonlar topilmadi
                      </h3>
                      <p className="mt-2 text-gray-600">
                        Hozircha birorta imtihon yaratilmagan
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="transition hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {exam.name}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4" />
                          {formatDateOnly(exam.startTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {exam.group?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {exam.curriculumSubject?.subject?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            {formatTimeOnly(exam.startTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-red-600" />
                          <span className="text-sm font-medium">
                            {formatTimeOnly(exam.endTime)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                          {exam.attempts}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(exam.status)}
                        {getTypeBadge(exam.isAmaliy)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/test-center/mustaqi-exam/students/${exam.id}`
                            )
                          }
                          className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-200"
                          title="Talabalarni ko'rish"
                        >
                          <UserGroupIcon className="h-4 w-4" />
                          Talabalar
                        </button>
                        <button
                          onClick={() => openEdit(exam)}
                          className="flex items-center gap-1 rounded-lg bg-yellow-100 px-3 py-2 text-sm font-medium text-yellow-700 transition hover:bg-yellow-200"
                          title="Tahrirlash"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
                          title="O'chirish"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {open && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="animate-scaleIn w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editExam ? "✏️ Imtihonni Tahrirlash" : "➕ Yangi Imtihon"}
                </h2>
                <p className="mt-1 text-gray-600">
                  Imtihon parametrlarini to'ldiring
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <XCircleIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Group Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Guruh *
                </label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isSearchable
                  placeholder="Guruh tanlang"
                  options={groups.map((g) => ({
                    label: g.name,
                    value: g.id,
                    curriculumHemisId: g.curriculum,
                  }))}
                  onChange={handleGroupChange}
                  value={
                    groups.find((g) => g.id === form.groupId)
                      ? {
                          label: groups.find((g) => g.id === form.groupId)
                            ?.name,
                          value: form.groupId,
                        }
                      : null
                  }
                />
              </div>

              {/* Subject Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fan *
                </label>
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isSearchable
                  placeholder="Fan tanlang"
                  options={subjects.map((item) => ({
                    label: `${item.subject.subject.name} (${item.subject.semesterName})`,
                    value: item.subject.id,
                    subjectName: item.subject.subject.name,
                  }))}
                  onChange={(s) =>
                    setForm({
                      ...form,
                      curriculumSubjectId: s.value,
                      name: s.subjectName,
                    })
                  }
                  value={
                    subjects.find(
                      (s) => s.subject.id === form.curriculumSubjectId
                    )
                      ? {
                          label: subjects.find(
                            (s) => s.subject.id === form.curriculumSubjectId
                          )?.subject?.subject?.name,
                          value: form.curriculumSubjectId,
                        }
                      : null
                  }
                />
              </div>

              {/* Exam Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Imtihon Nomi *
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Imtihon nomini kiriting"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Attempts */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Urinishlar Soni
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.attempts}
                  onChange={(e) =>
                    setForm({ ...form, attempts: e.target.value })
                  }
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Boshlanish Vaqti *
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm({ ...form, startTime: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tugash Vaqti *
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={form.endTime}
                      onChange={(e) =>
                        setForm({ ...form, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <span className="block font-medium text-gray-900">
                      Status
                    </span>
                    <span className="text-sm text-gray-600">
                      Imtihonni faollashtirish
                    </span>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={form.status}
                      onChange={() =>
                        setForm({ ...form, status: !form.status })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <span className="block font-medium text-gray-900">
                      Imtihon Turi
                    </span>
                    <span className="text-sm text-gray-600">
                      {form.isAmaliy ? "Amaliy" : "Test"} imtihon
                    </span>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={form.isAmaliy}
                      onChange={() =>
                        setForm({ ...form, isAmaliy: !form.isAmaliy })
                      }
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                disabled={loading}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !form.groupId || !form.curriculumSubjectId}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-medium text-white shadow transition hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : editExam ? (
                  "Saqlash"
                ) : (
                  "Yaratish"
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

        /* Custom select styles */
        .react-select-container .react-select__control {
          border-radius: 0.5rem;
          border-color: #d1d5db;
          min-height: 48px;
        }
        .react-select-container .react-select__control:hover {
          border-color: #3b82f6;
        }
        .react-select-container .react-select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        .react-select-container .react-select__menu {
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}

export default MustaqilExamPage;
