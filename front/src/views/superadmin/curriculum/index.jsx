import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from "react-icons/md";
import Card from "components/card";
import Select from "react-select";

const Curriculum = () => {
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
    duration: "",
  });

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/curriculums", "GET", null);
      setCurriculums(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching curriculums:", err);
      setError("O'quv dasturlarni yuklashda xatolik");
    } finally {
      setLoading(false);
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
      setFormData({ name: "", code: "", description: "", duration: "" });
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
      code: curriculum.code,
      description: curriculum.description,
      duration: curriculum.duration,
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Card extra="p-6 mb-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              📖 O'quv dasturlari
            </h2>
          </div>
          <button
            onClick={() => {
              setFormData({ name: "", code: "", description: "", duration: "" });
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <MdAdd className="h-5 w-5" />
            Yangi dastur
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <MdClose className="h-6 w-6" />
              </button>

              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? "O'quv dasturini tahrirlash" : "Yangi o'quv dasturi yaratish"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dastur nomi
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Dastur nomi kiriting"
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
                    placeholder="Dastur kodi kiriting"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Muddati (oylar)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Muddati oylar bilan kiriting"
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
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="O'quv dasturlarini qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {loading && <div className="text-center">Yuklanmoqda...</div>}

      {filteredCurriculums.length === 0 ? (
        <Card extra="p-6 text-center">
          <p className="text-gray-500">O'quv dasturlari topilmadi</p>
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
                  Muddati
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
              {filteredCurriculums.map((curriculum) => (
                <tr key={curriculum.id} className="border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {curriculum.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {curriculum.code}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {curriculum.duration} oy
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    {curriculum.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(curriculum)}
                        className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(curriculum.id)}
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

export default Curriculum;

