import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdClose,
  MdArrowBack,
  MdPerson,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";

const GroupDetailModern = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    login: "",
    password: "",
    groupsId: groupId || "",
  });

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail();
      fetchStudentsByGroup();
    }
  }, [groupId]);

  // Xabarni 4 sekunddan keyin yashirish
  useEffect(() => {
    if (error || successMsg) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMsg("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMsg]);

  const fetchGroupDetail = async () => {
    try {
      setLoading(true);
      const response = await ApiCall(`/api/v1/groups/${groupId}`, "GET", null);
      if (response?.error) {
        setError("Guruh ma'lumotini yuklashda xatolik");
        return;
      }
      setGroup(response.data);
    } catch (err) {
      console.error("Error fetching group:", err);
      setError("Guruh ma'lumotini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsByGroup = async () => {
    try {
      const response = await ApiCall("/api/v1/students", "GET", null);
      if (response?.error) {
        setStudents([]);
        return;
      }
      const data = response.data || [];
      const filtered = Array.isArray(data)
        ? data.filter((s) => s.groupsId === groupId)
        : [];
      setStudents(filtered);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      login: "",
      password: "",
      groupsId: groupId || "",
    });
    setEditingId(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!formData.fullName.trim()) {
      setError("To'liq ism bo'sh bo'lishi mumkin emas");
      return;
    }
    if (!editingId && !formData.login.trim()) {
      setError("Login bo'sh bo'lishi mumkin emas");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // UPDATE — faqat o'zgargan fieldlar
        const updateData = {
          fullName: formData.fullName,
          groupsId: groupId,
        };
        const res = await ApiCall(`/api/v1/students/${editingId}`, "PUT", updateData);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Talabani yangilashda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Talaba muvaffaqiyatli yangilandi ✅");
      } else {
        // CREATE
        const createData = {
          fullName: formData.fullName,
          login: formData.login,
          password: formData.password || undefined,
          groupsId: groupId,
        };
        const res = await ApiCall("/api/v1/students", "POST", createData);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Talabani yaratishda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Talaba muvaffaqiyatli qo'shildi ✅");
      }

      resetForm();
      setShowForm(false);
      fetchStudentsByGroup();
    } catch (err) {
      console.error("Error saving student:", err);
      setError("Talabani saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      fullName: student.fullName || "",
      login: student.login || "",
      password: "",
      groupsId: groupId,
    });
    setEditingId(student.id);
    setShowPassword(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Talabani o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        setError("");
        const res = await ApiCall(`/api/v1/students/${id}`, "DELETE", null);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Talabani o'chirishda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Talaba o'chirildi ✅");
        fetchStudentsByGroup();
      } catch (err) {
        console.error("Error deleting student:", err);
        setError("Talabani o'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      (student.fullName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (student.login?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading && !group) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/superadmin/groups")}
        className="flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <MdArrowBack className="h-5 w-5" />
        Guruhlar ro'yxatiga qaytish
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 {group?.name || "Guruh"}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {group?.description || "Tavsif mavjud emas"}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              <MdPerson className="h-4 w-4" />
              {students.length} ta talaba
            </span>
            {group?.semesterName && (
              <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                📅 {group.semesterName}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          <MdAdd className="h-5 w-5" />
          Yangi talaba qo'shish
        </button>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
          {successMsg}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search Box */}
      {students.length > 0 && (
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Talabalarni qidirish (ism yoki login)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {/* ==================== MODAL ==================== */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MdClose className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Talabani tahrirlash" : "Yangi talaba qo'shish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* To'liq Ismi */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  To'liq ismi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: Ali Valiyev"
                />
              </div>

              {/* Login */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Login {!editingId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.login}
                  onChange={(e) =>
                    setFormData({ ...formData, login: e.target.value })
                  }
                  required={!editingId}
                  disabled={!!editingId}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    editingId
                      ? "cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-600"
                      : ""
                  }`}
                  placeholder="Masalan: ali123"
                />
                {editingId && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Login tahrirlash mumkin emas
                  </p>
                )}
              </div>

              {/* Parol — faqat yaratishda */}
              {!editingId && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Parol{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (bo'sh bo'lsa avtomatik yaratiladi)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Parol kiriting (ixtiyoriy)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? (
                        <MdVisibilityOff className="h-5 w-5" />
                      ) : (
                        <MdVisibility className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:opacity-50"
                >
                  {loading
                    ? "Saqlanmoqda..."
                    : editingId
                    ? "Yangilash"
                    : "Qo'shish"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EMPTY STATE ==================== */}
      {filteredStudents.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm
              ? "Talabalar topilmadi"
              : "Bu guruhda hali talabalar yo'q"}
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? "Boshqa kalit so'z bilan qidirib ko'ring"
              : "\"Yangi talaba qo'shish\" tugmasini bosing"}
          </p>
        </div>
      )}

      {/* ==================== TABLE ==================== */}
      {filteredStudents.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    To'liq ismi
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    Login
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                    Yaratilgan sana
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          {student.fullName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                            @{student.login}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        @{student.login}
                      </span>
                    </td>

                    <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                      {formatDate(student.createAt)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="Tahrirlash"
                        >
                          <MdEdit className="h-4 w-4" />
                          <span className="hidden lg:inline">Tahrirlash</span>
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                          title="O'chirish"
                        >
                          <MdDelete className="h-4 w-4" />
                          <span className="hidden lg:inline">O'chirish</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="border-t border-gray-200 px-6 py-3 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Jami: <span className="font-semibold">{filteredStudents.length}</span>{" "}
              ta talaba
              {searchTerm && ` ("${searchTerm}" bo'yicha filtrlangan)`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailModern;

