import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import { useNavigate, useParams } from "react-router-dom";

function StudentEdit() {
    const { id } = useParams(); // Talaba ID
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            toast.error("Rasm tanlanmadi!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("photo", file);
            formData.append("prefix", "student");

            const res = await ApiCall("/api/v1/file/upload", "POST", formData);
            console.log(res.data);

            const imageId = res.data;

            if (!imageId) {
                toast.error("Rasm ID qaytmadi!");
                return;
            }

            setForm((prev) => ({
                ...prev,
                imageId: imageId,
                image: `/api/v1/file/getFile/${imageId}` // 🔥 preview uchun avtomatik
            }));

            toast.success("Rasm muvaffaqiyatli yuklandi!");
        } catch (err) {
            console.error("Rasm yuklashda xato:", err);
            toast.error("Rasm yuklashda xatolik!");
        }
    };

    // Form holati
    const [form, setForm] = useState({
        firstName: "",
        secondName: "",
        thirdName: "",
        studentIdNumber: "",
        groupName: "",
        password: "",
        hemisId: "",
        image: "",
        isOnline: false,
        level: "",
        levelName: "",
        paymentForm: "",
        semester: "",
        semesterName: "",
        specialtyName: "",
        departmentName: "",
        educationForm: "",
        educationType: "",
        educationYear: "",
        studentStatus: "",
        yearOfEnter: "",
        shortName: "",
        groupId: null,
        curriculumId: null,
        imageId: "",
    });

    // ================= GROUPS LOAD =================
    useEffect(() => {
        ApiCall("/api/v1/groups", "GET")
            .then(res => setGroups(res.data))
            .catch(err => console.log("Guruhlar olinmadi:", err));
    }, []);

    // ================= LOAD STUDENT FOR EDIT =================
    useEffect(() => {
        if (!id) {
            navigate("/students");
            return;
        }

        setLoading(true);

        Promise.all([
            ApiCall(`/api/v1/my-student/${id}`, "GET"),
            ApiCall("/api/v1/groups", "GET")
        ])
            .then(([studentRes, groupsRes]) => {
                const student = studentRes.data;
                console.log(student);

                setGroups(groupsRes.data || []);

                // Student ma'lumotlarini formaga to'ldirish
                setForm({
                    firstName: student.firstName || "",
                    secondName: student.secondName || "",
                    thirdName: student.thirdName || "",
                    studentIdNumber: student.studentIdNumber || "",
                    groupName: student.groupName || "",
                    password: student.password || "",
                    hemisId: student.hemisId?.toString() || "",
                    image: student.image || "",
                    isOnline: student.isOnline || false,
                    level: student.level || "",
                    levelName: student.levelName || "",
                    paymentForm: student.paymentForm || "",
                    semester: student.semester || "",
                    semesterName: student.semesterName || "",
                    specialtyName: student.specialtyName || "",
                    departmentName: student.departmentName || "",
                    educationForm: student.educationForm || "",
                    educationType: student.educationType || "",
                    educationYear: student.educationYear || "",
                    studentStatus: student.studentStatus || "O'qimoqda",
                    yearOfEnter: student.yearOfEnter?.toString() || "",
                    shortName: student.shortName || "",
                    groupId: student.group?.id || null,
                    curriculumId: student.curriculumId || null,
                    imageId: student.imageId || "",
                });

                setLoading(false);
            })
            .catch(err => {
                console.error("Ma'lumotlar olinmadi:", err);
                alert("Talaba ma'lumotlari yuklanmadi!");
                navigate("/students");
                setLoading(false);
            });
    }, [id, navigate]);

    // ================= INPUT HANDLER =================
    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // ================= GROUP SELECT HANDLER =================
    const handleGroupChange = e => {
        const gId = e.target.value;
        const group = groups.find(g => g.id === gId);

        setForm(prev => ({
            ...prev,
            groupId: gId || null,
            groupName: group?.name || "",
            specialtyName: group?.specialtyName || prev.specialtyName,
            departmentName: group?.departmentName || prev.departmentName,
            curriculumId: group?.curriculum || prev.curriculumId
        }));
    };

    // ================= FORM VALIDATION =================
    const validateForm = () => {
        if (!form.firstName.trim()) {
            alert("Iltimos, ismni kiriting!");
            return false;
        }
        if (!form.secondName.trim()) {
            alert("Iltimos, familiyani kiriting!");
            return false;
        }
        if (!form.studentIdNumber.trim()) {
            alert("Iltimos, talaba ID raqamini kiriting!");
            return false;
        }
        return true;
    };

    // ================= UPDATE STUDENT (PUT) =================
    const handleUpdate = e => {
        e.preventDefault();

        if (!validateForm()) return;

        if (!id) {
            toast.error("Talaba ID topilmadi!");
            return;
        }

        setSaving(true);

        const payload = {
            ...form,
            hemisId: form.hemisId ? Number(form.hemisId) : null,
            yearOfEnter: form.yearOfEnter ? Number(form.yearOfEnter) : null,
            shortName: form.shortName || `${form.firstName.charAt(0)}. ${form.secondName}`,
            imageId: form.imageId
        };
        console.log(payload);
        
        ApiCall(`/api/v1/my-student/${id}`, "PUT", payload)
            .then(() => {
                toast.success("Talaba ma'lumotlari muvaffaqiyatli yangilandi!");
                navigate("/superadmin/add-student");
            })
            .catch(err => {
                console.error("Yangilashda xatolik:", err);

                const errorMsg =
                    err.response?.data ||
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Server xatosi";

                toast.error(errorMsg);
            })
            .finally(() => setSaving(false));
    };

    // ================= DELETE STUDENT =================
    const handleDelete = () => {
        if (!window.confirm(`${form.firstName} ${form.secondName} talabasini o'chirishni tasdiqlaysizmi?`)) {
            return;
        }

        ApiCall(`/api/v1/my-student/${id}`, "DELETE")
            .then(() => {
                alert("Talaba muvaffaqiyatli o'chirildi!");
                navigate("/superadmin/add-student");
            })
            .catch(err => {
                console.error("O'chirishda xatolik:", err);
                alert("Talaba o'chirilmadi!");
            });
    };

    // ================= LOADING STATE =================
    if (loading) {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Talaba ma'lumotlari yuklanmoqda...</p>
            </div>
        );
    }

    // ==========================================================
    // ========================= UI =============================
    // ==========================================================

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start md:items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Talabani tahrirlash</h1>
                        <p className="text-gray-600 mt-1">
                            {form.firstName} {form.secondName} • ID: {form.studentIdNumber}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/superadmin/add-student")}
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                        ← Ortga qaytish
                    </button>
                </div>
            </div>

            {/* Talaba ma'lumotlari kartasi */}
            <div className="bg-white rounded-lg shadow p-6 mb-6 border">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <img
                        src={form.image}
                        // src="http://localhost:8080/api/v1/file/getFile/d975f6f1-1952-4a00-a8a8-488b5354b6f3"
                        alt={form.firstName}
                        className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div>
                        <h2 className="text-xl font-semibold">
                            {form.firstName} {form.secondName} {form.thirdName}
                        </h2>
                        <div className="flex flex-wrap gap-3 mt-2">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {form.groupName || "Guruhsiz"}
                            </span>
                            <span className={`px-3 py-1 text-sm rounded-full ${form.studentStatus === 'O\'qimoqda'
                                ? 'bg-green-100 text-green-800'
                                : form.studentStatus === 'Bitirgan'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {form.studentStatus}
                            </span>
                            {form.isOnline && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    Online
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdate} className="space-y-6">
                {/* ================= PERSONAL INFO ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Asosiy ma'lumotlar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ism *
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Familiya *
                            </label>
                            <input
                                type="text"
                                name="secondName"
                                value={form.secondName}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Otasining ismi
                            </label>
                            <input
                                type="text"
                                name="thirdName"
                                value={form.thirdName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Qisqa ism
                        </label>
                        <input
                            type="text"
                            name="shortName"
                            value={form.shortName}
                            onChange={handleChange}
                            className="w-full md:w-1/2 border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder={`${form.firstName.charAt(0)}. ${form.secondName}`}
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rasm yuklash
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                        />
                    </div>

                </div>

                {/* ================= IDENTIFICATION ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Identifikatsiya</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Talaba ID raqami *
                            </label>
                            <input
                                type="text"
                                name="studentIdNumber"
                                value={form.studentIdNumber}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                HEMIS ID
                            </label>
                            <input
                                type="number"
                                name="hemisId"
                                value={form.hemisId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kirish yili
                            </label>
                            <input
                                type="number"
                                name="yearOfEnter"
                                value={form.yearOfEnter}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Parol
                            </label>
                            <input
                                type="text"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                placeholder="Parolni yangilash"
                            />
                        </div>
                    </div>
                </div>

                {/* ================= GROUP & STUDY ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">O'qish tafsilotlari</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Guruh
                            </label>
                            <select
                                name="groupId"
                                value={form.groupId || ""}
                                onChange={handleGroupChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Guruhni tanlang</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} ({g.specialtyName})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Guruh nomi
                            </label>
                            <input
                                type="text"
                                name="groupName"
                                value={form.groupName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ta'lim shakli
                            </label>
                            <select
                                name="educationForm"
                                value={form.educationForm}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">Tanlang</option>
                                <option value="Kunduzgi">Kunduzgi</option>
                                <option value="Sirtqi">Sirtqi</option>
                                <option value="Kechki">Kechki</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ta'lim turi
                            </label>
                            <input
                                type="text"
                                name="educationType"
                                value={form.educationType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                O'qish yili
                            </label>
                            <input
                                type="text"
                                name="educationYear"
                                value={form.educationYear}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* ================= ACADEMIC INFO ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Akademik ma'lumotlar</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daraja</label>
                            <input type="text" name="level" value={form.level} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Daraja nomi</label>
                            <input type="text" name="levelName" value={form.levelName} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semestr</label>
                            <input type="text" name="semester" value={form.semester} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Semestr nomi</label>
                            <input type="text" name="semesterName" value={form.semesterName} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                </div>

                {/* ================= SPECIALTY ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Mutaxassislik va to'lov</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mutaxassislik</label>
                            <input type="text" name="specialtyName" value={form.specialtyName} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kafedra</label>
                            <input type="text" name="departmentName" value={form.departmentName} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">To'lov shakli</label>
                            <select name="paymentForm" value={form.paymentForm} onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                <option value="">Tanlang</option>
                                <option value="Kontrakt">Kontrakt</option>
                                <option value="Davlat granti">Davlat granti</option>
                                <option value="To'lov-shartnoma">To'lov-shartnoma</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ================= STATUS ================= */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Status va qo'shimcha</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Talaba holati</label>
                            <select
                                name="studentStatus"
                                value={form.studentStatus}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="O'qimoqda">O'qimoqda</option>
                                <option value="O'qishdan chetlashtirilgan">O'qishdan chetlashtirilgan</option>
                                <option value="Akademik ta'til">Akademik ta'til</option>
                                <option value="Bitirgan">Bitirgan</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3 mt-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isOnline"
                                    checked={form.isOnline}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-gray-700">Online ta'lim</span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Rasm URL
                        </label>
                        <input
                            type="text"
                            name="image"
                            value={form.image}
                            onChange={handleChange}
                            placeholder="https://example.com/student-image.jpg"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* ================= BUTTONS ================= */}
                <div className="flex justify-between items-center pt-6 border-t">
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        O'chirish
                    </button>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/students")}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Bekor qilish
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saqlanmoqda...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Saqlash
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default StudentEdit;