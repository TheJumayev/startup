import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import Select from "react-select";
import { FiEdit2 } from "react-icons/fi";
import { FaTrash, FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

function FaceGroupManager() {
    const [faceGroups, setFaceGroups] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false); // 🟢 yangi state — POST/PUT paytida
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    // 🔹 FaceGroup ro‘yxatini olish
    const fetchFaceGroups = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/face-group", "GET");
            setFaceGroups(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            toast.error("❌ Face group ma'lumotlarini olishda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Guruhlar ro‘yxatini olish
    const fetchGroups = async () => {
        try {
            const res = await ApiCall("/api/v1/groups", "GET");
            const options = res.data.map((g) => ({
                value: g.id,
                label: g.name || g.groupName,
            }));
            setGroups(options);
        } catch (err) {
            toast.error("❌ Guruhlarni olishda xatolik!");
            console.error(err);
        }
    };

    useEffect(() => {
        fetchFaceGroups();
        fetchGroups();
    }, []);

    // 🔹 Modalni ochish (yangi qo‘shish)
    const openModal = () => {
        setSelectedGroup(null);
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
        setModalOpen(true);
    };

    // 🔹 Yangi qo‘shish
    const handleAdd = async () => {
        if (!selectedGroup) {
            toast.warn("Avval asosiy guruhni tanlang!");
            return;
        }

        setSaving(true); // 🔵 Loading overlay yoqiladi
        try {
            await ApiCall(`/api/v1/face-group/${selectedGroup.value}`, "POST");
            toast.success("✅ Yangi Face Group muvaffaqiyatli qo‘shildi!");
            setModalOpen(false);
            fetchFaceGroups();
        } catch (err) {
            toast.error("❌ Face Group qo‘shishda xatolik!");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    // 🔹 Tahrirlash
    const handleEdit = async () => {
        if (!selectedGroup) {
            toast.warn("Yangi guruhni tanlang!");
            return;
        }

        setSaving(true); // 🔵 Loading overlay yoqiladi
        try {
            await ApiCall(`/api/v1/face-group/${editId}/${selectedGroup.value}`, "PUT");
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

    // 🔹 O‘chirish
    const handleDelete = async (id) => {
        if (!window.confirm("Haqiqatan ham o‘chirmoqchimisiz?")) return;
        try {
            await ApiCall(`/api/v1/face-group/${id}`, "DELETE");
            toast.success("✅ O‘chirildi!");
            fetchFaceGroups();
        } catch (err) {
            toast.error("❌ O‘chirishda xatolik!");
            console.error(err);
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto relative">
            <ToastContainer />

            {/* 🌀 To‘liq sahifalik LOADING OVERLAY */}
            {saving && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 border-4 border-white border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-white mt-4 text-lg font-medium">
                        Saqlanmoqda, iltimos kuting...
                    </p>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Face Group Boshqaruvi</h1>
                <button
                    onClick={openModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <FaPlus /> Yangi qo‘shish
                </button>
            </div>

            {/* 🔹 Jadval */}
            {loading ? (
                <div className="text-center text-gray-500">Yuklanmoqda...</div>
            ) : faceGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow border border-gray-200">
                    <div className="text-6xl text-gray-300 mb-4">📁</div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-1">
                        Hozircha hech qanday Face Group yaratilmagan
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Yangi Face Group yaratish uchun “Yangi qo‘shish” tugmasini bosing.
                    </p>
                    <button
                        onClick={openModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        <FaPlus /> Yangi qo‘shish
                    </button>
                </div>
            ) : (
                <table className="w-full border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-gray-600 text-sm font-semibold">№</th>
                            <th className="px-4 py-2 text-left text-gray-600 text-sm font-semibold">Guruh</th>
                            <th className="px-4 py-2 text-center text-gray-600 text-sm font-semibold">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faceGroups.map((f, i) => (
                            <tr key={f.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{i + 1}</td>
                                <td className="px-4 py-2 text-blue-700 cursor-pointer">
                                    {f?.group && f?.group?.id ? (
                                        <button
                                            onClick={() => navigate(`/superadmin/face-group/${f?.group?.id}`)}
                                            className="hover:underline hover:text-blue-900 transition-colors"
                                            title="Face Group sahifasiga o'tish"
                                        >
                                            {f?.group?.name || "—"}
                                        </button>
                                    ) : (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 flex justify-center gap-3">
                                    <button
                                        onClick={() => openEditModal(f)}
                                        className="text-indigo-600 hover:text-indigo-800"
                                    >
                                        <FiEdit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(f.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* 🧩 Modal */}
            <Modal
                isOpen={modalOpen}
                onRequestClose={() => setModalOpen(false)}
                className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 outline-none"
                overlayClassName="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center"
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {editMode ? "Face Groupni tahrirlash" : "Yangi Face Group qo‘shish"}
                </h2>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {editMode ? "Yangi guruhni tanlang" : "Asosiy Guruh"}
                </label>

                <Select
                    options={groups}
                    value={selectedGroup}
                    onChange={setSelectedGroup}
                    placeholder="Guruhni tanlang..."
                    isSearchable
                    className="mb-4"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setModalOpen(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={editMode ? handleEdit : handleAdd}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                        {editMode ? "Yangilash" : "Saqlash"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default FaceGroupManager;
