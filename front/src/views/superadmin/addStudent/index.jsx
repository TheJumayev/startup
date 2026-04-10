import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import React, { useEffect, useState } from "react";
import ApiCall from "../../../config/index";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Index() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [modal, setModal] = useState(false);
  const [groupStudents, setGroupStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalStudent, setOriginalStudent] = useState(null); // Asl talabani saqlash
  const navigate = useNavigate();
  const [form, setForm] = useState({
    curriculumId: "",
    departmentName: "",
    educationForm: "",
    educationType: "",
    educationYear: "",
    firstName: "",
    secondName: "",
    thirdName: "",
    groupName: "",
    hemisId: "",
    image: "",
    isOnline: false,
    level: "",
    levelName: "",
    paymentForm: "",
    semester: "",
    semesterName: "",
    shortName: "",
    specialtyName: "",
    studentIdNumber: "",
    studentStatus: "",
    yearOfEnter: "",
    groupId: "",
    password: "",
    imageId: "",
  });

  const handleExportExcel = () => {
    if (!students || students.length === 0) {
      toast.warning("Talabalar mavjud emas!");
      return;
    }

    const excelData = students.map((s, index) => ({
      "№": index + 1,
      ID: s.id,
      "Hemis ID": s.hemisId,
      "To'liq ism": s.fullName,
      Ism: s.firstName,
      Familiya: s.secondName,
      Sharifi: s.thirdName,
      "Qisqa ism": s.shortName,
      "Talaba ID": s.studentIdNumber,
      Telefon: s.phone,
      Guruh: s.groupName,
      Mutaxassislik: s.specialtyName,
      "Ta'lim shakli": s.educationForm,
      "Ta'lim turi": s.educationType,
      Daraja: s.level,
      Semester: s.semester,
      Online: s.isOnline ? "HA" : "YO'Q",
      "Yaratilgan sana": s.createdAt,
      "Yangilangan sana": s.updatedAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, `Students_${new Date().getFullYear()}.xlsx`);
  };

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);
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

      // Backend faqat ID qaytarayotgan bo‘lsa:
      const imageId = res.data;

      if (!imageId) {
        toast.error("Rasm ID qaytmadi!");
        return;
      }

      // Formga yozish
      setForm((prev) => ({
        ...prev,
        imageId: imageId,
      }));

      toast.success("Rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      console.error("Rasm yuklashda xato:", err);
      toast.error("Rasm yuklashda xatolik!");
    }
  };

  // 🔵 TALABALAR RO'YXATI
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/my-student", "GET");
      const data = res.data.filter((st) => st.isMy === true);
      setStudents(data);
    } catch (err) {
      console.error("Talabalarni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Barcha guruhlarni olish
  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      setGroups(res.data || []);
    } catch (err) {
      console.error("Guruhlarni olishda xatolik:", err);
    }
  };

  // 🔵 Formani tozalash
  const resetForm = () => {
    setForm({
      curriculumId: "",
      departmentName: "",
      educationForm: "",
      educationType: "",
      educationYear: "",
      firstName: "",
      secondName: "",
      thirdName: "",
      groupName: "",
      hemisId: "",
      image: "",
      isOnline: false,
      level: "",
      levelName: "",
      paymentForm: "",
      semester: "",
      semesterName: "",
      shortName: "",
      specialtyName: "",
      studentIdNumber: "",
      studentStatus: "O'qimoqda",
      yearOfEnter: "",
      groupId: "",
      password: "12345678",
    });
    setGroupStudents([]);
    setOriginalStudent(null);
  };

  // 🔵 Guruh tanlansa → shu guruh talabalarini yuklash
  const handleGroupSelect = async (opt) => {
    if (!opt) {
      resetForm();
      return;
    }

    setForm({
      ...form,
      groupId: opt.value,
      groupName: opt.label,
      departmentName: opt.dep,
      specialtyName: opt.spec,
      curriculumId: opt.cur,
    });

    try {
      const res = await ApiCall(`/api/v1/groups/students/${opt.value}`, "GET");
      setGroupStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Guruh talabalari olinmadi", err);
      setGroupStudents([]);
    }
  };

  // 🔵 Talaba tanlansa → formga hamma ma'lumotlarni to'ldirish
  const handleStudentSelect = (opt) => {
    if (!opt || !opt.data) {
      resetForm();
      return;
    }

    const s = opt.data;

    // Asl talabani saqlab qo'yish (clone qilish uchun)
    setOriginalStudent(s);

    // DTO va API javobidan bir xil ma'lumotlarni ajratib olish
    const baseForm = {
      // Asosiy shaxsiy ma'lumotlar
      firstName: s.firstName || "",
      secondName: s.secondName || "",
      thirdName: s.thirdName || "",
      studentIdNumber: s.studentIdNumber || "",
      hemisId: s.hemisId || "",
      image: s.image || "",
      shortName: s.shortName || "",
      password: s.password || "12345678",

      // O'qish ma'lumotlari
      curriculumId: s.curriculumId || s.group?.curriculum || "",
      departmentName: s.departmentName || s.group?.departmentName || "",
      specialtyName: s.specialtyName || s.group?.specialtyName || "",
      groupName: s.groupName || s.group?.name || "",
      groupId: s.group?.id || form.groupId,
      educationForm: s.educationForm || "Kunduzgi",
      educationType: s.educationType || "Bakalavr",
      educationYear: s.educationYear || "",
      level: s.level || "",
      levelName: s.levelName || "",
      semester: s.semester || "",
      semesterName: s.semesterName || "",
      yearOfEnter: s.yearOfEnter || new Date().getFullYear(),

      // Status va to'lov
      paymentForm: s.paymentForm || "To'lov-shartnoma",
      studentStatus: s.studentStatus || "O'qimoqda",
      isOnline: s.isOnline || false,
    };

    setForm(baseForm);
  };

  // 🔵 Yangi talaba ID generatsiyasi
  const generateNewStudentId = () => {
    // Sizning logikangiz bo'yicha yangi ID generatsiya qilish
    // Masalan: avvalgi ID raqamni oshirish yoki random generatsiya
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${new Date().getFullYear()}${randomNum}`;
  };

  // 🔵 POST Yuborish
  const createStudent = async () => {
    // Validatsiya
    if (!form.groupId) {
      alert("Iltimos, guruhni tanlang!");
      return;
    }

    if (!form.firstName.trim() || !form.secondName.trim()) {
      alert("Iltimos, ism va familiyani kiriting!");
      return;
    }

    if (!form.studentIdNumber.trim()) {
      alert("Iltimos, yangi talaba ID raqamini kiriting!");
      return;
    }
    if (!form.hemisId.trim()) {
      alert("Iltimos, yangi Hemis ID kiriting!");
      return;
    }
    // Clone qilish uchun so'rov tayyorlash
    const studentData = {
      // 1. Guruh ma'lumoti
      groupId: form.groupId,
      groupName: form.groupName,

      // 2. Talaba shaxsiy ma'lumotlari (o'zgartiriladiganlar)
      firstName: form.firstName,
      secondName: form.secondName,
      thirdName: form.thirdName,
      studentIdNumber: form.studentIdNumber,
      password: form.password || "12345678",

      // 3. Asl talabadan olingan ma'lumotlar
      curriculumId: form.curriculumId || originalStudent?.curriculumId,
      departmentName: form.departmentName || originalStudent?.departmentName,
      educationForm: form.educationForm || originalStudent?.educationForm,
      educationType: form.educationType || originalStudent?.educationType,
      educationYear: form.educationYear || originalStudent?.educationYear,
      hemisId: form.hemisId,
      image: form.image || originalStudent?.image,
      isOnline: form.isOnline,
      level: form.level || originalStudent?.level,
      levelName: form.levelName || originalStudent?.levelName,
      paymentForm: form.paymentForm || originalStudent?.paymentForm,
      semester: form.semester || originalStudent?.semester,
      semesterName: form.semesterName || originalStudent?.semesterName,
      shortName:
        form.shortName || `${form.firstName?.charAt(0)}. ${form.secondName}`,
      specialtyName: form.specialtyName || originalStudent?.specialtyName,
      studentStatus: form.studentStatus || originalStudent?.studentStatus,
      yearOfEnter: form.yearOfEnter || originalStudent?.yearOfEnter,
      imageId: form.imageId,
    };
    try {
      await ApiCall("/api/v1/my-student", "POST", studentData);
      alert("Talaba muvaffaqiyatli yaratildi!");
      setModal(false);
      resetForm();
      fetchStudents();
    } catch (err) {
      console.error("Yaratishda xato:", err);
      const message = err.response?.data || "Xatolik yuz berdi";
      toast.error(message, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // 🔵 Yangi ID generatsiyasi tugmasi
  const handleGenerateId = () => {
    setForm({
      ...form,
      studentIdNumber: generateNewStudentId(),
    });
  };

  // 🔵 OPTIONS — Guruhlar
  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.name} (${g.specialtyName})`,
    dep: g.departmentName,
    spec: g.specialtyName,
    cur: g.curriculum,
  }));

  // 🔵 OPTIONS — Talabalar
  const studentOptions = groupStudents.map((s) => ({
    value: s.id,
    label: `${s.firstName} ${s.secondName} - ${s.studentIdNumber}`,
    data: s,
  }));

  // 🔵 Asosiy inputlar uchun handleChange
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="p-5">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Talabalar boshqaruvi
          </h1>
          <p className="mt-1 text-gray-600">Jami {students.length} ta talaba</p>
        </div>
        <button
          onClick={handleExportExcel}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-white shadow hover:bg-green-700"
        >
          Excel yuklab olish
        </button>

        <button
          onClick={() => {
            resetForm();
            setModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-white shadow hover:bg-purple-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Yangi talaba (Clone)
        </button>
      </div>

      {/* STUDENTS TABLE */}
      {loading ? (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  #
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  F.I.Sh
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Talaba ID
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Guruh
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Mutaxassislik
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Holati
                </th>
                <th className="p-3 text-left text-sm font-medium text-gray-700">
                  Amallar
                </th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Hozircha talabalar mavjud emas
                  </td>
                </tr>
              ) : (
                students.map((stud, index) => (
                  <tr key={stud.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      <div className="font-medium">
                        {stud.firstName} {stud.secondName} {stud.thirdName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stud.shortName}
                      </div>
                    </td>
                    <td className="p-3 font-mono">{stud.studentIdNumber}</td>
                    <td className="p-3">{stud.groupName}</td>
                    <td className="p-3">{stud.specialtyName}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          stud.studentStatus === "O'qimoqda"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {stud.studentStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/superadmin/add-student/${stud.id}`)
                        }
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= MODAL ================ */}
      {modal && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
            {/* Modal Header */}
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Yangi talaba yaratish (Clone usuli)
                </h2>
                <button
                  onClick={() => {
                    setModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-gray-600">
                Guruh va talaba tanlab, yangi talaba ma'lumotlarini o'zgartiring
              </p>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 p-6">
              {/* 1. Guruh tanlash */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Guruh tanlash <span className="text-red-500">*</span>
                </label>
                <Select
                  options={groupOptions}
                  placeholder="Guruhni tanlang..."
                  isSearchable
                  onChange={handleGroupSelect}
                  styles={{
                    control: (base) => ({
                      ...base,
                      border: "1px solid #d1d5db",
                      borderRadius: "0.5rem",
                      padding: "2px",
                    }),
                  }}
                />
              </div>

              {/* 2. Talaba tanlash */}
              {form.groupId && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Namuna talabani tanlang
                  </label>
                  <Select
                    options={studentOptions}
                    placeholder="Talabani tanlang (ma'lumotlarni ko'chirish uchun)..."
                    isSearchable
                    onChange={handleStudentSelect}
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "1px solid #d1d5db",
                        borderRadius: "0.5rem",
                        padding: "2px",
                      }),
                    }}
                  />
                </div>
              )}

              {/* 3. Talaba shaxsiy ma'lumotlari */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">
                  Yangi talaba ma'lumotlari
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Ism <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="Yangi ism"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Familiya <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="secondName"
                      value={form.secondName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="Yangi familiya"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Otasining ismi
                    </label>
                    <input
                      type="text"
                      name="thirdName"
                      value={form.thirdName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="O.O'g'li / Q.Qizi"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Qisqa ism
                    </label>
                    <input
                      type="text"
                      name="shortName"
                      value={form.shortName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="Avtomatik to'ldiriladi"
                    />
                  </div>
                  {/* Hemis ID */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Hemis ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="hemisId"
                      value={form.hemisId}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 
                   outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="Yangi Hemis ID"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Talaba rasmi
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                {/* Talaba ID va Parol */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Talaba ID raqami <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="studentIdNumber"
                        value={form.studentIdNumber}
                        onChange={handleChange}
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                        placeholder="Yangi ID raqami"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateId}
                        className="rounded-lg border bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                      >
                        Generatsiya
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Parol
                    </label>
                    <input
                      type="text"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                      placeholder="12345678"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Ko'chirilgan ma'lumotlar */}
              {originalStudent && (
                <div className="rounded-lg border bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-700">
                    Namuna talaba ma'lumotlari:
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Mutaxassislik:</span>
                      <span className="ml-2 font-medium">
                        {originalStudent.specialtyName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">O'qish shakli:</span>
                      <span className="ml-2 font-medium">
                        {originalStudent.educationForm}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Daraja:</span>
                      <span className="ml-2 font-medium">
                        {originalStudent.level}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">To'lov turi:</span>
                      <span className="ml-2 font-medium">
                        {originalStudent.paymentForm}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t bg-gray-50 p-6">
              <button
                onClick={() => {
                  setModal(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>

              <button
                onClick={createStudent}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-white hover:bg-purple-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Talabani yaratish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
