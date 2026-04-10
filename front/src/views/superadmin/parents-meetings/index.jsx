import React, { useState, useEffect, useRef } from "react";
import ApiCall from "../../../config";
import * as XLSX from "xlsx";

const STATUSES = [
  {
    value: 1,
    label: "Ota",
    emoji: "👨",
    active: "bg-blue-500 text-white border-blue-500",
    inactive:
      "bg-white text-gray-400 border-gray-200 hover:border-blue-300 hover:text-blue-400",
  },
  {
    value: 2,
    label: "Ona",
    emoji: "👩",
    active: "bg-purple-500 text-white border-purple-500",
    inactive:
      "bg-white text-gray-400 border-gray-200 hover:border-purple-300 hover:text-purple-400",
  },
  {
    value: 3,
    label: "Kelmadi",
    emoji: "🚫",
    active: "bg-red-500 text-white border-red-500",
    inactive:
      "bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-400",
  },
  {
    value: 4,
    label: "Boshqa",
    emoji: "📝",
    active: "bg-green-500 text-white border-green-500",
    inactive:
      "bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:text-green-400",
  },
];

const STATUS_LABEL = { 1: "Ota", 2: "Ona", 3: "Kelmadi", 4: "Boshqa" };

const savedRowStyle = "bg-white rounded-xl border-2 border-blue-200 p-3";
const defaultRowStyle = "bg-white rounded-xl border-2 border-gray-100 p-3";

function Select({ options, value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q.toLowerCase())
  );
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const fn = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => {
          setOpen(!open);
          setQ("");
        }}
        className="flex cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm transition-colors hover:border-blue-300"
      >
        <span
          className={selected ? "font-medium text-gray-800" : "text-gray-400"}
        >
          {selected?.label || placeholder}
        </span>
        <span className="ml-2 text-xs text-gray-400">▼</span>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border-2 border-gray-200 bg-white shadow-lg">
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qidirish..."
            className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`cursor-pointer px-4 py-2.5 text-sm transition-colors ${
                  value === o.value
                    ? "bg-blue-50 font-semibold text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {o.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentsMeetings() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [meetings, setMeetings] = useState({});
  const [saving, setSaving] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    ApiCall("/api/v1/groups", "GET").then((r) => {
      if (!r.error) setGroups(r.data || []);
    });
    ApiCall("/api/v1/parents-meetings", "GET").then((r) => {
      if (!r.error) {
        const map = {};
        (r.data || []).forEach((m) => {
          if (m.student?.id) map[m.student.id] = m;
        });
        setMeetings(map);
      }
    });
  }, []);

  const handleGroupChange = (gid) => {
    setSelectedGroup(gid);
    setStudents([]);
    if (gid) {
      ApiCall(`/api/v1/groups/students/${gid}`, "GET").then((r) => {
        if (!r.error) setStudents(r.data || []);
      });
    }
  };

  const getMeeting = (sid) =>
    meetings[sid] || { status: null, description: "" };

  const setField = (sid, field, val) => {
    setMeetings((prev) => ({
      ...prev,
      [sid]: { ...getMeeting(sid), [field]: val },
    }));
  };

  const handleSave = async (student) => {
    const sid = student.id;
    const m = getMeeting(sid);
    if (!m.status) return;
    setSaving(sid);
    const payload = {
      studentId: sid,
      status: m.status,
      description: m.status === 4 ? m.description || "" : "",
    };
    const res = m.id
      ? await ApiCall(`/api/v1/parents-meetings/${m.id}`, "PUT", payload)
      : await ApiCall("/api/v1/parents-meetings", "POST", payload);
    if (!res.error) setMeetings((prev) => ({ ...prev, [sid]: res.data }));
    setSaving(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await ApiCall("/api/v1/parents-meetings", "GET");
      const data = res.error ? [] : res.data || [];

      const rows = data.map((m, i) => ({
        "№": i + 1,
        Talaba:
          m.student?.fullName ||
          `${m.student?.firstName || ""} ${m.student?.lastName || ""}`.trim() ||
          "—",
        Guruh: m.student?.group?.name || "—",
        Status: STATUS_LABEL[m.status] || m.status || "—",
        Izoh: m.description || "",
        Sana: m.createdAt
          ? new Date(m.createdAt).toLocaleDateString("uz-UZ")
          : "—",
      }));

      const ws = XLSX.utils.json_to_sheet(rows);

      // Column widths
      ws["!cols"] = [
        { wch: 4 }, // №
        { wch: 28 }, // Talaba
        { wch: 18 }, // Guruh
        { wch: 12 }, // Status
        { wch: 30 }, // Izoh
        { wch: 14 }, // Sana
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Uchrashuvlar");

      const groupName =
        groups.find((g) => g.id === selectedGroup)?.name || "barchasi";
      XLSX.writeFile(wb, `ota-onalar-uchrashuvlari-${groupName}.xlsx`);
    } catch (e) {
      console.error(e);
    }
    setExporting(false);
  };

  const groupOptions = groups.map((g) => ({ value: g.id, label: g.name }));
  const name = (s) => s.fullName || "Talaba";

  return (
    <div className="max-w-8xl mx-auto px-5 py-8 font-sans">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold text-gray-900">
            Ota-onalar uchrashuvlari
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Kim keldi, kim kelmadini belgilang
          </p>
        </div>

        {/* Excel export button */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all ${
            exporting
              ? "cursor-default border-gray-200 bg-gray-100 text-gray-400"
              : "cursor-pointer border-green-500 bg-green-500 text-white hover:border-green-600 hover:bg-green-600"
          }`}
        >
          {exporting ? (
            <span>Yuklanmoqda...</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                />
              </svg>
              Excel yuklab olish
            </>
          )}
        </button>
      </div>

      {/* Group select */}
      <div className="mb-5 rounded-xl border-2 border-gray-100 bg-white p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
          Guruh
        </label>
        <Select
          options={groupOptions}
          value={selectedGroup}
          onChange={handleGroupChange}
          placeholder="Guruhni tanlang..."
        />
      </div>

      {/* Loading */}
      {selectedGroup && students.length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400">
          Yuklanmoqda...
        </div>
      )}

      {/* Students list */}
      {students.length > 0 && (
        <div className="flex flex-col gap-2">
          {students
            .slice()
            .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""))
            .map((s, i) => {
              const m = getMeeting(s.id);
              const isSaving = saving === s.id;
              const saved = !!m.id;

              return (
                <div
                  key={s.id}
                  className={saved ? savedRowStyle : defaultRowStyle}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-5 text-right text-xs font-bold text-gray-300">
                      {i + 1}
                    </span>
                    <span className="min-w-36 flex-1 text-sm font-semibold text-gray-800">
                      {name(s)}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((st) => {
                        const active = m.status === st.value;
                        return (
                          <button
                            key={st.value}
                            onClick={() =>
                              setField(s.id, "status", active ? null : st.value)
                            }
                            className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                              active ? st.active : st.inactive
                            }`}
                          >
                            {st.emoji} {st.label}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handleSave(s)}
                      disabled={!m.status || isSaving}
                      className={`min-w-20 rounded-lg border-none px-4 py-1.5 text-sm font-semibold transition-all ${
                        m.status && !isSaving
                          ? "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
                          : "cursor-default bg-gray-100 text-gray-400"
                      }`}
                    >
                      {isSaving ? "..." : saved ? "✓ Saqlandi" : "Saqlash"}
                    </button>
                  </div>

                  {m.status === 4 && (
                    <input
                      value={m.description || ""}
                      onChange={(e) =>
                        setField(s.id, "description", e.target.value)
                      }
                      placeholder="Izoh yozing..."
                      className="mt-2.5 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-green-400"
                    />
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
