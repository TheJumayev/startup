import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import LoadingOverlay from "components/loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";
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
  const [attachmentId, setAttachmentId] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [videoIframe, setVideoIframe] = useState("");
  const [lessonFileId, setLessonFileId] = useState(null); // id LessonFile (для удаления)
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(null);

  // 📌 При открытии модалки подтягиваем текущие LessonFile
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await ApiCall(
          `/api/v1/lessons-file/by-lesson/${lessonId}`,
          "GET"
        );
        if (Array.isArray(res.data) && res.data.length > 0) {
          const lf = res.data[0]; // последний созданный
          setLessonFileId(lf.id);
          if (lf.attachment) {
            setAttachmentId(lf.attachment.id);
            setFileUrl(
              lf.attachment.url ||
              `/api/v1/lessons-file/attachments/${lf.attachment.id}`
            );
            setFileName(lf.attachment.name);
          }
          if (lf.videoUrl) {
            setVideoIframe(lf.videoUrl);
          }
        }
      } catch (err) {
        console.error("Xatolik (fetchExisting):", err);
      }
    };
    if (isOpen) fetchExisting();
  }, [isOpen, lessonId]);

  const cleanFileName = (name) => {
    if (!name) return "";
    // убираем всё до первого "_"
    let cleaned = name.replace(/^[^_]+_/, "");
    // убираем завершающий "_", если есть
    cleaned = cleaned.replace(/_$/, "");
    return cleaned;
  };
  // 📌 Загрузка PDF
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🔒 если уже есть файл, запрещаем замену
    if (fileUrl) {
      toast.warn("Yuklash fayl allaqachon mavjud. Avval uni o'chiring.");
      e.target.value = ""; // сброс input, чтобы событие не зависло
      return;
    }

    setFileName(file.name);
    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF-ni yuklash mumkin");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", "/lesson");

      const res = await ApiCall(
        `/api/v1/lessons-file/attachments/upload`,
        "POST",
        formData
      );
      const id = res?.id || res?.data?.id || (res?.data ? res.data.id : null);

      if (!id) throw new Error("Faylni yuklab bo'lmadi");

      setAttachmentId(id);
      setFileUrl(URL.createObjectURL(file));
      toast.success("Fayl muvaffaqiyatli Yuklandi ✅");
    } catch (err) {
      console.error(err);
      toast.error("Faylni yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  // удалить только PDF
  // const handleDeleteFileOnly = () => {
  //   setAttachmentId(null);
  //   setFileUrl(null);
  //   setFileName(null);
  // };

  // // удалить только iframe
  // const handleDeleteVideoOnly = () => {
  //   setVideoIframe("");
  // };

  // 📌 Удаление LessonFile
  const handleDelete = async () => {
    if (!lessonFileId) return;
    try {
      await ApiCall(`/api/v1/lessons-file/${lessonFileId}`, "DELETE");
      toast.success("Fayl/video o‘chirildi ✅");
      setAttachmentId(null);
      setFileUrl(null);
      setVideoIframe("");
      setLessonFileId(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Xatolik (delete):", err);
      toast.error("O‘chirishda xatolik");
    }
  };

  // 📌 Сабмит
  const handleSubmit = async () => {
    try {
      console.log(attachmentId, videoIframe);

      const payload = {
        lessonId,
        ...(attachmentId ? { attachmentId } : {}),
        ...(videoIframe.trim() ? { video: videoIframe.trim() } : {}),
      };

      const res = await ApiCall(`/api/v1/lessons-file`, "POST", payload);

      if (res) {
        toast.success("Ma'lumot muvaffaqiyatli bog‘landi ✅");
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Saqlashda xatolik");
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} center>
      <h2 className="mb-4 text-lg font-bold">Fayl yoki Video qo'shish</h2>

      {/* PDF yuklash */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          PDF yuklash
        </label>
        <input
          type="file"
          accept=".pdf"
          onClick={(e) => {
            if (fileUrl) {
              e.preventDefault(); // блокируем открытие диалога выбора файла
              toast.warn("Fayl allaqachon mavjud. Avval uni o‘chiring.");
            }
          }}
          onChange={handleFileChange}
        />
        {fileName && (
          <p className="mt-1 text-sm text-blue-600">
            📄 {cleanFileName(fileName)}
          </p>
        )}

        {fileUrl && (
          <div className="relative mt-2">
            <iframe
              src={fileUrl}
              title="PDF Preview"
              className="h-40 w-full border"
            />
            {/* <button
              onClick={handleDeleteFileOnly}
              className="absolute top-2 right-2 rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
            >
              ✕
            </button> */}
          </div>
        )}
      </div>

      {/* YouTube iframe */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Video havolasi (YouTube yoki Google Drive)
        </label>
        <input
          type="text"
          value={videoIframe}
          onChange={(e) => {
            let val = e.target.value.trim();

            // Google Drive havolasi uchun avtomatik preview konvertatsiyasi
            const driveMatch = val.match(
              /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
            );
            if (driveMatch) {
              const fileId = driveMatch[1];
              val = `<iframe src="https://drive.google.com/file/d/${fileId}/preview" width="640" height="480" allow="autoplay" allowfullscreen></iframe>`;
            }

            setVideoIframe(val);
          }}
          className="w-full rounded border px-2 py-1 text-sm"
          placeholder="YouTube iframe yoki Google Drive linkini kiriting"
        />

        {videoIframe.trim() && (
          <div className="relative mt-2 border">
            <div dangerouslySetInnerHTML={{ __html: videoIframe }} />
          </div>
        )}
      </div>


      {/* Tugmalar */}
      <div className="mt-4 flex justify-between">
        {lessonFileId && (
          <button
            onClick={handleDelete}
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            O‘chirish
          </button>
        )}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isUploading ? "Yuklanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </Modal>
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
// Yuklab olish tugmasi komponenti
const DownloadButton = ({ fileUrl, fileName }) => {
  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      console.log("Yuklab olinmoqda:", fileUrl);

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

  // Получаем объект файла/видео
  const fetchFiles = useCallback(async () => {
    try {
      const response = await ApiCall(
        `/api/v1/lessons-file/by-lesson/${lesson.id}`,
        "GET"
      );
      console.log("Fayllar javobi:", response.data);

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

      {/* Amallar */}
      <td className="px-2 py-2">
        <div className="flex items-center space-x-2">
          {/* Yuklab olish tugmasi */}
          {lessonFile?.attachment && (
            <DownloadButton
              fileUrl={`${baseUrl}/api/v1/file/getFile/${lessonFile.attachment.id}`}
              fileName={lessonFile.attachment.name}
            />
          )}

          {/* Fayl yuklash tugmasi */}
          <FileUploadButton
            lessonId={lesson.id}
            onFileUpload={handleFileUploadSuccess}
          />
        </div>
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
      <Breadcrumbs
        items={[
          {
            label: "O'quv reja fanlar",
            to: "/admin/curriculum-subject/",
          },
        ]}
      />
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
