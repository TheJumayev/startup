import ModalForcePasswordChange from "../profile/CheckPassword"; // 🔥 mana shu qo'shiladi
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaListUl,
  FaRegFileAlt,
  FaTasks,
} from "react-icons/fa"; // ikonlar

import {
  MdArticle,
  MdBook,
  MdAccountCircle,
  MdLogout,
  MdOndemandVideo,
  MdPlayLesson,
  MdOutlineRule,
  MdHomeWork,
  MdScore,
} from "react-icons/md";

const Dashboard = () => {
  const [forcePasswordModal, setForcePasswordModal] = useState(false);
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [files, setFiles] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [kafolat, setKafolat] = useState(null);
  const [percent, setPercent] = useState(0); // 50
  const formatDate = (date) => new Date(date).toLocaleDateString("uz-UZ");
  const baseAmount = contract?.amount || 0;
  const discount = contract?.discount || 0;
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("+998");
  const finalAmount = baseAmount - discount; // yakuniy kontrakt
  const payment = contract?.payment || 0;
  const phoneRegex = /^\+998(9[0-9]|3[3]|7[1]|8[8])[0-9]{7}$/;
  const isPhoneValid = /^\+998\d{9}$/.test(phoneValue);
  const debt = Math.max(finalAmount - payment, 0);
  const extra = Math.max(payment - finalAmount, 0);

  const paidAmount = contract?.payment || 0;
  // Majburiy to'lov summasi (50% kontraktdan)
  const requiredAmount =
    percent > 0 ? Math.round((finalAmount * percent) / 100) : 0;

  // Hali to'lanishi kerak bo'lgan majburiy summa
  const percentAmount = Math.max(requiredAmount - paidAmount, 0);
  const safeDate = selectedDate ? formatDate(selectedDate) : "__________";

  const fetchPercent = async () => {
    const res = await ApiCall("/api/v1/contract-amount", "GET");
    setPercent(res.data.amount); // masalan: 50
  };

  useEffect(() => {
    fetchPercent();
  }, []); // ✅ faqat 1 marta

  // Hozirgi yil
  const currentYear = new Date().getFullYear();

  // Bugungi sana
  const todayFormatted = new Date().toLocaleDateString("uz-UZ");
  const text1 = `Buxoro xalqaro universiteti rektori Sh. R. Barotovga 
${student?.groupName} guruh talabasi ${student?.fullName} tomonidan`;
  const text2 = `Men ${student?.groupName} guruh talabasi ${
    student?.fullName
  } ${currentYear}-${currentYear + 1} o'quv yilining ${
    student?.semesterName
  }dan Buxoro xalqaro universitetida shartnoma asosida tahsil olayotganimni ma'lum qilaman. Umumiy kontrakt summasi ${finalAmount.toLocaleString()} so'mni tashkil etadi. Amaldagi tartibga muvofiq, ushbu summaning ${percent}% miqdori — ${requiredAmount.toLocaleString()} so'm bo'lib, shundan ${paidAmount.toLocaleString()} so'mi to'langan. Qolgan ${percentAmount.toLocaleString()} so'mni ${safeDate} ga qadar to'lashga kafolat beraman.
`;
  const space = "\u00A0".repeat(15);
  const text3 = `${student?.fullName}${space}${todayFormatted}`;

  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const maxDate = threeMonthsLater.toISOString().split("T")[0];

  const token = localStorage.getItem("authToken");

  // ✅ Tokenni tekshirish
  const checkLogin = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (checkLogin()) {
      fetchStudentData(token);
    }
  }, []);

  useEffect(() => {
    if (student?.id) {
      fetchKafolat(student.id);
    }
  }, [student]);

  const fetchKafolat = async (studentId) => {
    try {
      const res = await ApiCall(
        `/api/v1/kafolat-xati/student/${studentId}`,
        "GET"
      );

      const list = res.data || [];
      setKafolat(list.length > 0 ? list[0] : null);
    } catch (err) {
      console.error(err);
      setKafolat(null);
    }
  };

  const handleDownload = async (hemisId) => {
    console.log(hemisId);
    try {
      if (!hemisId) {
        console.error("❌ Hemis ID topilmadi");
        return;
      }
      setLoading(true);
      const response = await fetch(
        `${baseUrl}/api/v1/contract/hemis/${hemisId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // agar backendda token kerak bo'lsa
          },
        }
      );

      if (!response.ok) {
        throw new Error("❌ Contract yuklashda xatolik");
      }

      // Blob (fayl oqimi) sifatida olish
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Faylni avtomatik yuklab olish
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Contract_${hemisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Xotirani tozalash
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Shartnoma yuklab olishda xatolik. Hisobchiga murojaat qiling!");
      console.error("❌ Contract yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      // 🔴 AGAR PHONE YO‘Q BO‘LSA → MAJBURIY MODAL
      if (!response.data.phone || response.data.phone.trim() === "") {
        setPhoneModalOpen(true);
      }

      // ✅ Проверка специальной ошибки от бэкенда
      if (
        response?.error === "INVALID_TOKEN" ||
        response?.error === true || // общий boolean-ответ
        response?.status === 401 ||
        response?.status === 403
      ) {
        console.log(11111);

        localStorage.clear();
        navigate("/student/login");
        return;
      }

      const studentData = response.data;
      setStudent(studentData);

      // 🔥 PAROL = LOGIN bo'lsa modal ochilsin
      if (studentData.password === studentData.studentIdNumber) {
        setForcePasswordModal(true);
      }

      if (studentData?.hemisId) {
        await fetchContract(studentData.studentIdNumber);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      localStorage.removeItem("authToken");
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };
  const todayDate = new Date().setHours(0, 0, 0, 0);

  const isExpired =
    kafolat?.date && new Date(kafolat.date).setHours(0, 0, 0, 0) < todayDate;

  const isPending = kafolat && kafolat.status === false;

  const isApprovedAndActive = kafolat && kafolat.status === true && !isExpired;

  const canUpload = !kafolat || (kafolat.status === true && isExpired);

  const currentStudyYear = `${currentYear}-${currentYear + 1}`;

  const fetchContract = async (hemisId) => {
    try {
      // 1. Oddiy kontrakt
      const res = await ApiCall(`/api/v1/contract/student/${hemisId}`, "GET");
      const contractData = res.data;

      // 2. Chegirma ma'lumoti
      const response = await ApiCall(
        `/api/v1/discount-student/${contractData.passportNumber}`,
        "GET"
      );

      let discountAmount = 0;

      if (response?.data && Array.isArray(response.data.discountByYear)) {
        const currentYearDiscount = response.data.discountByYear.find(
          (d) => d.name === currentStudyYear
        );

        discountAmount = currentYearDiscount?.discount || 0;
      }

      // 3. BIRLASHTIRILGAN CONTRACT
      setContract({
        ...contractData,
        discount: discountAmount, // 🔥 mana eng muhim joy
      });
    } catch (err) {
      console.error("❌ Contract fetch error:", err);
      setContract(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <span className="mt-4 block text-lg text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      <div className="mx-auto max-w-4xl">
        {/* Student info */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-lg md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Student Info Section */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                Talaba shartnomasi
              </h1>
              <p className="mt-1 text-sm text-gray-600 md:text-base">
                {student?.fullName} (
                {student?.groupName || "Guruh belgilanmagan"})
              </p>
            </div>

            {/* Action Buttons Section */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-0">
              {/* Download Contract Button */}
              <button
                onClick={() => handleDownload(student?.studentIdNumber)}
                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition duration-300 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                <span className="mr-2">📥</span>
                Shartnomani yuklash
              </button>

              {/* Guarantee Letter Section */}
              <div>
                {/* 1️⃣ Umuman yo'q yoki muddati tugagan */}
                {canUpload && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex w-full items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-green-700"
                  >
                    <span className="mr-2">📥</span>
                    {kafolat
                      ? "Kafolat xatini qayta yuklash"
                      : "Kafolat xati yuklash"}
                  </button>
                )}

                {/* 2️⃣ Yuborilgan, admin tekshirmoqda */}
                {isPending && (
                  <div className="rounded-lg border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
                    ⏳ Kafolat xati yuborilgan. Admin tomonidan tekshirilmoqda.
                  </div>
                )}

                {/* 3️⃣ Tasdiqlangan va muddati tugamagan */}
                {isApprovedAndActive && (
                  <div className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                    ✅ Kafolat xati tasdiqlangan.
                    <br />
                    📅 Amal qilish muddati:{" "}
                    <b>{new Date(kafolat.date).toLocaleDateString("uz-UZ")}</b>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Contract info */}
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          {!contract ? (
            <p className="font-medium text-red-600">
              Sizga kontrakt topilmadi. Registrator ofisga murojaat qiling.
            </p>
          ) : (
            <div className="items-center justify-between gap-6 md:flex">
              {/* Asosiy summa */}
              <div>
                <p className="text-sm text-gray-500">Asosiy summa</p>
                <p className="text-lg font-semibold">
                  {baseAmount.toLocaleString()} so'm
                </p>
              </div>

              {/* Chegirma (faqat > 0 bo'lsa ko'rinadi) */}
              {discount > 0 && (
                <div className="items-center justify-between gap-4 md:flex">
                  <div>
                    <p className="text-sm text-gray-500">Chegirma</p>
                    <p className="text-lg font-semibold text-green-600">
                      {discount.toLocaleString()} so'm
                    </p>
                  </div>

                  {/* Yakuniy kontrakt */}
                  <div>
                    <p className="text-sm text-gray-500">Yakuniy kontrakt</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {finalAmount.toLocaleString()} so'm
                    </p>
                  </div>
                </div>
              )}

              {/* To'langan */}
              <div>
                <p className="text-sm text-gray-500">To'langan</p>
                <p className="text-lg font-semibold text-yellow-500">
                  {payment.toLocaleString()} so'm
                </p>
              </div>

              {/* Qarzdorlik */}
              <div>
                <p className="text-sm text-gray-500">Qarzdorlik</p>
                <p className="text-lg font-semibold text-red-600">
                  {debt.toLocaleString()} so'm
                </p>
              </div>

              {/* Ortiqcha to'lov */}
              <div>
                <p className="text-sm text-gray-500">Ortiqcha to'lov</p>
                <p className="text-lg font-semibold text-green-700">
                  {extra.toLocaleString()} so'm
                </p>
              </div>

              {/* Sana */}
              <div>
                <p className="text-sm text-gray-500">Yaratilgan sana</p>
                <p className="text-lg font-semibold">
                  {contract?.createdAt
                    ? new Date(contract.createdAt).toLocaleDateString()
                    : "Noma'lum"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Home */}
          <div
            onClick={() => navigate("/student/default")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <FaHome className="mb-3 text-4xl text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Bosh sahifa</h3>
          </div>

          {/* Debts */}
          <div
            onClick={() => navigate("/student/debts")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <FaFileInvoiceDollar className="mb-3 text-4xl text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Qarzdorlik fanlar
            </h3>
          </div>
          <div
            onClick={() => navigate("/student/homework")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <MdHomeWork className="mb-3 text-4xl text-lime-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Qo'shimcha vazifalar
            </h3>
          </div>
          <div
            onClick={() => navigate("/student/test-knowledge")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <MdOutlineRule className="mb-3 text-4xl text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Bilimni sinab ko'rish
            </h3>
          </div>

          {/* Appeals */}
          {/* <div
            onClick={() => navigate("/student/appeals")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <FaListUl className="mb-3 text-4xl text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Ariza topshirish
            </h3>
          </div> */}

          {/* My Appeal */}
          {/* <div
            onClick={() => navigate("/student/myappeal")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <FaRegFileAlt className="mb-3 text-4xl text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Mening arizalarim
            </h3>
          </div> */}
          {/* additional homework */}

          <div
            onClick={() => navigate("/student/amaliyot")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <FaTasks className="mb-3 text-4xl text-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">Amaliyot</h3>
          </div>
          <div
            onClick={() => navigate("/student/score")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <MdScore className="mb-3 text-4xl text-teal-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Yakuniy baholar
            </h3>
          </div>
          {/* Shaxsiy ma'lumotlar */}
          <div
            onClick={() => navigate("/student/cabinet")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <MdAccountCircle className="mb-3 text-4xl text-purple-600" />
            <h3 className="text-base font-semibold text-gray-800">
              Shaxsiy ma'lumotlar
            </h3>
          </div>
          {/* chiqish */}
          <div
            onClick={() => navigate("/student/login")}
            className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
          >
            <MdLogout className="mb-3 text-4xl text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Tizimdan chiqish
            </h3>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {student.isOnline === true && (
            <>
              {/* Attendance */}
              <div
                onClick={() => navigate("/student/attendance")}
                className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
              >
                <MdArticle className="mb-3 text-4xl text-navy-600" />
                <h3 className="text-lg font-semibold text-gray-800">Davomat</h3>
              </div>

              {/* Subject */}
              <div
                onClick={() => navigate("/student/subject")}
                className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
              >
                <MdPlayLesson className="mb-3 text-4xl text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-800">Fan</h3>
              </div>

              {/* bilim */}
              <div
                onClick={() => navigate("/student/test-knowledge")}
                className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
              >
                <MdOutlineRule className="text-stone-500 mb-3 text-4xl" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Bilimni sinab ko'rish
                </h3>
              </div>

              {/* Media-lesson */}
              <div
                onClick={() => navigate("/student/media-lessons")}
                className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
              >
                <MdOndemandVideo className="mb-3 text-4xl text-cyan-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Video darslar
                </h3>
              </div>
            </>
          )}
          {/* magistr */}
          {student?.level === "1-kurs" &&
            student?.educationType === "Magistr" && (
              <div
                onClick={() => navigate("/student/magistr")}
                className="flex cursor-pointer flex-col items-center rounded-xl bg-white p-6 text-center shadow-md transition duration-300 hover:shadow-lg"
              >
                <MdBook className="mb-3 text-4xl text-teal-600" />
                <h3 className="text-base font-semibold text-gray-800">
                  Desertatsiya mavzusi
                </h3>
              </div>
            )}
        </div>
      </div>

      {phoneModalOpen && (
        <div className="bg-black/60 fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-lg font-bold text-red-600">
              📱 Telefon raqamni kiriting
            </h2>

            <p className="mb-4 text-sm text-gray-600">
              Tizimdan foydalanish uchun telefon raqamingizni kiritishingiz
              shart.
            </p>

            <input
              type="tel"
              value={phoneValue}
              placeholder="+998911234567"
              maxLength={13}
              onChange={(e) => {
                let value = e.target.value;

                // 🔒 +998 ni o‘chirishga ruxsat YO‘Q
                if (!value.startsWith("+998")) {
                  value = "+998";
                }

                // 🔢 faqat raqam va +
                if (!/^[+0-9]*$/.test(value)) return;

                // 🔒 uzunlik 13 dan oshmasin
                if (value.length > 13) return;

                setPhoneValue(value);
              }}
              className="mb-2 w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500"
            />

            <button
              disabled={!isPhoneValid}
              onClick={async () => {
                try {
                  await ApiCall("/api/v1/student/phone/" + student.id, "PUT", {
                    phone: phoneValue,
                  });

                  setStudent((prev) => ({ ...prev, phone: phoneValue }));
                  setPhoneModalOpen(false);
                  toast.success("Telefon raqam saqlandi");
                } catch (err) {
                  toast.error("Telefonni saqlashda xatolik");
                }
              }}
              className={`w-full rounded-lg py-2 text-white
    ${
      isPhoneValid
        ? "bg-blue-600 hover:bg-blue-700"
        : "cursor-not-allowed bg-gray-400"
    }
  `}
            >
              Saqlash
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              📥 {kafolat ? "Kafolat xatini yangilash" : "Kafolat xati yuklash"}
            </h2>

            {/* Kafolat xati matni */}
            <div className="mb-4 whitespace-pre-line rounded-lg border bg-gray-50 p-3 text-sm text-gray-800">
              <div className="flex justify-end">
                <p className="w-1/2">{text1}</p>
              </div>
              <p className="text-center">Kafolat xati</p>
              <p className="whitespace-pre-line indent-[2rem]">{text2}</p>

              {"\n\n"}
              {text3}
            </div>

            {/* Date input */}
            <label className="mb-1 block font-medium">
              To'lov qilishning oxirgi sanasini tanlang
            </label>
            <input
              type="date"
              className="mb-4 w-full rounded-lg border p-2"
              min={today}
              max={maxDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              {/* ❌ Bekor qilish */}
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedDate(""); // ixtiyoriy: formani tozalash
                }}
                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
              >
                Bekor qilish
              </button>

              {/* ✅ Yuborish / Yangilash */}
              <button
                disabled={!selectedDate}
                onClick={async () => {
                  try {
                    const payload = {
                      studentId: student.id,
                      text1,
                      text2,
                      text3,
                      date: selectedDate,
                    };
                    await ApiCall("/api/v1/kafolat-xati", "POST", payload);
                    setModalOpen(false);
                    fetchKafolat(student.id);
                  } catch (err) {
                    console.error(err);
                    toast.error("Kafolat xatini saqlashda xatolik");
                  }
                }}
                className={`rounded-lg px-4 py-2 text-white
      ${
        !selectedDate
          ? "cursor-not-allowed bg-gray-400"
          : "bg-blue-600 hover:bg-blue-700"
      }
    `}
              >
                {kafolat ? "Yangilash" : "Yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}
      {forcePasswordModal && (
        <ModalForcePasswordChange
          student={student}
          onSuccess={() => setForcePasswordModal(false)}
          open={forcePasswordModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
