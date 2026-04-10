import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import Card from "components/card";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    groupId: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await ApiCall("/api/v1/students", "GET", null);
      setStudents(response.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Talabalarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await ApiCall(`/api/v1/students/${editingId}`, "PUT", formData);
      } else {
        await ApiCall("/api/v1/students", "POST", formData);
      }
      setFormData({ firstName: "", lastName: "", email: "", phone: "", groupId: "" });
      setEditingId(null);
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      console.error("Error saving student:", err);
      setError("Talabani saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      groupId: student.groupId,
    });
    setEditingId(student.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Talabani o'chirishni tasdiqlaysizmi?")) {
      try {
        setLoading(true);
        await ApiCall(`/api/v1/students/${id}`, "DELETE", null);
        fetchStudents();
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
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Card extra="p-6 mb-6">
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎓 Talabalar
            </h2>
          </div>
          <button
            onClick={() => {
              setFormData({ firstName: "", lastName: "", email: "", phone: "", groupId: "" });
              setEditingId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <MdAdd className="h-5 w-5" />
            Yangi talaba
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ismi
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ismi kiriting"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Familiyasi
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Familiyasi kiriting"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Email kiriting"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Telefon
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Telefon kiriting"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Guruh ID
              </label>
              <input
                type="text"
                value={formData.groupId}
                onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Guruh ID kiriting"
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
              placeholder="Talabalarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </Card>

      {loading && <div className="text-center">Yuklanmoqda...</div>}

      {filteredStudents.length === 0 ? (
        <Card extra="p-6 text-center">
          <p className="text-gray-500">Talabalar topilmadi</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Ismi
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Familiyasi
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Email
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Telefon
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Guruh
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                  Harakatlari
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {student.firstName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {student.lastName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-900 dark:border-gray-600 dark:text-white">
                    {student.email}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    {student.phone}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-600 dark:border-gray-600 dark:text-gray-400">
                    {student.groupId}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(student)}
                        className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
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

export default Students;

