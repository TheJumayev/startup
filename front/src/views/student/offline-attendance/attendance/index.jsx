import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft,
  Save,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  Download,
  X,
  User,
  Calendar,
  BookOpen,
  Building,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  Lock,
  Unlock,
} from "lucide-react";

/* =====================================================
   HELPER: DARS BOSHLANGANMI?
===================================================== */
const isLessonStarted = (lessonDate, startTime) => {
  if (!lessonDate || !startTime) return false;
  const [h, m] = startTime.split(":").map(Number);
  const lessonStart = new Date(Number(lessonDate) * 1000);
  lessonStart.setHours(h, m, 0, 0);
  return new Date() >= lessonStart;
};
/* =====================================================
   HELPER: DARS 20 DAQIQAGACHA TAHIRLASH MUMKIN
===================================================== */
const isLessonWithinEditTime = (lessonDate, startTime) => {
  if (!lessonDate || !startTime) return false;

  const [h, m] = startTime.split(":").map(Number);

  // If backend sends UNIX seconds → multiply by 1000
  const lessonStart = new Date(Number(lessonDate) * 1000);

  lessonStart.setHours(h, m, 0, 0);

  const now = new Date();

  // 20 minute window
  const lessonEndLimit = new Date(lessonStart.getTime() + 20 * 60 * 1000);

  return now >= lessonStart && now <= lessonEndLimit;
};

/* =====================================================
   STATUS SELECT COMPONENT
===================================================== */
const StatusSelect = ({ value, onChange, disabled, isMobile = false }) => {
  const statusOptions = [
    {
      value: 1,
      label: "Bor",
      icon: CheckCircle,
      color: "bg-emerald-500 text-white",
    },
    { value: 2, label: "Yo'q", icon: XCircle, color: "bg-rose-500 text-white" },
    {
      value: 3,
      label: "Sababli",
      icon: AlertCircle,
      color: "bg-amber-500 text-white",
    },
  ];

  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm shadow-sm ring-1 ${
            value === 0
              ? "border-2 border-amber-500 bg-amber-50 ring-amber-500"
              : "bg-white ring-gray-200"
          } disabled:opacity-50`}
        >
          <div className="flex items-center gap-2">
            {statusOptions.find((opt) => opt.value === value)?.icon &&
              React.createElement(
                statusOptions.find((opt) => opt.value === value).icon,
                {
                  size: 16,
                  className: statusOptions
                    .find((opt) => opt.value === value)
                    ?.color.includes("emerald")
                    ? "text-emerald-500"
                    : statusOptions
                        .find((opt) => opt.value === value)
                        ?.color.includes("rose")
                    ? "text-rose-500"
                    : "text-amber-500",
                }
              )}
            <span className="font-medium">
              {statusOptions.find((opt) => opt.value === value)?.label ||
                "Tanlang (Majburiy)"}
            </span>
          </div>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
              >
                <option.icon
                  size={16}
                  className={
                    option.color.includes("emerald")
                      ? "text-emerald-500"
                      : option.color.includes("rose")
                      ? "text-rose-500"
                      : "text-amber-500"
                  }
                />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <select
      value={value || 0}
      onChange={(e) => onChange(Number(e.target.value))}
      disabled={disabled}
      className={`w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 ${
        value === 0
          ? "border-2 border-amber-500 bg-amber-50 focus:border-amber-500 focus:ring-amber-500/20"
          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500/20"
      } disabled:opacity-50`}
    >
      <option value={0} className="font-medium text-amber-600">
        🔴 Tanlang (Majburiy)
      </option>
      {statusOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-700"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

/* =====================================================
   STATUS BADGE COMPONENT
===================================================== */
const StatusBadge = ({ status }) => {
  const config = {
    1: {
      label: "Bor",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle,
    },
    2: {
      label: "Yo'q",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: XCircle,
    },
    3: {
      label: "Sababli",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: AlertCircle,
    },
    0: {
      label: "TANLANMAGAN",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: AlertTriangle,
    },
  };

  const { label, bg, text, border, icon: Icon } = config[status] || config[0];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${bg} ${text} ${border}`}
    >
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

/* =====================================================
   FILE UPLOAD COMPONENT
===================================================== */
const FileUpload = ({
  file,
  onChange,
  onRemove,
  disabled,
  isMobile = false,
  isRequired = false,
}) => {
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) onChange(selectedFile);
  };

  if (file) {
    return (
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-blue-500" />
        <span
          className={`truncate text-sm font-medium ${
            isMobile ? "max-w-[120px]" : "max-w-[150px]"
          }`}
        >
          {file.name}
        </span>
        {!disabled && (
          <button
            onClick={onRemove}
            className="hover:text-rose-500 text-gray-400"
            type="button"
          >
            <X size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer items-center gap-2 ${
        isMobile ? "text-xs" : "text-sm"
      } ${
        isRequired ? "font-medium text-amber-600" : "text-blue-600"
      } hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <Upload size={isMobile ? 14 : 16} />
      <span>{isRequired ? "Fayl yuklash (Majburiy)" : "Fayl yuklash"}</span>
      <input
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        disabled={disabled}
      />
    </label>
  );
};

/* =====================================================
   MOBILE STUDENT CARD
===================================================== */
const MobileStudentCard = ({
  item,
  index,
  isEditable,
  editedData,
  onStatusChange,
  onCommentChange,
  onFileChange,
  onFileRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const currentStatus =
    editedData?.isPresent !== undefined ? editedData.isPresent : item.isPresent;
  const currentComment =
    editedData?.comment !== undefined ? editedData.comment : item.comment;
  const currentFile = editedData?.file;
  const needsFile = currentStatus === 3 && !currentFile && !item.attachmentId;

  const fullName =
    item.student?.fullName ||
    `${item.student?.lastName || ""} ${item.student?.firstName || ""}`.trim();

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${
        currentStatus === 0 && isEditable
          ? "border-2 border-amber-500"
          : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              currentStatus === 0 && isEditable
                ? "bg-gradient-to-br from-amber-50 to-amber-100"
                : "bg-gradient-to-br from-blue-50 to-blue-100"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                currentStatus === 0 && isEditable
                  ? "text-amber-600"
                  : "text-blue-600"
              }`}
            >
              {index + 1}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{fullName}</h3>
            <p className="mt-1 text-xs text-gray-500">
              ID: {item.student?.studentIdNumber || "N/A"}
            </p>
            <div className="mt-2">
              <StatusBadge status={currentStatus} />
              {currentStatus === 0 && isEditable && (
                <p className="mt-1 text-xs text-amber-600">
                  ⚠️ Holat tanlanishi kerak
                </p>
              )}
            </div>
          </div>
        </div>

        {isEditable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <Edit3 size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && isEditable && (
        <div className="border-t border-gray-100 p-4">
          <div className="space-y-4">
            {/* Status Selection */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Davomat holati <span className="text-rose-500">*</span>
              </label>
              <StatusSelect
                value={currentStatus}
                onChange={(value) =>
                  onStatusChange(item.id, item.student?.id, value)
                }
                disabled={!isEditable || item.isLate}
                isMobile={true}
              />
              {currentStatus === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  Iltimos, davomat holatini tanlang
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Izoh (ixtiyoriy)
              </label>
              <textarea
                value={currentComment || ""}
                onChange={(e) =>
                  onCommentChange(item.id, item.student?.id, e.target.value)
                }
                className="w-full rounded-lg border resize-none  border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Izoh qoldiring..."
                rows={2}
              />
            </div>

            {/* File Upload for Reason */}
            {currentStatus === 3 && (
              <div>
                <label className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-700">
                  Sabab hujjati <span className="text-rose-500">*</span>
                  {needsFile && (
                    <span className="text-xs text-amber-600">(Majburiy)</span>
                  )}
                </label>
                {needsFile ? (
                  <div className="space-y-2">
                    <FileUpload
                      file={currentFile}
                      onChange={(file) =>
                        onFileChange(item.id, item.student?.id, file)
                      }
                      onRemove={() => onFileRemove(item.id)}
                      disabled={!isEditable}
                      isMobile={true}
                      isRequired={true}
                    />
                    <p className="text-xs text-amber-600">
                      ⚠️ "Sababli" holati uchun hujjat yuklash majburiy
                    </p>
                  </div>
                ) : (
                  <FileUpload
                    file={currentFile}
                    onChange={(file) =>
                      onFileChange(item.id, item.student?.id, file)
                    }
                    onRemove={() => onFileRemove(item.id)}
                    disabled={!isEditable}
                    isMobile={true}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Existing Comment Display */}
      {!isExpanded && currentComment && (
        <div className="border-t border-gray-100 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Izoh:</span> {currentComment}
          </p>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */
const Attendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attendanceList, setAttendanceList] = useState([]);
  const [editedMap, setEditedMap] = useState({});
  const [lessonInfo, setLessonInfo] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isLessonEditable, setIsLessonEditable] = useState(false);
  useEffect(() => {
    if (!lessonInfo) return;

    const checkTime = () => {
      const editable = isLessonWithinEditTime(
        lessonInfo.lessonDate,
        lessonInfo.start_time
      );
      setIsLessonEditable(editable);
    };

    checkTime(); // run immediately

    const interval = setInterval(checkTime, 60000); // recheck every minute

    return () => clearInterval(interval);
  }, [lessonInfo]);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    // Avval talaba ma’lumotini olib kelamiz
    fetchStudentAccount(token);
  }, [navigate]);

  const fetchStudentAccount = async (token) => {
    try {
      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
    } catch (err) {
      console.error("Talaba ma’lumotini olishda xato:", err);
      navigate("/student/login");
    }
  };
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }
    loadAttendance();
    // eslint-disable-next-line
  }, [id]);
  const handleDownloadFile = async (fileId, fileName) => {
    if (!fileId) {
      toast.warning("Fayl topilmadi!");
      return;
    }
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
      });

      if (!response.ok) {
        toast.error("Faylni yuklab bo'lmadi!");
        return;
      }

      const blob = await response.blob();

      // Fayl turini aniqlash (xavfsiz tekshiruv bilan)
      const contentType = response.headers.get("Content-Type") || "";
      const fileExtension =
        contentType === "application/pdf"
          ? ".pdf"
          : contentType.includes("zip")
          ? ".zip"
          : "";

      // Fayl nomini aniqlash
      const downloadName =
        fileName && fileName.includes(".")
          ? fileName
          : `fayl${fileExtension || ".pdf"}`;

      // Faylni yuklab olish
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Fayl yuklab olindi!");
    } catch (error) {
      console.error("Yuklab olishda xatolik:", error);
      toast.error("Faylni yuklab olishda xatolik yuz berdi.");
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/attendance-offline/offline/${id}`,
        "GET"
      );
      const data = res.data || [];
      setAttendanceList(data);

      if (data.length > 0 && data[0].scheduleList) {
        setLessonInfo(data[0].scheduleList);
      }
    } catch {
      toast.error("Davomatni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const visibleAttendance = attendanceList.filter((item) => !item.todayOnline);

  const totalStudents = visibleAttendance.length;

  // Count students with valid status (not 0 or "Tanlang")
  const checkedStudents = visibleAttendance.filter((item) => {
    const editedData = editedMap[item.id];
    const currentStatus =
      editedData?.isPresent !== undefined
        ? editedData.isPresent
        : item.isPresent;
    return currentStatus !== 0; // Status must be selected (1, 2, or 3)
  }).length;

  // Check if all students have valid file uploads when status is 3
  const allFilesUploaded = visibleAttendance.every((item) => {
    const editedData = editedMap[item.id];
    const currentStatus =
      editedData?.isPresent !== undefined
        ? editedData.isPresent
        : item.isPresent;
    const currentFile = editedData?.file;
    const hasAttachment = item.attachmentId;

    if (currentStatus === 3) {
      return currentFile || hasAttachment;
    }
    return true;
  });

  // Check if all students have valid statuses (not 0)
  const allStudentsChecked =
    checkedStudents === totalStudents && totalStudents > 0;

  // Check if all requirements are met
  const canSave =
    allStudentsChecked && allFilesUploaded && Object.keys(editedMap).length > 0;

  // const isLessonEditable = lessonInfo
  //   ? isLessonStarted(lessonInfo.lessonDate, lessonInfo.start_time)
  //   : false;

  const handleStatusChange = (attendanceId, studentId, newStatus) => {
    if (!isLessonEditable) return;

    const attendance = attendanceList.find((a) => a.id === attendanceId);

    // 🚫 agar kech qolgan bo'lsa o'zgartirib bo'lmaydi
    if (attendance?.isLate) {
      toast.warning(
        "Bu talaba kech qolgan deb belgilangan. Davomatni o‘zgartirib bo‘lmaydi."
      );
      return;
    }

    setEditedMap((prev) => ({
      ...prev,
      [attendanceId]: {
        ...prev[attendanceId],
        isPresent: newStatus,
        studentId,
      },
    }));
  };

  const handleCommentChange = (attendanceId, studentId, comment) => {
    if (!isLessonEditable) return;

    setEditedMap((prev) => ({
      ...prev,
      [attendanceId]: {
        ...prev[attendanceId],
        comment,
        studentId,
      },
    }));
  };

  const handleFileChange = (attendanceId, studentId, file) => {
    if (!isLessonEditable) return;

    setEditedMap((prev) => ({
      ...prev,
      [attendanceId]: {
        ...prev[attendanceId],
        file,
        studentId,
      },
    }));
  };

  const handleFileRemove = (attendanceId) => {
    if (!isLessonEditable) return;

    setEditedMap((prev) => ({
      ...prev,
      [attendanceId]: {
        ...prev[attendanceId],
        file: null,
      },
    }));
  };
  const uploadFile = async (file) => {
    if (!file) return null;

    const form = new FormData();
    form.append("photo", file);
    form.append("prefix", "/attendance-offline");

    const res = await fetch(`${baseUrl}/api/v1/file/upload`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error("Upload error");
    return await res.json();
  };

  const saveAll = async () => {
    if (!canSave) {
      if (!allStudentsChecked) {
        toast.warning(
          `Barcha ${totalStudents} ta talaba uchun holat tanlanishi kerak`
        );
      } else if (!allFilesUploaded) {
        toast.warning(
          `"Sababli" holatidagi barcha talabalar uchun hujjat yuklanishi kerak`
        );
      }
      return;
    }

    const entries = Object.entries(editedMap);
    if (entries.length === 0) {
      toast.info("O'zgartirishlar yo'q");
      return;
    }

    try {
      setLoading(true);

      for (const [attendanceId, data] of entries) {
        let attachmentId = null;

        if (data.isPresent === 3 && data.file) {
          const uploadResult = await uploadFile(data.file);

          attachmentId = uploadResult;
        }

        await ApiCall(`/api/v1/attendance-offline/${attendanceId}`, "PUT", {
          isPresent: data.isPresent,
          comment: data.comment || null,
          attachmentId,
          studentId: data.studentId || null,
        });
      }

      toast.success("✅ Davomat muvaffaqiyatli saqlandi");
      setEditedMap({});
      loadAttendance();
    } catch (e) {
      toast.error("❌ Saqlashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Count students missing status
  const missingStatusCount = totalStudents - checkedStudents;

  // Count students missing files
  const missingFileCount = visibleAttendance.filter((item) => {
    const editedData = editedMap[item.id];
    const currentStatus =
      editedData?.isPresent !== undefined
        ? editedData.isPresent
        : item.isPresent;
    const currentFile = editedData?.file;
    const hasAttachment = item.attachmentId;

    return currentStatus === 3 && !currentFile && !hasAttachment;
  }).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-blue-600" />
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Davomat yuklanmoqda...
          </p>
          <p className="mt-1 text-sm text-gray-500">Iltimos, kuting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow-md"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline">Orqaga</span>
              </button>

              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Davomatni boshqarish
                </h1>
                {lessonInfo && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span className="font-medium">
                        {lessonInfo.subject?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>
                        {lessonInfo.start_time} - {lessonInfo.end_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building size={14} />
                      <span>{lessonInfo.auditoriumName}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {checkedStudents}/{totalStudents}
                    </span>
                    <span className="text-xs text-blue-600">tanlandi</span>
                  </div>
                </div>
                {!canSave && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Lock size={16} className="text-amber-600" />
                  </div>
                )}
                {canSave && (
                  <div className="bg-emerald-100 flex h-8 w-8 items-center justify-center rounded-full">
                    <Unlock size={16} className="text-emerald-600" />
                  </div>
                )}
              </div>

              <button
                onClick={saveAll}
                disabled={!canSave}
                className={`
                  flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-all
                  ${
                    canSave
                      ? "from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 bg-gradient-to-r shadow-lg hover:shadow-xl active:scale-95"
                      : "cursor-not-allowed "
                  }
                `}
              >
                {canSave ? (
                  <>
                    <Save size={18} />
                    <span>Saqlash</span>
                    {Object.keys(editedMap).length > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">
                        {Object.keys(editedMap).length}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Qulflangan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Validation Warnings */}
      {/* Validation Warnings */}
      {(!isLessonEditable ||
        missingStatusCount > 0 ||
        missingFileCount > 0) && (
        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <p className="text-sm font-medium text-amber-800">
                  Davomatni saqlash uchun quyidagilarni bajarish kerak:
                </p>
              </div>

              <div className="ml-6 space-y-1">
                {/* 🔒 TIME LOCK MESSAGE */}
                {!isLessonEditable && (
                  <p className="text-rose-700 text-sm">
                    ⛔ Davomatni tahrirlash vaqti tugagan (faqat dars
                    boshlanganidan keyin 20 daqiqa ichida mumkin)
                  </p>
                )}

                {missingStatusCount > 0 && (
                  <p className="text-sm text-amber-700">
                    🔴{" "}
                    <span className="font-semibold">
                      {missingStatusCount} ta talaba
                    </span>{" "}
                    uchun holat tanlanmagan
                  </p>
                )}

                {missingFileCount > 0 && (
                  <p className="text-sm text-amber-700">
                    📎{" "}
                    <span className="font-semibold">
                      {missingFileCount} ta talaba
                    </span>{" "}
                    uchun sabab hujjati yuklanmagan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mx-auto mt-4 max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        {isMobile ? (
          /* Mobile View - Cards */
          <div className="space-y-4">
            {visibleAttendance.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <User size={24} className="text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  Talabalar topilmadi
                </h3>
                <p className="text-gray-500">Davomat ro'yxati bo'sh</p>
              </div>
            ) : (
              visibleAttendance.map((item, index) => {
                const isEditable =
                  isLessonEditable && item.isPresent === 0 && !item.isLate;
                const editedData = editedMap[item.id];

                return (
                  <MobileStudentCard
                    key={item.id}
                    item={item}
                    index={index}
                    isEditable={isEditable}
                    editedData={editedData}
                    onStatusChange={handleStatusChange}
                    onCommentChange={handleCommentChange}
                    onFileChange={handleFileChange}
                    onFileRemove={handleFileRemove}
                  />
                );
              })
            )}
          </div>
        ) : (
          /* Desktop View - Table */
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      №
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Talaba
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Holat <span className="text-rose-500">*</span>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Izoh
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Fayl
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {visibleAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                          <User size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500">Davomat ro'yxati bo'sh</p>
                      </td>
                    </tr>
                  ) : (
                    visibleAttendance.map((item, index) => {
                      const isEditable =
                        isLessonEditable && item.isPresent === 0;
                      const editedData = editedMap[item.id] || {};
                      const currentStatus =
                        editedData.isPresent !== undefined
                          ? editedData.isPresent
                          : item.isPresent;
                      const currentComment =
                        editedData.comment !== undefined
                          ? editedData.comment
                          : item.comment;
                      const currentFile = editedData.file;
                      const needsFile =
                        currentStatus === 3 &&
                        !currentFile &&
                        !item.attachmentId;

                      const fullName =
                        item.student?.fullName ||
                        `${item.student?.lastName} ${item.student?.firstName}`;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            currentStatus === 0 && isEditable
                              ? "bg-amber-50/50 hover:bg-amber-100/50"
                              : isEditable
                              ? "hover:bg-blue-50/50"
                              : "hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg font-medium ${
                                currentStatus === 0 && isEditable
                                  ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {index + 1}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="min-w-[200px]">
                              <div className="font-medium text-gray-900">
                                {fullName}
                              </div>
                              {item.isLate && (
                                <span className="text-xs font-medium text-orange-600">
                                  ⏰ Kech qolgan
                                </span>
                              )}
                              <div className="mt-1 text-xs text-gray-500">
                                ID: {item.student?.studentIdNumber}
                              </div>
                              {currentStatus === 0 && isEditable && (
                                <p className="mt-1 text-xs text-amber-600">
                                  🔴 Holat tanlanishi kerak
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <StatusSelect
                              value={currentStatus}
                              onChange={(value) =>
                                handleStatusChange(
                                  item.id,
                                  item.student?.id,
                                  value
                                )
                              }
                              disabled={!isEditable || item.isLate}
                            />
                            {currentStatus === 0 && isEditable && (
                              <p className="mt-1 text-xs text-amber-600">
                                Majburiy maydon
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <textarea
                              value={currentComment || ""}
                              onChange={(e) =>
                                handleCommentChange(
                                  item.id,
                                  item.student?.id,
                                  e.target.value
                                )
                              }
                              className="w-full min-w-[200px] resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="Izoh qoldiring..."
                              rows={2}
                              disabled={!isEditable}
                            />
                          </td>
                          <td className="px-4 py-4">
                            {item?.file?.id ? (
                              <button
                                onClick={() =>
                                  handleDownloadFile(
                                    item?.file?.id,
                                    item?.file?.name
                                  )
                                }
                                className="inline-flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <Download size={14} />
                                Yuklab olish
                              </button>
                            ) : isEditable && currentStatus === 3 ? (
                              <div>
                                <label className="group relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2 transition-colors hover:border-blue-500 hover:bg-blue-50">
                                  <input
                                    type="file"
                                    onChange={(e) =>
                                      handleFileChange(
                                        item.id,
                                        item.student?.id,
                                        e.target.files[0]
                                      )
                                    }
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    accept="image/*,.pdf,.doc,.docx"
                                  />
                                  <Upload
                                    size={16}
                                    className="mr-2 text-gray-500 group-hover:text-blue-600"
                                  />
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                                    Fayl yuklash
                                  </span>
                                </label>

                                {needsFile && (
                                  <p className="mt-1 text-xs text-amber-600">
                                    ⚠️ "Sababli" holati uchun majburiy
                                  </p>
                                )}

                                {currentFile?.name && (
                                  <p className="mt-1 truncate text-xs text-gray-500">
                                    {currentFile.name}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Action Bar */}
        {visibleAttendance.length > 0 && (
          <div className="mt-8">
            <div
              className={`rounded-2xl p-6 ${
                canSave
                  ? "bg-gradient-to-r from-gray-900 to-gray-800"
                  : "bg-gradient-to-r from-gray-900 to-gray-800"
              }`}
            >
              <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {canSave ? "Davomatni saqlash tayyor" : "Davomatni saqlash"}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {Object.keys(editedMap).length} ta o'zgartirish •{" "}
                    {checkedStudents}/{totalStudents} tanlandi
                    {missingFileCount > 0 &&
                      ` • ${missingFileCount} ta fayl yetishmaydi`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {!canSave && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-500/30 px-4 py-2 text-white">
                      <Lock size={16} />
                      <span className="text-sm">
                        {missingStatusCount > 0 &&
                          `${missingStatusCount} ta holat tanlanmagan`}
                        {missingStatusCount > 0 &&
                          missingFileCount > 0 &&
                          " • "}
                        {missingFileCount > 0 &&
                          `${missingFileCount} ta hujjat yuklanmagan`}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={saveAll}
                    disabled={!canSave}
                    className={`
                      flex items-center gap-3 rounded-xl px-6 py-3 font-semibold text-white transition-all
                      ${
                        canSave
                          ? "cursor-not-allowed bg-gray-700/50"
                          : "cursor-not-allowed bg-gray-700/50"
                      }
                    `}
                  >
                    {canSave ? (
                      <>
                        <Save size={20} />
                        Davomatni saqlash
                        <Check size={20} className="text-emerald-700" />
                      </>
                    ) : (
                      <>
                        <Lock size={20} />
                        Qulflangan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
