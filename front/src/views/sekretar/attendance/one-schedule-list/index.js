import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ArrowLeft,
  Save,
  Upload,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
   STATUS BADGE COMPONENT
===================================================== */
const StatusBadge = ({ status }) => {
  const config = {
    1: {
      label: "Bor",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    2: {
      label: "Yo'q",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
    3: {
      label: "Sababli",
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: AlertCircle,
    },
    0: {
      label: "Kutilmoqda",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: Calendar,
    },
  };

  const { label, color, icon: Icon } = config[status] || config[0];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );
};

/* =====================================================
   ROW COMPONENT
===================================================== */
const AttendanceRow = ({ item, index, onChange }) => {
  const [status, setStatus] = useState(item.isPresent ?? 0);
  const [comment, setComment] = useState(item.comment || "");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const canEdit =
    isLessonStarted(
      item.scheduleList?.lessonDate,
      item.scheduleList?.start_time
    ) && item.isPresent === 0;

  useEffect(() => {
    if (
      canEdit &&
      (status !== item.isPresent || comment !== (item.comment || "") || file)
    ) {
      onChange(item.id, { isPresent: status, comment, file });
    }
    // eslint-disable-next-line
  }, [status, comment, file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const fullName =
    item.student?.fullName ||
    `${item.student?.lastName || ""} ${item.student?.firstName || ""}`.trim();

  return (
    <tr
      className={`border-b transition-colors ${
        !canEdit ? "bg-gray-50" : "hover:bg-gray-50"
      }`}
    >
      <td className="px-4 py-4 text-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
          {index + 1}
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <User size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">
              {item.student?.phoneNumber || ""}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        {canEdit ? (
          <select
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={0}>Tanlang</option>
            <option value={1}>Bor</option>
            <option value={2}>Yo'q</option>
            <option value={3}>Sababli</option>
          </select>
        ) : (
          <StatusBadge status={item.isPresent} />
        )}
      </td>

      <td className="px-4 py-4">
        {canEdit ? (
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Izoh qoldiring..."
            maxLength={100}
          />
        ) : (
          <p className="text-sm text-gray-600">{comment || "—"}</p>
        )}
      </td>

      <td className="px-4 py-4">
        {canEdit && status === 3 ? (
          <div>
            <label className="group relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2 transition-colors hover:border-blue-500 hover:bg-blue-50">
              <input
                type="file"
                onChange={handleFileChange}
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
            {fileName && (
              <p className="mt-1 truncate text-xs text-gray-500">{fileName}</p>
            )}
          </div>
        ) : item.attachmentId ? (
          <a
            href={`${baseUrl}/api/v1/file/download/${item.attachmentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            <Upload size={14} />
            Yuklab olish
          </a>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
    </tr>
  );
};

/* =====================================================
   MOBILE ROW COMPONENT
===================================================== */
const MobileAttendanceRow = ({ item, index, onChange }) => {
  const [status, setStatus] = useState(item.isPresent ?? 0);
  const [comment, setComment] = useState(item.comment || "");
  const [file, setFile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const canEdit =
    isLessonStarted(
      item.scheduleList?.lessonDate,
      item.scheduleList?.start_time
    ) && item.isPresent === 0;

  useEffect(() => {
    if (
      canEdit &&
      (status !== item.isPresent || comment !== (item.comment || "") || file)
    ) {
      onChange(item.id, { isPresent: status, comment, file });
    }
    // eslint-disable-next-line
  }, [status, comment, file]);

  const fullName =
    item.student?.fullName ||
    `${item.student?.lastName || ""} ${item.student?.firstName || ""}`.trim();

  return (
    <div
      className={`rounded-lg border ${
        !canEdit ? "bg-gray-50" : "bg-white"
      } p-4 shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <span className="text-sm font-medium text-blue-600">
              {index + 1}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{fullName}</h3>
            <div className="mt-1">
              <StatusBadge status={canEdit ? status : item.isPresent} />
            </div>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            {isExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        )}
      </div>

      {isExpanded && canEdit && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Holati
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm"
            >
              <option value={0}>Tanlang</option>
              <option value={1}>Bor</option>
              <option value={2}>Yo'q</option>
              <option value={3}>Sababli</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Izoh
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Izoh qoldiring..."
              rows={2}
              maxLength={100}
            />
          </div>

          {status === 3 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sabab fayli
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 hover:bg-gray-100">
                <Upload size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Fayl tanlash</span>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {!canEdit && comment && (
        <p className="mt-3 border-t pt-3 text-sm text-gray-600">
          <span className="font-medium">Izoh:</span> {comment}
        </p>
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
  const [admin, setAdmin] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);


  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {

     fetchAdmin();
  }, []);



  const fetchAdmin = async () => {
    try {
      const res = await ApiCall("/api/v1/auth/decode", "GET");
      setAdmin(res.data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    if (!id) {
      navigate(-1);
      return;
    }
    loadAttendance();
    // eslint-disable-next-line
  }, [id]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/attendance-offline/offline/${id}`,
        "GET"
      );
      setAttendanceList(res.data || []);
    } catch {
      toast.error("Davomatni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const onRowChange = (attendanceId, data) => {
    setEditedMap((prev) => ({ ...prev, [attendanceId]: data }));
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
    const entries = Object.entries(editedMap);
    if (entries.length === 0) {
      toast.info("O'zgartirishlar mavjud emas");
      return;
    }

    try {
      setLoading(true);

      for (const [attendanceId, data] of entries) {
        let attachmentId = null;

        if (data.isPresent === 3 && data.file) {
          attachmentId = await uploadFile(data.file);
        }

        await ApiCall(`/api/v1/attendance-offline/${attendanceId}`, "PUT", {
          isPresent: data.isPresent,
          comment: data.comment || null,
          attachmentId,

          userId: admin?.id || null,
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

  const visibleAttendance = attendanceList.filter(
    (item) => item.student?.isOnline
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Davomat yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
                📊 Talabalar davomati
              </h1>
              <p className="mt-2 text-gray-600">
                {visibleAttendance.length} ta talaba
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
              >
                <ArrowLeft size={20} />
                Orqaga
              </button>

              <button
                onClick={saveAll}
                disabled={Object.keys(editedMap).length === 0}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-colors ${
                  Object.keys(editedMap).length === 0
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95"
                }`}
              >
                <Save size={20} />
                Saqlash ({Object.keys(editedMap).length})
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white shadow-lg">
          {isMobile ? (
            /* Mobile View */
            <div className="space-y-4 p-4">
              {visibleAttendance.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-500">Davomat ro'yxati bo'sh</p>
                </div>
              ) : (
                visibleAttendance.map((item, index) => (
                  <MobileAttendanceRow
                    key={item.id}
                    item={item}
                    index={index}
                    onChange={onRowChange}
                  />
                ))
              )}
            </div>
          ) : (
            /* Desktop View */
            <div className="overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        №
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Talaba
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Holati
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Izoh
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Fayl
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {visibleAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-gray-500">
                            Davomat ro'yxati bo'sh
                          </p>
                        </td>
                      </tr>
                    ) : (
                      visibleAttendance.map((item, index) => (
                        <AttendanceRow
                          key={item.id}
                          item={item}
                          index={index}
                          onChange={onRowChange}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          {visibleAttendance.length > 0 && !isMobile && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {Object.keys(editedMap).length} ta o'zgartirish kiritilgan
                </p>
                <button
                  onClick={saveAll}
                  disabled={Object.keys(editedMap).length === 0}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-colors ${
                    Object.keys(editedMap).length === 0
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  <Save size={18} />
                  Hammasini saqlash
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
