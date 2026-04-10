import React, { useEffect, useMemo, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import Select from "react-select";
import { uploadAttachment } from "./attachmentUpload";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  Loader2,
  Filter,
  X,
  Upload,
  Image as ImageIcon,
  BookOpen,
  Users,
  User,
  Building,
  Clock,
  FileText,
  Plus,
  Trash2,
  ChevronLeft,
  CheckCircle,
  RefreshCw,
  Save,
  FileSpreadsheet,
  CalendarDays,
} from "lucide-react";

const MAX_IMAGES = 5;
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

const Attendance = () => {
  const [loading, setLoading] = useState(true);
  const [scheduleList, setScheduleList] = useState([]);

  const [groupFilter, setGroupFilter] = useState(null);
  const [pairFilter, setPairFilter] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);

  // OLD images from backend (Attachment[])
  const [existingImages, setExistingImages] = useState([]);

  // NEW files selected by user
  const [newFiles, setNewFiles] = useState([]);

  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const [reportLoading, setReportLoading] = useState(false);
  const [reportFromDate, setReportFromDate] = useState("");
  const [reportToDate, setReportToDate] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const savedDate = localStorage.getItem("scheduleSelectedDate");
    return savedDate || new Date().toISOString().slice(0, 10);
  });

  /* ===============================
     HANDLE DATE CHANGE WITH LOCALSTORAGE
  =============================== */
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    localStorage.setItem("scheduleSelectedDate", newDate);
  };

  const setToToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setSelectedDate(today);
    localStorage.setItem("scheduleSelectedDate", today);
  };

  /* ===============================
     LOAD DATA
  =============================== */
  const loadSchedules = async (date) => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/schedule-list-controller/admin/get-all/${date}`,
        "GET"
      );
      setScheduleList(res?.data || []);
    } catch {
      toast.error("Ma'lumotlarni yuklashda xatolik ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules(selectedDate);
  }, [selectedDate]);

  /* ===============================
     FILTER OPTIONS
  =============================== */
  const groupOptions = useMemo(() => {
    return [
      ...new Set(scheduleList.map((i) => i.groups?.name).filter(Boolean)),
    ].map((g) => ({ label: g, value: g }));
  }, [scheduleList]);

  const pairOptions = useMemo(() => {
    return [
      ...new Set(scheduleList.map((i) => i.lessonPairName).filter(Boolean)),
    ].map((p) => ({ label: p, value: p }));
  }, [scheduleList]);

  const filteredList = useMemo(() => {
    return scheduleList.filter((item) => {
      const byGroup = !groupFilter || item.groups?.name === groupFilter.value;
      const byPair = !pairFilter || item.lessonPairName === pairFilter.value;
      return byGroup && byPair;
    });
  }, [scheduleList, groupFilter, pairFilter]);

  /* ===============================
     FILE SELECT
  =============================== */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error("❌ Faqat rasm (PNG, JPG) mumkin!");
        return;
      }
    }

    if (existingImages.length + newFiles.length + files.length > MAX_IMAGES) {
      toast.error(`❌ Maksimum ${MAX_IMAGES} ta rasm!`);
      return;
    }

    setNewFiles((prev) => [...prev, ...files]);
  };

  const removeNewFile = (index) =>
    setNewFiles(newFiles.filter((_, i) => i !== index));

  const removeExistingImage = (index) =>
    setExistingImages(existingImages.filter((_, i) => i !== index));

  /* ===============================
     SAVE
  =============================== */
  const saveImages = async () => {
    try {
      setUploading(true);

      const uploadedIds = [];

      // Upload ONLY new files
      for (const file of newFiles) {
        const id = await uploadAttachment(file, "/sekretar-images");
        uploadedIds.push(id);
      }

      await ApiCall("/api/v1/schedule-list-controller/images", "PUT", {
        scheduleListId: currentSchedule.id,
        img1Id: uploadedIds[0] || null,
        img2Id: uploadedIds[1] || null,
        img3Id: uploadedIds[2] || null,
        img4Id: uploadedIds[3] || null,
        img5Id: uploadedIds[4] || null,
        sekretarDescription: description,
      });

      toast.success("✅ Rasmlar muvaffaqiyatli saqlandi!");
      setOpenModal(false);
      setNewFiles([]);
      loadSchedules(selectedDate);
    } catch {
      toast.error("❌ Rasm yuklashda xatolik!");
    } finally {
      setUploading(false);
    }
  };

  /* ===============================
     FORMAT DATE
  =============================== */
  const formatDate = () => {
    const date = new Date();
    const months = [
      "yan",
      "fev",
      "mar",
      "apr",
      "may",
      "iyn",
      "iyl",
      "avg",
      "sen",
      "okt",
      "noy",
      "dek",
    ];
    const weekdays = ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

    return `${weekdays[date.getDay()]}, ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  /* ===============================
     SKELETON LOADER
  =============================== */
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-6 w-24 rounded-lg bg-gray-200"></div>
        <div className="h-6 w-16 rounded-lg bg-gray-200"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
        <div className="h-4 w-2/3 rounded bg-gray-200"></div>
      </div>
    </div>
  );

  /* ===============================
     LOADING
  =============================== */
  if (loading && scheduleList.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-600">Dars jadvali yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  /* ===============================
     RESET FILTERS
  =============================== */
  const resetFilters = () => {
    setGroupFilter(null);
    setPairFilter(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                📅 Kunlik dars jadvali
              </h1>
              <p className="mt-2 text-blue-100">{formatDate(selectedDate)}</p>
            </div>

            {/* DATE PICKER WITH TODAY BUTTON */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={setToToday}
                className="flex items-center justify-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/30"
              >
                <Calendar size={16} />
                Bugun
              </button>
              <div className="flex items-center gap-3 rounded-lg bg-white/10 p-2 backdrop-blur-sm">
                <CalendarDays size={20} className="text-blue-200" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="rounded bg-white/10 px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtrlar</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* GROUP FILTER */}
            <Select
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
              placeholder="👥 Guruhni tanlang"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "2px",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />

            {/* PAIR FILTER */}
            <Select
              value={pairFilter}
              onChange={setPairFilter}
              options={pairOptions}
              placeholder="⏱ Juftlikni tanlang"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  padding: "2px",
                  borderColor: "#d1d5db",
                  "&:hover": { borderColor: "#3b82f6" },
                }),
              }}
            />

            {/* FILTER ACTIONS */}
            <div className="flex gap-3">
              {(groupFilter || pairFilter) && (
                <button
                  onClick={resetFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw size={16} />
                  Filtrlarni tozalash
                </button>
              )}
              <button
                onClick={() => loadSchedules(selectedDate)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                <RefreshCw size={16} />
                Yangilash
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading && scheduleList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <ImageIcon className="text-blue-600" size={32} />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-800">
              Dars topilmadi
            </h3>
            <p className="text-gray-600">
              {scheduleList.length === 0
                ? "Dars jadvali mavjud emas."
                : "Tanlangan filtrlar bo'yicha dars topilmadi."}
            </p>
            {(groupFilter || pairFilter) && (
              <button
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Filtrlarni tozalash
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* CARD HEADER */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5">
                    <Clock size={14} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-700">
                      {item.lessonPairName}
                    </span>
                  </div>

                  {/* IMAGE COUNTER */}
                  <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium">
                    <ImageIcon size={14} className="text-gray-600" />
                    <span className="text-gray-700">
                      {item.attachment?.length || 0} / {MAX_IMAGES}
                    </span>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="line-clamp-2 font-semibold text-gray-900">
                        {item.subject?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.subject?.type}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.groups?.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.employeeName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {item.auditoriumName}
                      </span>
                    </div>
                  </div>

                  {/* TIME SECTION */}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        🕒 {item.start_time}
                      </span>
                      <span className="text-sm text-gray-500">dan</span>
                      <span className="text-sm font-medium text-gray-700">
                        {item.end_time} gacha
                      </span>
                    </div>
                  </div>

                  {/* UPLOAD BUTTON */}
                  <button
                    onClick={() => {
                      setCurrentSchedule(item);
                      setExistingImages(item.attachment || []);
                      setDescription(item.sekretarDescription || "");
                      setNewFiles([]);
                      setOpenModal(true);
                    }}
                    className="mt-3 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-medium text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Upload size={18} />
                      Rasm yuklash
                    </div>
                  </button>
                </div>

                {/* HOVER EFFECTS */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 transition-all duration-300 group-hover:from-blue-50/50 group-hover:to-indigo-50/50" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
          {/* BACKDROP */}
          <div
            className="bg-black/90 fixed inset-0 backdrop-blur-sm transition-opacity"
            onClick={() => setOpenModal(false)}
          />

          {/* MODAL CONTENT */}
          <div className="relative min-h-screen">
            {/* HEADER */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 shadow-xl backdrop-blur-md">
              <div className="mx-auto flex max-w-7xl items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setOpenModal(false)}
                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      <Upload className="mr-2 inline" size={20} />
                      Rasm yuklash
                    </h2>
                    <p className="mt-1 text-sm text-gray-300">
                      {currentSchedule?.subject?.name} •{" "}
                      {currentSchedule?.groups?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                    <span className="font-medium">
                      {existingImages.length + newFiles.length}
                    </span>
                    <span className="text-gray-300"> / {MAX_IMAGES} ta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
              {/* SCHEDULE INFO */}
              <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold ">
                      📚 Dars ma'lumotlari
                    </h3>
                    <div className="space-y-1 ">
                      <p>
                        <strong>Fan:</strong> {currentSchedule?.subject?.name}
                      </p>
                      <p>
                        <strong>Guruh:</strong> {currentSchedule?.groups?.name}
                      </p>
                      <p>
                        <strong>O'qituvchi:</strong>{" "}
                        {currentSchedule?.employeeName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold ">
                      🕒 Vaqt va joy
                    </h3>
                    <div className="space-y-1 ">
                      <p>
                        <strong>Vaqti:</strong> {currentSchedule?.start_time} -{" "}
                        {currentSchedule?.end_time}
                      </p>
                      <p>
                        <strong>Auditoriya:</strong>{" "}
                        {currentSchedule?.auditoriumName}
                      </p>
                      <p>
                        <strong>Juftlik:</strong>{" "}
                        {currentSchedule?.lessonPairName}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-lg font-semibold ">
                      <FileText className="mr-2 inline" size={20} />
                      Izoh
                    </h3>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-lg border-2 bg-white/5  p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Izoh yozing..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <h3 className="mb-4 text-lg font-semibold ">
                  <ImageIcon className="mr-2 inline" size={20} />
                  Rasmlar ({existingImages.length + newFiles.length}/5)
                </h3>

                {/* FILE UPLOAD */}
                <label className="group mb-6 block">
                  <div className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed  border-blue-500 bg-white/5 p-8 transition-all hover:bg-white/10">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                      <Upload className="text-blue-400" size={28} />
                    </div>
                    <p className="mb-2 text-lg font-medium ">
                      Rasmlarni tanlang
                    </p>
                    <p className="text-center text-sm text-gray-400">
                      PNG yoki JPG formatida, maksimum {MAX_IMAGES} ta rasm
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={
                        existingImages.length + newFiles.length >= MAX_IMAGES
                      }
                    />
                  </div>
                </label>

                {/* IMAGE PREVIEW */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {/* EXISTING IMAGES */}
                  {existingImages.map((img, i) => (
                    <div
                      key={`old-${i}`}
                      className="group relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={baseUrl + "/api/v1/file/getFile/" + img.id}
                        alt={`Uploaded ${i + 1}`}
                        className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-2 right-2 rounded-full bg-red-600/90 p-1.5  opacity-0 transition-all group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="from-black/80 to-transparent absolute bottom-0 left-0 right-0 bg-gradient-to-t p-2">
                        <p className="truncate text-xs ">
                          {img.fileName || `Rasm ${i + 1}`}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* NEW FILES */}
                  {newFiles.map((file, i) => (
                    <div
                      key={`new-${i}`}
                      className="group relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${i + 1}`}
                        className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        onClick={() => removeNewFile(i)}
                        className="absolute top-2 right-2 rounded-full bg-red-600/90 p-1.5  opacity-0 transition-all group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="from-black/80 to-transparent absolute bottom-0 left-0 right-0 bg-gradient-to-t p-2">
                        <p className="truncate text-xs ">{file.name}</p>
                      </div>
                    </div>
                  ))}

                  {/* ADD MORE PLACEHOLDER */}
                  {existingImages.length + newFiles.length < MAX_IMAGES && (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-4 transition-colors hover:border-blue-500 hover:bg-white/10">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                        <Plus className="" size={24} />
                      </div>
                      <span className="text-sm ">Qo'shish</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setOpenModal(false)}
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={saveImages}
                  disabled={
                    uploading ||
                    (existingImages.length === 0 && newFiles.length === 0)
                  }
                  className={`flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-medium text-white ${
                    uploading ||
                    (existingImages.length === 0 && newFiles.length === 0)
                      ? "cursor-not-allowed bg-gray-900"
                      : " hover:to-emerald-700   hover:from-green-900"
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Yuklanmoqda...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Saqlash
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
