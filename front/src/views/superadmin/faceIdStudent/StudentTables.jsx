import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

function StudentTables() {
    const { id } = useParams(); // URL dan groupId
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    // 🟢 FaceStudents jadvalidan barcha ma’lumotlarni olish
    const fetchFaceData = async () => {
        try {
            const res = await ApiCall(`/api/v1/face-students/all`, "GET");
            const faceList = res.data || [];

            // 🟢 Talabalarga ularning Face ma’lumotlarini birlashtiramiz
            setStudents((prev) =>
                prev.map((s) => {
                    const match = faceList.find((f) => f.student?.id === s.id);
                    return match
                        ? {
                            ...s,
                            phone: match.phone || "",
                            telegramId: match.telegramId || "",
                            nickname: match.nickname || "",
                            isActive: match.isActive || false,
                            hasFace: true,
                        }
                        : s;
                })
            );
        } catch (err) {
            console.error("❌ FaceStudents ma’lumotlarini olishda xatolik:", err);
        }
    };
    useEffect(() => {
        if (students.length > 0) {
            fetchFaceData();
        }
    }, [students.length]);

    // 🔹 Talabalarni olish
    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/groups/students/${id}`, "GET");
            setStudents((res.data || []).map(s => ({ ...s, hasFace: false })));
        } catch (err) {
            toast.error("❌ Talabalar ro‘yxatini olishda xatolik!");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [id]);


    const refreshStudent = async (studentId) => {
        try {
            const res = await ApiCall(`/api/v1/face-students/${studentId}`, "GET");
            const updated = res.data;
            console.log(res.data);

            setStudents((prev) =>
                prev.map((s) =>
                    s.id === studentId
                        ? {
                            ...s,
                            phone: updated.phone,
                            telegramId: updated.telegramId,
                            nickname: updated.nickname,
                            isActive: updated.isActive,
                            hasFace: true, // flag qo‘yamiz
                        }
                        : s
                )
            );
        } catch (err) {
            console.error("❌ Student yangilashda xatolik:", err);
        }
    };

    // 🔹 Input o‘zgarishini saqlash
    const handleChange = (studentId, field, value) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.id === studentId ? { ...s, [field]: value } : s
            )
        );
    };

    // 🔹 Toggle status
    const toggleStatus = (studentId) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.id === studentId ? { ...s, isActive: !s.isActive } : s
            )
        );
    };

    // 🔹 Saqlashni tasdiqlash oynasi
    const handleSaveClick = (student) => {
        setSelectedStudent(student);
        setConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        if (!selectedStudent) return;

        try {
            const method = selectedStudent.hasFace ? "PUT" : "POST";
            await ApiCall(`/api/v1/face-students/${selectedStudent.id}`, method, {
                phone: selectedStudent.phone || "",
                telegramId: selectedStudent.telegramId
                    ? Number(selectedStudent.telegramId)
                    : null,
                nickname: selectedStudent.nickname || "",
                isActive: selectedStudent.isActive || false,
            });

            toast.success(`${selectedStudent.fullName} ma’lumotlari saqlandi ✅`);
            setConfirmModal(false);
            setSelectedStudent(null);

            // ✅ Faqat shu talaba uchun yangilangan ma’lumotni qayta olish
            await refreshStudent(selectedStudent.id);

        } catch (err) {
            toast.error("❌ Saqlashda xatolik!");
            console.error(err);
        }
    };


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ToastContainer />
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Guruh talabalari ro‘yxati
            </h1>

            {loading ? (
                <div className="text-center text-gray-500">Yuklanmoqda...</div>
            ) : students.length === 0 ? (
                <div className="text-center text-gray-400">Talabalar mavjud emas</div>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">№</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">F.I.SH</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hemis ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Telefon raqam</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Telegram ID</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nick name</th>
                                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Amal</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {students.map((s, i) => (
                                <tr key={s.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm text-gray-700">{i + 1}</td>
                                    <td className="px-4 py-2 flex items-center gap-3">
                                        <img
                                            src={s.image || "https://via.placeholder.com/40"}
                                            alt={s.fullName}
                                            className="w-10 h-10 rounded-full border"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-800">{s.fullName}</div>
                                            <div className="text-xs text-gray-500">{s.group?.name || "—"}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-700">{s.studentIdNumber}</td>

                                    {/* Telefon raqam input */}
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={
                                                s.phone?.startsWith("+998")
                                                    ? s.phone
                                                    : "+998" + (s.phone || "")
                                            }
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (!value.startsWith("+998")) {
                                                    value = "+998" + value.replace(/^\+?998?/, "");
                                                }
                                                let digits = value.replace("+998", "").replace(/\D/g, "");
                                                if (digits.length > 9) digits = digits.slice(0, 9);
                                                handleChange(s.id, "phone", "+998" + digits);
                                            }}
                                            placeholder="+998911234567"
                                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </td>

                                    {/* Telegram ID input */}
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={s.telegramId || ""}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, "");
                                                if (value.length > 10) value = value.slice(0, 10);
                                                handleChange(s.id, "telegramId", value);
                                            }}
                                            placeholder="Telegram ID"
                                            className={`w-full border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 ${s.telegramId &&
                                                (s.telegramId.length < 7 || s.telegramId.length > 10)
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                        />
                                    </td>

                                    {/* Nickname input */}
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            value={s.nickname || ""}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (!value.startsWith("@"))
                                                    value = "@" + value.replace(/@/g, "");
                                                value = value.replace(/[^A-Za-z0-9_@]/g, "");
                                                if (value.length > 32) value = value.slice(0, 32);
                                                handleChange(s.id, "nickname", value);
                                            }}
                                            placeholder="@username"
                                            className={`w-full border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 ${s.nickname &&
                                                (!s.nickname.startsWith("@") ||
                                                    s.nickname.length < 5 ||
                                                    s.nickname.length > 32)
                                                ? "border-red-400 focus:ring-red-500"
                                                : "border-gray-300 focus:ring-blue-500"
                                                }`}
                                        />
                                    </td>

                                    {/* ✅ Toggle switch for status */}
                                    <td className="px-4 py-2 text-center">
                                        <label className="relative inline-block w-12 h-7 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={s.isActive || false}
                                                onChange={() => toggleStatus(s.id)}
                                                className="sr-only peer"
                                            />
                                            <span
                                                className="
        absolute inset-0 bg-gray-300 
        rounded-full transition-all duration-300 
        peer-checked:bg-green-500
      "
                                            ></span>
                                            <span
                                                className="
        absolute left-1 top-1 
        w-5 h-5 bg-white rounded-full 
        shadow-md transition-all duration-300 
        peer-checked:translate-x-5
      "
                                            ></span>
                                        </label>
                                    </td>


                                    {/* Saqlash tugmasi */}
                                    <td className="px-4 py-2 text-center">
                                        <button
                                            onClick={() => handleSaveClick(s)}
                                            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md"
                                        >
                                            Saqlash
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 🟢 Tasdiqlash modali */}
            <Modal
                isOpen={confirmModal}
                onRequestClose={() => setConfirmModal(false)}
                className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            >
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Siz ishonchingiz komilmi?
                </h2>
                <p className="text-gray-600 mb-6">
                    {selectedStudent?.fullName} ma’lumotlarini saqlamoqchimisiz?
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setConfirmModal(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                    >
                        Bekor qilish
                    </button>
                    <button
                        onClick={handleConfirmSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Tasdiqlash
                    </button>
                </div>
            </Modal>
        </div>
    );
}

export default StudentTables;
