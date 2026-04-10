import React, { useEffect, useState, useMemo } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useLocation } from "react-router-dom";
import Modal from "react-modal";
import {
  FiUpload,
  FiFile,
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiClock,
} from "react-icons/fi";

Modal.setAppElement("#root");

// Status konstantalari
const STATUS = {
  NOT_UPLOADED: 1, // Yuklanmagan (default)
  PENDING: 2, // Talaba yuborgan, tasdiqlanmagan
  APPROVED: 3, // Tasdiqlangan
  REJECTED: 4, // Rad etilgan
};

const AmaliyotUpload = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const studentId = state?.studentId;
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [files, setFiles] = useState({});
  const [existing, setExisting] = useState(null);
  const [openFile, setOpenFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(null);

  // Har bir kundalik uchun deadline lar
  const kundalikDeadlines = useMemo(() => {
    if (!existing) return {};

    return {
      // kundalik: getNormalizedDeadline(existing.kundalikEndTime),
      kundalik1: getNormalizedDeadline(existing.kundalikEndTime1),
      // kundalik2: getNormalizedDeadline(existing.kundalikEndTime2),
      // kundalik3: getNormalizedDeadline(existing.kundalikEndTime3),
    };
  }, [existing]);

  // Umumiy deadline
  const generalDeadline = useMemo(
    () => getNormalizedDeadline(existing?.deadline),
    [existing?.deadline]
  );

  function getNormalizedDeadline(deadline) {
    if (!deadline) return null;

    const d = new Date(deadline);
    if (isNaN(d)) return null;

    return d; // 🔥 Endi aynan backenddagi vaqt ishlatiladi
  }

  const currentMonthName = useMemo(
    () =>
      state?.monthName?.toLowerCase() || existing?.month?.months?.toLowerCase(),
    [state?.monthName, existing?.month?.months]
  );

  const fileFields = [
    {
      key: "kundalik1",
      label: "Kundalik",
      icon: "📝",
      type: "kundalik",
    },
    // {
    //   key: "kundalik",
    //   label: "Kundalik 2-haftalik",
    //   icon: "📝",
    //   dateRange: `8-14 ${currentMonthName}`,
    //   type: "kundalik",
    // },
    // {
    //   key: "kundalik2",
    //   label: "Kundalik 3-haftalik",
    //   icon: "📝",
    //   dateRange: `15-21 ${currentMonthName}`,
    //   type: "kundalik",
    // },
    // {
    //   key: "kundalik3",
    //   label: "Kundalik 4-haftalik",
    //   icon: "📝",
    //   dateRange: `22-31 ${currentMonthName}`,
    //   type: "kundalik",
    // },
    {
      key: "darsTahlili",
      label: "Dars tahlili",
      icon: "📊",
      type: "other",
    },
    {
      key: "darsIshlanmasi",
      label: "Dars ishlanmasi",
      icon: "📚",
      type: "other",
    },
    {
      key: "tarbiyaviy",
      label: "Tarbiyaviy ish",
      icon: "👨‍🏫",
      type: "other",
    },
    {
      key: "sinfRahbar",
      label: "Sinf rahbarlik",
      icon: "👥",
      type: "other",
    },
    // {
    //     key: "pedagogik",
    //     label: "Pedagogik amaliyot",
    //     icon: "🎓",
    //     type: "other"
    // },
    {
      key: "tadbir",
      label: "Tadbir ishlanmasi",
      icon: "🎉",
      type: "other",
    },
    {
      key: "photo",
      label: "Foto (pdf)",
      icon: "📷",
      type: "other",
    },
    {
      key: "hisobot",
      label: "Hisobot (PDF)",
      icon: "📄",
      type: "other",
    },
  ];

  // Yuklash imkoniyatini tekshirish - HAR DOIM TRUE QAYTARADI
  const canUploadFile = (key) => {
    if (!existing) return false;

    const now = new Date();

    // 🔹 BARCHA fayllar uchun bitta umumiy deadline
    const deadline = existing.deadline || existing.month?.deadline;

    // agar deadline umuman yo‘q bo‘lsa → yuklashga ruxsat
    if (!deadline) return true;

    return now <= new Date(deadline);
  };

  // Deadline statusini olish (faqat ko'rsatish uchun)
  const getFileDeadlineStatus = () => {
    if (!existing) return { isOver: false, text: "" };

    const deadline = existing.deadline || existing.month?.deadline;
    if (!deadline) return { isOver: false, text: "" };

    const now = new Date();
    const d = new Date(deadline);
    const isOver = now > d;

    return {
      isOver,
      text: isOver ? "❌ Muddat o'tgan" : `⏳ ${d.toLocaleDateString()} gacha`,
    };
  };
  // Mavjud yuklamani olish
  const checkExisting = async () => {
    if (!studentId || !id) return;
    try {
      const res = await ApiCall(
        `/api/v1/amaliyot-yuklama/${studentId}/${id}`,
        "GET"
      );
      console.log(res.data);

      if (res?.data) {
        setExisting(res.data);
      } else {
        setExisting(null);
      }
    } catch (err) {
      console.error("Yuklama olishda xatolik:", err);
      toast.error("Ma'lumotni olishda xatolik!");
    }
  };

  // Fayl tanlash
  const handleFileChange = (e, key) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("❌ Fayl hajmi 10 MB dan oshmasligi kerak!");
      return;
    }

    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("❌ Faqat PDF yoki rasm yuklash mumkin!");
      return;
    }

    setFiles((prev) => ({ ...prev, [key]: selectedFile }));
  };

  // Fayl yuklash
  const handleUpload = async (key) => {
    const file = files[key];
    if (!file) return toast.warning(`⚠️ Avval faylni tanlang!`);
    if (!studentId || !id)
      return toast.error("❌ Student yoki monthId topilmadi!");

    try {
      setLoading(true);
      setUploadingFile(key);

      // Faylni serverga yuklash
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("prefix", "/amaliyot");

      const uploadRes = await fetch(`${baseUrl}/api/v1/file/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Faylni yuklab bo'lmadi");
      const uploadData = await uploadRes.json();
      const fileId = uploadData;

      if (!fileId) throw new Error("Fayl ID topilmadi!");

      // Mavjud yuklamani tekshirish
      const res = await ApiCall(
        `/api/v1/amaliyot-yuklama/${studentId}/${id}`,
        "GET"
      );
      console.log(res.data);

      const current = res?.data || null;

      // DTO yaratish - STATUS 2 (PENDING) bo'lishi kerak
      const dto = {
        studentId,
        monthId: id,
        [key]: fileId,
        [`${key}Status`]: STATUS.PENDING, // ✅ TO'G'RI STATUS
      };

      // PUT yoki POST qilish
      let response;
      if (current && current.id) {
        response = await ApiCall(
          `/api/v1/amaliyot-yuklama/${current.id}`,
          "PUT",
          dto
        );
      } else {
        response = await ApiCall(
          `/api/v1/amaliyot-yuklama/upload`,
          "POST",
          dto
        );
      }

      if (response) {
        toast.success(`✅ Fayl muvaffaqiyatli yuklandi!`);
        setFiles((prev) => ({ ...prev, [key]: null })); // Faylni tozalash
        await checkExisting();
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Faylni yuklashda xatolik yuz berdi!");
    } finally {
      setLoading(false);
      setUploadingFile(null);
    }
  };

  // Fayl yuklab olish
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("📥 Fayl yuklab olindi");
    } catch (error) {
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  useEffect(() => {
    checkExisting();
  }, [studentId, id]);

  // Status komponenti
  const renderStatus = (fileStatus, fieldKey) => {
    const fileObj =
      existing?.[`${fieldKey}File`] || existing?.[`${fieldKey}FileOld`];

    switch (fileStatus) {
      case STATUS.NOT_UPLOADED:
        return null;

      case STATUS.PENDING:
        return (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <FiLoader className="animate-spin" />
            <span className="text-sm">Tasdiqlanish kutilmoqda</span>
          </div>
        );

      case STATUS.APPROVED:
        return (
          <div className="flex flex-col items-center justify-center gap-2 text-green-600">
            <div className="flex items-center gap-2">
              <FiCheckCircle />
              <span className="text-sm font-semibold">✅ Tasdiqlandi</span>
            </div>
            {/* {fileObj && (
                            <div className="flex gap-2 mt-2 w-full">
                                <button
                                    onClick={() => setOpenFile(fileObj)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm flex items-center gap-1"
                                >
                                    <FiEye size={12} /> Ko'rish
                                </button>
                                <button
                                    onClick={() => handleDownload(fileObj.id, fileObj.name)}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded text-sm flex items-center gap-1"
                                >
                                    <FiDownload size={12} /> Yuklab
                                </button>
                            </div>
                        )} */}
          </div>
        );

      case STATUS.REJECTED:
        return (
          <div className="flex flex-col items-center gap-3 text-red-600">
            <div className="flex items-center gap-2">
              <FiX />
              <span className="text-sm font-semibold">❌ Rad etildi</span>
            </div>
            {existing?.[`${fieldKey}Description`] && (
              <p className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs italic text-gray-600">
                Izoh: {existing[`${fieldKey}Description`]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Status badge uchun matn
  const getStatusText = (fileStatus) => {
    switch (fileStatus) {
      case STATUS.NOT_UPLOADED:
        return "Yuklanmagan";
      case STATUS.PENDING:
        return "Tasdiqlanish kutilmoqda";
      case STATUS.APPROVED:
        return "Tasdiqlangan";
      case STATUS.REJECTED:
        return "Rad etilgan";
      default:
        return "Yuklanmagan";
    }
  };

  // Status badge uchun rang
  const getStatusColor = (fileStatus) => {
    switch (fileStatus) {
      case STATUS.NOT_UPLOADED:
        return "bg-yellow-100 text-yellow-800";
      case STATUS.PENDING:
        return "bg-blue-100 text-blue-800";
      case STATUS.APPROVED:
        return "bg-green-100 text-green-800";
      case STATUS.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Umumiy natijani hisoblash
  const overallResult = useMemo(() => {
    if (!existing) return null;

    const requiredFields = [
      "kundalik1",
      // "kundalik",
      // "kundalik2",
      // "kundalik3",
      "darsTahlili",
      "darsIshlanmasi",
      "tarbiyaviy",
      "sinfRahbar",
      "tadbir",
      "photo",
      "hisobot",
    ];
    // const requiredFields = [
    //     "kundalik", "kundalik1", "kundalik2", "kundalik3",
    //     "darsTahlili", "darsIshlanmasi", "tarbiyaviy", "sinfRahbar",
    //     "pedagogik", "tadbir", "photo", "hisobot"
    // ];

    const allApproved = requiredFields.every(
      (key) => existing?.[`${key}Status`] === STATUS.APPROVED
    );

    const grade = existing?.grade;

    if (!allApproved) {
      return {
        type: "error",
        message: "Topshiriqlar to'liq bajarilmagan",
        icon: FiAlertCircle,
      };
    }

    if (allApproved && grade == null) {
      return {
        type: "warning",
        message: "Baho: Baholanmagan",
        icon: FiLoader,
      };
    }

    if (allApproved && grade != null) {
      return {
        type: "success",
        message: `Baho: ${grade}`,
        icon: FiCheckCircle,
      };
    }

    return null;
  }, [existing]);

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <ToastContainer position="top-right" autoClose={3000} />

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-800 md:text-4xl">
            📁 Amaliyot Fayllarini Yuklash
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Kerakli fayllarni yuklang yoki avval yuklangan fayllarni ko'ring
          </p>

          {/* Umumiy deadline ma'lumoti */}
          {generalDeadline && (
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 ${
                new Date() >= generalDeadline
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              <FiClock />
              <span>
                Yuklamalar yakuni: {generalDeadline.toLocaleDateString()} -
                {new Date() >= generalDeadline
                  ? " 🕐 Muddat o'tgan"
                  : " ⏳ Davom etmoqda"}
              </span>
            </div>
          )}
        </div>

        {/* Umumiy natija */}
        <div className="my-4 text-center">
          {overallResult ? (
            <div
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold shadow-sm ${
                overallResult.type === "success"
                  ? "bg-green-100 text-green-700"
                  : overallResult.type === "warning"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <overallResult.icon
                className={
                  overallResult.type === "warning" ? "animate-spin" : ""
                }
              />
              <span>{overallResult.message}</span>
            </div>
          ) : (
            <p className="italic text-gray-500">
              Yuklama ma'lumotlari yuklanmoqda...
            </p>
          )}
        </div>

        {/* Fayllar Gridi */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {fileFields.map((field) => {
            const fileObj =
              existing?.[`${field.key}File`] ||
              existing?.[`${field.key}FileOld`];
            const fileStatus = existing?.[`${field.key}Status`];
            const isUploading = uploadingFile === field.key;
            const hasFile = !!fileObj;
            const deadlineStatus = getFileDeadlineStatus(field.key);

            return (
              <div
                key={field.key}
                className={`rounded-xl border-2 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ${
                  fileStatus === STATUS.APPROVED
                    ? "border-green-200"
                    : fileStatus === STATUS.REJECTED
                    ? "border-red-200"
                    : fileStatus === STATUS.PENDING
                    ? "border-blue-200"
                    : "border-gray-200"
                }`}
              >
                <div className="p-4 md:p-5">
                  {/* Sarlavha */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-2xl">{field.icon}</span>
                      <h3 className="text-sm font-semibold text-gray-800 md:text-base">
                        {field.label}
                      </h3>
                    </div>
                    {/* {field.dateRange && (
                      <p className="mb-2 text-xs text-blue-600">
                        {field.dateRange}
                      </p>
                    )} */}
                    <div
                      className={`inline-block rounded-full px-2 py-1 text-xs ${getStatusColor(
                        fileStatus
                      )}`}
                    >
                      {getStatusText(fileStatus)}
                    </div>
                  </div>
                  {/* Fayl Amallari */}
                  <div className="space-y-3">
                    {/* Mavjud fayl uchun ko'rish/yuklab olish */}
                    {hasFile && (
                      <div className="flex w-full items-center gap-2">
                        <button
                          onClick={() => setOpenFile(fileObj)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                        >
                          <FiEye size={16} />
                          <span>Ko'rish</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDownload(fileObj.id, fileObj.name)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-2 px-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
                        >
                          <FiDownload size={16} />
                          <span>Yuklab</span>
                        </button>
                      </div>
                    )}

                    {/* Status ko'rsatish */}
                    {fileStatus && renderStatus(fileStatus, field.key)}

                    {/* ✅ YUKLASH BO'LIMI - HAR DOIM OCHIQ */}
                    {(fileStatus === STATUS.NOT_UPLOADED ||
                      fileStatus === STATUS.REJECTED ||
                      !fileStatus) &&
                      canUploadFile(field.key) && (
                        <>
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => handleFileChange(e, field.key)}
                              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              id={`file-${field.key}`}
                            />
                            <label
                              htmlFor={`file-${field.key}`}
                              className={`block w-full cursor-pointer rounded-lg border-2 border-dashed py-3 px-4 text-center transition-colors ${
                                deadlineStatus.isOver
                                  ? "border-red-300 bg-red-50 hover:bg-red-100"
                                  : "border-gray-300 bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              <FiUpload
                                className={`mr-2 inline ${
                                  deadlineStatus.isOver
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}
                              />
                              <span
                                className={`text-sm ${
                                  deadlineStatus.isOver
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {files[field.key]
                                  ? files[field.key].name
                                  : "Fayl tanlang"}
                              </span>
                            </label>
                          </div>
                          {files[field.key] && (
                            <button
                              onClick={() => handleUpload(field.key)}
                              disabled={
                                (loading && isUploading) ||
                                !canUploadFile(field.key)
                              }
                              className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white 
    ${
      !canUploadFile(field.key)
        ? "cursor-not-allowed bg-gray-400"
        : deadlineStatus.isOver
        ? "bg-orange-600 hover:bg-orange-700"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
                            >
                              {isUploading ? (
                                <>
                                  <FiLoader className="animate-spin" />
                                  Yuklanmoqda...
                                </>
                              ) : (
                                <>
                                  <FiUpload />
                                  {fileStatus === STATUS.REJECTED
                                    ? "Qayta yuborish"
                                    : deadlineStatus.isOver
                                    ? "Kechiktirib yuborish"
                                    : "Yuklash"}
                                </>
                              )}
                            </button>
                          )}
                        </>
                      )}

                    {/* Deadline o'tganligi haqida ogohlantirish */}
                    {deadlineStatus.isOver &&
                      (!fileStatus || fileStatus === STATUS.REJECTED) && (
                        <div className="py-1 text-center text-xs text-red-500">
                          ⚠️ Muddat o'tgan, lekin yuklashingiz mumkin
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fayl ko'rish modali */}
      <Modal
        isOpen={!!openFile}
        onRequestClose={() => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setOpenFile(null);
        }}
        contentLabel="Faylni ko'rish"
        className="mx-auto mt-8 w-full max-w-4xl rounded-xl bg-white shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start p-4 z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800">
              <FiEye className="text-blue-600" />
              Faylni ko'rish
            </h3>
            <button
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
                setOpenFile(null);
              }}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>
          </div>
          {openFile && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                {openFile.name?.endsWith(".pdf") ? (
                  previewUrl ? (
                    <iframe
                      src={previewUrl}
                      title="PDF Preview"
                      className="h-[70vh] w-full border-0"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-12">
                      <div className="text-6xl">📄</div>
                      <p className="max-w-sm text-center text-gray-600">
                        PDF faylni ko'rish uchun quyidagi tugmani bosing
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(
                              `${baseUrl}/api/v1/file/getFile/${openFile.id}`,
                              {
                                method: "GET",
                                headers: {
                                  Accept: "application/pdf",
                                },
                              }
                            );

                            if (!res.ok)
                              throw new Error("Faylni olishda xatolik");

                            const blob = await res.blob();
                            const blobUrl = URL.createObjectURL(
                              new Blob([blob], { type: "application/pdf" })
                            );

                            setPreviewUrl(blobUrl);
                          } catch (e) {
                            toast.error("❌ PDF faylni ochib bo'lmadi!");
                            console.error(e);
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                      >
                        <FiEye />
                        PDF faylni ochish
                      </button>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center bg-gray-50 p-4">
                    <img
                      src={`${baseUrl}/api/v1/file/getFile/${openFile.id}`}
                      alt="Fayl"
                      className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-md"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden flex-col items-center justify-center gap-4 py-12 text-center">
                      <div className="text-6xl">🖼️</div>
                      <p className="max-w-sm text-gray-600">
                        Rasm yuklanmadi yoki ko'rsatib bo'lmadi
                      </p>
                      <button
                        onClick={() =>
                          handleDownload(openFile.id, openFile.name)
                        }
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <FiDownload />
                        Yuklab olish
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => handleDownload(openFile.id, openFile.name)}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 font-medium text-white transition-colors hover:bg-green-700"
                >
                  <FiDownload />
                  Yuklab olish
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AmaliyotUpload;
