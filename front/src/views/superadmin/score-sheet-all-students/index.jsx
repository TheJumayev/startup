import React, { useEffect, useState } from "react";
import Select from "react-select";
import ApiCall from "../../../config/index";

export default function Index() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 INIT (groups + localStorage restore)
  useEffect(() => {
    fetchGroups();

    const saved = localStorage.getItem("score_filter");
    if (saved) {
      const parsed = JSON.parse(saved);

      setSelectedGroup(parsed.group || null);
      setSelectedStudent(parsed.student || null);
      setSelectedSubject(parsed.subject || null);

      if (parsed.group) {
        fetchStudents(parsed.group.value);
        fetchSubjects(parsed.group.raw?.curriculum);
      }
    }
  }, []);

  // 🔥 GROUPS
  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");

      setGroups(
        res.data.map((g) => ({
          value: g.id,
          label: g.name,
          raw: g,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // 🔥 STUDENTS
  const fetchStudents = async (groupId) => {
    if (!groupId) {
      setStudents([]);
      return;
    }

    try {
      const res = await ApiCall(`/api/v1/groups/students/${groupId}`, "GET");

      const list = res?.data || [];

      setStudents(
        list.map((s) => ({
          value: s.id,
          label: s.fullName || `${s.firstName || ""} ${s.lastName || ""}`,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // 🔥 SUBJECTS
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
    } catch (e) {
      console.error(e);
    }
  };

  // 🔁 GROUP CHANGE
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
    setSelectedStudent(null);
    setSelectedSubject(null);

    if (group) {
      fetchStudents(group.value);
      fetchSubjects(group.raw?.curriculum);
    } else {
      setStudents([]);
      setSubjects([]);
    }
  };

  // 🔍 SEARCH
  const handleSearch = async () => {
    try {
      setLoading(true);

      const body = {
        studentId: selectedStudent?.value || null,
        subjectId: selectedSubject?.value || null,
      };

      // 🔥 SAVE FULL STATE
      localStorage.setItem(
        "score_filter",
        JSON.stringify({
          group: selectedGroup,
          student: selectedStudent,
          subject: selectedSubject,
        })
      );

      const res = await ApiCall("/api/v1/score-sheet/filter", "POST", body);
      console.log(res.data);

      setData(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // 🧹 CLEAR
  const handleClear = () => {
    localStorage.removeItem("score_filter");

    setSelectedGroup(null);
    setSelectedStudent(null);
    setSelectedSubject(null);

    setStudents([]);
    setSubjects([]);
    setData([]);
  };

  const handleDeleteScore = async (item) => {
    try {
      if (!window.confirm("Rostdan ham baholarni o‘chirmoqchimisiz?")) return;

      await ApiCall(`/api/v1/score-sheet/fall-student/${item.id}`, "PUT", {
        studentId: item.student?.id,
        subjectId: item.scoreSheetGroup?.curriculumSubject?.id,
      });

      alert("Baholar o‘chirildi ✅");

      // 🔄 qayta yuklash (refresh)
      handleSearch();
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi ❌");
    }
  };

  return (
    <div className="space-y-4 p-6">
      {/* 🔍 FILTER */}
      <div className="grid grid-cols-3 gap-4">
        <Select
          options={groups}
          value={selectedGroup}
          onChange={handleGroupChange}
          placeholder="Guruh tanlang"
          isClearable
        />

        <Select
          options={students}
          value={selectedStudent}
          onChange={setSelectedStudent}
          placeholder="Student tanlang"
          isDisabled={!selectedGroup}
          isClearable
        />

        <Select
          options={subjects}
          value={selectedSubject}
          onChange={setSelectedSubject}
          placeholder="Fan tanlang"
          isDisabled={!selectedGroup}
          isClearable
        />
      </div>

      {/* 🔘 BUTTONS */}
      <div className="flex gap-3">
        <button
          onClick={handleSearch}
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          {loading ? "Qidirilmoqda..." : "Qidirish"}
        </button>

        <button
          onClick={handleClear}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          Tozalash
        </button>
      </div>

      {/* 📊 TABLE */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Student</th>
            <th className="p-2">Fan</th>
            <th className="p-2">Qaydnoma</th>
            <th className="p-2">Mustaqil</th>
            <th className="p-2">Oraliq</th>
            <th className="p-2">Jami</th>
            <th className="p-2">Status</th>
            <th className="p-2">Amallar</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && !loading && (
            <tr>
              <td colSpan="7" className="p-4 text-center">
                Ma'lumot topilmadi
              </td>
            </tr>
          )}

          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2">{item.student?.fullName}</td>
              <td className="p-2">
                {item.scoreSheetGroup?.curriculumSubject?.subject?.name}
              </td>
              <td className="p-2">{item.scoreSheetGroup?.qaytnoma}</td>
              <td className="p-2">{item.mustaqil}</td>
              <td className="p-2">{item.oraliq}</td>
              <td className="p-2">{item.mustaqil + item.oraliq}</td>
              <td className="p-2">{item.isPassed ? "✅" : "❌"}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDeleteScore(item)}
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  Baholarni o'chirish
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
