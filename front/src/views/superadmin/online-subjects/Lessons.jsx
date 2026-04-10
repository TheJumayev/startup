import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../config";
import LoadingOverlay from "components/loading/LoadingOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

// localStorage helper funksiyalari
const getStoredPage = () => {
  try {
    return parseInt(localStorage.getItem("curriculumTablePage")) || 0;
  } catch {
    return 0;
  }
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
  console.log("fileUrl:", fileUrl);
  
  const handleDownload = () => {
    if (!fileUrl) return;

    // Yangi tabda ochish
    window.open(fileUrl, "_blank");

    // Yoki to'g'ridan-to'g'ri yuklab olish
    // const link = document.createElement('a');
    // link.href = fileUrl;
    // link.download = fileName || "document.pdf";
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
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
// Table row komponenti
const LessonRow = ({ lesson, formatSemester, index, onFileUpload }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // Fayllarni olish funksiyasi
  const fetchFiles = useCallback(async () => {
    try {
      const response = await ApiCall(
        `/api/v1/lessons-file/by-lesson/${lesson.id}`,
        "GET"
      );
      if (response && Array.isArray(response)) {
        setUploadedFiles(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setUploadedFiles(response.data);
      } else if (
        response &&
        response.content &&
        Array.isArray(response.content)
      ) {
        setUploadedFiles(response.content);
      }
    } catch (error) {
      console.error("Fayllarni olishda xatolik:", error);
    }
  }, [lesson.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUploadSuccess = () => {
    fetchFiles(); // Yangi fayl yuklangandan so'ng ro'yxatni yangilash
    if (onFileUpload) onFileUpload();
  };

  // Oxirgi yuklangan faylni olish
  const latestFile = uploadedFiles.length > 0 ? uploadedFiles[0] : null;
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
      <td className="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="px-2 py-2 text-sm text-gray-900">
        <div className="line-clamp-2 max-w-xs">{lesson.name || "N/A"}</div>
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
        {lesson.topic_load || "N/A"}
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
        {formatSemester(lesson.semester)}
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
        {lesson.departmentName ||
          lesson.curriculumSubject?.department?.name ||
          "N/A"}
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-sm text-gray-500">
        {trainingTypeMap[lesson.trainingType] || "Boshqa"}
      </td>

      <td className="whitespace-nowrap px-2 py-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            lesson.active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {lesson.active ? "Faol" : "Nofaol"}
        </span>
      </td>

      {/* Fayl statusi */}
      <td className="whitespace-nowrap px-2 py-2 text-sm">
        {latestFile ? (
          <span className="flex items-center text-green-600">✅ Yuklangan</span>
        ) : (
          <span className="text-gray-400">Fayl yo'q</span>
        )}
      </td>

      {/* Yuklash/Yuklab olish tugmalari */}
      <td className="whitespace-nowrap px-2 py-2">
        <div className="flex items-center space-x-2">
          {/* Yuklab olish tugmasi (faqat fayl mavjud bo'lganda) */}
          {latestFile && (
            <DownloadButton
              fileUrl={latestFile.attachment?.url}
              fileName={latestFile.attachment?.originalName}
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
// Fayl yuklash tugmasi komponenti
const FileUploadButton = ({ lessonId, onFileUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Fayl hajmini tekshirish (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Fayl hajmi 5MB dan oshmasligi kerak");
      return;
    }

    // Fayl turini tekshirish (faqat PDF)
    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF hujjatlarini yuklash mumkin");
      return;
    }

    try {
      setIsUploading(true);

      // 1. Faylni yuklash
      const attachmentFormData = new FormData();
      attachmentFormData.append("file", file);
      attachmentFormData.append("prefix", "/lesson");

      const attachmentResponse = await ApiCall(
        `/api/v1/lessons-file/attachments/upload`,
        "POST",
        attachmentFormData
      );

      console.log("Attachment response:", attachmentResponse);

      const attachmentId =
        attachmentResponse?.id ||
        attachmentResponse?.data?.id ||
        (attachmentResponse?.data ? attachmentResponse.data.id : null);

      if (!attachmentId) {
        throw new Error("Fayl yuklash muvaffaqiyatsiz tugadi");
      }

      // 2. Yuklangan faylni darsga bog'lash
      const linkResponse = await ApiCall(`/api/v1/lessons-file`, "POST", {
        lessonId: lessonId,
        attachmentId: attachmentId,
      });

      if (linkResponse) {
        toast.success("PDF muvaffaqiyatli yuklandi va darsga bog'landi");
        if (onFileUpload) onFileUpload();
      } else {
        throw new Error("Faylni darsga bog'lash muvaffaqiyatsiz tugadi");
      }
    } catch (error) {
      console.error("Fayl yuklashda xatolik:", error);
      toast.error("Fayl yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="relative cursor-pointer ">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        disabled={isUploading}
      />
      <button
        className={`rounded-lg p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600 ${
          isUploading ? "cursor-not-allowed opacity-70" : ""
        }`}
        disabled={isUploading}
        title="Fayl yuklash"
      >
        {isUploading ? (
          <LoadingSpinner size={4} className="text-blue-600" />
        ) : (
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
        )}
      </button>
    </div>
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
      console.log("Lessons response:", response);

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
    { key: "fileStatus", label: "Fayl holati" }, // Yangi ustun
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
            to: "/superadmin/curriculum-subject/",
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
            className={`rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-700 ${
              isUpdating ? "cursor-not-allowed opacity-70" : ""
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
