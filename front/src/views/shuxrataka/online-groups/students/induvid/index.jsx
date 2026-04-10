// src/pages/.../Debts.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall from "../../../../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

export default function Debts() {
  const { studentId } = useParams();
  const id = studentId;
  const [linkId, setLinkId] = useState(null);

  const [student, setStudent] = useState(null);
  const [weekdays, setWeekdays] = useState([]); // [{ id: number, day: string }]
  const [assignments, setAssignments] = useState([]); // OnlineStudentWeekDay[]
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  // 🔽 История активности (attendance)
  const [history, setHistory] = useState([]); // массив записей
  const [historyLoading, setHistoryLoading] = useState(false);

  // 🔽 Фильтры
  const [presenceFilter, setPresenceFilter] = useState("all"); // all | present | absent
  const [subjectFilter, setSubjectFilter] = useState("all"); // 'all' | subjectKey
  const [dayFilter, setDayFilter] = useState("all"); // 'all' | 1..7 (строкой)

  // 🔽 Выбор дней (локально) + модалка подтверждения
  const [selectedDayIds, setSelectedDayIds] = useState(new Set()); // Set<number>
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  // ------- API calls -------
  const fetchStudent = async () => {
    try {
      const res = await ApiCall(`/api/v1/student/byid/${id}`, "GET");
      setStudent(res?.data || null);
      setLinkId(res.data.group.id);
    } catch {
      toast.error("Talaba ma'lumotlarini olishda xatolik!");
      setStudent(null);
    }
  };

  const fetchWeekdays = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/online-student-weekday/weekdays`,
        "GET"
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setWeekdays(list);
    } catch {
      toast.error("Hafta kunlarini olishda xatolik!");
      setWeekdays([]);
    }
  };

  const fetchStudentAssignments = async () => {
    try {
      const res = await ApiCall(
        `/api/v1/online-student-weekday/student/${id}?activeOnly=true`,
        "GET"
      );
      const arr = Array.isArray(res?.data) ? res.data : [];
      setAssignments(arr);
    } catch {
      toast.error("Talabaning onlayn kunlarini olishda xatolik!");
      setAssignments([]);
    }
  };

  // 🔽 Загрузка истории активности
  const fetchAttendanceHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await ApiCall(`/api/v1/attendance/student/${id}`, "GET");
      const list = Array.isArray(res?.data) ? res.data : [];
      setHistory(list);
    } catch {
      toast.error(
        "Talabaning faoliyat tarixi (attendance) ni olishda xatolik!"
      );
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ------- helpers -------
  const assignedByWeekdayId = useMemo(() => {
    const map = new Map();
    for (const rec of assignments) {
      const wId = rec?.weekday?.id ?? rec?.weekdayId;
      if (wId != null) map.set(Number(wId), rec);
    }
    return map;
  }, [assignments]);

  const assignedSet = useMemo(
    () => new Set([...assignedByWeekdayId.keys()]),
    [assignedByWeekdayId]
  );

  // Синхронизируем локальный выбор с реальными назначениями при загрузке/обновлении
  useEffect(() => {
    setSelectedDayIds(new Set(assignedSet));
  }, [assignedSet]);

  const isAssigned = (weekdayId) => assignedByWeekdayId.has(weekdayId);
  const isSelected = (weekdayId) => selectedDayIds.has(weekdayId);

  // Локальный toggle без API
  const toggleSelectedDay = (weekdayId) => {
    setSelectedDayIds((prev) => {
      const next = new Set(prev);
      if (next.has(weekdayId)) next.delete(weekdayId);
      else next.add(weekdayId);
      return next;
    });
  };

  // Применение изменений после подтверждения
  const applySelectedDays = async () => {
    // Вычисляем разницу
    const toAdd = [...selectedDayIds].filter((d) => !assignedSet.has(d));
    const toRemove = [...assignedSet].filter((d) => !selectedDayIds.has(d));

    if (toAdd.length === 0 && toRemove.length === 0) {
      setConfirmOpen(false);
      toast.info("O‘zgarishlar yo‘q.");
      return;
    }

    setApplying(true);
    try {
      const addCalls = toAdd.map((weekdayId) =>
        ApiCall(
          `/api/v1/online-student-weekday/by-student?studentId=${id}&weekdayId=${weekdayId}`,
          "POST"
        )
      );
      const removeCalls = toRemove.map((weekdayId) =>
        ApiCall(
          `/api/v1/online-student-weekday/by-student?studentId=${id}&weekdayId=${weekdayId}`,
          "DELETE"
        )
      );

      const results = await Promise.allSettled([...addCalls, ...removeCalls]);

      const ok = results.filter((r) => r.status === "fulfilled").length;
      const fail = results.length - ok;

      if (ok > 0) toast.success(`Saqlash: ${ok} ta amal bajarildi ✅`);
      if (fail > 0) toast.error(`Xato: ${fail} ta amal bajarilmadi ❌`);

      // Перечитаем назначения c бэка, затем локально синхронизируемся через эффект
      await fetchStudentAssignments();
    } catch {
      toast.error("Saqlashda server xatosi ❌");
    } finally {
      setApplying(false);
      setConfirmOpen(false);
    }
  };

  // Утилита форматирования даты/времени
  const formatDateTime = (raw) => {
    if (!raw) return "-";
    const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleString("uz-UZ");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      await Promise.all([
        fetchStudent(),
        fetchWeekdays(),
        fetchStudentAssignments(),
        fetchAttendanceHistory(),
      ]);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Dushanba..Yakshanba — fallback на случай, если API weekdays пуст
  const fallbackDays = {
    1: "Dushanba",
    2: "Seshanba",
    3: "Chorshanba",
    4: "Payshanba",
    5: "Juma",
    6: "Shanba",
    7: "Yakshanba",
  };

  // Всегда рендерим Пн→Вс если id 1..7
  const orderedWeekdays = useMemo(() => {
    const order = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7 };
    return [...weekdays].sort(
      (a, b) => (order[a.id] || 99) - (order[b.id] || 99)
    );
  }, [weekdays]);

  // Опции селекта Subject (по данным истории)
  const subjectOptions = useMemo(() => {
    const m = new Map();
    history.forEach((h) => {
      const key =
        h?.subjectId != null
          ? String(h.subjectId)
          : h?.subjectCode || h?.subjectName;
      const label = h?.subjectName || h?.subjectCode || "—";
      if (key) m.set(String(key), label);
    });
    return Array.from(m, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label, "uz")
    );
  }, [history]);

  // Опции селекта Day (из API weekdays или fallback)
  const dayOptions = useMemo(() => {
    const m = new Map();
    if (weekdays?.length) {
      orderedWeekdays.forEach((w) => m.set(String(w.id), w.day));
    } else {
      for (let i = 1; i <= 7; i++) m.set(String(i), fallbackDays[i]);
    }
    return Array.from(m, ([value, label]) => ({ value, label }));
  }, [orderedWeekdays]);

  // 🔽 Нормализуем и фильтруем историю
  const normalizedHistory = useMemo(() => {
    const list = history.map((h, idx) => {
      const when = h?.date || h?.lessonDate || null;
      const normalized = when
        ? when.includes("T")
          ? when
          : when.replace(" ", "T")
        : null;
      let dayId = null;
      if (normalized) {
        const d = new Date(normalized);
        if (!isNaN(d.getTime())) {
          const jsDay = d.getDay(); // 0..6 (Sun..Sat)
          dayId = jsDay === 0 ? 7 : jsDay; // 1..7 (Mon..Sun)
        }
      }
      const dayName =
        (dayId &&
          (weekdays.find((w) => w.id === dayId)?.day || fallbackDays[dayId])) ||
        undefined;

      return {
        key: `${h?.hemisId ?? ""}-${h?.subjectId ?? ""}-${when ?? ""}-${idx}`,
        ...h,
        _when: when,
        _dayId: dayId, // 1..7
        _dayName: dayName, // "Dushanba" и т.п.
      };
    });

    let filtered = list;

    if (presenceFilter !== "all") {
      const want = presenceFilter === "present";
      filtered = filtered.filter((it) => Boolean(it.present) === want);
    }
    if (subjectFilter !== "all") {
      filtered = filtered.filter(
        (it) =>
          String(it.subjectId ?? it.subjectCode ?? it.subjectName) ===
          subjectFilter
      );
    }
    if (dayFilter !== "all") {
      filtered = filtered.filter(
        (it) => String(it._dayId) === String(dayFilter)
      );
    }

    filtered.sort((a, b) => {
      const ad = a._when
        ? new Date((a._when + "").replace(" ", "T")).getTime()
        : 0;
      const bd = b._when
        ? new Date((b._when + "").replace(" ", "T")).getTime()
        : 0;
      return bd - ad;
    });

    return filtered;
  }, [history, presenceFilter, subjectFilter, dayFilter, weekdays]);

  // Есть ли несохранённые изменения
  const hasChanges = useMemo(() => {
    if (assignedSet.size !== selectedDayIds.size) return true;
    for (const id of assignedSet) if (!selectedDayIds.has(id)) return true;
    return false;
  }, [assignedSet, selectedDayIds]);

  return (
    <div className="min-h-screen p-6">
      <ToastContainer position="top-right" autoClose={2500} />
      <Breadcrumbs
        items={[
          {
            label: "Guruhlar",
            to: "/office/online-group",
          },
          { label: "Talabalar", to: `/office/online-group/${linkId}` },
        ]}
      />
      <div className="mb-6 flex items-center gap-4 rounded-lg bg-white p-4 shadow">
        {/* 🔹 Student image */}
        {student?.image ? (
          <img
            src={student.image}
            alt={student.fullName || "Talaba"}
            className="h-16 w-16 rounded-full border-2 border-blue-600 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/64";
            }}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-sm text-gray-500">
            No Image
          </div>
        )}

        {/* 🔹 Student details */}
        <div>
          <h1 className="text-xl font-bold text-blue-600">
            Talaba Onlayn Kunlari
          </h1>
          <p className="mt-1 text-gray-600">
            {student?.fullName
              ? `${student.fullName} — ${student.groupName ?? ""}`
              : "Talaba ma'lumotlari"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
        </div>
      ) : (
        <>
          {/* ------- Кнопки дней + подтверждение ------- */}
          <div className="rounded-lg bg-white p-6 shadow">
            {orderedWeekdays.length === 0 ? (
              <p className="text-gray-500">Hafta kunlari topilmadi.</p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                  {orderedWeekdays.map((w) => {
                    const selected = isSelected(w.id);
                    const assigned = isAssigned(w.id);
                    const changed = selected !== assigned; // подсветим изменения

                    return (
                      <button
                        key={w.id}
                        onClick={() => toggleSelectedDay(w.id)}
                        disabled={mutating || applying}
                        className={`rounded-lg px-4 py-3 text-sm font-semibold transition
                          ${selected
                            ? "bg-green-100 text-green-700 ring-2 ring-green-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                          ${mutating || applying
                            ? "cursor-not-allowed opacity-70"
                            : ""
                          }
                          ${changed
                            ? "outline outline-dashed outline-1 outline-yellow-400"
                            : ""
                          }
                        `}
                        title={selected ? "Tanlovdan olib tashlash" : "Tanlash"}
                      >
                        {w.day ?? `Kun #${w.id}`}
                        {selected && <span className="ml-2 text-xs">✓</span>}
                        {changed && (
                          <span className="ml-2 text-[10px] text-yellow-600">
                            o‘zgartirilgan
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Панель подтверждения */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-gray-600">
                    {hasChanges
                      ? "Saqlanmagan o‘zgarishlar bor."
                      : "O‘zgarishlar yo‘q."}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDayIds(new Set(assignedSet))}
                      disabled={!hasChanges || applying}
                      className={`rounded-md border px-3 py-2 text-sm ${!hasChanges || applying
                          ? "cursor-not-allowed border-gray-200 text-gray-400"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      Bekor qilish
                    </button>

                    <button
                      onClick={() => setConfirmOpen(true)}
                      disabled={!hasChanges || applying}
                      className={`rounded-md px-3 py-2 text-sm font-medium text-white ${!hasChanges || applying
                          ? "bg-gray-400"
                          : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      Tasdiqlash
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ------- История активности ------- */}
          <div className="mt-8 rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-blue-700">
                Davomat tarixi (Attendance)
              </h2>

              {/* 🔽 Селекты фильтров */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  title="Fan bo‘yicha filtrlash"
                >
                  <option value="all">Barcha fanlar</option>
                  {subjectOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  title="Kun bo‘yicha filtrlash"
                >
                  <option value="all">Barcha kunlar</option>
                  {dayOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  value={presenceFilter}
                  onChange={(e) => setPresenceFilter(e.target.value)}
                  title="Davomat holati"
                >
                  <option value="all">Hammasi</option>
                  <option value="present">Qatnashgan</option>
                  <option value="absent">Qatnashmagan</option>
                </select>

                <button
                  onClick={fetchAttendanceHistory}
                  disabled={historyLoading}
                  className={`rounded-md px-3 py-2 text-sm font-medium text-white ${historyLoading
                      ? "bg-gray-400"
                      : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  title="Yangilash"
                >
                  {historyLoading ? "Yangilanmoqda..." : "Yangilash"}
                </button>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex h-32 items-center justify-center text-gray-600">
                Loading…
              </div>
            ) : normalizedHistory.length === 0 ? (
              <p className="text-gray-500">Hozircha mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Vaqt
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Para
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Fan
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        O'qituvchi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Davomat
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                        Izoh
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {normalizedHistory.map((row) => (
                      <tr key={row.key} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-800">
                          <div className="font-medium">
                            {formatDateTime(row._when)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row.start_time && row.end_time
                              ? `${row.start_time}–${row.end_time}`
                              : ""}
                          </div>
                          {row._dayName && (
                            <div className="mt-0.5 text-[11px] text-gray-500">
                              {row._dayName}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-800">
                          {row.lessonPairName ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-800">
                          <div className="font-medium">
                            {row.subjectName ?? "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {row.subjectCode ?? ""}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-800">
                          {row.employeeName ?? "-"}
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {row.present === true ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                              Qatnashdi
                            </span>
                          ) : row.present === false ? (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                              Qatnashmadi
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-600">
                              Belgilanmagan
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-800">
                          {row.comment ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ------- Modal подтверждения ------- */}
          {confirmOpen && (
            <div
              className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
              aria-modal="true"
              role="dialog"
            >
              <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ishonchingiz komilmi?
                </h3>

                {/* Краткое резюме изменений */}
                <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                  <ChangeSummary
                    selectedSet={selectedDayIds}
                    assignedSet={assignedSet}
                    weekdays={weekdays}
                    fallbackDays={fallbackDays}
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmOpen(false)}
                    disabled={applying}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={applySelectedDays}
                    disabled={applying}
                    className={`rounded-md px-4 py-2 text-sm font-medium text-white ${applying ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                  >
                    {applying ? "Saqlanmoqda..." : "Tasdiqlash"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Небольшой вспомогательный компонент: показывает какие дни добавятся/удалятся */
function ChangeSummary({ selectedSet, assignedSet, weekdays, fallbackDays }) {
  const dayName = (id) =>
    weekdays.find((w) => w.id === id)?.day || fallbackDays[id] || `Kun #${id}`;

  const toAdd = [...selectedSet].filter((d) => !assignedSet.has(d));
  const toRemove = [...assignedSet].filter((d) => !selectedSet.has(d));

  if (toAdd.length === 0 && toRemove.length === 0) {
    return <div>O‘zgarishlar yo‘q.</div>;
  }

  return (
    <div className="space-y-1">
      {toAdd.length > 0 && (
        <div>
          <span className="font-medium text-green-700">Qo‘shiladi:</span>{" "}
          {toAdd.map((id) => dayName(id)).join(", ")}
        </div>
      )}
      {toRemove.length > 0 && (
        <div>
          <span className="font-medium text-red-700">O‘chiriladi:</span>{" "}
          {toRemove.map((id) => dayName(id)).join(", ")}
        </div>
      )}
    </div>
  );
}
