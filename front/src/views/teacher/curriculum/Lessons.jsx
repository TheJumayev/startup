import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import LoadingOverlay from "components/loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

// localStorage helper funksiyalari
const getStoredPage = () => {
  try {
    return parseInt(localStorage.getItem("curriculumTablePage")) || 0;
  } catch {
    return 0;
  }
};
const FileUploadModal = ({ isOpen, onClose, lessonId, onSuccess }) => {
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [lessons, setLessons] = useState([]);
  const [attachmentId, setAttachmentId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [videoIframe, setVideoIframe] = useState("");
  const [lessonFileId, setLessonFileId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(null);

  // 🔹 Test uchun holatlar
  const [haveTest, setHaveTest] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testContent, setTestContent] = useState("");
  const [ball, setBall] = useState(1);

  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await ApiCall(
          `/api/v1/teacher-homework/by-lesson/${lessonId}`,
          "GET"
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          const lf = res.data[0];
          console.log(lf);

          setLessonFileId(lf.id);
          if (lf.attachment) {
            setAttachmentId(lf.attachment.id);
            setFileUrl(
              lf.attachment.url ||
              `/api/v1/teacher-homework/attachments/${lf.attachment.id}`
            );

            console.log(fileUrl);

            setFileName(lf.attachment.name);
          }
          setVideoIframe(lf.videoUrl || "");
          setDescription(lf.description || "");
          setStatus(lf.status ? "ACTIVE" : "INACTIVE");
          setHaveTest(lf.haveTest || false);
          setBall(lf.ball || 1);
        } else {
          setLessonFileId(null);
          setAttachmentId(null);
          setFileUrl(null);
          setVideoIframe("");
          setDescription("");
          setStatus("ACTIVE");
          setHaveTest(false);
          setBall(1);
        }
      } catch (err) {
        console.error("Xatolik (fetchExisting):", err);
      }
    };
    if (isOpen) fetchExisting();
  }, [isOpen, lessonId]);

  const handleSubmit = async () => {
    try {
      const dto = {
        lessonId,
        attachmentId,
        videoUrl: videoIframe || null,
        description,
        haveTest,
        ball,
        test: haveTest ? testContent : null,
      };

      // ✅ Shart: hech biri yo‘q bo‘lsa — POST, aks holda — PUT
      const isEmpty =
        (!haveTest || haveTest === null) &&
        (!attachmentId || attachmentId === null) &&
        (!videoIframe || videoIframe.trim() === "");

      let res;

      if (isEmpty) {
        // 🟢 Yangi yozuv yaratish
        console.log("POST mode:", dto);
        res = await ApiCall(`/api/v1/teacher-homework`, "POST", dto);
      } else if (lessonFileId) {
        // 🔵 Mavjud homeworkni yangilash
        console.log("PUT mode:", dto);
        res = await ApiCall(
          `/api/v1/teacher-homework/${lessonFileId}`,
          "PUT",
          dto
        );
      } else {
        // Agar lessonFileId bo‘lmasa ham POST fallback
        console.log("Fallback POST:", dto);
        res = await ApiCall(`/api/v1/teacher-homework`, "POST", dto);
      }

      console.log(res);

      if (res && !res.error) {
        toast.success("✅ Ma’lumot saqlandi");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error("❌ Saqlashda xatolik");
      }
    } catch (err) {
      console.error("Homework yuborishda xato:", err);
      toast.error("Server bilan aloqa xatosi");
    }
  };


  const handleSubmitTest = () => {
    if (!testContent.trim()) return toast.warn("Test matnini kiriting!");
    setHaveTest(true);
    setShowTestModal(false);
    toast.success("✅ Test yuklandi");
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose} center>
        <h2 className="mb-4 text-lg font-bold">
          Fayl, Video yoki Test qo‘shish
        </h2>
        {/* PDF yuklash */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            PDF yuklash
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (!file) return;

              if (file.type !== "application/pdf") {
                toast.error("Faqat PDF yuklang!");
                return;
              }

              setFileUrl(URL.createObjectURL(file));
              setFileName(file.name);
              setIsUploading(true);
              try {
                console.log("📤 Fayl yuborilmoqda:", file.name);
                const formData = new FormData();
                formData.append("photo", file);
                formData.append("prefix", "/teacher-homework");
                console.log(baseUrl);

                const res = await fetch(`${baseUrl}/api/v1/file/upload`, {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) throw new Error("Faylni yuklab bo‘lmadi!");
                const data = await res.json();
                console.log("✅ Yuklangan fayl javobi:", data);
                // attachmentId ni olamiz (data.id yoki data.data.id dan)
                const newId = data || data?.data?.id;
                setAttachmentId(newId);
                console.log("📎 attachmentId:", newId);

                toast.success("✅ Fayl muvaffaqiyatli yuklandi");
              } catch (err) {
                console.error("❌ Fayl yuklashda xato:", err);
                toast.error("Fayl yuklashda xato!");
              } finally {
                setIsUploading(false);
              }
            }}
          />

          {/* Yuklanish holatini ko‘rsatish */}
          {isUploading && (
            <p className="mt-2 animate-pulse text-sm text-yellow-600">
              ⏳ Fayl yuklanmoqda...
            </p>
          )}

          {fileUrl && (
            <iframe
              src={fileUrl}
              title="PDF"
              className="mt-2 h-40 w-full border"
            />
          )}
        </div>

        {/* Video iframe */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Video iframe kodi (YouTube)
          </label>
          <textarea
            rows={3}
            value={videoIframe}
            onChange={(e) => setVideoIframe(e.target.value)}
            className="w-full rounded border px-2 py-1 text-sm"
            placeholder="<iframe ...></iframe>"
          />
          {videoIframe.trim() && (
            <div className="relative mt-2 border">
              <div dangerouslySetInnerHTML={{ __html: videoIframe }} />
            </div>
          )}
        </div>

        {/* Test yuklash checkbox */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="testCheck"
            checked={haveTest}
            onChange={(e) => {
              const checked = e.target.checked;
              setHaveTest(checked);
              if (checked) setShowTestModal(true);
            }}
            className="h-4 w-4"
          />
          <label
            htmlFor="testCheck"
            className="select-none text-sm font-medium text-gray-700"
          >
            Test yuklash
          </label>
          {haveTest && (
            <span className="ml-2 text-xs text-green-600">
              ✅ Yuklangan ({ball} ball har savol uchun)
            </span>
          )}
        </div>

        {/* Ball */}
        {haveTest && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Har bir savol uchun ball
            </label>
            <input
              type="number"
              min={1}
              value={ball}
              onChange={(e) => setBall(parseInt(e.target.value))}
              className="w-full rounded border px-2 py-1 text-sm"
            />
          </div>
        )}

        {/* Izoh + Holat */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tavsif / Izoh
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-2 py-1 text-sm"
              placeholder="Masalan: 3-darsning qo‘shimcha materiali..."
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Holati
            </label>
            <button
              type="button"
              onClick={() =>
                setStatus(status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
              }
              className={`w-full rounded px-3 py-2 font-semibold transition ${status === "ACTIVE"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {status === "ACTIVE" ? "✅ Faol" : "❌ Nofaol"}
            </button>
          </div>
        </div>

        {/* Tugmalar */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Saqlash
          </button>
        </div>
      </Modal>

      {/* 🧩 Test modal (fon interaktiv holatda) */}
      {showTestModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border bg-white shadow-lg">
            <button
              onClick={() => setShowTestModal(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold">Yangi test qo‘shish</h2>
              <p className="mb-2 text-sm text-gray-600">
                Har bir savol bloki <b>+++++</b> bilan ajratiladi, savol va
                javoblar <b>====</b> bilan ajratiladi. To‘g‘ri javob oldida{" "}
                <b>#</b> belgisi bo‘lishi kerak.
              </p>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder={`Savol 1
====
# To‘g‘ri javob
====
Noto‘g‘ri javob 1
====
Noto‘g‘ri javob 2
====
Noto‘g‘ri javob 3
+++++
Savol 2
==== ...`}
                className="h-64 w-full rounded-md border border-gray-300 p-3 focus:ring focus:ring-blue-200"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmitTest}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const setStoredPage = (page) => {
  try {
    localStorage.setItem("curriculumTablePage", page.toString());
  } catch (error) {
    console.error("LocalStorage ga yozishda xatolik:", error);
  }
};

// Loading spinner komponenti
const LoadingSpinner = ({ size = 4, className = "" }) => (
  <svg
    className={`h-${size} w-${size} animate-spin text-white ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    ></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
);

// Empty state komponenti
const EmptyState = ({ title, message }) => (
  <div className="rounded-lg bg-white p-8 text-center shadow">
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
    <p className="mt-1 text-sm text-gray-500">{message}</p>
  </div>
);
// Yuklab olish tugmasi komponenti
const DownloadButton = ({ fileUrl, fileName }) => {
  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      // Скачать как бинарный поток
      const response = await fetch(fileUrl, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Faylni yuklab bo'lmadi");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      // Создаём временную ссылку и кликаем
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="rounded-lg p-1.5 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700"
      title="Faylni yuklab olish"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
    </button>
  );
};

// Table header komponenti
const TableHeader = ({ columns }) => (
  <thead className="bg-gray-50">
    <tr>
      {columns.map((column) => (
        <th
          key={column.key}
          className="px-2 py-2 text-left text-xs font-medium uppercase text-gray-500"
        >
          {column.label}
        </th>
      ))}
    </tr>
  </thead>
);

// Table row komponenti
const LessonRow = ({ lesson, formatSemester, index, onFileUpload }) => {
  const [lessonFile, setLessonFile] = useState(null);
  const navigate = useNavigate();
  // Получаем объект файла/видео
  const fetchFiles = useCallback(async () => {
    try {
      const response = await ApiCall(
        `/api/v1/teacher-homework/by-lesson/${lesson.id}`,
        "GET"
      );
      console.log(response.data);

      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        setLessonFile(response.data[0]); // последний загруженный
      } else {
        setLessonFile(null);
      }
    } catch (error) {
      console.error("Fayllarni olishda xatolik:", error);
    }
  }, [lesson.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUploadSuccess = () => {
    fetchFiles();
    if (onFileUpload) onFileUpload();
  };

  const trainingTypeMap = {
    11: "Ma'ruza",
    12: "Laboratoriya",
    13: "Amaliy",
    14: "Seminar",
    15: "Trening",
    16: "Kurs ishi",
    17: "Mustaqil ta'lim",
  };

  return (
    <tr key={lesson.id} className="hover:bg-gray-50">
      <td className="px-2 py-2 text-sm font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="px-2 py-2 text-sm text-gray-900">
        <div className="line-clamp-2 max-w-xs">{lesson.name || "N/A"}</div>
      </td>
      <td className="px-2 py-2 text-sm text-gray-500">
        {lesson.topic_load || "N/A"}
      </td>
      <td className="px-2 py-2 text-sm text-gray-500">
        {formatSemester(lesson.semester)}
      </td>
      <td className="px-2 py-2 text-sm text-gray-500">
        {lesson.departmentName ||
          lesson.curriculumSubject?.department?.name ||
          "N/A"}
      </td>
      <td className="px-2 py-2 text-sm text-gray-500">
        {trainingTypeMap[lesson.trainingType] || "Boshqa"}
      </td>
      <td className="px-2 py-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${lesson.active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {lesson.active ? "Faol" : "Nofaol"}
        </span>
      </td>

      <td className="px-2 py-2 text-sm">
        {lessonFile?.attachment ? (
          <span className="flex items-center text-green-600">✅</span>
        ) : (
          <span className="text-gray-400">Fayl yo'q</span>
        )}
      </td>

      {/* ✅ Video statusi */}
      <td className="px-2 py-2 text-sm">
        {lessonFile?.videoUrl ? (
          <span className="flex items-center text-green-600">✅</span>
        ) : (
          <span className="text-gray-400">Video yo'q</span>
        )}
      </td>
      {/* ✅Test */}
      <td className="px-2 py-2 text-sm">
        {lessonFile?.haveTest ? (
          <span className="flex items-center text-green-600">✅</span>
        ) : (
          <span className="text-gray-400">Test yo'q</span>
        )}
      </td>
      <td className="px-2 py-2 text-sm">
        {lessonFile?.description ? (
          <span className="flex items-center text-green-600">✅</span>
        ) : (
          <span className="text-gray-400">Izoh yo'q</span>
        )}
      </td>

      {/* Amallar */}
      <td className="px-2 py-2">
        <div className="flex items-center space-x-2">
          {/* Yuklab olish tugmasi */}
          {/* Fayl yuklash tugmasi */}
          <FileUploadButton
            lessonId={lesson.id}
            onFileUpload={handleFileUploadSuccess}
          />
          {lessonFile?.attachment && (
            <DownloadButton
              fileUrl={`${baseUrl}/api/v1/file/getFile/${lessonFile.attachment.id}`}
              fileName={lessonFile.attachment.name}
            />
          )}
        </div>
        <button
          disabled={lesson?.isPresent !== true}
          onClick={() => navigate(`/teacher/homework-check/lessons/${lesson.id}`)}
          className={`rounded-lg px-6 py-2 text-white transition ${lesson?.isPresent ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          Tekshirish
        </button>

      </td>
    </tr>
  );
};

// Fayl yuklash tugmasi komponenti (faqat icon)
const FileUploadButton = ({ lessonId, onFileUpload }) => {
  const [openModal, setOpenModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600"
        title="Fayl yuklash"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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
      </button>

      <FileUploadModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        lessonId={lessonId}
        onSuccess={onFileUpload}
      />
    </>
  );
};

// Fan ma'lumotlari komponenti
const SubjectInfoCard = ({ subjectData }) => {
  if (!subjectData || !subjectData.curriculumSubject) return null;

  const { curriculumSubject } = subjectData;
  const { subject, curriculum, department, credit, totalAcload } =
    curriculumSubject;

  return (
    <div className="mb-4 rounded-lg bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-bold text-gray-800">Fan ma'lumotlari</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Fan nomi</h3>
          <p className="truncate text-sm font-semibold">
            {subject?.name || "N/A"}
          </p>
        </div>

        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Fan kodi</h3>
          <p className="text-sm font-semibold">{subject?.code || "N/A"}</p>
        </div>

        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Kredit</h3>
          <p className="text-sm font-semibold">{credit || "N/A"}</p>
        </div>

        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Akademik yuk</h3>
          <p className="text-sm font-semibold">{totalAcload || "N/A"} soat</p>
        </div>

        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Kafedra</h3>
          <p className="truncate text-sm font-semibold">
            {department?.name || "N/A"}
          </p>
        </div>

        <div className="truncate">
          <h3 className="text-xs font-medium text-gray-500">Semestr</h3>
          <p className="text-sm font-semibold">
            {curriculum?.semester || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

function Lessons() {
  const { id } = useParams();
  const [state, setState] = useState({
    lessons: [],
    isLoading: true,
    isUpdating: false,
    subjectData: null,
  });

  const { lessons, isLoading, isUpdating, subjectData } = state;
  // Format semester to display (subtract 10 as per your requirement)
  const formatSemester = useCallback((semester) => {
    return semester ? semester - 10 : "N/A";
  }, []);

  // Fetch lessons for the curriculum
  const fetchLessons = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const response = await ApiCall(
        `/api/v1/lessons/by-curriculum-subject/${id}`,
        "GET"
      );
      // Backenddan qaytgan ma'lumotni tekshirish
      let lessonsData = [];

      if (response && response.data) {
        // Agar response.data massiv bo'lsa
        if (Array.isArray(response.data)) {
          lessonsData = response.data;
        }
        // Agar response.data object bo'lsa va ichida data bo'lsa
        else if (response.data.data && Array.isArray(response.data.data)) {
          lessonsData = response.data.data;
        }
        // Agar response.data ichida content bo'lsa
        else if (
          response.data.content &&
          Array.isArray(response.data.content)
        ) {
          lessonsData = response.data.content;
        }
        // Agar response.data ichida items bo'lsa
        else if (response.data.items && Array.isArray(response.data.items)) {
          lessonsData = response.data.items;
        }

        // Agar birinchi dars mavjud bo'lsa, subject ma'lumotlarini olish
        if (lessonsData.length > 0 && lessonsData[0].curriculumSubject) {
          setState((prev) => ({ ...prev, subjectData: lessonsData[0] }));
        }
      }
      setState((prev) => ({ ...prev, lessons: lessonsData }));
    } catch (err) {
      console.error("Error fetching lessons:", err);
      toast.error("Darslarni yuklashda xatolik yuz berdi");
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [id]);

  // Update lessons from HEMIS
  const getLessonFromHemis = useCallback(async () => {
    try {
      const response = await ApiCall(`/api/v1/lessons/update/${id}`, "GET");
      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto'g'ri.");
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      console.error("Xatolik (yangilash):", error);
      toast.error("Yangilashda xatolik yuz berdi");
    }
  }, [id]);

  const updateLessonsFromHemis = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isUpdating: true }));
      await getLessonFromHemis();
      await fetchLessons();
    } catch (err) {
      console.error("Error updating lessons:", err);
    } finally {
      setState((prev) => ({ ...prev, isUpdating: false }));
    }
  }, [getLessonFromHemis, fetchLessons]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const tableColumns = [
    { key: "number", label: "№" },
    { key: "name", label: "Mavzu nomi" },
    { key: "topic_load", label: "Yuki" },
    { key: "semester", label: "Sem" },
    { key: "department", label: "Kafedra" },
    { key: "trainingType", label: "Dars turlari" },
    { key: "status", label: "Holati" },
    { key: "fileStatus", label: "Fayl" },
    { key: "videoUrlStatus", label: "Video" }, // Yangi ustun
    { key: "tests", label: "Test" }, // Yangi ustun
    { key: "Izoh", label: "Izoh" }, // Yangi ustun
    { key: "actions", label: "Amallar" }, // Yuklash/Yuklab olish
  ];

  // Fan nomini olish - turli xil strukturani qo'llab-quvvatlash
  const getSubjectName = () => {
    if (lessons.length === 0) return "Fan topilmadi!";

    // Turli xil backend strukturasi uchun
    const firstLesson = lessons[0];
    return (
      (firstLesson.curriculumSubject?.subject?.name ||
        firstLesson.subjectName ||
        firstLesson.name ||
        "Fan") + " fani"
    );
  };

  const subjectName = getSubjectName();

  return (
    <div className="min-h-screen p-2">
      <ToastContainer />
      <div className="mx-auto max-w-full">
        <div className="mb-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="truncate text-xl font-bold text-gray-800">
            {subjectName}
          </h1>
          <button
            onClick={updateLessonsFromHemis}
            disabled={isUpdating}
            className={`rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 ${isUpdating ? "cursor-not-allowed opacity-70" : ""
              }`}
          >
            {isUpdating ? (
              <span className="flex items-center">
                <LoadingSpinner size={4} className="mr-1" />
                Yangilanmoqda...
              </span>
            ) : (
              "HEMISdan yangilash"
            )}
          </button>
        </div>

        {subjectData && <SubjectInfoCard subjectData={subjectData} />}

        {isLoading || isUpdating ? (
          <LoadingOverlay text="Yangilanmoqda..." />
        ) : lessons.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <TableHeader columns={tableColumns} />
              <tbody className="divide-y divide-gray-200 bg-white">
                {lessons.map((lesson, index) => (
                  <LessonRow
                    key={lesson.id || lesson.hemisId || Math.random()}
                    lesson={lesson}
                    formatSemester={formatSemester}
                    index={index}
                    onFileUpload={fetchLessons}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Darslar topilmadi!"
            message="Hozircha hech qanday dars mavjud emas. Yangilash tugmasini bosib sinab ko'ring."
          />
        )}
      </div>
    </div>
  );
}

export default Lessons;
