import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import Select from "react-select";
import { FiEdit2, FiUsers, FiUser, FiBook } from "react-icons/fi";
import { FaTrash, FaPlus, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
Modal.setAppElement("#root");
function FaceGroupManager() {
    const [faceGroups, setFaceGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const [duties, setDuties] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0 });
    const navigate = useNavigate();

    // 🔹 FaceGroup ro'yxatini olish
    const fetchFaceGroups = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/amaliyot-group", "GET");
            console.log(res.data);

            const groupsData = Array.isArray(res.data) ? res.data : [];
            setFaceGroups(groupsData);

            // Statistika hisoblash
            setStats({
                total: groupsData.length,
                active: groupsData.filter(g => g.group?.isActive).length
            });
        } catch (err) {
            toast.error("❌ Face group ma'lumotlarini olishda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Guruhlar ro'yxatini olish
    const fetchGroups = async () => {
        try {
            const res = await ApiCall("/api/v1/groups", "GET");
            const options = res.data.map((g) => ({
                value: g.id,
                label: g.name || g.groupName,
                isActive: g.isActive
            }));
            setGroups(options);
        } catch (err) {
            toast.error("❌ Guruhlarni olishda xatolik!");
            console.error(err);
        }
    };

    // 🔹 O'qituvchilar ro'yxatini olish
    const getDuty = async () => {
        try {
            const response = await ApiCall(`/api/v1/teacher`, "GET");
            const options = Array.isArray(response.data)
                ? response.data.map((t) => ({
                    value: t.id,
                    label: t.name || t.username || "Noma'lum o'qituvchi",
                }))
                : [];
            setDuties(options);
        } catch (error) {
            console.error("O'qituvchilarni yuklashda xatolik:", error);
            toast.error("O'qituvchilarni yuklab bo'lmadi");
        }
    };

    useEffect(() => {
        fetchFaceGroups();
        fetchGroups();
        getDuty();
    }, []);

    // 🔹 Modalni ochish (yangi qo'shish)
    const openModal = () => {
        setSelectedGroup(null);
        setSelectedTeacher(null);
        setEditMode(false);
        setEditId(null);
        setModalOpen(true);
    };

    // 🔹 Tahrirlash uchun modalni ochish
    const openEditModal = (item) => {
        setEditMode(true);
        setEditId(item.id);
        setSelectedGroup(
            item.group
                ? { value: item.group.id, label: item.group.name || item.group.groupName }
                : null
        );
        setSelectedTeacher(
            item.user
                ? { value: item.user.id, label: item.user.name }
                : null
        );
        setModalOpen(true);
    };

    const handleAdd = async () => {
        if (!selectedGroup || selectedGroup.length === 0 || !selectedTeacher) {
            toast.warn("Guruh(lar) va mas'ul o‘qituvchini tanlang!");
            return;
        }

        const groupIds = selectedGroup.map(g => g.value); // UUID list

        setSaving(true);
        try {
            await ApiCall(
                `/api/v1/amaliyot-group/multi/${selectedTeacher.value}`,
                "POST",
                groupIds
            );

            toast.success("✅ Guruhlar muvaffaqiyatli biriktirildi!");
            setModalOpen(false);
            fetchFaceGroups();
        } catch (err) {
            toast.error("❌ Saqlashda xatolik!");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
    // 🔹 Tahrirlash
    const handleEdit = async () => {
        if (!selectedGroup || !selectedTeacher) {
            toast.warn("Yangi guruh va mas'ulni tanlang!");
            return;
        }

        setSaving(true);
        try {
            await ApiCall(
                `/api/v1/amaliyot-group/${editId}/${selectedGroup.value}/${selectedTeacher.value}`,
                "PUT"
            );
            toast.success("✅ Tahrir muvaffaqiyatli bajarildi!");
            setModalOpen(false);
            fetchFaceGroups();
        } catch (err) {
            toast.error("❌ Tahrirlashda xatolik!");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // 🔹 O'chirish
    const handleDelete = async (id) => {
        if (!window.confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
        try {
            await ApiCall(`/api/v1/amaliyot-group/${id}`, "DELETE");
            toast.success("✅ O'chirildi!");
            fetchFaceGroups();
        } catch (err) {
            toast.error("❌ O'chirishda xatolik!");
            console.error(err);
        }
    };

    const getGroupStatus = (group) => {
        return group.group?.isActive ?
            { label: "Faol", color: "bg-green-100 text-green-800", dot: "bg-green-500" } :
            { label: "Nofaol", color: "bg-gray-100 text-gray-600", dot: "bg-gray-400" };
    };

    return (
        <div className="min-h-screen p-6">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-white mt-4 text-lg font-medium">
                        Saqlanmoqda, iltimos kuting...
                    </p>
                </div>
            )}

            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="mb-4 lg:mb-0">
                        <div className="flex items-center mb-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mr-4">
                                <FiUsers className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Amaliyot Group Boshqaruvi</h1>
                                <p className="text-gray-600">Guruh va mas'ullarni boshqarish paneli</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <FiBook className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                    <div className="text-xs text-blue-600 font-medium">Jami guruhlar</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                    <FiUser className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                                    <div className="text-xs text-green-600 font-medium">Faol guruhlar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Barcha amaliyot guruhlari</h2>
                    <p className="text-gray-600 text-sm">Jami: {faceGroups.length} ta guruh</p>
                </div>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-150 shadow-md"
                >
                    <FaPlus className="w-4 h-4" /> Yangi guruh qo'shish
                </button>
            </div>

            {/* Jadval */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Guruhlar yuklanmoqda...</p>
                    </div>
                </div>
            ) : faceGroups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                    <div className="text-gray-400 text-6xl mb-4">👨‍🏫</div>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">Guruhlar topilmadi</h3>
                    <p className="text-gray-500 mb-6">Hozircha hech qanday guruh yaratilmagan.</p>
                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-150 shadow-md"
                    >
                        <FaPlus className="w-4 h-4" /> Yangi guruh qo'shish
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        №
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Guruh ma'lumotlari
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Mas'ul o'qituvchi
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Holati
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                                        Harakatlar
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {faceGroups.map((f, i) => {
                                    const status = getGroupStatus(f);
                                    return (
                                        <tr key={f.id} className="hover:bg-gray-50 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 text-center">
                                                    {i + 1}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-4">
                                                        {f?.group?.name?.charAt(0) || "G"}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {f?.group?.name || "—"}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {f?.group?.id || "—"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold mr-3">
                                                        {f?.user?.name?.charAt(0) || "O"}
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        {f?.user?.name || "—"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                                                    <span className={`w-2 h-2 ${status.dot} rounded-full mr-2`}></span>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/superadmin/amaliyot-group/${f?.group?.id}`)}
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-lg transition-colors duration-150"
                                                        title="Ko'rish"
                                                    >
                                                        <FaEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(f)}
                                                        className="bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-lg transition-colors duration-150"
                                                        title="Tahrirlash"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(f.id)}
                                                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors duration-150"
                                                        title="O'chirish"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 🧩 Modal */}
            <Modal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                className="bg-white rounded-2xl shadow-2xl max-w-md mx-auto mt-20 p-6 outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
            >
                <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white mr-3">
                        {editMode ? <FiEdit2 className="w-5 h-5" /> : <FaPlus className="w-5 h-5" />}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            {editMode ? "Guruhni tahrirlash" : "Yangi guruh qo'shish"}
                        </h2>
                        <p className="text-gray-600 text-sm">Guruh va mas'ulni tanlang</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Guruhni tanlang</label>
                        <Select
                            options={groups}
                            value={selectedGroup}
                            onChange={setSelectedGroup}
                            isMulti
                            placeholder="Guruhlarni tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mas'ulni tanlang</label>
                        <Select
                            options={duties}
                            value={selectedTeacher}
                            onChange={setSelectedTeacher}
                            placeholder="Mas'ulni tanlang..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors duration-150"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={editMode ? handleEdit : handleAdd}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-150 shadow-md"
                    >
                        {editMode ? "Yangilash" : "Saqlash"}
                    </button>
                </div>
            </Modal>

            {/* Custom CSS for React Select */}
            <style jsx>{`
                .react-select-container .react-select__control {
                    border: 1px solid #d1d5db;
                    border-radius: 0.75rem;
                    padding: 0.25rem;
                    transition: all 0.15s ease-in-out;
                }
                .react-select-container .react-select__control:hover {
                    border-color: #9ca3af;
                }
                .react-select-container .react-select__control--is-focused {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
}

export default FaceGroupManager;