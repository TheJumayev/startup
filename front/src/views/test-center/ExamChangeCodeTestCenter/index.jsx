import React, { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import { toast } from "react-toastify";

function TestCenterCode() {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [codeValue, setCodeValue] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // 🔵 FETCH ALL CODES
    const fetchCodes = async () => {
        try {
            setLoading(true);
            const res = await ApiCall("/api/v1/test-center-code", "GET");
            setCodes(res.data || []);
        } catch {
            toast.error("❌ Ma'lumot yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    // 🔵 OPEN CREATE MODAL
    const openCreateModal = () => {
        setEditId(null);
        setCodeValue("");
        setShowModal(true);
    };

    // 🔵 OPEN EDIT MODAL
    const openEditModal = (item) => {
        setEditId(item.id);
        setCodeValue(item.code);
        setShowModal(true);
    };

    // 🔵 CLOSE MODAL
    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
        setCodeValue("");
    };

    // 🔵 DELETE CODE
    const deleteCode = async (id) => {
        if (!window.confirm("Rostan ham o'chirmoqchimisiz?")) return;

        try {
            await ApiCall(`/api/v1/test-center-code/${id}`, "DELETE");
            toast.success("✅ Kod muvaffaqiyatli o'chirildi!");
            fetchCodes();
        } catch {
            toast.error("❌ O'chirishda xatolik!");
        }
    };

    // 🔵 SAVE (CREATE / UPDATE)
    const saveCode = async () => {
        if (!codeValue.trim()) {
            toast.error("⚠️ Iltimos, kod kiriting!");
            return;
        }

        try {
            if (editId) {
                // UPDATE
                await ApiCall(`/api/v1/test-center-code/${editId}/${codeValue}`, "PUT");
                toast.success("✅ Kod muvaffaqiyatli yangilandi!");
            } else {
                // CREATE
                await ApiCall(`/api/v1/test-center-code/${codeValue}`, "POST");
                toast.success("✅ Kod muvaffaqiyatli qo'shildi!");
            }

            closeModal();
            fetchCodes();
        } catch {
            toast.error("❌ Saqlashda xatolik!");
        }
    };

    // 🔵 Filter codes based on search
    const filteredCodes = codes.filter(item =>
        item.code.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Ma'lumotlar yuklanmoqda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-blue-600">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                🔑 Test Center Kodlari
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Barcha test markaz kodlarini boshqarish
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                                {codes.length} ta kod
                            </p>
                            <p className="text-gray-500">
                                Jami ro'yxat
                            </p>
                        </div>
                    </div>

                    {/* Search and Add Button */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Kod bo'yicha qidirish..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        {/* <button
                            onClick={openCreateModal}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Yangi kod qo'shish
                        </button> */}
                    </div>
                </div>

                {/* Codes Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="p-4 text-left text-gray-700 font-semibold">№</th>
                                    <th className="p-4 text-left text-gray-700 font-semibold">Kod</th>
                                    <th className="p-4 text-center text-gray-700 font-semibold">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredCodes.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium mb-2">Kodlar topilmadi</p>
                                                <p className="text-sm">
                                                    {searchTerm ? "Qidiruv shartlariga mos kod topilmadi" : "Hali birorta kod qo'shilmagan"}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCodes.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-blue-50 transition-colors duration-150">
                                            <td className="p-4 text-gray-600 font-medium">{index + 1}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-blue-600 font-bold text-lg">#</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 text-lg">
                                                            {item.code}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {item.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        Tahrirlash
                                                    </button>
                                                    <button
                                                        onClick={() => deleteCode(item.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        O'chirish
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-4 p-4">
                        {filteredCodes.length === 0 ? (
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-lg font-medium text-gray-500 mb-2">Kodlar topilmadi</p>
                                <p className="text-sm text-gray-400">
                                    {searchTerm ? "Qidiruv shartlariga mos kod topilmadi" : "Hali birorta kod qo'shilmagan"}
                                </p>
                            </div>
                        ) : (
                            filteredCodes.map((item, index) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">#</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-800 text-lg">
                                                    {item.code}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: {item.id}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-gray-400 font-medium">#{index + 1}</span>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Tahrirlash
                                        </button>
                                        <button
                                            onClick={() => deleteCode(item.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            O'chirish
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-blue-600">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {editId ? "✏️ Kodni tahrirlash" : "🔑 Yangi kod qo'shish"}
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kod raqami
                                </label>
                                <input
                                    type="number"
                                    value={codeValue}
                                    onChange={(e) => setCodeValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="Kodni kiriting..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={closeModal}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={saveCode}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {editId ? "Yangilash" : "Qo'shish"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TestCenterCode;