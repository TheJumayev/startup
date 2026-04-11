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
          className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <MdAdd className="w-5 h-5" />
          Yangi guruhi
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search Box */}
      <div className="relative">
        <MdSearch className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-4 top-1/2" />
        <input
          type="text"
          placeholder="Guruhlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-3 pl-12 pr-4 text-gray-900 transition-colors bg-white border border-gray-300 rounded-lg placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowForm(false)}>
          <div
            className="relative w-full max-w-md p-8 space-y-6 bg-white border border-gray-200 shadow-2xl rounded-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute p-2 text-gray-500 rounded-lg top-4 right-4 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MdClose className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "Guruhni tahrirlash" : "Yangi guruhi yaratish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Guruhi nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Guruhi nomi kiriting"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Tavsif kiriting"
                  rows="3"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Semestr nomi
                </label>
                <input
                  type="text"
                  value={formData.semesterName}
                  onChange={(e) => setFormData({ ...formData, semesterName: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 transition-colors bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: 1-semestr (ixtiyoriy)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 font-semibold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-blue-500/50 disabled:opacity-50"
                >
                  {loading ? "Saqlanmoqda..." : "Saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 font-semibold text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
        <div className="p-12 text-center border-2 border-gray-300 border-dashed rounded-2xl bg-gray-50 dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Guruhlar topilmadi
          </p>
        </div>
      )}

      {/* Grid Cards */}
      {filteredGroups.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {filteredGroups.map((group, index) => (
    <div
      key={group.id}
      className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50/30 p-6 shadow-md transition-all duration-500 hover:shadow-xl hover:scale-[1.02] hover:border-blue-400 cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => navigate(`/superadmin/groups/${group.id}`)}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 transition-transform duration-700 translate-x-16 -translate-y-16 rounded-full opacity-50 bg-gradient-to-br from-blue-100 to-blue-200 group-hover:scale-150" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 shadow-md rounded-xl bg-gradient-to-br from-blue-400 to-blue-500">
            <span className="text-xl text-white">👥</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 transition-colors group-hover:text-blue-600">
              {group.name}
            </h3>
            <p className="text-xs text-gray-400">Guruh ID: {group.id}</p>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {group.description || "Tavsif mavjud emas"}
        </p>

        {/* Buttons - hammasi ko'k rangda */}
        <div className="flex gap-2 pt-4 border-t border-blue-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(group);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-md hover:scale-[1.02]"
          >
            <MdEdit className="w-4 h-4" />
            Tahrirlash
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(group.id);
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600 hover:shadow-md hover:scale-[1.02]"
          >
            <MdDelete className="w-4 h-4" />
            O'chirish
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/superadmin/groups/${group.id}`);
            }}
            className="inline-flex items-center justify-center rounded-lg bg-blue-500 p-2 text-white transition-all duration-300 hover:bg-blue-600 hover:scale-[1.02]"
            title="Guruh ichiga kirish"
          >
            <MdArrowForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
      )}
    </div>
  );
};

export default GroupsModern;

