import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdPerson, MdVisibility, MdVisibilityOff, MdShield } from "react-icons/md";

const ROLE_COLORS = {
  ROLE_SUPERADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  ROLE_ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ROLE_TEACHER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  ROLE_REKTOR: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ROLE_STUDENT: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  ROLE_USER: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};
const ROLE_LABELS = { ROLE_SUPERADMIN: "Super Admin", ROLE_ADMIN: "Admin", ROLE_TEACHER: "O'qituvchi", ROLE_REKTOR: "Rektor", ROLE_STUDENT: "Talaba", ROLE_USER: "Foydalanuvchi" };

const TeacherUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ phone: "", password: "", name: "", roleIds: [] });

  useEffect(() => { fetchUsers(); fetchRoles(); }, []);
  useEffect(() => { if (error || successMsg) { const t = setTimeout(() => { setError(""); setSuccessMsg(""); }, 4000); return () => clearTimeout(t); } }, [error, successMsg]);

  const fetchUsers = async () => {
    try { setLoading(true); const r = await ApiCall("/api/v1/admin/users", "GET", null); if (r?.error) { setError("Yuklashda xatolik"); setUsers([]); return; } setUsers(Array.isArray(r.data) ? r.data : []); }
    catch (err) { console.error(err); setUsers([]); setError("Yuklashda xatolik"); } finally { setLoading(false); }
  };
  const fetchRoles = async () => {
    try { const r = await ApiCall("/api/v1/role", "GET", null); if (r?.error) { setRoles([]); return; } setRoles(Array.isArray(r.data) ? r.data : []); }
    catch (err) { console.error(err); setRoles([]); }
  };

  const resetForm = () => { setFormData({ phone: "", password: "", name: "", roleIds: [] }); setEditingId(null); setShowPassword(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setSuccessMsg("");
    if (!editingId && !formData.phone.trim()) { setError("Phone bo'sh bo'lishi mumkin emas"); return; }
    try {
      setLoading(true);
      if (editingId) {
        const ud = {}; if (formData.name.trim()) ud.name = formData.name; if (formData.password.trim()) ud.password = formData.password; if (formData.roleIds.length > 0) ud.roleIds = formData.roleIds;
        const res = await ApiCall(`/api/v1/admin/users/${editingId}`, "PUT", ud);
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "Yangilashda xatolik"); return; }
        setSuccessMsg("Yangilandi ✅");
      } else {
        const cd = { phone: formData.phone }; if (formData.password.trim()) cd.password = formData.password; if (formData.name.trim()) cd.name = formData.name; if (formData.roleIds.length > 0) cd.roleIds = formData.roleIds;
        const res = await ApiCall("/api/v1/admin/users", "POST", cd);
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "Yaratishda xatolik"); return; }
        setSuccessMsg("Yaratildi ✅");
      }
      resetForm(); setShowForm(false); fetchUsers();
    } catch (err) { console.error(err); setError("Saqlashda xatolik"); } finally { setLoading(false); }
  };

  const handleEdit = (u) => { setFormData({ phone: u.phone || "", password: "", name: u.name || "", roleIds: u.roleIds || [] }); setEditingId(u.id); setShowPassword(false); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("O'chirishni tasdiqlaysizmi?")) {
      try { setLoading(true); setError(""); const res = await ApiCall(`/api/v1/admin/users/${id}`, "DELETE", null);
        if (res?.error) { setError(typeof res.data === "string" ? res.data : "O'chirishda xatolik"); return; }
        setSuccessMsg("O'chirildi ✅"); fetchUsers(); }
      catch (err) { console.error(err); setError("O'chirishda xatolik"); } finally { setLoading(false); }
    }
  };

  const getRoleName = (rid) => { const r = roles.find((x) => x.id === rid); return r ? (ROLE_LABELS[r.name] || r.name) : `#${rid}`; };
  const getRoleColor = (rid) => { const r = roles.find((x) => x.id === rid); return r ? (ROLE_COLORS[r.name] || ROLE_COLORS.ROLE_USER) : ROLE_COLORS.ROLE_USER; };
  const toggleRole = (rid) => setFormData((p) => ({ ...p, roleIds: p.roleIds.includes(rid) ? p.roleIds.filter((x) => x !== rid) : [...p.roleIds, rid] }));
  const filteredUsers = users.filter((u) => (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (u.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">👤 Foydalanuvchilar</h1><p className="mt-2 text-gray-600 dark:text-gray-400">{users.length} ta foydalanuvchi</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-green-500/50"><MdAdd className="h-5 w-5" /> Yangi foydalanuvchi</button>
      </div>

      {successMsg && <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">{successMsg}</div>}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">{error}</div>}

      <div className="relative"><MdSearch className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Qidirish (ism yoki phone)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white" /></div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="relative max-h-[90vh] w-full max-w-md space-y-6 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowForm(false)} className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"><MdClose className="h-6 w-6" /></button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingId ? "Tahrirlash" : "Yangi foydalanuvchi"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Phone (login) {!editingId && <span className="text-red-500">*</span>}</label>
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required={!editingId} disabled={!!editingId}
                  className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${editingId ? "cursor-not-allowed opacity-60" : ""}`} placeholder="teacher1" />
                {editingId && <p className="mt-1 text-xs text-gray-500">Phone tahrirlash mumkin emas</p>}</div>
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Ism</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Karimov Ali" /></div>
              <div><label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">Parol <span className="text-xs font-normal text-gray-400">{editingId ? "(bo'sh=o'zgarmaydi)" : "(default: 00000000)"}</span></label>
                <div className="relative"><input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Parol (ixtiyoriy)" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}</button></div></div>
              <div><label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-gray-300"><MdShield className="mr-1 inline h-4 w-4" /> Rollar</label>
                <div className="grid grid-cols-2 gap-2">{roles.map((role) => {
                  const sel = formData.roleIds.includes(role.id); const cc = ROLE_COLORS[role.name] || ROLE_COLORS.ROLE_USER;
                  return (<button key={role.id} type="button" onClick={() => toggleRole(role.id)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${sel ? `border-green-500 ${cc} ring-2 ring-green-500/20` : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400"}`}>
                    <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${sel ? "border-green-500 bg-green-500" : "border-gray-300 dark:border-gray-500"}`}>{sel && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}</div>
                    {ROLE_LABELS[role.name] || role.name}</button>);
                })}</div>{formData.roleIds.length === 0 && <p className="mt-2 text-xs text-gray-400">Hech qanday rol tanlanmagan</p>}</div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-teal-700 px-4 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-green-500/50 disabled:opacity-50">{loading ? "Saqlanmoqda..." : editingId ? "Yangilash" : "Yaratish"}</button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && !loading && <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50"><div className="mb-4 text-4xl">📭</div><p className="text-lg font-semibold text-gray-900 dark:text-white">{searchTerm ? "Topilmadi" : "Foydalanuvchilar yo'q"}</p></div>}

      {filteredUsers.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"><tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ism</th>
              <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 sm:table-cell">Phone</th>
              <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 md:table-cell">Rollar</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amallar</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((u, i) => (
                <tr key={u.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-500 text-sm font-bold text-white">{u.name?.charAt(0)?.toUpperCase() || "?"}</div><div><p className="text-sm font-medium text-gray-900 dark:text-white">{u.name || "—"}</p><p className="text-xs text-gray-500 sm:hidden">{u.phone}</p><div className="mt-1 flex flex-wrap gap-1 md:hidden">{(u.roleIds||[]).map(rid=><span key={rid} className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${getRoleColor(rid)}`}>{getRoleName(rid)}</span>)}</div></div></div></td>
                  <td className="hidden whitespace-nowrap px-6 py-4 sm:table-cell"><span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">{u.phone}</span></td>
                  <td className="hidden px-6 py-4 md:table-cell"><div className="flex flex-wrap gap-1.5">{(u.roleIds||[]).map(rid=><span key={rid} className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getRoleColor(rid)}`}>{getRoleName(rid)}</span>)}{(!u.roleIds||u.roleIds.length===0)&&<span className="text-xs text-gray-400">Rol yo'q</span>}</div></td>
                  <td className="whitespace-nowrap px-6 py-4"><div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(u)} className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400" title="Tahrirlash"><MdEdit className="h-4 w-4" /><span className="hidden lg:inline">Tahrirlash</span></button>
                    <button onClick={() => handleDelete(u.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" title="O'chirish"><MdDelete className="h-4 w-4" /><span className="hidden lg:inline">O'chirish</span></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div className="border-t border-gray-200 px-6 py-3 dark:border-gray-700"><p className="text-sm text-gray-500">Jami: <span className="font-semibold">{filteredUsers.length}</span> ta foydalanuvchi</p></div>
        </div>
      )}
    </div>
  );
};

export default TeacherUsers;

