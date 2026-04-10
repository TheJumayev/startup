import React, { useEffect, useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import ApiCall from "../../../config";
import Card from "components/card";

const emptyForm = {
  name: "",
  description: "",
  userId: "",
  subjectsId: "",
  groupsId: "",
  createAt: "",
};

const OquvReja = () => {
  const [curriculmList, setCurriculmList] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCurriculm();
  }, []);

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    return [];
  };

  const fetchCurriculm = async () => {
    setLoading(true);
    const response = await ApiCall("/api/v1/curriculm", "GET", null);

    if (response?.error) {
      setError("O'quv reja ro'yxatini yuklashda xatolik");
      setLoading(false);
      return;
    }

    setCurriculmList(normalizeList(response?.data));
    setError("");
    setLoading(false);
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const endpoint = editingId
      ? `/api/v1/curriculm/${editingId}`
      : "/api/v1/curriculm";
    const method = editingId ? "PUT" : "POST";

    const response = await ApiCall(endpoint, method, formData);

    if (response?.error) {
      setError("O'quv rejani saqlashda xatolik");
      setLoading(false);
      return;
    }

    await fetchCurriculm();
    resetForm();
    setLoading(false);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      userId: item?.userId || "",
      subjectsId: item?.subjectsId || "",
      groupsId: item?.groupsId || "",
      createAt: item?.createAt || "",
    });
    setEditingId(item?.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("O'quv rejani o'chirishni tasdiqlaysizmi?")) {
      return;
    }

    setLoading(true);
    const response = await ApiCall(`/api/v1/curriculm/${id}`, "DELETE", null);

    if (response?.error) {
      setError("O'quv rejani o'chirishda xatolik");
      setLoading(false);
      return;
    }

    await fetchCurriculm();
    setLoading(false);
  };

  const filteredList = useMemo(() => {
    return curriculmList.filter((item) => {
      const name = String(item?.name || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase());
    });
  }, [curriculmList, searchTerm]);

  const onInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Card extra="mb-6 p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            O'quv reja
          </h2>

          <button
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <MdAdd className="h-5 w-5" />
            Yangi reja
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 grid gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 md:grid-cols-2">
            <input
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder="Nomi"
              required
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              value={formData.createAt}
              onChange={(e) => onInputChange("createAt", e.target.value)}
              placeholder="Sana (YYYY-MM-DD)"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              value={formData.userId}
              onChange={(e) => onInputChange("userId", e.target.value)}
              placeholder="User ID"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              value={formData.subjectsId}
              onChange={(e) => onInputChange("subjectsId", e.target.value)}
              placeholder="Subjects ID"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <input
              value={formData.groupsId}
              onChange={(e) => onInputChange("groupsId", e.target.value)}
              placeholder="Groups ID"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <textarea
              value={formData.description}
              onChange={(e) => onInputChange("description", e.target.value)}
              placeholder="Tavsif"
              rows={3}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white md:col-span-2"
            />

            <div className="flex gap-2 md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}

        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="O'quv reja qidirish..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </Card>

      {loading && <p className="text-center text-gray-500">Yuklanmoqda...</p>}

      <Card extra="overflow-x-auto p-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border border-gray-300 px-3 py-2 text-left text-sm dark:border-gray-600">
                Nomi
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm dark:border-gray-600">
                Tavsif
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm dark:border-gray-600">
                Sana
              </th>
              <th className="border border-gray-300 px-3 py-2 text-left text-sm dark:border-gray-600">
                Amallar
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-gray-300 px-3 py-4 text-center text-gray-500 dark:border-gray-600">
                  O'quv reja topilmadi
                </td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                    {item.description || "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                    {item.createAt || "-"}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                      >
                        <MdEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded bg-red-500 p-2 text-white hover:bg-red-600"
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default OquvReja;

