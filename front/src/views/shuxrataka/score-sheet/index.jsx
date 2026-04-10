import React, { useEffect, useState, useCallback } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-semestr`,
}));

const QAYDNOMA_OPTIONS = [
  { value: 1, label: "1-qaydnoma" },
  { value: 2, label: "2-qaydnoma" },
  { value: 3, label: "3-qaydnoma" },
];

const LS_KEY = "office_scoresheet_filters";

const defaultFilters = {
  group: null,
  semester: null,
  qaydnoma: null,
  search: "",
};

const loadFiltersFromLS = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...defaultFilters, ...JSON.parse(raw) } : defaultFilters;
  } catch {
    return defaultFilters;
  }
};

const saveFiltersToLS = (f) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(f));
  } catch {}
};

// ─────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
      <div className="animate-fadeIn max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────
const Spinner = ({ size = "medium" }) => {
  const cls = { small: "w-4 h-4", medium: "w-8 h-8", large: "w-12 h-12" }[size];
  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${cls}`}
    />
  );
};

// ─────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────
const emptyForm = {
  group: null,
  subject: null,
  teacher: null,
  teacher2: null,
  startTime: "",
  endTime: "",
  description: "",
  qaydnoma: null,
  isKursIshi: false,
};

// ─────────────────────────────────────────
// MAIN COMPONENT  (office roli)
// ─────────────────────────────────────────
const ScoreSheetOffice = () => {
  const navigate = useNavigate();
  const now = new Date().toISOString().slice(0, 16);

  // ── Data ──────────────────────────────
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // ── UI ────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Modals ────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // ── Form ──────────────────────────────
  const [form, setForm] = useState(emptyForm);
  const setFormField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // ── Filters ───────────────────────────
  const [tempFilters, setTempFilters] = useState(loadFiltersFromLS);
  const [activeFilters, setActiveFilters] = useState(loadFiltersFromLS);
  const setTempField = (key, val) =>
    setTempFilters((p) => ({ ...p, [key]: val }));

  // ─────────────────────────────────────────
  // CLIENT-SIDE: umumiy search + qaydnoma
  // ─────────────────────────────────────────
  const filteredSheets = sheets.filter((item) => {
    const { search, qaydnoma } = activeFilters;

    if (search) {
      const q = search.toLowerCase();
      const inSubject = item.curriculumSubject?.subject?.name
        ?.toLowerCase()
        .includes(q);
      const inTeacher = item.teacher?.name?.toLowerCase().includes(q);
      const inLecturer = item.lecturer?.name?.toLowerCase().includes(q);
      if (!inSubject && !inTeacher && !inLecturer) return false;
    }

    if (
      qaydnoma &&
      parseInt(item.qaytnoma?.replace(/\D/g, "")) !== qaydnoma.value
    )
      return false;

    return true;
  });

  // ─────────────────────────────────────────
  // FETCH: server filter (guruh + semestr)
  // ─────────────────────────────────────────
  const fetchFilteredSheets = useCallback(
    async (filters) => {
      const { semester, group } = filters ?? activeFilters;
      if (!group || !semester) return;

      const semesterCode = String(Number(semester.value) + 10);
      const groupId = group.value;

      try {
        setLoading(true);
        const res = await ApiCall(
          `/api/v1/score-sheet-group/filter?semesterCode=${semesterCode}&groupId=${groupId}`,
          "GET"
        );
        setSheets(res.data ?? []);
        setHasSearched(true);
      } catch {
        toast.error("Filterlashda xatolik!");
        setSheets([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [activeFilters]
  );

  // ─────────────────────────────────────────
  // FETCH: Fanlar
  // ─────────────────────────────────────────
  const fetchSubjects = async (curriculumId) => {
    if (!curriculumId) {
      setSubjects([]);
      return;
    }
    try {
      const res = await ApiCall(
        `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}`,
        "GET"
      );
      const content = res?.data?.content ?? [];
      setSubjects(
        content
          .slice()
          .sort((a, b) => {
            const n = (v) => parseInt(v?.toString().replace(/\D/g, "") || "0");
            return n(a.subject?.semesterName) - n(b.subject?.semesterName);
          })
          .map((item) => ({
            value: item.subject?.id,
            label: `${item.subject?.semesterName || "-"} - ${
              item.subject?.subject?.name || "Noma'lum fan"
            }`,
          }))
      );
    } catch {
      toast.error("Fanlarni yuklashda xatolik!");
    }
  };

  // ─────────────────────────────────────────
  // INITIAL LOAD
  // ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [groupRes, teacherRes] = await Promise.all([
          ApiCall("/api/v1/groups", "GET"),
          ApiCall("/api/v1/teacher", "GET"),
        ]);

        const mappedGroups = groupRes.data.map((g) => ({
          value: g.id,
          label: g.name,
          curriculumId: g.curriculum ?? null,
        }));
        const mappedTeachers = teacherRes.data.map((t) => ({
          value: t.id,
          label: t.name,
        }));

        setGroups(mappedGroups);
        setTeachers(mappedTeachers);

        const saved = loadFiltersFromLS();
        if (saved.group && saved.semester) {
          const found = mappedGroups.find((x) => x.value === saved.group.value);
          const restoredFilters = { ...saved, group: found || null };
          setTempFilters(restoredFilters);
          setActiveFilters(restoredFilters);
          await fetchFilteredSheets(restoredFilters);
        } else {
          setSheets([]);
          setHasSearched(false);
        }
      } catch {
        toast.error("Ma'lumotlarni yuklab bo'lmadi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────
  // FILTER ACTIONS
  // ─────────────────────────────────────────
  const applyFilters = () => {
    if (!tempFilters.group || !tempFilters.semester) {
      toast.warning("⚠️ Guruh va semestrni tanlang!");
      return;
    }
    setActiveFilters(tempFilters);
    saveFiltersToLS(tempFilters);
    fetchFilteredSheets(tempFilters);
  };

  const clearFilters = () => {
    setTempFilters(defaultFilters);
    setActiveFilters(defaultFilters);
    setSheets([]);
    setHasSearched(false);
    localStorage.removeItem(LS_KEY);
  };

  // ─────────────────────────────────────────
  // FORM HELPERS
  // ─────────────────────────────────────────
  const clearForm = () => setForm(emptyForm);

  const handleGroupChange = (item) => {
    setFormField("group", item);
    setFormField("subject", null);
    if (item?.curriculumId) fetchSubjects(item.curriculumId);
  };

  // ─────────────────────────────────────────
  // CRUD
  // ─────────────────────────────────────────
  const buildPayload = () => ({
    groupId: form.group?.value,
    curriculumSubjectId: form.subject?.value,
    teacherId: form.teacher?.value,
    lecturerId: form.teacher2?.value ?? null,
    startTime: form.startTime,
    endTime: form.endTime,
    description: form.description,
    qaytnoma: form.qaydnoma?.value,
    isKursIshi: form.isKursIshi,
  });

  const handleCreate = async () => {
    if (!form.group || !form.subject || !form.teacher) {
      toast.error("Barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    try {
      setActionLoading(true);
      await ApiCall("/api/v1/score-sheet-group", "POST", buildPayload());
      toast.success("✅ Muvaffaqiyatli yaratildi!");
      setCreateOpen(false);
      clearForm();
      fetchFilteredSheets(activeFilters);
    } catch {
      toast.error("❌ Yaratishda xatolik!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setActionLoading(true);
      await ApiCall(`/api/v1/score-sheet-group/${editItem.id}`, "PUT", {
        ...buildPayload(),
        qaytnoma:
          form.qaydnoma?.value ??
          parseInt(editItem.qaytnoma?.replace(/\D/g, ""), 10),
      });
      toast.success("✅ Muvaffaqiyatli yangilandi!");
      setEditOpen(false);
      clearForm();
      fetchFilteredSheets(activeFilters);
    } catch {
      toast.error("❌ O'zgartirishda xatolik!");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await ApiCall(`/api/v1/score-sheet-group/${deleteId}`, "DELETE");
      toast.success("✅ O'chirildi!");
      setDeleteOpen(false);
      fetchFilteredSheets(activeFilters);
    } catch {
      toast.error("❌ O'chirishda xatolik!");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    try {
      await ApiCall(
        `/api/v1/score-sheet-group/change-status/${pendingStatusId}`,
        "PUT"
      );
      toast.success("Status yangilandi!");
      fetchFilteredSheets(activeFilters);
    } catch {
      toast.error("Statusni o'zgartirishda xatolik!");
    } finally {
      setStatusOpen(false);
      setPendingStatusId(null);
    }
  };

  // ─────────────────────────────────────────
  // FILE: faqat yuklab olish (office yuklayolmaydi)
  // ─────────────────────────────────────────
  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("📥 Fayl yuklab olindi");
    } catch {
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  // ─────────────────────────────────────────
  // REPORTS
  // ─────────────────────────────────────────
  const fetchScoreStatistikStudent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/v1/score-sheet/excel`);
      if (!res.ok) {
        toast.error("Xatolik: Excel olib bo'lmadi!");
        return;
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "score_sheet.xlsx";
      link.click();
      toast.success("📥 Score Sheet Excel yuklandi!");
    } catch {
      toast.error("Score Sheetlarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const fetchScoreStatistik = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/score-sheet/get-all", "GET");
      const data = res.data;

      const grouped = {};
      data.forEach((item) => {
        const key = `${item.scoreSheetGroup?.id}_${item.scoreSheetGroup?.curriculumSubject?.subject?.id}`;
        if (!grouped[key]) {
          grouped[key] = {
            groupName: item.scoreSheetGroup?.group?.name,
            subjectName: item.scoreSheetGroup?.curriculumSubject?.subject?.name,
            teacher: item.scoreSheetGroup?.teacher?.name,
            lecturer: item.scoreSheetGroup?.lecturer?.name,
            endTime: item.scoreSheetGroup?.endTime,
            totalStudents: 0,
            passed: 0,
            failed: 0,
            none: 0,
            mustaqilCount: 0,
            oraliqCount: 0,
            acceptedCount: 0,
          };
        }
        const g = grouped[key];
        g.totalStudents++;
        if (item.isPassed === true) g.passed++;
        else if (item.isPassed === false) g.failed++;
        else g.none++;
        if (item.mustaqil) g.mustaqilCount++;
        if (item.oraliq) g.oraliqCount++;
        if (item.isAccepted) g.acceptedCount++;
      });

      const argb = (type, val, total) => {
        if (type === "none") {
          if (val === 0) return "FF00FF00";
          if (val === total) return "FFFF3300";
          return "FFFFFF00";
        }
        if (val === total) return "FF00FF00";
        if (val === 0) return "FFFF3300";
        return "FFFFFF00";
      };

      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet("Statistika");
      const d = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

      ws.addRow([`Yuklab olingan vaqt: ${dateStr}`]);
      ws.addRow([`Mas'ul xodim: Jumayev Diyorbek  (+998 91 418 44 15)`]);
      ws.addRow([""]);
      ws.getRow(1).eachCell((c) => {
        c.font = { bold: true, size: 14 };
      });
      ws.getRow(2).eachCell((c) => {
        c.font = { bold: true, size: 13 };
      });

      const hRow = ws.addRow([
        "№",
        "Guruh",
        "Fan nomi",
        "Seminarchi",
        "Ma'ruzachi",
        "Jami talabalar",
        "O'tdi",
        "O'tmadi",
        "Belgilanmadi",
        "Mustaqil olganlar soni",
        "Oraliq olganlar soni",
        "Tanishgan talabalar soni",
        "Tugash vaqti",
      ]);
      hRow.eachCell((c) => {
        c.font = { bold: true };
        c.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
        c.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      ws.views = [{ state: "frozen", ySplit: 4 }];

      let counter = 1;
      Object.values(grouped).forEach((g) => {
        const pf = g.passed + g.failed;
        const eligible = g.totalStudents - g.failed;
        const pfColor = argb("pf", pf, g.totalStudents);
        const noneColor = argb("none", g.none, g.totalStudents);
        const mustColor = argb("must", g.mustaqilCount, eligible);
        const oraColor = argb("ora", g.oraliqCount, eligible);
        const accColor = argb("acc", g.acceptedCount, eligible);

        const colColors = [
          null,
          null,
          null,
          null,
          null,
          null,
          pfColor,
          pfColor,
          noneColor,
          mustColor,
          oraColor,
          accColor,
          null,
        ];
        const hasRed = colColors.some((c) => c === "FFFF3300");
        const allGreen = colColors
          .filter(Boolean)
          .every((c) => c === "FF00FF00");
        const rowBg = hasRed ? "FFFF3300" : allGreen ? "FF00FF00" : "FFFFFF00";

        let endTimeStr = "-";
        if (g.endTime) {
          const ed = new Date(g.endTime);
          endTimeStr = `${ed.getFullYear()}-${pad(ed.getMonth() + 1)}-${pad(
            ed.getDate()
          )} ${pad(ed.getHours())}:${pad(ed.getMinutes())}`;
        }

        const row = ws.addRow([
          counter++,
          g.groupName,
          g.subjectName,
          g.teacher,
          g.lecturer,
          g.totalStudents,
          g.passed,
          g.failed,
          g.none,
          g.mustaqilCount,
          g.oraliqCount,
          g.acceptedCount,
          endTimeStr,
        ]);
        row.eachCell((cell, i) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: colColors[i - 1] || rowBg },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      ws.columns.forEach((col) => (col.width = 22));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Hisobot-Qaydnoma.xlsx");
      toast.success("Statistika muvaffaqiyatli yuklandi!");
    } catch (e) {
      console.error(e);
      toast.error("Xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // OPEN EDIT MODAL
  // ─────────────────────────────────────────
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      group: {
        value: item.group.id,
        label: item.group.name,
        curriculumId: item.group.curriculum,
      },
      subject: {
        value: item.curriculumSubject.id,
        label: `${item.curriculumSubject.semesterName} - ${item.curriculumSubject.subject.name}`,
      },
      teacher: { value: item.teacher.id, label: item.teacher.name },
      teacher2: item.lecturer
        ? { value: item.lecturer.id, label: item.lecturer.name }
        : null,
      startTime: item.startTime?.substring(0, 16) || "",
      endTime: item.endTime?.substring(0, 16) || "",
      description: item.description || "",
      qaydnoma: {
        value: parseInt(item.qaytnoma?.replace(/\D/g, "")),
        label: item.qaytnoma,
      },
      isKursIshi: item.isKursIshi ?? false,
    });
    fetchSubjects(item.group.curriculum);
    setEditOpen(true);
  };

  // ─────────────────────────────────────────
  // SHARED FORM FIELDS
  // ─────────────────────────────────────────
  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Guruh
        </label>
        <Select
          options={groups}
          value={form.group}
          onChange={handleGroupChange}
          placeholder="Guruh tanlang..."
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Fan
        </label>
        <Select
          options={subjects}
          value={form.subject}
          onChange={(v) => setFormField("subject", v)}
          placeholder="Fan tanlang..."
          isDisabled={!form.group}
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Seminarchi
        </label>
        <Select
          options={teachers}
          value={form.teacher}
          onChange={(v) => setFormField("teacher", v)}
          placeholder="Seminarchi tanlang..."
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Ma'ruzachi
        </label>
        <Select
          options={teachers}
          value={form.teacher2}
          onChange={(v) => setFormField("teacher2", v)}
          placeholder="Ma'ruzachi tanlang..."
          classNamePrefix="react-select"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Boshlanish Vaqti
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.startTime}
            min={now}
            onChange={(e) => setFormField("startTime", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tugash Vaqti
          </label>
          <input
            type="datetime-local"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={form.endTime}
            min={form.startTime || now}
            onChange={(e) => setFormField("endTime", e.target.value)}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isKursIshi}
          onChange={(e) => setFormField("isKursIshi", e.target.checked)}
          className="h-5 w-5"
        />
        <label className="text-sm font-medium text-gray-700">Kurs ishi</label>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Qaydnoma turi
        </label>
        <Select
          options={QAYDNOMA_OPTIONS}
          value={form.qaydnoma}
          onChange={(v) => setFormField("qaydnoma", v)}
          placeholder="Qaydnoma tanlang..."
          classNamePrefix="react-select"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Izoh
        </label>
        <textarea
          className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          rows={3}
          value={form.description}
          onChange={(e) => setFormField("description", e.target.value)}
          placeholder="Qo'shimcha izoh..."
        />
      </div>
    </div>
  );

  // ─────────────────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-t-transparent mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-600" />
          <p className="text-lg text-gray-600">Ma'lumotlar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="mx-auto max-w-7xl">
        {/* ── Header ── */}
        <div className="mb-8 flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <div className="mb-4 sm:mb-0">
            <h1 className="mb-1 text-3xl font-bold text-gray-800">
              Baholash Jadvalari
            </h1>
            <p className="text-gray-600">
              Barcha guruhlar va fanlar bo'yicha baholash jadvallari
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchScoreStatistik}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              O'qituvchilar hisoboti
            </button>
            <button
              onClick={fetchScoreStatistikStudent}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              Talaba hisoboti
            </button>
            <button
              onClick={() => {
                clearForm();
                setCreateOpen(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
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
              Yangi Jadval
            </button>
          </div>
        </div>

        {/* ── Jami ── */}
        {hasSearched && (
          <div className="mb-4 flex justify-end">
            <p className="text-xl font-semibold text-gray-600">
              Jami:{" "}
              <span className="text-blue-600">{filteredSheets.length}</span> ta
            </p>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {/* Guruh — majburiy */}
            <Select
              options={groups}
              value={tempFilters.group}
              onChange={(v) => setTempField("group", v)}
              placeholder="Guruh *"
              isSearchable
              classNamePrefix="react-select"
            />

            {/* Semestr — majburiy */}
            <Select
              options={SEMESTER_OPTIONS}
              value={tempFilters.semester}
              onChange={(v) => setTempField("semester", v)}
              placeholder="Semestr *"
              classNamePrefix="react-select"
            />

            {/* Qaydnoma */}
            <Select
              options={QAYDNOMA_OPTIONS}
              value={tempFilters.qaydnoma}
              onChange={(v) => setTempField("qaydnoma", v)}
              placeholder="Qaydnoma..."
              isClearable
              classNamePrefix="react-select"
            />

            {/* Umumiy qidiruv */}
            <div className="relative md:col-span-2">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Fan yoki o'qituvchi nomi..."
                className="w-full rounded-lg border px-3 py-2 pl-9 text-sm focus:border-blue-400 focus:outline-none"
                value={tempFilters.search}
                onChange={(e) => setTempField("search", e.target.value)}
              />
            </div>

            <button
              onClick={applyFilters}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Filtrlash
            </button>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Tozalash
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            * Guruh va semestr majburiy — filtrlash uchun ikkalasini tanlang
          </p>
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Holat 1: Hali qidiruv qilinmagan */}
          {!hasSearched ? (
            <div className="py-16 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
                />
              </svg>
              <p className="mb-1 text-lg font-medium text-gray-400">
                Qidiruv amalga oshirilmagan
              </p>
              <p className="text-sm text-gray-400">
                Guruh va semestrni tanlang, so'ng "Filtrlash" tugmasini bosing
              </p>
            </div>
          ) : filteredSheets.length === 0 ? (
            /* Holat 2: Natija yo'q */
            <div className="py-16 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mb-1 text-lg font-medium text-gray-500">
                Ma'lumot topilmadi
              </p>
              <p className="text-sm text-gray-400">
                Tanlangan guruh va semestr bo'yicha jadval mavjud emas
              </p>
            </div>
          ) : (
            /* Holat 3: Natijalar */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {[
                      "№",
                      "Guruh",
                      "Fan",
                      "Seminarchi",
                      "Ma'ruzachi",
                      "Qaydnoma",
                      "Vaqt Oralig'i",
                      "Amallar",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-gray-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSheets.map((item, index) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          className="text-sm font-semibold text-blue-600 hover:underline"
                          onClick={() =>
                            navigate(`/office/vedims/${item.id}`, {
                              state: {
                                isKursIshi: item.isKursIshi ?? false,
                                subjectName:
                                  item.curriculumSubject?.subject?.name ?? "",
                              },
                            })
                          }
                        >
                          {item.group?.name}
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.curriculumSubject?.subject?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.curriculumSubject?.semesterName}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.teacher?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.lecturer?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.qaytnoma}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-900">
                        Boshlash:{" "}
                        {new Date(item.startTime).toLocaleDateString("uz-UZ")}{" "}
                        <br />
                        Tugatish:{" "}
                        {new Date(item.endTime).toLocaleDateString("uz-UZ")}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-3">
                          {/* Action buttons */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {/* Edit */}
                              <button
                                className="flex items-center gap-1.5 rounded-lg bg-yellow-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-yellow-600"
                                onClick={() => openEdit(item)}
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Tahrirlash
                              </button>
                              {/* Delete */}
                              <button
                                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700"
                                onClick={() => {
                                  setDeleteId(item.id);
                                  setDeleteOpen(true);
                                }}
                              >
                                <svg
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                O'chirish
                              </button>
                            </div>

                            {/* Status toggle */}
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input
                                type="checkbox"
                                checked={item.status}
                                onChange={() => {
                                  setPendingStatusId(item.id);
                                  setStatusOpen(true);
                                }}
                                className="sr-only"
                              />
                              <div
                                className={`h-6 w-11 rounded-full transition-colors ${
                                  item.status ? "bg-blue-500" : "bg-gray-300"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                    item.status ? "translate-x-5" : ""
                                  }`}
                                />
                              </div>
                            </label>
                          </div>

                          {/* Biriktirilgan fayllar — faqat yuklab olish */}
                          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Biriktirilgan fayllar
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.attachments?.length > 0 ? (
                                item.attachments.map((file) => (
                                  <button
                                    key={file.id}
                                    onClick={() =>
                                      handleDownload(
                                        file.id,
                                        file.fileOriginalName
                                      )
                                    }
                                    className="flex max-w-[150px] items-center gap-1.5 rounded border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs text-green-700 transition-all hover:bg-green-100"
                                    title={file.fileOriginalName}
                                  >
                                    <svg
                                      className="h-3.5 w-3.5 flex-shrink-0"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                    <span className="flex-1 truncate">
                                      {file.fileOriginalName}
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-400">
                                  <svg
                                    className="h-3.5 w-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Fayl mavjud emas
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── STATUS MODAL ── */}
      <Modal
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        title="Statusni o'zgartirish"
      >
        <div className="text-center">
          <p className="mb-6 text-gray-700">
            Ushbu jadvalning statusini o'zgartirmoqchimisiz?
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setStatusOpen(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              onClick={confirmStatusChange}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Tasdiqlash
            </button>
          </div>
        </div>
      </Modal>

      {/* ── CREATE MODAL ── */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yangi Baholash Jadvali"
      >
        <FormFields />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setCreateOpen(false)}
            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleCreate}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading && <Spinner size="small" />}
            {actionLoading ? "Yaratilmoqda..." : "Yaratish"}
          </button>
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Jadvalni Tahrirlash"
      >
        <FormFields />
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditOpen(false)}
            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleEdit}
            disabled={actionLoading}
            className="flex items-center gap-2 rounded-lg bg-yellow-600 px-6 py-2 font-medium text-white transition-colors hover:bg-yellow-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {actionLoading && <Spinner size="small" />}
            {actionLoading ? "Yangilanmoqda..." : "Yangilash"}
          </button>
        </div>
      </Modal>

      {/* ── DELETE MODAL ── */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="O'chirishni Tasdiqlash"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="mb-6 text-gray-700">
            Bu jadvalni o'chirishni istaysizmi? Bu amalni ortga qaytarib
            bo'lmaydi.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading && <Spinner size="small" />}
              {actionLoading ? "O'chirilmoqda..." : "Ha, O'chirish"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScoreSheetOffice;
