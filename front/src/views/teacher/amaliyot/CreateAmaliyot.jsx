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
  FiEye,
} from "react-icons/fi";

function CreateAmaliyot() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("months");
  const navigate = useNavigate();
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
    setMonth(monthsOptions.find((opt) => opt.value === month.months));
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

      // 1️⃣ Oy ma'lumotini update qilish
      const res = await ApiCall(
        `/api/v1/months/${editingMonth.id}`,
        "PUT",
        payload
      );
      console.log(deadline);

      // 2️⃣ Deadline o'zgargan bo'lsa barcha talabalar uchun update qilish
      if (deadline) {
        console.log(51515);

        await ApiCall(
          `/api/v1/amaliyot-group/update-endtime/group/${id}`,
          "PUT",
          {
            deadline: deadline, // 🔥 BACKEND qaysi field kutayotgan bo'lsa shuni yozing
          }
        );
      }

      toast.success(`✅ ${res.data.months || month.value} oy yangilandi!`);
      toast.success("⏰ Deadline barcha talabalar uchun yangilandi!");

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
    const monthIndex =
      monthsOptions.findIndex((m) => m.value === month.value) + 1;
    const daysInMonth = new Date(year, monthIndex, 0).getDate();
    return {
      min: `${year}-${String(monthIndex).padStart(2, "0")}-01T00:00`,
      max: `${year}-${String(monthIndex).padStart(
        2,
        "0"
      )}-${daysInMonth}T23:59`,
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
        borderColor: "#10B981",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#10B981"
        : state.isFocused
        ? "#ECFDF5"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      padding: "0.75rem 1rem",
    }),
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto max-w-7xl">
        {/* 🔹 Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
            🎓 Guruh Boshqaruvi
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Guruh oylari va talabalarini boshqaring
          </p>
        </div>

        {/* 🔹 Main Content Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {/* 🔹 Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-gray-200 p-6">
            <button
              className={`flex items-center gap-3 rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === "months"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("months")}
            >
              <FiCalendar className="text-lg" />
              <span>Oylar</span>
              {monthsList.length > 0 && (
                <span className="rounded-full bg-white bg-opacity-20 px-2 py-1 text-xs">
                  {monthsList.length}
                </span>
              )}
            </button>
            <button
              className={`flex items-center gap-3 rounded-xl px-6 py-3 font-semibold transition-all duration-300 ${
                activeTab === "students"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
              onClick={() => setActiveTab("students")}
            >
              <FiUsers className="text-lg" />
              <span>Talabalar</span>
              {students.length > 0 && (
                <span className="rounded-full bg-white bg-opacity-20 px-2 py-1 text-xs">
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
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Guruh Oylari
                    </h2>
                    <p className="mt-1 text-gray-600">
                      Amaliyot oylarini boshqaring
                    </p>
                  </div>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
                  >
                    <FiPlus className="text-lg" />
                    Yangi oy qo'shish
                  </button>
                </div>

                {/* 🔹 Oylar ro'yxati */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-green-500"></div>
                  </div>
                ) : monthsList.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 py-12 text-center">
                    <div className="mb-4 text-6xl">📅</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                      Hech qanday oy topilmadi
                    </h3>
                    <p className="mb-6 text-gray-500">
                      Yangi oy qo'shish uchun quyidagi tugmani bosing
                    </p>
                    <button
                      onClick={openAddModal}
                      className="mx-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
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
                        className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-indigo-300 hover:shadow-md"
                      >
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-600">
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <div className="mb-3 flex flex-wrap items-center gap-3">
                                  <h4 className="text-xl font-bold text-gray-800">
                                    {m.months}
                                  </h4>
                                  {m.description && (
                                    <span className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600">
                                      {m.description}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                  {m.deadline && (
                                    <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-red-700">
                                      <FiClock className="text-red-500" />
                                      <span className="font-medium">
                                        Oxirgi muddat:
                                      </span>
                                      {new Date(m.deadline).toLocaleString(
                                        "uz-UZ"
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-gray-500">
                                    <FiCalendar />
                                    {new Date(m.createdAt).toLocaleDateString(
                                      "uz-UZ"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/teacher/amaliyots/students/${m.id}`,
                                  {
                                    state: { groupId: id },
                                  }
                                )
                              }
                              className="hover:bg-greeen-600 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors"
                            >
                              <FiEye size={16} />
                              Tekshirish
                            </button>
                            <button
                              onClick={() => handleEditMonth(m)}
                              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                            >
                              <FiEdit size={16} />
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDeleteMonth(m.id)}
                              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
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
                  <h2 className="mb-2 text-2xl font-bold text-gray-800">
                    Guruh Talabalari
                  </h2>
                  <p className="text-gray-600">
                    Guruhdagi barcha talabalar ro'yxati
                  </p>
                </div>

                {loadingStudents ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : students.length === 0 ? (
                  <div className="rounded-2xl bg-gray-50 py-12 text-center">
                    <div className="mb-4 text-6xl">👥</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-700">
                      Talabalar topilmadi
                    </h3>
                    <p className="text-gray-500">
                      Guruhda hali talabalar mavjud emas
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((student, index) => (
                      <div
                        onClick={() =>
                          navigate(`/teacher/amaliyots/month/${student.id}`)
                        }
                        key={student.id}
                        className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="mb-4 flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800">
                              {student.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
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
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div
              className={`flex items-center justify-between rounded-t-2xl px-6 py-4 ${
                isAddModalOpen
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600"
              }`}
            >
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                {isAddModalOpen ? <FiPlus /> : <FiEdit />}
                {isAddModalOpen ? "Yangi oy qo'shish" : "Oyni tahrirlash"}
              </h3>
              <button
                onClick={isAddModalOpen ? closeAddModal : closeEditModal}
                className="text-white transition-colors hover:text-gray-200"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* 🔹 Oy tanlash */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Oy *
                </label>
                <Select
                  placeholder="Oy tanlang..."
                  options={monthsOptions}
                  value={month}
                  onChange={(opt) => {
                    setMonth(opt);
                    if (opt) {
                      const monthIndex =
                        monthsOptions.findIndex((m) => m.value === opt.value) +
                        1;
                      const defaultDate = `${year}-${String(
                        monthIndex
                      ).padStart(2, "0")}-01T00:00`;
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
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  <FiClock className="mr-2 inline" />
                  Oxirgi muddat
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  value={deadline}
                  min={min}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Tanlangan oy:{" "}
                  {min
                    ? `${min.split("T")[0]} - ${max.split("T")[0]}`
                    : "Oy tanlang"}
                </p>
              </div>

              {/* 🔹 Izoh maydoni */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  <FiFileText className="mr-2 inline" />
                  Izoh
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 1-kurs amaliyoti"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 rounded-b-2xl bg-gray-50 px-6 py-4">
              <button
                onClick={isAddModalOpen ? closeAddModal : closeEditModal}
                className="flex-1 rounded-xl border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={isAddModalOpen ? handleCreateMonth : handleUpdateMonth}
                disabled={loading || !month}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 font-medium text-white transition-all ${
                  loading || !month
                    ? "cursor-not-allowed bg-gray-400"
                    : isAddModalOpen
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
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
