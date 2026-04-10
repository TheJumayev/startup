import React, { useEffect, useState } from "react";
import Select from "react-select";
import ApiCall from "../../../config";
import { useNavigate, useParams } from "react-router-dom";

function FinalExamEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const [form, setForm] = useState({
    name: "",
    curriculumSubjectId: "",
    groupId: "",
    questionCount: "",
    duration: "",
    maxBall: "",
    contract: "",
    attempts: "",
    startTime: "",
    endTime: "",
    isAmaliy: false,
    isAmaliyot: false,
  });

  // ============================
  // 🔵 INITIAL LOAD: groups + exam
  // ============================
  useEffect(() => {
    loadGroups();
    loadExam();
  }, [id]);

  const loadGroups = async () => {
    const res = await ApiCall("/api/v1/groups", "GET");
    const data = Array.isArray(res.data) ? res.data : [];
    setGroups(data);
  };

  const loadExam = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/final-exam/${id}`, "GET");
      const exam = res.data;

      setForm({
        name: exam.name,
        curriculumSubjectId: exam.curriculumSubject.id,
        groupId: exam.group.id,
        questionCount: exam.questionCount,
        duration: exam.duration,
        maxBall: exam.maxBall,
        attempts: exam.attempts,
        startTime: exam.startTime?.slice(0, 16),
        endTime: exam.endTime?.slice(0, 16),
        contract: exam.contract ?? 0,
        isAmaliy: exam.isAmaliy ?? false,
        isAmaliyot: exam.isAmaliyot ?? false,
      });

      // Guruh bo'yicha SUBJECT yuklash
      loadSubjects(exam.group.curriculum);
    } catch (error) {
      alert("Imtihon ma'lumotlarini yuklashda xatolik!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🔵 LOAD SUBJECTS BY CURRICULUM HEMIS
  // ============================
  const loadSubjects = async (curriculumHemisId) => {
    try {
      const res = await ApiCall(
        `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumHemisId}&size=200`,
        "GET"
      );
      setFilteredSubjects(res.data.content || []);
    } catch (error) {
      console.error("Fanlarni yuklashda xatolik:", error);
    }
  };

  // ============================
  // 🔵 GROUP SELECT CHANGE
  // ============================
  const handleGroupChange = async (sel) => {
    setForm({ ...form, groupId: sel.value, curriculumSubjectId: "" });
    await loadSubjects(sel.curriculumHemisId);
  };

  // ============================
  // 🔵 FORM VALIDATION
  // ============================
  const validateForm = () => {
    const required = [
      "name",
      "curriculumSubjectId",
      "groupId",
      "questionCount",
      "duration",
      "attempts",
      "startTime",
      "contract",
      "endTime",
    ];
    const missing = required.filter((field) => !form[field]);

    if (missing.length > 0) {
      alert("⚠️ Iltimos, barcha maydonlarni to'ldiring");
      return false;
    }

    if (new Date(form.startTime) >= new Date(form.endTime)) {
      alert("⚠️ Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak");
      return false;
    }

    // 🔴 Yangi qoidamiz: TEST 100 DAN KAM BO'LMASIN
    if (selectedSubject?.test_count < 0) {
      alert(
        `⚠️ Ushbu fan uchun kamida 50 ta test bo'lishi shart! Hozirgi testlar soni: ${selectedSubject?.test_count}`
      );
      return false;
    }

    return true;
  };

  // ============================
  // 🔵 SUBMIT (PUT)
  // ============================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        curriculumSubjectId: form.curriculumSubjectId,
        groupId: form.groupId,
        questionCount: Number(form.questionCount),
        duration: Number(form.duration),
        maxBall: Number(form.maxBall),
        attempts: Number(form.attempts),
        startTime: form.startTime,
        endTime: form.endTime,
        isAmaliy: form.isAmaliy,
        contract: Number(form.contract),
        isAmaliyot: form.isAmaliyot,
      };

      await ApiCall(`/api/v1/final-exam/${id}`, "PUT", payload);
      alert("✅ Imtihon muvaffaqiyatli yangilandi!");
      navigate("/office/final-exam");
    } catch (err) {
      alert(err?.response?.data || "❌ Xatolik yuz berdi!");
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = filteredSubjects.find(
    (item) => item.subject.id === form.curriculumSubjectId
  );

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      border: "1px solid #d1d5db",
      borderRadius: "0.75rem",
      padding: "0.25rem",
      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "&:hover": {
        borderColor: "#3b82f6",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#eff6ff"
        : "white",
      color: state.isSelected ? "white" : "#1f2937",
      padding: "0.75rem 1rem",
    }),
  };

  if (loading && !form.groupId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="font-medium text-gray-600">
            Imtihon ma'lumotlari yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Card */}
        <div className="mb-8 rounded-2xl border-l-4 border-blue-600 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                ✏️ Final imtihonni tahrirlash
              </h1>
              <p className="text-lg text-gray-600">
                Imtihon ma'lumotlarini yangilang
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  if (!form.curriculumSubjectId) {
                    alert("⚠️ Iltimos, avval fan tanlang!");
                    return;
                  }

                  if (!selectedSubject) {
                    alert("⚠️ Mos fan topilmadi!");
                    return;
                  }

                  // navigate(`/office/test-upload/${selectedSubject.subject.id}`);
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:shadow-lg"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Testlar ({selectedSubject?.test_count ?? 0})
              </button>

              <button
                onClick={() => navigate("/office/final-exam")}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:from-gray-700 hover:to-gray-800 hover:shadow-lg"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Orqaga
              </button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Group */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Guruh <span className="text-red-500">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                value={groups
                  .map((g) => ({
                    label: g.name,
                    value: g.id,
                    curriculumHemisId: g.curriculum,
                  }))
                  .find((x) => x.value === form.groupId)}
                options={groups.map((g) => ({
                  label: g.name,
                  value: g.id,
                  curriculumHemisId: g.curriculum,
                }))}
                onChange={handleGroupChange}
                placeholder="Guruh tanlang..."
                isSearchable
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fan <span className="text-red-500">*</span>
              </label>
              <Select
                styles={customSelectStyles}
                value={filteredSubjects
                  .map((item) => ({
                    label: `${item.subject.subject.name} (${item.subject.semesterName})`,
                    value: item.subject.id,
                    test_count: item.test_count,
                    fullSubject: item.subject.subject.name,
                  }))
                  .find((x) => x.value === form.curriculumSubjectId)}
                options={filteredSubjects.map((item) => ({
                  label: `${item.subject.subject.name} (${item.subject.semesterName})`,
                  value: item.subject.id,
                  test_count: item.test_count,
                  fullSubject: item.subject.subject.name,
                }))}
                onChange={(sel) => {
                  setForm({
                    ...form,
                    curriculumSubjectId: sel.value,
                    name: sel.fullSubject,
                  });
                }}
                placeholder="Fan tanlang..."
                isSearchable
              />
            </div>

            {/* Exam Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Imtihon nomi <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Yakuniy nazorat"
              />
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Boshlanish vaqti <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tugash vaqti <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Imtihon vaqti (daqiqa) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Questions Count */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Savollar soni <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.questionCount}
                onChange={(e) =>
                  setForm({ ...form, questionCount: e.target.value })
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Attempts */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Urinishlar soni <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.attempts}
                onChange={(e) => setForm({ ...form, attempts: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>

            {/* Max Ball */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Maksimal ball
              </label>
              <input
                type="number"
                value={form.maxBall}
                onChange={(e) => setForm({ ...form, maxBall: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kontrakt foizi <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.contract}
                onChange={(e) => setForm({ ...form, contract: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Masalan: 30"
                min="1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col items-end justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
            {/* Test / Amaliy Toggle */}
            <div className="space-y-2">
              <div className="flex items-end gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    {form.isAmaliy ? "🔵 Amaliy imtihon" : "🟢 Test imtihon"}
                  </label>
                  <label
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "60px",
                      height: "34px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.isAmaliy}
                      onChange={() =>
                        setForm({ ...form, isAmaliy: !form.isAmaliy })
                      }
                      style={{
                        opacity: 0,
                        width: 0,
                        height: 0,
                      }}
                    />

                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: form.isAmaliy ? "#2196F3" : "#ccc",
                        transition: ".4s",
                        borderRadius: "34px",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          height: "26px",
                          width: "26px",
                          left: form.isAmaliy ? "30px" : "4px",
                          bottom: "4px",
                          backgroundColor: "white",
                          transition: ".4s",
                          borderRadius: "50%",
                        }}
                      ></span>
                    </span>
                  </label>
                </div>
                {/* ✅ Amaliyot fani checkbox */}
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.isAmaliyot}
                    onChange={() =>
                      setForm({ ...form, isAmaliyot: !form.isAmaliyot })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Amaliyot fani
                  </span>
                </label>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4 sm:flex-row">
              <button
                onClick={() => navigate("/office/final-exam")}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-8 py-3 font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Bekor qilish
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || selectedSubject?.test_count < 0}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Yangilash
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-4 w-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-blue-800">Ma'lumot</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Guruhni o'zgartirsangiz, fanlar ro'yxati yangilanadi</li>
                <li>• Fan tanlaganingizda, testlar soni ko'rsatiladi</li>
                <li>
                  • Testlarni boshqarish uchun "Testlar" tugmasidan foydalaning
                </li>
                <li>• Boshlanish vaqti tugash vaqtidan oldin bo'lishi kerak</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinalExamEdit;
