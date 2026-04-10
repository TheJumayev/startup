import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast } from "react-toastify";

function IpConfig() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [form, setForm] = useState({ name: "", address: "" });
    const [editId, setEditId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);

    // =============================
    // 🔵 LOAD ALL PCs
    // =============================
    const loadData = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/univer-pc", "GET");
            setList(res.data || []);
        } catch (err) {
            toast.error("Ma'lumot yuklanmadi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =============================
    // 🟢 OPEN CREATE MODAL
    // =============================
    const openCreate = () => {
        setForm({ name: "", address: "" });
        setEditId(null);
        setShowModal(true);
    };

    // =============================
    // 🟠 OPEN EDIT MODAL
    // =============================
    const openEdit = (item) => {
        setEditId(item.id);
        setForm({
            name: item.name,
            address: item.address,
        });
        setShowModal(true);
    };

    // =============================
    // 🟣 SAVE (CREATE or UPDATE)
    // =============================
    const handleSave = async () => {
        if (!form.name || !form.address) {
            toast.warning("Iltimos, barcha maydonlarni to'ldiring!");
            return;
        }

        try {
            if (editId) {
                // UPDATE
                await ApiCall(`/api/v1/univer-pc/${editId}`, "PUT", form);
                toast.success("Tahrirlandi!");
            } else {
                // CREATE
                await ApiCall("/api/v1/univer-pc", "POST", form);
                toast.success("Yaratildi!");
            }

            setShowModal(false);
            loadData();
        } catch (err) {
            toast.error("Xatolik yuz berdi!");
        }
    };

    // =============================
    // 🔴 DELETE
    // =============================
    const deletePc = async (id) => {
        if (!window.confirm("O'chirishni tasdiqlaysizmi?")) return;

        try {
            await ApiCall(`/api/v1/univer-pc/${id}`, "DELETE");
            toast.success("O'chirildi!");
            loadData();
        } catch (err) {
            toast.error("O'chirishda xatolik!");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Universitet kompyuterlari (IP sozlamalar)</h1>

                <button
                    onClick={openCreate}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Yangi qo‘shish
                </button>
            </div>

            {/* ======== TABLE ======== */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 border">№</th>
                            <th className="p-3 border">Nomi</th>
                            <th className="p-3 border">IP manzil</th>
                            <th className="p-3 border text-center">Amal</th>
                        </tr>
                    </thead>

                    <tbody>
                        {list.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center p-4 text-gray-500">
                                    Ma'lumot yo‘q
                                </td>
                            </tr>
                        )}

                        {list.map((item, index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-3 border">{index + 1}</td>
                                <td className="p-3 border">{item.name}</td>
                                <td className="p-3 border">{item.address}</td>

                                <td className="p-3 border text-center">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="px-4 py-1 bg-yellow-500 text-white rounded-lg mr-2 hover:bg-yellow-600"
                                    >
                                        Tahrirlash
                                    </button>

                                    <button
                                        onClick={() => deletePc(item.id)}
                                        className="px-4 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        O'chirish
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ======== MODAL ======== */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editId ? "Tahrirlash" : "Yangi qo‘shish"}
                        </h2>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Kompyuter nomi"
                                className="w-full p-3 border rounded-lg"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({ ...form, name: e.target.value })
                                }
                            />

                            <input
                                type="text"
                                placeholder="IP manzili"
                                className="w-full p-3 border rounded-lg"
                                value={form.address}
                                onChange={(e) =>
                                    setForm({ ...form, address: e.target.value })
                                }
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                            >
                                Bekor qilish
                            </button>

                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default IpConfig;
