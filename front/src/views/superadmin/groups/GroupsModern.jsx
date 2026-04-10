import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdArrowForward } from "react-icons/md";

const GroupsModern = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    semesterName: "",
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/groups", "GET", null);
      const data = response.data || [];
      setGroups(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
      setError("Guruhlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await ApiCall(`/api/v1/groups/${editingId}`, "PUT", formData);
      } else {
        await ApiCall("/api/v1/groups", "POST", formData);
      }
      setFormData({ name: "", description: "", semesterName: "" });
      setEditingId(null);
      setShowForm(false);
      fetchGroups();
    } catch (err) {
      console.error("Error saving group:", err);
      setError("Guruhni saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group) => {
    setFormData({
      name: group.name || "",
      description: group.description || "",
      semesterName: group.semesterName || "",
    });
    setEditingId(group.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Guruhni o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        await ApiCall(`/api/v1/groups/${id}`, "DELETE", null);
        fetchGroups();
      } catch (err) {
        console.error("Error deleting group:", err);
        setError("Guruhni o'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredGroups = groups.filter((group) =>
    (group.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            👥 Guruhlar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {groups.length} ta guruhi
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", description: "", semesterName: "" });
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          <MdAdd className="h-5 w-5" />
          Yangi guruhi
        </button>
      </div>

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
          placeholder="Guruhlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div
            className="relative w-full max-w-md space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MdClose className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Guruhni tahrirlash" : "Yangi guruhi yaratish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Guruhi nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Guruhi nomi kiriting"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Tavsif kiriting"
                  rows="3"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Semestr nomi
                </label>
                <input
                  type="text"
                  value={formData.semesterName}
                  onChange={(e) => setFormData({ ...formData, semesterName: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: 1-semestr (ixtiyoriy)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-blue-500/50 disabled:opacity-50"
                >
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredGroups.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Guruhlar topilmadi
          </p>
        </div>
      )}

      {/* Grid Cards */}
      {filteredGroups.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500 cursor-pointer"
              onClick={() => navigate(`/superadmin/groups/${group.id}`)}
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {group.name}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {group.description || "Tavsif mavjud emas"}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(group);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <MdEdit className="h-4 w-4" />
                  Tahrirlash
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(group.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <MdDelete className="h-4 w-4" />
                  O'chirish
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/superadmin/groups/${group.id}`);
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  title="Guruh ichiga kirish"
                >
                  <MdArrowForward className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupsModern;
