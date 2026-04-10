import React, { useEffect, useMemo, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { FaLink } from "react-icons/fa";
import Select from "react-select";
import Breadcrumbs from "views/BackLink/BackButton";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [checkedSubjects, setCheckedSubjects] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const TEACHERS_PAGE_SIZE = 10;
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const teacherOptions = useMemo(() => {
    return teachers.map((t) => ({ value: t.id, label: t.name }));
  }, [teachers]);


  // 🔎 Qidiruv + filterlangan o'qituvchilar
  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.trim().toLowerCase();
    if (!q) return teachers;

    return teachers.filter((t) => {
      const name = (t?.name ?? "").toLowerCase();
      const phone = (t?.phone ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [teachers, teacherSearch]);

  const totalTeacherPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredTeachers.length / TEACHERS_PAGE_SIZE));
  }, [filteredTeachers.length]);

  // 📄 Sahifa bo'yicha 10 ta kesib olish
  const pagedTeachers = useMemo(() => {
    const start = (teacherPage - 1) * TEACHERS_PAGE_SIZE;
    return filteredTeachers.slice(start, start + TEACHERS_PAGE_SIZE);
  }, [filteredTeachers, teacherPage]);

  useEffect(() => {
    setTeacherPage(1);
  }, [teacherSearch]);


  const [newTeacher, setNewTeacher] = useState({
    id: "",
    name: "",
    phone: "",
    password: "",
  });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assignTeacher, setAssignTeacher] = useState(null);
  const [show, setShow] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [tableTeachers, setTableTeachers] = useState([]);
  const [showEditAssignModal, setShowEditAssignModal] = useState(false);
  const [editOldTeacher, setEditOldTeacher] = useState(null);
  const [editNewTeacher, setEditNewTeacher] = useState(null);

  // 🔹 Tanlov uchun state
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  // Yuqoridagi jadval uchun (faqat POST)
  const handleAssignClickPost = (teacher) => {
    console.log(teacher);

    setAssignTeacher(teacher);
    setSelectedGroup(null);
    setSubjects([]);
    setCheckedSubjects([]);
    setAllChecked(false);
    setAssignModal("post"); // 🔹 modal turi
  };

  const deleteAssignedRow = async (id) => {
    if (!window.confirm("Bu biriktirishni o'chirishni tasdiqlaysizmi?")) return;

    try {
      await ApiCall(`/api/v1/mustaqil-teacher/${id}`, "DELETE");
      toast.success("Biriktirish o‘chirildi!");
      fetchTableTeachers(); // 🔄 jadvalni qayta yuklash
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      toast.error("O'chirishda xatolik!");
    }
  };


  const updateAssignedTeacher = async () => {
    if (!editNewTeacher) {
      toast.warning("Yangi o'qituvchini tanlang!");
      return;
    }

    try {
      await ApiCall(`/api/v1/mustaqil-teacher/${editOldTeacher.id}/${editNewTeacher.value}`, "PUT");
      toast.success("O'qituvchi muvaffaqiyatli almashtirildi!");
      setShowEditAssignModal(false);
      fetchTableTeachers();
    } catch (error) {
      console.error(error);
      toast.error("Almashtirishda xatolik!");
    }
  };


  const handleAssignClickPut = async (teacher, row) => {
    setAssignTeacher(teacher);

    // 🔹 Guruhni avtomatik tanlash
    const selectedGroupData = {
      value: row.groups?.id,
      label: row.groups?.name,
      curriculumId: row.groups?.curriculum,
    };
    setSelectedGroup(selectedGroupData);
    setAssignModal("put");

    // 🔹 Belgilangan curriculumSubject ID’lari
    const existingSubjectIds = (row.curriculumSubject || [])
      .map((item) => item.id) // ✅ curriculumSubject.id
      .filter(Boolean);

    if (selectedGroupData.curriculumId) {
      setLoadingSubjects(true);
      try {
        const url = `/api/v1/curriculum-subject/filter?curriculumHemisId=${selectedGroupData.curriculumId}&size=100`;
        const response = await ApiCall(url, "GET");
        const data = response.data?.content || [];
        console.log(data);

        // 🔹 Fanlar ro'yxatini tayyorlaymiz
        const mappedSubjects = data
          .slice()
          .sort((a, b) => {
            const semA = parseInt(a.subject?.semesterName) || 0;
            const semB = parseInt(b.subject?.semesterName) || 0;
            return semA - semB; // 1 → 2 → 3 → 4
          })
          .map((item) => ({
            id: item.subject?.id, // curriculumSubject ID
            name: `${item.subject?.semesterName || "-"} - ${item.subject?.subject?.name || "Noma'lum fan"
              } - (${item.subject?.credit || 0} kredit)`,
          }));


        setSubjects(mappedSubjects);

        // 🔹 Avval belgilangan fanlarni tiklaymiz
        setCheckedSubjects(existingSubjectIds);

        // 🔹 Agar hammasi tanlangan bo'lsa
        setAllChecked(existingSubjectIds.length === mappedSubjects.length);
      } catch (error) {
        console.error("Fanlarni yuklashda xatolik:", error);
        toast.error("Fanlarni yuklashda xatolik!");
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    }
  };

  useEffect(() => {
    getTeachers();
    fetchGroups();
    fetchTableTeachers();
  }, []);

  // 🔹 O'qituvchilarni olish
  const getTeachers = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(`/api/v1/teacher`, "GET");
      setTeachers(response.data || []);
    } catch (error) {
      console.error("O'qituvchilarni olishda xatolik:", error);
      toast.error("O'qituvchilarni olishda xatolik!");
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableTeachers = async () => {
    try {
      const response = await ApiCall(`/api/v1/mustaqil-teacher`, "GET");

      const data = response?.data;

      const arr =
        Array.isArray(data) ? data :
          Array.isArray(data?.content) ? data.content :
            Array.isArray(data?.data) ? data.data :
              [];

      setTableTeachers(arr);
    } catch (error) {
      console.error("Jadval ma'lumotlarini olishda xatolik:", error);
      toast.error("Ma'lumotlarni olishda xatolik!");
      setTableTeachers([]);
    }
  };


  const PAGE_SIZE = 100;

  // 🔹 Guruhlarni olish
  const fetchGroups = async () => {
    try {
      const response = await ApiCall("/api/v1/groups", "GET");
      const groupsArr = Array.isArray(response.data)
        ? response.data
        : response.data?.content || response.data?.data || [];

      const mapped = groupsArr.map((g) => ({
        value: g.id,
        label: g.name ?? g.groupName ?? "Noma'lum guruh",
        curriculumId: g.curriculum ?? null,
      }));

      setGroups(mapped);
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
      toast.error("Guruhlarni yuklashda xatolik!");
    }
  };

  const fetchSubjectsByGroup = async (curriculumId) => {
    if (!curriculumId) {
      setSubjects([]);
      return;
    }

    setLoadingSubjects(true);
    try {
      const url = `/api/v1/curriculum-subject/filter?curriculumHemisId=${curriculumId}&size=${PAGE_SIZE}`;
      const response = await ApiCall(url, "GET");
      const data = response.data?.content || [];
      console.log(data);

      const mappedSubjects = data
        .slice() // 🔹 clone array (mutatsiya bo'lmasin)
        .sort((a, b) => {
          const semA = parseInt(a.subject?.semesterName) || 0;
          const semB = parseInt(b.subject?.semesterName) || 0;
          return semA - semB; // 🔹 1 → 2 → 3 → 4 tartib
        })
        .map((item) => ({
          id: item.subject?.id,
          name: ` ${item.subject?.semesterName || "-"
            } - ${item.subject?.subject.name || "Noma'lum fan"} - (${item.subject?.credit || 0} kredit)`,
        }));


      setSubjects(mappedSubjects);
      setCheckedSubjects([]);
      setAllChecked(false);
    } catch (error) {
      console.error("Fanlarni olishda xatolik:", error);
      toast.error("Fanlarni olishda xatolik!");
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    // Agar PUT rejimida bo'lsak, fetchSubjectsByGroup avtomatik chaqirilmasin
    if (assignModal === "put") return;

    if (selectedGroup?.curriculumId) {
      fetchSubjectsByGroup(selectedGroup.curriculumId);
    } else {
      setSubjects([]);
      setCheckedSubjects([]);
    }
  }, [selectedGroup, assignModal]);

  const assignSubjectsToTeacher = async () => {
    if (!assignTeacher) {
      toast.warning("O'qituvchi tanlanmagan!");
      return;
    }
    if (checkedSubjects.length === 0) {
      toast.warning("Hech bo'lmaganda bitta fan tanlang!");
      return;
    }
    console.log(assignTeacher);

    const dto = {
      teacherId: assignTeacher.id,
      groupIds: selectedGroup?.value,
      curriculumSubjectIds: checkedSubjects,
    };
    const method = assignModal === "put" ? "PUT" : "POST";
    const successMsg =
      method === "PUT"
        ? "Fanlar muvaffaqiyatli yangilandi!"
        : "Fanlar muvaffaqiyatli biriktirildi!";

    try {
      await ApiCall(`/api/v1/mustaqil-teacher`, method, dto);
      toast.success(successMsg);
      setAssignModal(null);
      setCheckedSubjects([]);
      setSelectedGroup(null);
      setSubjects([]);
      fetchTableTeachers();
    } catch (error) {
      console.error("Fanlarni saqlashda xatolik:", error);
      toast.error("Fanlarni saqlashda xatolik!");
    }
  };

  // 🔹 O'qituvchi qo'shish
  const addTeacher = async () => {
    if (!newTeacher.name || !newTeacher.phone || !newTeacher.password) {
      toast.warning("Barcha maydonlarni to'ldiring!");
      return;
    }

    try {
      const obj = {
        phone: newTeacher.phone,
        password: newTeacher.password,
        name: newTeacher.name,
      };
      await ApiCall(`/api/v1/teacher`, "POST", obj);
      await getTeachers();
      setShow(false);
      setNewTeacher({ id: "", name: "", phone: "", password: "" });
      toast.success("O'qituvchi qo'shildi!");
    } catch (error) {
      console.error("O'qituvchi qo'shishda xatolik:", error);
      toast.error("O'qituvchi qo'shishda xatolik!");
    }
  };




  return (
    <div className="min-h-screen p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">O'qituvchilarga mustaqil ta'lim biriktirish</h1>
      </div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <input
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            placeholder="Qidiruv: ism yoki telefon..."
            className="w-full md:w-80 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {teacherSearch && (
            <button
              onClick={() => setTeacherSearch("")}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Tozalash
            </button>
          )}
        </div>
        <div className="text-sm text-gray-600">
          Topildi: <b>{filteredTeachers.length}</b> ta | Har sahifada: <b>10</b> ta
        </div>
      </div>


      {/* O'qituvchilar ro'yxati */}
      <Card extra="w-full h-full shadow-sm mb-6">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            O'qituvchilar ro'yxati
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    №
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Ism
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Telefon/Login
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : (
                  pagedTeachers.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {(teacherPage - 1) * TEACHERS_PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {row.phone}
                      </td>
                      <td className="flex justify-end gap-2 px-4 py-3">
                        <button
                          onClick={() => handleAssignClickPost(row)}
                          className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                          title="Fanlarni biriktirish"
                        >
                          <FaLink className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && filteredTeachers.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                O'qituvchilar topilmadi
              </div>
            )}

          </div>
          {!loading && filteredTeachers.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600">
                Sahifa: <b>{teacherPage}</b> / <b>{totalTeacherPages}</b>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTeacherPage((p) => Math.max(1, p - 1))}
                  disabled={teacherPage === 1}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ◀ Oldingi
                </button>

                <button
                  onClick={() => setTeacherPage((p) => Math.min(totalTeacherPages, p + 1))}
                  disabled={teacherPage === totalTeacherPages}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Keyingi ▶
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>


      {/* Biriktirilgan fanlar jadvali */}
      <Card extra="w-full h-full shadow-sm">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Biriktirilgan fanlar
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    №
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    O'qituvchi
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Guruhlar
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Fan nomi
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableTeachers.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b transition-colors hover:bg-gray-50"
                  >
                    {/* № */}
                    <td className="px-4 py-3 text-sm text-gray-700">{i + 1}</td>

                    {/* O'qituvchi */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {row.teacher?.name ?? "—"}
                    </td>

                    {/* Guruh nomi */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.groups?.name ?? "—"}
                    </td>

                    {/* Fanlar ro'yxati */}
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {row.curriculumSubject &&
                        row.curriculumSubject.length > 0 ? (
                        <ul className="list-disc pl-4">
                          {row.curriculumSubject.map((subject, index) => (
                            <li key={subject.id || index}>
                              {subject.subject?.name ?? "Noma'lum fan"}{" "}
                              <span className="text-xs text-gray-500">
                                ({subject.credit ?? 0} kredit)
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">
                          Fanlar mavjud emas
                        </span>
                      )}
                    </td>

                    {/* Amallar */}
                    <td className="flex justify-end gap-2 px-4 py-3">
                      <button
                        onClick={() => handleAssignClickPut(row.teacher, row)}
                        className="rounded-full p-2 text-green-600 transition-colors hover:bg-green-50"
                        title="Fanlarni yangilash"
                      >
                        <FaLink className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditOldTeacher(row.teacher);
                          setEditNewTeacher(null);
                          setShowEditAssignModal(true);
                        }}
                        className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50"
                        title="O'qituvchini almashtirish"
                      >
                        <MdModeEditOutline className="h-4 w-4" />
                      </button>
                      {/* ❌ Biriktirilgan fanlarni O'CHIRISH */}
                      <button
                        onClick={() => deleteAssignedRow(row.id)}
                        className="rounded-full p-2 text-red-600 transition-colors hover:bg-red-50"
                        title="Biriktirishni o‘chirish"
                      >
                        <MdDelete className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tableTeachers.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                Ma'lumotlar topilmadi
              </div>
            )}
          </div>
        </div>
      </Card>

      {showEditAssignModal && (
        <div className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">

            <button
              onClick={() => setShowEditAssignModal(false)}
              className="absolute right-4 top-4 text-xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="mb-6 text-xl font-bold text-gray-800">
              O‘qituvchini almashtirish
            </h2>

            <p className="mb-4 text-gray-700">
              Hozirgi o‘qituvchi: <b>{editOldTeacher?.name}</b>
            </p>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Yangi o‘qituvchini tanlang
            </label>

            <Select
              // options={teachers.map((t) => ({
              //   value: t.id,
              //   label: t.name,
              // }))}
              options={teacherOptions}
              value={editNewTeacher}
              onChange={setEditNewTeacher}
              placeholder="O‘qituvchini tanlang"
              isSearchable
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditAssignModal(false)}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Bekor qilish
              </button>

              <button
                onClick={updateAssignedTeacher}
                disabled={!editNewTeacher}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 🔗 Fanlarni biriktirish MODAL */}
      {assignModal && (
        <div className="bg-black/40 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
            <button
              onClick={() => {
                setAssignModal(null);
                setSelectedGroup(null);
                setSubjects([]);
                setCheckedSubjects([]);
              }}
              className="absolute right-4 top-4 text-xl text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="mb-6 border-b pb-3 text-xl font-bold text-gray-800">
              {assignModal === "put"
                ? "Fanlarni yangilash: "
                : "Fanlarni biriktirish: "}
              <span className="text-blue-600">{assignTeacher?.name}</span>
            </h2>

            <div className="space-y-4">
              {/* Guruh tanlash */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Guruh
                </label>
                <Select
                  options={groups}
                  value={selectedGroup} // PUT rejimida handleAssignClickPut to'ldiradi
                  onChange={(selected) => {
                    setSelectedGroup(selected);
                    setCheckedSubjects([]);
                    setAllChecked(false);
                  }}
                  isSearchable
                  isClearable
                  placeholder="Guruhni tanlang"
                  className="text-sm"
                />
              </div>

              {/* Fan tanlash */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Fanlar {selectedGroup && `(${subjects.length} ta)`}
                </label>

                {loadingSubjects ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    Fanlar yuklanmoqda...
                  </div>
                ) : !selectedGroup ? (
                  <div className="rounded-lg border py-4 text-center text-sm text-gray-500">
                    Iltimos, avval guruhni tanlang
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="rounded-lg border py-4 text-center text-sm text-gray-500">
                    Ushbu guruhda fanlar topilmadi
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex items-center rounded-lg bg-gray-50 p-2">
                      <input
                        type="checkbox"
                        id="checkAll"
                        checked={allChecked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setAllChecked(checked);
                          setCheckedSubjects(
                            checked ? subjects.map((s) => s.id) : []
                          );
                        }}
                        className="mr-2 h-4 w-4 accent-blue-600"
                      />
                      <label
                        htmlFor="checkAll"
                        className="text-sm font-medium text-gray-700"
                      >
                        Hammasini tanlash{" "}
                        <span className="text-gray-500">
                          ({checkedSubjects.length}/{subjects.length})
                        </span>
                      </label>
                    </div>

                    <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border p-3">
                      {subjects.map((subject) => (
                        <label
                          key={subject.id}
                          className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={checkedSubjects.includes(subject.id)} // ✅ subject.id endi curriculumSubject.id
                            onChange={() => {
                              setCheckedSubjects((prev) =>
                                prev.includes(subject.id)
                                  ? prev.filter((id) => id !== subject.id)
                                  : [...prev, subject.id]
                              );
                            }}
                            className="h-4 w-4 accent-blue-600"
                          />

                          <span className="flex-1 text-sm text-gray-700">
                            {subject.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => {
                  setAssignModal(false);
                  setSelectedGroup(null);
                  setSubjects([]);
                  setCheckedSubjects([]);
                }}
                className="rounded-lg border border-gray-300 px-5 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                onClick={assignSubjectsToTeacher}
                disabled={checkedSubjects.length === 0}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Saqlash ({checkedSubjects.length})
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Teacher;
