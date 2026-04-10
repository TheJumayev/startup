import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from "react-icons/md";
import Select from "react-select";

const SubjectsModern = () => {
  const [subjects, setSubjects] = useState([]);
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    curriculumId: "",
  });

  useEffect(() => {
    fetchSubjects();
    fetchCurriculums();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/subjects", "GET", null);
      const data = response.data || [];
      setSubjects(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
      setError("Fanlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurriculums = async () => {
    try {
      const response = await ApiCall("/api/v1/curriculums", "GET", null);
      const data = response.data || [];
      setCurriculums(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching curriculums:", err);
      setCurriculums([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await ApiCall(`/api/v1/subjects/${editingId}`, "PUT", formData);
      } else {
        await ApiCall("/api/v1/subjects", "POST", formData);
      }
      setFormData({ name: "", code: "", description: "", curriculumId: "" });
      setEditingId(null);
      setShowForm(false);
      fetchSubjects();
    } catch (err) {
      console.error("Error saving subject:", err);
      setError("Fanni saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subject) => {
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description,
      curriculumId: subject.curriculumId,
    });
    setEditingId(subject.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Fanni o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        await ApiCall(`/api/v1/subjects/${id}`, "DELETE", null);
        fetchSubjects();
      } catch (err) {
        console.error("Error deleting subject:", err);
        setError("Fanni o'chirishda xatolik");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredSubjects = subjects.filter((subject) =>
    (subject.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📚 Fanlar
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {subjects.length} ta fan
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", code: "", description: "", curriculumId: "" });
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
        >
          <MdAdd className="h-5 w-5" />
          Yangi fan
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
          placeholder="Fanlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
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
              {editingId ? "Fanni tahrirlash" : "Yangi fan yaratish"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Fan nomi
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Fan nomi kiriting"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Kod
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Fan kodi kiriting"
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
                  O'quv dasturi
                </label>
                <Select
                  options={curriculums.map((curriculum) => ({
                    value: curriculum.id,
                    label: curriculum.name,
                  }))}
                  value={formData.curriculumId ? { value: formData.curriculumId, label: curriculums.find(c => c.id === formData.curriculumId)?.name } : null}
                  onChange={(option) => setFormData({ ...formData, curriculumId: option?.value || "" })}
                  isClearable
                  isSearchable
                  placeholder="O'quv dasturini tanlang..."
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#d1d5db",
                      backgroundColor: "#ffffff",
                      color: "#111827",
                      minHeight: "44px",
                      borderRadius: "8px",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#f3f4f6" : "#ffffff",
                      color: state.isSelected ? "#ffffff" : "#111827",
                      cursor: "pointer",
                    }),
                  }}
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
      {filteredSubjects.length === 0 && !loading && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
          <div className="mb-4 text-4xl">📭</div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            Fanlar topilmadi
          </p>
        </div>
      )}

      {/* Table */}
      {filteredSubjects.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Nomi
                  </th>
                  <th className="hidden px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white sm:table-cell">
                    Kod
                  </th>
                  <th className="hidden px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white md:table-cell">
                    O'quv dasturi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {subject.name}
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-600 dark:text-gray-400 sm:table-cell">
                      <code className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">
                        {subject.code}
                      </code>
                    </td>
                    <td className="hidden px-6 py-4 text-sm text-gray-600 dark:text-gray-400 md:table-cell">
                      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {curriculums.find(c => c.id === subject.curriculumId)?.name || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="inline-flex items-center justify-center rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        >
                          <MdEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="inline-flex items-center justify-center rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <MdDelete className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsModern;

