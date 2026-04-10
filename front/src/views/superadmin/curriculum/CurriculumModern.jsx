import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from "react-icons/md";

const CurriculumModern = () => {
  const [curriculums, setCurriculums] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    groupsId: "",
    subjectsId: "",
  });

  useEffect(() => {
    fetchCurriculums();
    fetchGroups();
    fetchSubjects();
  }, []);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/curriculums", "GET", null);
      const data = response.data || [];
      setCurriculums(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching curriculums:", err);
      setCurriculums([]);
      setError("O'quv dasturlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await ApiCall("/api/v1/groups", "GET", null);
      const data = response.data || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching groups:", err);
      setGroups([]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await ApiCall("/api/v1/subjects", "GET", null);
      const data = response.data || [];
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await ApiCall(`/api/v1/curriculums/${editingId}`, "PUT", formData);
      } else {
        await ApiCall("/api/v1/curriculums", "POST", formData);
      }
      setFormData({ name: "", duration: "", groupsId: "", subjectsId: "" });
      setEditingId(null);
      setShowForm(false);
      fetchCurriculums();
    } catch (err) {
      console.error("Error saving curriculum:", err);
      setError("O'quv dasturini saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curriculum) => {
    setFormData({
      name: curriculum.name,
      duration: curriculum.duration,
      groupsId: curriculum.groupsId || "",
      subjectsId: curriculum.subjectsId || "",
    });
    setEditingId(curriculum.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("O'quv dasturini o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        await ApiCall(`/api/v1/curriculums/${id}`, "DELETE", null);
        fetchCurriculums();
      } catch (err) {
        console.error("Error deleting curriculum:", err);
        setError("O'quv dasturini o'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCurriculums = curriculums.filter((curriculum) =>
    (curriculum.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const getGroupName = (id) => groups.find((g) => g.id === id)?.name || "—";
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📖 O'quv dasturlari
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {curriculums.length} ta o'quv dasturi
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", duration: "", groupsId: "", subjectsId: "" });
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          <MdAdd className="h-5 w-5" />
          Yangi dastur
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
          placeholder="O'quv dasturlarini qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="relative w-full max-h-[90vh] max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <MdClose className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingId ? "O'quv dasturini tahrirlash" : "Yangi o'quv dasturi yaratish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dastur nomi */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Dastur nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Dastur nomi kiriting"
                />
              </div>

              {/* Muddati (oylar) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Muddati (oylar)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Masalan: 12"
                />
              </div>

              {/* Guruh (select) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Guruh
                </label>
                <select
                  value={formData.groupsId}
                  onChange={(e) => setFormData({ ...formData, groupsId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Guruh tanlang</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fan (select) */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Fan
                </label>
                <select
                  value={formData.subjectsId}
                  onChange={(e) => setFormData({ ...formData, subjectsId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Fan tanlang</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
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
      {filteredCurriculums.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            O'quv dasturlari topilmadi
          </p>
        </div>
      )}

      {/* Grid Cards */}
      {filteredCurriculums.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCurriculums.map((curriculum) => (
            <div
              key={curriculum.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {curriculum.name}
                </h3>
                <div className="mt-3 space-y-2">
                  {/* Muddati */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⏱️</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Muddati</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {curriculum.duration} oy
                      </p>
                    </div>
                  </div>
                  {/* Guruh */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👥</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Guruh</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getGroupName(curriculum.groupsId)}
                      </p>
                    </div>
                  </div>
                  {/* Fan */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fan</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getSubjectName(curriculum.subjectsId)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  onClick={() => handleEdit(curriculum)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                >
                  <MdEdit className="h-4 w-4" />
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleDelete(curriculum.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                >
                  <MdDelete className="h-4 w-4" />
                  O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurriculumModern;

