import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from "react-icons/md";

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
      setFormData({ name: "", description: "", curriculumId: "" });
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
      description: subject.description || "",
      curriculumId: subject.curriculumId || "",
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
    <div className="min-h-screen p-6 space-y-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
            <span className="text-sm font-medium tracking-wide text-blue-600 uppercase">Fanlar bo'limi</span>
          </div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
            <span className="text-3xl">📚</span> 
            Fanlar
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Jami <span className="font-semibold text-blue-600">{subjects.length}</span> ta fan
          </p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: "", description: "", curriculumId: "" });
            setEditingId(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 hover:scale-[1.02] transition-all"
        >
          <MdAdd className="w-4 h-4" />
          Yangi fan
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm border-l-4 text-rose-700 bg-rose-50 rounded-xl border-rose-400">
          <span className="inline-block mr-2">⚠️</span>
          {error}
        </div>
      )}

      {/* Search Box */}
      <div className="relative max-w-md">
        <MdSearch className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3.5 top-1/2" />
        <input
          type="text"
          placeholder="Fanlarni qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2.5 pl-10 pr-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200/50 transition-all"
        />
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div
            className="relative w-full max-w-md bg-white border border-blue-100 shadow-2xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-t-2xl" />
            
            <button
              onClick={() => setShowForm(false)}
              className="absolute p-2 text-gray-400 transition-colors rounded-lg top-4 right-4 hover:text-gray-600 hover:bg-gray-100"
            >
              <MdClose className="w-5 h-5" />
            </button>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100">
                  {editingId ? (
                    <MdEdit className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MdAdd className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {editingId ? "Fanni tahrirlash" : "Yangi fan yaratish"}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Fan nomi <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Masalan: Matematika"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-sm font-medium text-gray-700">
                    Tavsif
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    placeholder="Fan haqida qisqacha ma'lumot"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl hover:shadow-md disabled:opacity-50 transition-all"
                  >
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && filteredSubjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 border-blue-200 rounded-full border-3 border-t-blue-500 animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Yuklanmoqda...</p>
        </div>
      )}

      {/* Empty State */}
      {filteredSubjects.length === 0 && !loading && (
        <div className="py-16 text-center border border-blue-100 shadow-sm bg-white/60 backdrop-blur-sm rounded-2xl">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 blur-xl opacity-30 animate-pulse" />
            <div className="relative mb-3 text-5xl">📭</div>
          </div>
          <p className="font-medium text-gray-600">
            {searchTerm ? "Hech qanday fan topilmadi" : "Fanlar ro'yxati bo'sh"}
          </p>
          <p className="mt-1 text-sm text-gray-400">
            {searchTerm ? "Boshqa so'z bilan qidirib ko'ring" : "Yangi fan qo'shish uchun tugmani bosing"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setFormData({ name: "", description: "", curriculumId: "" });
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              <MdAdd className="w-4 h-4" />
              Yangi fan qo'shish
            </button>
          )}
        </div>
      )}

      {/* Table */}
      {filteredSubjects.length > 0 && (
        <div className="overflow-hidden border border-blue-100 shadow-sm bg-white/80 backdrop-blur-sm rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/60">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      №
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center gap-2">
                      <span>📚</span>
                      Fan nomi
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase">
                    <div className="flex items-center gap-2">
                      <span>⚡</span>
                      Amallar
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filteredSubjects.map((subject, index) => (
                  <tr 
                    key={subject.id} 
                    className="transition-all duration-200 group hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-transparent"
                  >
                    {/* Number column - ustiga borganda och ko'k */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center text-sm font-medium text-gray-600 transition-all duration-300 bg-gray-100 rounded-lg w-7 h-7 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110">
                        {index + 1}
                      </div>
                    </td>
                    
                    {/* Subject name column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center transition-all duration-300 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-400 group-hover:to-indigo-400">
                          <span className="text-base transition-colors duration-300 group-hover:text-white">📘</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 transition-colors duration-300 group-hover:text-blue-600">
                          {subject.name}
                        </span>
                      </div>
                    </td>

                    {/* Actions column - tugmalar aniq ko'rinadi */}
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEdit(subject)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:bg-blue-600 hover:scale-105 shadow-sm"
                        >
                          <MdEdit className="w-3.5 h-3.5" />
                          Tahrirlash
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(subject.id)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium transition-all duration-200 hover:bg-rose-600 hover:scale-105 shadow-sm"
                        >
                          <MdDelete className="w-3.5 h-3.5" />
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          <div className="px-6 py-3 border-t border-blue-100 bg-gradient-to-r from-blue-50/30 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <p className="text-xs text-gray-500">
                  Ko'rsatilmoqda: <span className="font-medium text-gray-700">{filteredSubjects.length}</span> ta fan
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Umumiy: {subjects.length} ta
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectsModern;