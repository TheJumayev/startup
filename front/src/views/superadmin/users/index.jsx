import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdSearch,
  MdClose,
  MdPerson,
  MdVisibility,
  MdVisibilityOff,
  MdShield,
} from "react-icons/md";

// Rol ranglarini moslashtirish
const ROLE_COLORS = {
  ROLE_SUPERADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ROLE_ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ROLE_TEACHER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ROLE_REKTOR: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ROLE_STUDENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  ROLE_USER: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const ROLE_LABELS = {
  ROLE_SUPERADMIN: "Super Admin",
  ROLE_ADMIN: "Admin",
  ROLE_TEACHER: "O'qituvchi",
  ROLE_REKTOR: "Rektor",
  ROLE_STUDENT: "Talaba",
  ROLE_USER: "Foydalanuvchi",
};

const UsersModern = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    name: "",
    roleIds: [],
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/admin/users", "GET", null);
      if (response?.error) {
        setError("Foydalanuvchilarni yuklashda xatolik");
        setUsers([]);
        return;
      }
      const data = response.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
      setError("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await ApiCall("/api/v1/role", "GET", null);
      if (response?.error) {
        setRoles([]);
        return;
      }
      const data = response.data || [];
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setRoles([]);
    }
  };

  const resetForm = () => {
    setFormData({
      phone: "",
      password: "",
      name: "",
      roleIds: [],
    });
    setEditingId(null);
    setShowPassword(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!editingId && !formData.phone.trim()) {
      setError("Phone bo'sh bo'lishi mumkin emas");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // UPDATE
        const updateData = {};
        if (formData.name.trim()) updateData.name = formData.name;
        if (formData.password.trim()) updateData.password = formData.password;
        if (formData.roleIds.length > 0) updateData.roleIds = formData.roleIds;

        const res = await ApiCall(`/api/v1/admin/users/${editingId}`, "PUT", updateData);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Foydalanuvchini yangilashda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Foydalanuvchi muvaffaqiyatli yangilandi ✅");
      } else {
        // CREATE
        const createData = {
          phone: formData.phone,
        };
        if (formData.password.trim()) createData.password = formData.password;
        if (formData.name.trim()) createData.name = formData.name;
        if (formData.roleIds.length > 0) createData.roleIds = formData.roleIds;

        const res = await ApiCall("/api/v1/admin/users", "POST", createData);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Foydalanuvchini yaratishda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Foydalanuvchi muvaffaqiyatli yaratildi ✅");
      }

      resetForm();
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Foydalanuvchini saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      phone: user.phone || "",
      password: "",
      name: user.name || "",
      roleIds: user.roleIds || [],
    });
    setEditingId(user.id);
    setShowPassword(false);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        setError("");
        const res = await ApiCall(`/api/v1/admin/users/${id}`, "DELETE", null);
        if (res?.error) {
          const msg =
            typeof res.data === "string" ? res.data : "Foydalanuvchini o'chirishda xatolik";
          setError(msg);
          return;
        }
        setSuccessMsg("Foydalanuvchi o'chirildi ✅");
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        setError("Foydalanuvchini o'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  // Rol ID dan nom olish
  const getRoleName = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return `Role #${roleId}`;
    return ROLE_LABELS[role.name] || role.name;
  };

  const getRoleColor = (roleId) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return ROLE_COLORS.ROLE_USER;
    return ROLE_COLORS[role.name] || ROLE_COLORS.ROLE_USER;
  };

  // Rol checkbox ni toggle qilish
  const toggleRole = (roleId) => {
    setFormData((prev) => {
      const exists = prev.roleIds.includes(roleId);
      return {
        ...prev,
        roleIds: exists
          ? prev.roleIds.filter((id) => id !== roleId)
          : [...prev.roleIds, roleId],
      };
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👤 Foydalanuvchilar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {users.length} ta foydalanuvchi
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          <MdAdd className="h-5 w-5" />
          Yangi foydalanuvchi
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
      <div className="relative">
        <MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Foydalanuvchilarni qidirish (ism yoki phone)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

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
              {editingId
                ? "Foydalanuvchini tahrirlash"
                : "Yangi foydalanuvchi yaratish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone (login){" "}
                  {!editingId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required={!editingId}
                  disabled={!!editingId}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    editingId
                      ? "cursor-not-allowed bg-gray-100 opacity-60 dark:bg-gray-600"
                      : ""
                  }`}
                  placeholder="Masalan: teacher1"
                />
                {editingId && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Phone/login tahrirlash mumkin emas
                  </p>
                )}
              </div>

              {/* Ism */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ism
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: Karimov Ali"
                />
              </div>

              {/* Parol */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Parol{" "}
                  <span className="text-xs font-normal text-gray-400">
                    {editingId
                      ? "(bo'sh bo'lsa o'zgarmaydi)"
                      : "(bo'sh bo'lsa default: 00000000)"}
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

              {/* Rollar */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <MdShield className="mr-1 inline h-4 w-4" />
                  Rollar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const isSelected = formData.roleIds.includes(role.id);
                    const colorClass = ROLE_COLORS[role.name] || ROLE_COLORS.ROLE_USER;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => toggleRole(role.id)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                          isSelected
                            ? `border-blue-500 ${colorClass} ring-2 ring-blue-500/20`
                            : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500"
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300 dark:border-gray-500"
                          }`}
                        >
                          {isSelected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        {ROLE_LABELS[role.name] || role.name}
                      </button>
                    );
                  })}
                </div>
                {formData.roleIds.length === 0 && (
                  <p className="mt-2 text-xs text-gray-400">
                    Hech qanday rol tanlanmagan
                  </p>
                )}
              </div>

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
                    : "Yaratish"}
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
      {filteredUsers.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {searchTerm
              ? "Foydalanuvchilar topilmadi"
              : "Hali foydalanuvchilar yo'q"}
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? "Boshqa kalit so'z bilan qidirib ko'ring"
              : '"Yangi foydalanuvchi" tugmasini bosing'}
          </p>
        </div>
      )}

      {/* ==================== TABLE ==================== */}
      {filteredUsers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Ism
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:table-cell">
                    Phone
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 md:table-cell">
                    Rollar
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {/* # */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>

                    {/* Ism */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name || "—"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                            {user.phone}
                          </p>
                          {/* mobile da rollar */}
                          <div className="mt-1 flex flex-wrap gap-1 md:hidden">
                            {(user.roleIds || []).map((rid) => (
                              <span
                                key={rid}
                                className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${getRoleColor(rid)}`}
                              >
                                {getRoleName(rid)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {user.phone}
                      </span>
                    </td>

                    {/* Rollar */}
                    <td className="hidden px-6 py-4 md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {(user.roleIds || []).map((rid) => (
                          <span
                            key={rid}
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(rid)}`}
                          >
                            {getRoleName(rid)}
                          </span>
                        ))}
                        {(!user.roleIds || user.roleIds.length === 0) && (
                          <span className="text-xs text-gray-400">Rol yo'q</span>
                        )}
                      </div>
                    </td>

                    {/* Amallar */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                          title="Tahrirlash"
                        >
                          <MdEdit className="h-4 w-4" />
                          <span className="hidden lg:inline">Tahrirlash</span>
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
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
              Jami:{" "}
              <span className="font-semibold">{filteredUsers.length}</span> ta
              foydalanuvchi
              {searchTerm && ` ("${searchTerm}" bo'yicha filtrlangan)`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersModern;

