import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose } from "react-icons/md";

const TeacherCurriculum = () => {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({ name: "", userId: "", groupsId: "", subjectsId: "" });

  useEffect(() => {   fetchGroups(); fetchSubjects(); }, []);
    const getAdmin = async () => {
        let token = localStorage.getItem("access_token");
        try {
            const response = await ApiCall("/api/v1/auth/decode1?token="+token, "GET", null);
            setUserId(response.data?.id);

        } catch (error) {
            console.error("Error fetching account data:", error);
        }
    };

    useEffect(() => {
        getAdmin();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchCurriculums();
        }
    }, [userId]);
  const fetchCurriculums = async () => {
    try { setLoading(true); const r = await ApiCall("/api/v1/curriculums/user/"+userId, "GET", null); setCurriculums(Array.isArray(r.data) ? r.data : []); setError(""); }
    catch (err) { console.error(err); setCurriculums([]); setError("O'quv dasturlarni yuklashda xatolik"); } finally { setLoading(false); }
  };
  const fetchGroups = async () => { try { const r = await ApiCall("/api/v1/groups", "GET", null); setGroups(Array.isArray(r.data) ? r.data : []); } catch { setGroups([]); } };
  const fetchSubjects = async () => { try { const r = await ApiCall("/api/v1/subjects", "GET", null); setSubjects(Array.isArray(r.data) ? r.data : []); } catch { setSubjects([]); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
      const data = {
          ...formData,
          userId: userId
      };
    try { setLoading(true); if (editingId) await ApiCall(`/api/v1/curriculums/${editingId}`, "PUT", data); else await ApiCall("/api/v1/curriculums", "POST", data);
      setFormData({ name: "", userId: "", groupsId: "", subjectsId: "" }); setEditingId(null); setShowForm(false); fetchCurriculums(); }
    catch (err) { console.error(err); setError("O'quv dasturini saqlashda xatolik"); } finally { setLoading(false); }
  };
  const handleEdit = (c) => { setFormData({ name: c.name, userId: userId, groupsId: c.groupsId || "", subjectsId: c.subjectsId || "" }); setEditingId(c.id); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("O'quv dasturini o'chirishni tasdiqlaysizmi?")) {
      try { setLoading(true); await ApiCall(`/api/v1/curriculums/${id}`, "DELETE", null); fetchCurriculums(); }
      catch (err) { console.error(err); setError("O'chirishda xatolik"); } finally { setLoading(false); }
    }
  };

  const filteredCurriculums = curriculums.filter((c) => (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
  const getGroupName = (id) => groups.find((g) => g.id === id)?.name || "—";
  const getSubjectName = (id) => subjects.find((s) => s.id === id)?.name || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">📖 O'quv dasturlari</h1><p className="mt-2 text-gray-600 dark:text-gray-400">{curriculums.length} ta o'quv dasturi</p></div>
        <button onClick={() => { setFormData({ name: "", userId: "", groupsId: "", subjectsId: "" }); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"><MdAdd className="h-5 w-5" /> Yangi dastur</button>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">{error}</div>}
      <div className="relative"><MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="O'quv dasturlarini qidirish..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="relative max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><MdClose className="h-6 w-6" /></button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? "Tahrirlash" : "Yangi o'quv dasturi"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Guruh</label>
                <select value={formData.groupsId} onChange={(e) => setFormData({ ...formData, groupsId: e.target.value })} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"><option value="">Guruh tanlang</option>{groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Fan</label>
                <select value={formData.subjectsId} onChange={(e) => setFormData({ ...formData, subjectsId: e.target.value })} required className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white"><option value="">Fan tanlang</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-green-500/50 disabled:opacity-50">{loading ? "Saqlanmoqda..." : "Saqlash"}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredCurriculums.length === 0 && !loading && <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50"><div className="mb-4 text-4xl">📭</div><p className="text-lg font-semibold text-gray-900 dark:text-white">O'quv dasturlari topilmadi</p></div>}

      {filteredCurriculums.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCurriculums.map((c) => (
            <div key={c.id} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 cursor-pointer" onClick={() => navigate(`/teacher/curriculum/${c.id}`)}>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{getSubjectName(c.subjectsId)}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2"><span className="text-xl">👥</span><div><p className="text-xs text-gray-500">Guruh</p><p className="font-semibold text-gray-900 dark:text-white">{getGroupName(c.groupsId)}</p></div></div>
                </div>
              </div>
              <div className="flex gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button onClick={() => navigate(`/teacher/curriculum/${c.id}`)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400">📖 Darslar</button>
                <button onClick={() => handleEdit(c)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"><MdEdit className="h-4 w-4" /> Tahrirlash</button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"><MdDelete className="h-4 w-4" /> O'chirish</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherCurriculum;

