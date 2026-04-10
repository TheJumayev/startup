import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import Card from "components/card";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/subjects", "GET", null);
      setSubjects(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching subjects:", err);
      setError("Fanlarni yuklashda xatolik");
    } finally {
      setLoading(false);
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
      setFormData({ name: "", code: "", description: "" });
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
    subject.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Card extra="p-6 mb-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📚 Fanlar
            </h2>
          </div>
          <button
            onClick={() => {
              setFormData({ name: "", code: "", description: "" });
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <MdAdd className="h-5 w-5" />
            Yangi fan
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Fan nomi
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Fan nomi kiriting"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kod
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Fan kodi kiriting"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tavsif
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Tavsif kiriting"
                rows="3"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}

        <div className="mb-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Fanlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {loading && <div className="text-center">Yuklanmoqda...</div>}

      {filteredSubjects.length === 0 ? (
        <Card extra="p-6 text-center">
          <p className="text-gray-500">Fanlar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Nomi
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Kod
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Tavsif
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Harakatlari
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} className="border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {subject.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {subject.code}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    {subject.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
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
      )}
    </div>
  );
};

export default Subjects;

