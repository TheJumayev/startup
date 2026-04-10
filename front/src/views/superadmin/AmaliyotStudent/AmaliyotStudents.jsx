import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    FiCalendar,
    FiUsers,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiX,
    FiClock,
    FiFileText,
    FiCheckCircle,
    FiUser,
    FiMail,
    FiPhone,
    FiEye
} from "react-icons/fi";

function CreateAmaliyot() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState("months");
    const navigate = useNavigate()
    // 🔹 Modal holatlari
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // 🔹 Oy yaratish va tahrirlash uchun holatlar
    const [month, setMonth] = useState(null);
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [monthsList, setMonthsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingMonth, setEditingMonth] = useState(null);

    // 🔹 Talabalar uchun holatlar
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // 🔹 12 ta oy
    const monthsOptions = [
        { value: "Yanvar", label: "Yanvar" },
        { value: "Fevral", label: "Fevral" },
        { value: "Mart", label: "Mart" },
        { value: "Aprel", label: "Aprel" },
        { value: "May", label: "May" },
        { value: "Iyun", label: "Iyun" },
        { value: "Iyul", label: "Iyul" },
        { value: "Avgust", label: "Avgust" },
        { value: "Sentyabr", label: "Sentyabr" },
        { value: "Oktyabr", label: "Oktyabr" },
        { value: "Noyabr", label: "Noyabr" },
        { value: "Dekabr", label: "Dekabr" },
    ];

    // 🔹 Guruhga tegishli oylarni olish
    const fetchMonthsByGroup = async () => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/months/${id}`, "GET");
            if (Array.isArray(res.data)) {
                setMonthsList(res.data);
            } else {
                setMonthsList([]);
            }
        } catch (err) {
            toast.error("❌ Oylarni yuklashda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Talabalarni olish
    const fetchStudents = async () => {
        try {
            setLoadingStudents(true);
            const res = await ApiCall(`/api/v1/groups/students/${id}`, "GET");
            setStudents(res.data || []);
        } catch (err) {
            toast.error("❌ Talabalarni yuklashda xatolik!");
            console.error(err);
        } finally {
            setLoadingStudents(false);
        }
    };

    // 🔹 Yangi oy yaratish
    const handleCreateMonth = async () => {
        if (!month) {
            toast.error("Oy tanlang!");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                month: month.value,
                description,
                deadline,
                groupId: id,
            };
            const res = await ApiCall("/api/v1/months", "POST", payload);
            toast.success(`✅ ${res.data.months || month.value} oy qo'shildi!`);
            resetForm();
            setIsAddModalOpen(false);
            fetchMonthsByGroup();
        } catch (err) {
            toast.error("❌ Oy yaratishda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Oyni tahrirlash
    const handleEditMonth = (month) => {
        setEditingMonth(month);
        setMonth(monthsOptions.find(opt => opt.value === month.months));
        setDescription(month.description || "");
        setDeadline(month.deadline ? month.deadline.slice(0, 16) : "");
        setIsEditModalOpen(true);
    };

    // 🔹 Oyni yangilash
    const handleUpdateMonth = async () => {
        if (!month) {
            toast.error("Oy tanlang!");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                month: month.value,
                description,
                deadline,
                groupId: id,
            };
            const res = await ApiCall(`/api/v1/months/${editingMonth.id}`, "PUT", payload);
            toast.success(`✅ ${res.data.months || month.value} oy yangilandi!`);
            resetForm();
            setIsEditModalOpen(false);
            fetchMonthsByGroup();
        } catch (err) {
            toast.error("❌ Oyni yangilashda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Oyni o'chirish
    const handleDeleteMonth = async (monthId) => {
        if (window.confirm("Haqiqatan ham bu oyni o'chirmoqchimisiz?")) {
            try {
                await ApiCall(`/api/v1/months/${monthId}`, "DELETE");
                toast.success("✅ Oy muvaffaqiyatli o'chirildi!");
                fetchMonthsByGroup();
            } catch (err) {
                toast.error("❌ Oyni o'chirishda xatolik!");
                console.error(err);
            }
        }
    };

    // 🔹 Formani tozalash
    const resetForm = () => {
        setMonth(null);
        setDescription("");
        setDeadline("");
        setEditingMonth(null);
    };

    // 🔹 Modal ochish funksiyalari
    const openAddModal = () => {
        resetForm();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        resetForm();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        resetForm();
    };

    // 🔹 Tab o'zgarganda ma'lumotlarni yuklash
    useEffect(() => {
        if (activeTab === "months") {
            fetchMonthsByGroup();
        } else if (activeTab === "students") {
            fetchStudents();
        }
    }, [activeTab]);

    // 🔹 Hozirgi yil
    const year = new Date().getFullYear();

    // 🔹 Sana chegaralarini hisoblash
    const getDateLimits = () => {
        if (!month) return { min: "", max: "" };
        const monthIndex = monthsOptions.findIndex(m => m.value === month.value) + 1;
        const daysInMonth = new Date(year, monthIndex, 0).getDate();
        return {
            min: `${year}-${String(monthIndex).padStart(2, "0")}-01T00:00`,
            max: `${year}-${String(monthIndex).padStart(2, "0")}-${daysInMonth}T23:59`
        };
    };

    const { min, max } = getDateLimits();

    // 🔹 Custom Select styles
    const customStyles = {
        control: (base) => ({
            ...base,
            border: "1px solid #D1D5DB",
            borderRadius: "0.75rem",
            padding: "0.5rem",
            boxShadow: "none",
            "&:hover": {
                borderColor: "#10B981"
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? "#10B981" : state.isFocused ? "#ECFDF5" : "white",
            color: state.isSelected ? "white" : "#374151",
            padding: "0.75rem 1rem"
        })
    };

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* 🔹 Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                        🎓 Guruh Boshqaruvi
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Guruh oylari va talabalarini boshqaring
                    </p>
                </div>

                {/* 🔹 Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* 🔹 Tab Navigation */}
                    <div className="flex flex-wrap gap-2 border-b border-gray-200 p-6">
                        <button
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "months"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                                }`}
                            onClick={() => setActiveTab("months")}
                        >
                            <FiCalendar className="text-lg" />
                            <span>Oylar</span>
                            {monthsList.length > 0 && (
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                                    {monthsList.length}
                                </span>
                            )}
                        </button>
                        <button
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${activeTab === "students"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                                }`}
                            onClick={() => setActiveTab("students")}
                        >
                            <FiUsers className="text-lg" />
                            <span>Talabalar</span>
                            {students.length > 0 && (
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs">
                                    {students.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* 🔹 Content Area */}
                    <div className="p-6">
                        {/* 🟣 Oylar bo'limi */}
                        {activeTab === "months" && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Guruh Oylari
                                        </h2>
                                        <p className="text-gray-600 mt-1">
                                            Amaliyot oylarini boshqaring
                                        </p>
                                    </div>
                                    <button
                                        onClick={openAddModal}
                                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <FiPlus className="text-lg" />
                                        Yangi oy qo'shish
                                    </button>
                                </div>

                                {/* 🔹 Oylar ro'yxati */}
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                                    </div>
                                ) : monthsList.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                        <div className="text-6xl mb-4">📅</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            Hech qanday oy topilmadi
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            Yangi oy qo'shish uchun quyidagi tugmani bosing
                                        </p>
                                        <button
                                            onClick={openAddModal}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
                                        >
                                            <FiPlus className="text-lg" />
                                            Birinchi oyni qo'shish
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {monthsList.map((m, i) => (
                                            <div
                                                key={m.id}
                                                className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-4">
                                                            <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl font-bold text-lg">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                                    <h4 className="text-xl font-bold text-gray-800">
                                                                        {m.months}
                                                                    </h4>
                                                                    {m.description && (
                                                                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                                                                            {m.description}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                                    {m.deadline && (
                                                                        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg">
                                                                            <FiClock className="text-red-500" />
                                                                            <span className="font-medium">Deadline:</span>
                                                                            {new Date(m.deadline).toLocaleString("uz-UZ")}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2 text-gray-500">
                                                                        <FiCalendar />
                                                                        {new Date(m.createdAt).toLocaleDateString("uz-UZ")}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                navigate(`/superadmin/amaliyots/students/${m.id}`, {
                                                                    state: { groupId: id }
                                                                })
                                                            }
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-greeen-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <FiEye size={16} />
                                                            Tekshirish
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditMonth(m)}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <FiEdit size={16} />
                                                            Tahrirlash
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMonth(m.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <FiTrash2 size={16} />
                                                            O'chirish
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 👥 Talabalar bo'limi */}
                        {activeTab === "students" && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Guruh Talabalari
                                    </h2>
                                    <p className="text-gray-600">
                                        Guruhdagi barcha talabalar ro'yxati
                                    </p>
                                </div>

                                {loadingStudents ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                        <div className="text-6xl mb-4">👥</div>
                                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                            Talabalar topilmadi
                                        </h3>
                                        <p className="text-gray-500">
                                            Guruhda hali talabalar mavjud emas
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {students.map((student, index) => (
                                            <div
                                                onClick={() => navigate(`/superadmin/amaliyots/month/${student.id}`)}
                                                key={student.id}
                                                className="cursor-pointer bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-lg">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-800 text-lg">
                                                            {student.fullName}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm">
                                                            {student.email}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm text-gray-600">
                                                    {student.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <FiPhone size={14} />
                                                            <span>{student.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <FiUser size={14} />
                                                        <span>ID: {student.studentIdNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🔹 Yangi oy qo'shish modali */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className={`px-6 py-4 rounded-t-2xl flex justify-between items-center ${isAddModalOpen
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            }`}>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                {isAddModalOpen ? <FiPlus /> : <FiEdit />}
                                {isAddModalOpen ? "Yangi oy qo'shish" : "Oyni tahrirlash"}
                            </h3>
                            <button
                                onClick={isAddModalOpen ? closeAddModal : closeEditModal}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <FiX size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 🔹 Oy tanlash */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Oy *
                                </label>
                                <Select
                                    placeholder="Oy tanlang..."
                                    options={monthsOptions}
                                    value={month}
                                    onChange={(opt) => {
                                        setMonth(opt);
                                        if (opt) {
                                            const monthIndex = monthsOptions.findIndex(m => m.value === opt.value) + 1;
                                            const defaultDate = `${year}-${String(monthIndex).padStart(2, "0")}-01T00:00`;
                                            setDeadline(defaultDate);
                                        } else {
                                            setDeadline("");
                                        }
                                    }}
                                    isSearchable
                                    styles={customStyles}
                                />
                            </div>

                            {/* 🔹 Deadline tanlash */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <FiClock className="inline mr-2" />
                                    Deadline
                                </label>
                                <input
                                    type="datetime-local"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                    value={deadline}
                                    min={min}
                                    max={max}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Tanlangan oy: {min ? `${min.split('T')[0]} - ${max.split('T')[0]}` : 'Oy tanlang'}
                                </p>
                            </div>

                            {/* 🔹 Izoh maydoni */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    <FiFileText className="inline mr-2" />
                                    Izoh
                                </label>
                                <input
                                    type="text"
                                    placeholder="Masalan: 1-kurs amaliyoti"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button
                                onClick={isAddModalOpen ? closeAddModal : closeEditModal}
                                className="flex-1 border border-gray-300 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={isAddModalOpen ? handleCreateMonth : handleUpdateMonth}
                                disabled={loading || !month}
                                className={`flex-1 py-3 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 ${loading || !month
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : isAddModalOpen
                                        ? 'bg-green-500 hover:bg-green-600'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saqlanmoqda...
                                    </>
                                ) : (
                                    <>
                                        <FiCheckCircle />
                                        {isAddModalOpen ? "Qo'shish" : "Yangilash"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CreateAmaliyot;