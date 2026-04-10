import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdModeEditOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";
import { toast } from "react-toastify";
import Breadcrumbs from "views/BackLink/BackButton";

const Index = () => {
  const [state, setState] = useState({
    subjectId: "",
    departmentId: "",
    curriculumId: "",
    selectedCurriculumIds: [],
    curriculums: [],
    teacherId: "",
    teacherSubjects: [],
  });

  const [selectOptions, setSelectOptions] = useState({
    subjects: [],
    departments: [],
    curriculums: [],
    teachers: [],
  });

  const [teachers, setTeachers] = useState([]);
  const [show, setShow] = useState(false);

  // ✅ Teacherlarni olish
  const getTeachers = async () => {
    try {
      const response = await ApiCall(`/api/v1/teacher`, "GET");
      setTeachers(response.data);

      // Teacherlarni select optionsga qo'shish
      setSelectOptions((prev) => ({
        ...prev,
        teachers: (response.data || []).map((t) => ({
          value: t.id,
          label: `${t.name} (${t.phone})`,
        })),
      }));
    } catch (error) {
      console.error("Error fetching teacher:", error);
      toast.error("O'qituvchilarni yuklashda xatolik");
    }
  };

  useEffect(() => {
    getTeachers();
    fetchSelectOptions();
  }, []);

  // ✅ Filterlangan curriculum-subjectlarni olish
  const fetchFilteredCurriculums = async () => {
    try {
      const { subjectId, departmentId, curriculumId } = state;

      // Agar hammasi bo'sh bo'lsa → tozalash
      if (!subjectId && !departmentId && !curriculumId) {
        setState((prev) => ({ ...prev, curriculums: [] }));
        return;
      }

      const url = `/api/v1/curriculum-subject/filter?subjectId=${
        subjectId || ""
      }&departmentId=${departmentId || ""}&curriculumId=${
        curriculumId || ""
      }&page=0&size=50`;

      const res = await ApiCall(url, "GET");
      const data = res?.data?.content || [];

      setState((prev) => ({
        ...prev,
        curriculums: data,
      }));
    } catch (err) {
      toast.error("Natijalarni yuklashda xatolik");
      setState((prev) => ({ ...prev, curriculums: [] }));
    }
  };

  useEffect(() => {
    fetchFilteredCurriculums();
  }, [state.subjectId, state.departmentId, state.curriculumId]);

  // ✅ Fan/bo'lim/rejalarni olish
  const fetchSelectOptions = async () => {
    try {
      const subRes = await ApiCall("/api/v1/subjects", "GET");
      const depRes = await ApiCall("/api/v1/departments", "GET");
      const curRes = await ApiCall("/api/v1/curriculum", "GET");

      setSelectOptions((prev) => ({
        ...prev,
        subjects: (subRes?.data || []).map((s) => ({
          value: s.id,
          label: s.name,
        })),
        departments: (depRes?.data || []).map((d) => ({
          value: d.id,
          label: d.name,
        })),
        curriculums: (curRes?.data || []).map((c) => ({
          value: c.id,
          label: c.specialty?.name || "Noma'lum reja",
        })),
      }));
    } catch (err) {
      toast.error("Selectlarni yuklashda xatolik");
    }
  };

  // ✅ Yangi biriktirish (POST)
  const addTeacherCurriculum = async () => {
    if (!state.teacherId) {
      toast.error("O'qituvchini tanlang!");
      return;
    }
    try {
      const dto = {
        teacherId: state.teacherId,
        curriculumIds: state.selectedCurriculumIds,
      };

      await ApiCall("/api/v1/teacher-curriculum-subject", "POST", dto);

      toast.success("Fanlar muvaffaqiyatli biriktirildi");

      await loadTeacherSubjects(state.teacherId);
      setShow(false);
    } catch (err) {
      console.error("Biriktirishda xatolik:", err);
      toast.error("Biriktirishda xatolik");
    }
  };

  // ✅ Mavjudini yangilash (PUT)
  const updateTeacherCurriculum = async () => {
    if (!state.teacherId) {
      toast.error("O'qituvchini tanlang!");
      return;
    }
    try {
      const dto = {
        teacherId: state.teacherId,
        curriculumIds: state.selectedCurriculumIds,
      };

      await ApiCall("/api/v1/teacher-curriculum-subject", "PUT", dto);

      toast.success("Fanlar muvaffaqiyatli yangilandi");

      await loadTeacherSubjects(state.teacherId);
      setShow(false);
    } catch (err) {
      console.error("Yangilashda xatolik:", err);
      toast.error("Yangilashda xatolik");
    }
  };

  // ✅ Teacherning fanlarini yuklash
  const loadTeacherSubjects = async (teacherId) => {
    try {
      const res = await ApiCall(
        `/api/v1/teacher-curriculum-subject/teacher/${teacherId}`,
        "GET"
      );
      const teacherSubjects = res.data || [];

      setState((prev) => ({
        ...prev,
        teacherSubjects,
        selectedCurriculumIds: teacherSubjects.map(
          (ts) => ts.curriculumSubject?.id
        ), // 🔥 backenddan qaytgan asosiy IDlar bilan doimiy yangilab turadi
      }));
    } catch (err) {
      console.error("Fanlarni yuklashda xatolik:", err);
    }
  };

  // ✅ Modalni ochish va tanlangan o'qituvchining fanlarini yuklash
  const openModalWithTeacher = (teacherId) => {
    setState((prev) => ({
      ...prev,
      teacherId: teacherId,
      subjectId: "",
      departmentId: "",
      curriculumId: "",
      selectedCurriculumIds: [],
      curriculums: [],
    }));

    // faqat fanlarini yuklaymiz
    loadTeacherSubjects(teacherId);

    // modalni ko'rsatamiz
    setShow(true);
  };

  return (
    <div className="p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          O'qituvchilarga Fan Biriktirish
        </h1>
        <button
          onClick={() => {
            setState((prev) => ({
              ...prev,
              teacherId: "",
              subjectId: "",
              departmentId: "",
              curriculumId: "",
              selectedCurriculumIds: [],
              curriculums: [],
              teacherSubjects: [],
            }));
            setShow(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <FiPlus className="text-lg" />
          Fan Biriktirish
        </button>
      </div>

      {/* O'qituvchilar va ularning fanlari */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <Card
            key={teacher.id}
            extra={"w-full h-full shadow-sm hover:shadow-md transition-shadow"}
          >
            <div className="p-4">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {teacher.name}
                  </h3>
                  <p className="text-sm text-gray-600">{teacher.phone}</p>
                </div>
                <button
                  onClick={() => openModalWithTeacher(teacher.id)}
                  className="p-1 text-blue-500 hover:text-blue-700"
                  title="Fanlarini tahrirlash"
                >
                  <MdModeEditOutline size={20} />
                </button>
              </div>

              {/* O'qituvchining fanlari */}
              <div>
                <h4 className="mb-2 font-medium text-gray-700">
                  Biriktirilgan fanlar:
                </h4>
                <TeacherSubjectsList teacherId={teacher.id} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Fan biriktirish modali */}
      <Rodal
        visible={show}
        onClose={() => setShow(false)}
        width={700}
        height={450}
        customStyles={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="p-4">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            {state.teacherId
              ? "O'qituvchiga Fan Biriktirish"
              : "Yangi Fan Biriktirish"}
          </h2>

          {/* Teacher select */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              O'qituvchi *
            </label>
            <Select
              options={selectOptions.teachers}
              value={selectOptions.teachers.find(
                (opt) => opt.value === state.teacherId
              )}
              onChange={(sel) => {
                const teacherId = sel?.value || "";
                setState((prev) => ({
                  ...prev,
                  teacherId,
                  selectedCurriculumIds: [], // O'qituvchi o'zgarganda fanlarni tozalash
                }));
                if (teacherId) {
                  loadTeacherSubjects(teacherId);
                }
              }}
              isSearchable
              placeholder="O'qituvchi tanlang..."
              className="basic-select"
              classNamePrefix="select"
            />
          </div>

          {/* Filter qismi */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Fan */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Fan
              </label>
              <Select
                options={selectOptions.subjects}
                value={selectOptions.subjects.find(
                  (opt) => opt.value === state.subjectId
                )}
                onChange={(sel) =>
                  setState((prev) => ({ ...prev, subjectId: sel?.value || "" }))
                }
                isClearable
                isSearchable
                placeholder="Fan tanlang..."
                className="basic-select"
                classNamePrefix="select"
              />
            </div>

            {/* Bo'lim */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bo'lim
              </label>
              <Select
                options={selectOptions.departments}
                value={selectOptions.departments.find(
                  (opt) => opt.value === state.departmentId
                )}
                onChange={(sel) =>
                  setState((prev) => ({
                    ...prev,
                    departmentId: sel?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Bo'lim tanlang..."
                className="basic-select"
                classNamePrefix="select"
              />
            </div>

            {/* Reja */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                O'quv Rejasi
              </label>
              <Select
                options={selectOptions.curriculums}
                value={selectOptions.curriculums.find(
                  (opt) => opt.value === state.curriculumId
                )}
                onChange={(sel) =>
                  setState((prev) => ({
                    ...prev,
                    curriculumId: sel?.value || "",
                  }))
                }
                isClearable
                isSearchable
                placeholder="Reja tanlang..."
                className="basic-select"
                classNamePrefix="select"
              />
            </div>
          </div>

          {/* Fanlarni tanlash */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Biriktiriladigan Fanlar *
              <span className="ml-2 text-xs text-gray-500">
                ({state.curriculums.length} ta topildi)
              </span>
            </label>
            <Select
              options={state.curriculums.map((c) => ({
                value: c.id,
                label: `${c.subject?.name || "Fan"} - ${
                  c.department?.name || "Bo'lim"
                }`,
              }))}
              value={state.curriculums
                .filter((c) => state.selectedCurriculumIds.includes(c.id))
                .map((c) => ({
                  value: c.id,
                  label: `${c.subject?.name || "Fan"} - ${
                    c.department?.name || "Bo'lim"
                  }`,
                }))}
              isMulti
              isDisabled={state.curriculums.length === 0}
              onChange={(selected) =>
                setState((prev) => ({
                  ...prev,
                  selectedCurriculumIds: selected.map((s) => s.value), // 🔥 selectdan olib tashlansa ham state yangilanadi
                }))
              }
              placeholder={
                state.curriculums.length === 0
                  ? "Fanlar topilmadi - filtrlarni to'ldiring"
                  : "Fanlarni tanlang..."
              }
            />
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button
              onClick={() => setShow(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              onClick={addTeacherCurriculum}
              disabled={
                !state.teacherId || state.selectedCurriculumIds.length === 0
              }
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Saqlash
            </button>
          </div>
        </div>
      </Rodal>
    </div>
  );
};

// ✅ Alohida komponent: O'qituvchining fanlari ro'yxati
const TeacherSubjectsList = ({ teacherId }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await ApiCall(
          `/api/v1/teacher-curriculum-subject/teacher/${teacherId}`,
          "GET"
        );
        setSubjects(res.data || []);
      } catch (err) {
        console.error("Fanlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [teacherId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Yuklanmoqda...</div>;
  }

  if (subjects.length === 0) {
    return <p className="text-sm text-gray-500">Fanlar biriktirilmagan</p>;
  }

  return (
    <ul className="max-h-32 space-y-1 overflow-y-auto">
      {subjects.map((ts) => (
        <li
          key={ts.id}
          className="rounded bg-gray-50 px-2 py-1 text-sm text-gray-600"
        >
          • {ts.curriculumSubject?.subject?.name}
          {ts.curriculumSubject?.department?.name && (
            <span className="ml-1 text-xs text-gray-500">
              ({ts.curriculumSubject.department.name})
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default Index;
