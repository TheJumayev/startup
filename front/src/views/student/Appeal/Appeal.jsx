import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ApiCall, { baseUrl } from "../../../config";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Appeal() {
  const navigate = useNavigate();
  const [infoModal, setInfoModal] = useState(false);
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [form, setForm] = useState({});
  const [studentName, setStudentName] = useState(null);
  const [groupName, setGroupName] = useState(null);
  const [studentUuid, setStudentUuid] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [useCustomReason, setUseCustomReason] = useState(false);

  const token = localStorage.getItem("authToken");
  if (!token) {
    navigate("/student/login");
  }

  useEffect(() => {
    fetchAppeals();
    fetchStudentData(token);
  }, []);

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      if (response.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      setStudentName(response.data?.fullName);
      setGroupName(response.data?.groupName);
      setStudentUuid(response.data?.id);
    } catch (error) {
      console.error("Error fetching student data:", error);
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(`/api/v1/appeal-type/active`, "GET");
      if (response && Array.isArray(response.data)) {
        setAppeals(response.data);
      } else {
        setAppeals([]);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Sabablarni olish funksiyasi
  const fetchReasons = async (appealTypeId) => {
    try {
      const response = await ApiCall(`/api/v1/reason/${appealTypeId}`, "GET");
      if (response?.data && Array.isArray(response.data)) {
        setReasons(response.data);
      } else {
        setReasons([]);
      }
    } catch (error) {
      console.error("❌ Sabablarni olishda xatolik:", error);
      setReasons([]);
    }
  };

  const handleOpenModal = async (appeal) => {
    try {
      console.log("📌 StudentUuid:", studentUuid);
      console.log("📌 AppealId:", appeal.id);

      const checkResponse = await ApiCall(
        `/api/v1/appeal/student-appeal-status/${studentUuid}/${appeal.id}`,
        "GET"
      );

      console.log("✅ Appeal status tekshiruv natijasi:", checkResponse);

      if (!checkResponse.error) {
        // ❗ Agar error = false → Info modalni ochamiz
        setInfoModal(true);
        return;
      }

      // ✅ Agar error = true → Yangi ariza modalni ochamiz
      setSelectedAppeal(appeal);
      setForm({
        text3: "",
        sana1: "",
        sana2: "",
        file: null,
        fileId: null,
        reasonId: null,
      });

      // 🔹 Sabablarni olish (doim ishlashi kerak)
      await fetchReasons(appeal.id);
      setUseCustomReason(false);

      setOpenModal(true);
    } catch (error) {
      console.error("❌ Tekshirishda xatolik:", error);
      setSelectedAppeal(appeal);

      // fallback sifatida ham sabablarni olish
      await fetchReasons(appeal.id);
      setUseCustomReason(false);

      setOpenModal(true);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };
  const selectedReasonName = useMemo(() => {
    return !useCustomReason
      ? reasons.find((r) => String(r.id) === String(form.reasonId))?.name ||
          "_sabab_"
      : form.text3 || "_sabab_";
  }, [useCustomReason, reasons, form.reasonId, form.text3]);
  // 🔹 Arizani yuborish
  const handleSubmitAppeal = async () => {
    try {
      let uploadedFileId = null;

      if (form.file) {
        const formData = new FormData();
        formData.append("photo", form.file);
        formData.append("prefix", "appeal");

        const uploadResponse = await axios.post(
          `${baseUrl}/api/v1/file/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        uploadedFileId = uploadResponse.data;
      }

      const text1 = selectedAppeal.text1
        .replace("_talaba_ism_familya_", studentName || "_talaba_ism_familya_")
        .replace("_guruh_", groupName || "_guruh_");

      const text2 = selectedAppeal.text2
        .replace("_sana1_", form.sana1 || "_sana1_")
        .replace("_sana2_", form.sana2 || "_sana2_")
        .replace("_sabab_", selectedReasonName) // 🔹 bu yerda ishlatildi
        .replace("_talaba_ism_familya_", studentName || "_talaba_ism_familya_")
        .replace("_guruh_", groupName || "_guruh_");

      const appealDTO = {
        appealId: selectedAppeal.id,
        studentId: studentUuid,
        text1,
        text2,
        date: selectedAppeal.date,
        fileId: uploadedFileId || null,
        reasonId: !useCustomReason ? form.reasonId : null,
        customReason: useCustomReason ? form.text3 : null,
      };

      console.log("Yuborilayotgan appealDTO:", appealDTO);

      await ApiCall("/api/v1/appeal", "POST", appealDTO);
      toast.success("✅ Ariza yuborildi!");
      setOpenModal(false);
      navigate("/student/myappeal");
    } catch (error) {
      console.error("Ariza yuborishda xatolik:", error);
      alert("❌ Ariza yuborishda xatolik!");
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-10 max-w-4xl rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <h1 className="text-center text-lg font-semibold leading-relaxed text-gray-800 md:text-2xl">
            Hurmatli talaba, arizangiz topshirilgandan so'ng u mas'ul xodim
            tomonidan ko‘rib chiqilib tasdiqlanishi kerak. Agar tasdiqlansa —
            arizangiz kuchga kiradi, agar rad etilsa — ariza bekor qilinadi.
          </h1>

          <p className="mt-4 text-center font-medium text-blue-600">
            Iltimos, ariza holatini profilingizda tekshirib turing.
          </p>

          <p className="mt-3 text-center text-xl text-red-600 md:text-base">
            Arizani tasdiqlash uchun mas'ul xodimga uchrashing: <br />
            <span className="font-semibold text-gray-900">
              Muxtorov Erkin Mustafoyevich
            </span>{" "}
            — A-1.3 xona
          </p>
        </div>

        <div className="mb-8 flex justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Ariza topshirish
            </h1>
            <p className="mt-2 text-gray-600">
              Kerakli ariza turini tanlang va to'ldiring
            </p>
          </div>
          <div className="flex items-center space-x-3 rounded-lg bg-white px-4 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <span className="font-semibold text-blue-600">
                {studentName ? studentName.charAt(0) : "T"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {studentName || "Talaba"}
              </p>
              <p className="text-xs text-gray-500">{groupName || "Guruh"}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : appeals.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-700">
              Hozircha ariza mavjud emas
            </h3>
            <p className="text-gray-500">
              Aktiv arizalar mavjud bo'lganda ular shu yerda ko'rinadi
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {appeals.map((appeal) => (
              <div
                key={appeal.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-blue-100 hover:shadow-md"
              >
                <div className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        appeal.status
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appeal.status ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-800">
                    {appeal.name}
                  </h3>
                  <p className="line-clamp-2 mb-4 text-sm text-gray-600">
                    {appeal.description || "Ariza shakli"}
                  </p>
                  <button
                    className="flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 px-4 text-white transition-colors duration-200 hover:bg-blue-700"
                    onClick={() => handleOpenModal(appeal)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Ariza topshirish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          open={openModal}
          onClose={() => setOpenModal(false)}
          center
          classNames={{
            modal: "rounded-xl p-6 max-w-4xl",
          }}
        >
          {selectedAppeal && (
            <div className="w-full gap-8 md:flex">
              {/* Chap ustun - Inputlar */}
              <div className="w-full space-y-5 md:w-1/2">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedAppeal.name}
                  </h2>
                  <p className="mt-1 text-gray-600">
                    Ariza ma'lumotlarini to'ldiring
                  </p>
                </div>

                {/* Fayl yuklash */}
                {selectedAppeal.proof && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <label className="mb-2 block flex items-center text-sm font-medium text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      Fayl yuklash (PDF, maksimum 5MB)
                    </label>
                    <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-blue-200 px-6 pt-5 pb-6">
                      <div className="space-y-1 text-center">
                        <div className="flex justify-center text-sm text-gray-600">
                          <label className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none hover:text-blue-500">
                            <span>Faylni yuklash</span>
                            <input
                              type="file"
                              name="file"
                              accept=".pdf"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  if (file.type !== "application/pdf") {
                                    alert(
                                      "Faqat PDF fayl yuklashingiz mumkin!"
                                    );
                                    e.target.value = null;
                                    return;
                                  }
                                  if (file.size > 5 * 1024 * 1024) {
                                    alert(
                                      "Fayl hajmi 5MB dan oshmasligi kerak!"
                                    );
                                    e.target.value = null;
                                    return;
                                  }
                                  handleChange(e);
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF formatida, 5MB gacha
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sabab input */}
                {/* Sabab tanlash yoki yozish */}
                {selectedAppeal.isText3 && (
                  <div>
                    <label className="mb-2 block flex items-center text-sm font-medium text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      Sabab
                    </label>

                    {/* Agar "Boshqa" tanlanmagan bo‘lsa → select */}
                    {!useCustomReason && (
                      <select
                        name="reasonId"
                        value={form.reasonId || ""}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Sababni tanlang</option>
                        {reasons.map((reason) => (
                          <option key={reason.id} value={reason.id}>
                            {reason.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Agar "Boshqa" tanlansa → textarea */}
                    {useCustomReason && (
                      <textarea
                        name="text3"
                        value={form.text3}
                        onChange={handleChange}
                        placeholder="Ariza sababini kiriting..."
                        rows="3"
                        className="mt-3 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {/* Checkbox - Boshqa */}
                    <div className="mt-2 flex items-center">
                      <input
                        id="useCustomReason"
                        type="checkbox"
                        checked={useCustomReason}
                        onChange={(e) => {
                          setUseCustomReason(e.target.checked);
                          setForm({ ...form, reasonId: null, text3: "" }); // reset
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="useCustomReason"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Boshqa sababni o‘zim yozaman
                      </label>
                    </div>
                  </div>
                )}

                {/* Sana maydonlari */}
                {selectedAppeal.date === 1 && (
                  <div>
                    <label className="mb-2 block flex items-center text-sm font-medium text-gray-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2 h-5 w-5 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Sana
                    </label>
                    <input
                      type="date"
                      name="sana1"
                      value={form.sana1}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                {selectedAppeal.date === 2 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Boshlanish sanasi
                      </label>
                      <input
                        type="date"
                        name="sana1"
                        value={form.sana1}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Tugash sanasi
                      </label>
                      <input
                        type="date"
                        name="sana2"
                        value={form.sana2}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Yuborish tugmasi */}
                <button
                  onClick={handleSubmitAppeal}
                  className="mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 py-3 px-4 text-white transition-colors duration-200 hover:bg-green-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Ariza yuborish
                </button>
              </div>

              {/* O'ng ustun - Preview */}
              <div className="mt-8 w-full md:mt-0 md:w-1/2">
                <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                  <h3 className="flex items-center text-lg font-semibold">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Ariza ko'rinishi
                  </h3>
                </div>
                <div className="space-y-6 rounded-b-lg border border-gray-200 bg-white p-6 text-gray-800 shadow-sm">
                  <div className="mb-8 flex justify-end">
                    <div className="w-40 whitespace-pre-line text-right text-sm text-gray-600">
                      {selectedAppeal.text1
                        .replace(
                          "_talaba_ism_familya_",
                          studentName || "_talaba_ism_familya_"
                        )
                        .replace("_guruh_", groupName || "_guruh_")}
                    </div>
                  </div>
                  <div className="border-b border-gray-200 pb-3 text-center text-xl font-bold text-blue-800">
                    A R I Z A
                  </div>
                  <div className="mt-4 whitespace-pre-line text-justify text-sm leading-relaxed">
                    {selectedAppeal.text2
                      .replace("_sana1_", form.sana1 || "_sana1_")
                      .replace("_sana2_", form.sana2 || "_sana2_")
                      .replace("_sabab_", selectedReasonName)
                      .replace(
                        "_talaba_ism_familya_",
                        studentName || "_talaba_ism_familya_"
                      )
                      .replace("_guruh_", groupName || "_guruh_")}
                  </div>
                  <div className="mt-10 flex justify-between border-t border-gray-200 pt-4 text-sm text-gray-500">
                    <div>
                      <div className="font-medium">
                        Sana: {new Date().toLocaleDateString("uz-UZ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {studentName || "_talaba_ism_familya_"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
        {/* Info Modal */}
        <Modal
          open={infoModal}
          onClose={() => setInfoModal(false)}
          center
          classNames={{
            modal: "rounded-xl p-6 max-w-md text-center",
          }}
        >
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              ❗ Siz bu turdagi arizani allaqachon topshirgansiz
            </h2>
            <p className="text-gray-600">
              Iltimos, javobni kuting. Yangi ariza yuborish mumkin emas.
            </p>
            <button
              onClick={() => setInfoModal(false)}
              className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 px-4 text-white hover:bg-blue-700"
            >
              Yopish
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default Appeal;
