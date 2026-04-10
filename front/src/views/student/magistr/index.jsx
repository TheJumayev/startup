import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";

function MagistrThemeChooser() {
  const [themes, setThemes] = useState([]);
  const [studentTheme, setStudentTheme] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  const supervisors = [
    { name: "Xalilov Begzod Jobir o'g'li", phone: "+998 99 457 70 24", group: "M1-25 PSI" },
    { name: "Boltayev Shavkat Sharipovich", phone: "+998 91 407 69 02", group: "M1-25 IQT" },
    { name: "Sharopova Zarnigor Tolib qizi", phone: "+998 91 443 10 06", group: "M1-25 BTA" },
    { name: "Axtamov Islom Ilhomovich", phone: "+998 93 653 54 08", group: "M1-25 MUZ" },
    { name: "Abdullayev Amrullo Nasullayevich", phone: "+998 94 125 52 52", group: "M1-25 JIM" },
    { name: "Barotova Muxiba Oripovna", phone: "+998 50 109 06 78", group: "M1-25 O'TA" },
    { name: "Alimova Shamsiya", phone: "+998 91 448 58 82", group: "M1-25 PED" },
    { name: "Qurbonov Abdujalil Muxammedovich", phone: "+998 93 476 06 75", group: "M1-25 LNG" },
    { name: "Qurbonov Abdujalil Muxammedovich", phone: "+998 93 476 06 75", group: "M1-25 LNG (rus tili)" },
    { name: "Qurbonov Abdujalil Muxammedovich", phone: "+998 93 476 06 75", group: "M1-25 LING (nemis tili)" },
  ];

  const [supervisor, setSupervisor] = useState(null);

  useEffect(() => {
    if (student?.group?.name) {
      const found = supervisors.find((s) =>
        student.group.name.toLowerCase().includes(s.group.toLowerCase())
      );
      setSupervisor(found || null);
    }
  }, [student]);


  // 🔹 Student ma’lumotini olish
  const fetchStudentData = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      const studentData = response.data;
      setStudent(studentData);

      if (studentData?.id) {
        fetchStudentTheme(studentData.id, studentData.group?.id);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Talaba ma'lumotlarini yuklashda xatolik yuz berdi");
      setLoading(false);
    }
  };

  // 🔹 Studentning mavzusini tekshirish
  const fetchStudentTheme = async (studentId, groupId) => {
    try {
      const res = await ApiCall(
        `/api/v1/magistr-theme-teacher/me/${studentId}`,
        "GET"
      );

      if (res.data) {
        setStudentTheme(res.data); // allaqachon tanlagan
      } else if (groupId) {
        fetchThemesByGroup(groupId); // tanlamagan → bo‘sh mavzularni ko‘rsatamiz
      } else {
        setError("Guruh ma'lumoti topilmadi");
      }
    } catch (err) {
      console.log("Student theme not found, fetching group themes...");
      if (groupId) fetchThemesByGroup(groupId);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Guruh bo‘yicha mavzularni olish
  const fetchThemesByGroup = async (groupId) => {
    try {
      const res = await ApiCall(
        `/api/v1/magistr-theme-teacher/by-group/${groupId}`,
        "GET"
      );
      const availableThemes = res.data.filter((t) => !t.student);
      setThemes(availableThemes);
    } catch (err) {
      console.error("fetchThemesByGroup error:", err);
      setError("Mavzularni yuklashda xatolik yuz berdi");
    }
  };

  // 🔹 Saqlash
  const handleConfirm = async () => {
    if (!selectedTheme) return;
    try {
      await ApiCall(
        `/api/v1/magistr-theme-teacher/student/${student.id}/${selectedTheme.id}`,
        "PUT",
        {
          teacherName: selectedTheme.teacherName,
          themeName: selectedTheme.themeName,
        }
      );

      setShowModal(false);
      fetchStudentTheme(student.id, student.group?.id);
    } catch (err) {
      console.error("Saqlashda xato:", err);
      setError("Mavzuni saqlashda xatolik yuz berdi");
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h2 className="text-2xl font-bold">Magistr mavzuni tanlash</h2>
            <p className="mt-1 text-blue-100">
              O‘zingizga yoqqan ilmiy mavzuni tanlang.
            </p>

            {student && (
              <p className="mt-3 text-sm text-blue-100">
                <span className="font-semibold">{student.fullName}</span>, siz <span className="font-semibold">{student.group?.name}</span> guruhida tahsil olasiz.
                Ushbu yo‘nalishning rahbari –{" "}
                <span className="font-semibold text-white">
                  {supervisor?.name || "ma’lumot yuklanmoqda..."}
                </span>.
                Agar mavzuni o‘zgartirmoqchi bo‘lsangiz yoki boshqa savollaringiz bo‘lsa,
                quyidagi raqam orqali bog‘lanishingiz mumkin:{" "}
                <span className="underline">{supervisor?.phone}</span>.
              </p>
            )}
          </div>


          <div className="p-6">
            {error && (
              <div className="mb-6 rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                <p className="font-medium text-red-700">{error}</p>
              </div>
            )}

            {studentTheme ? (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-5">
                <h3 className="text-lg font-semibold text-green-800">
                  Siz mavzu tanlagansiz
                </h3>
                <div className="mt-2 border-t border-green-200 pt-4">
                  <p>
                    <span className="font-medium">Mavzu: </span>
                    {studentTheme.themeName}
                  </p>
                  <p>
                    <span className="font-medium">O‘qituvchi: </span>
                    {studentTheme.teacherName}
                  </p>
                </div>
              </div>
            ) : themes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                        №
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                        O‘qituvchi
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                        Mavzu
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-600">
                        Amal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {themes.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{idx + 1}</td>
                        <td className="px-4 py-2">{t.teacherName}</td>
                        <td className="px-4 py-2">{t.themeName}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setSelectedTheme(t);
                              setShowModal(true);
                            }}
                            className="rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                          >
                            Tanlash
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Hozircha mavjud mavzular yo‘q
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTheme && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="border-b p-6">
              <h3 className="text-xl font-semibold">Tasdiqlash</h3>
              <p>Siz tanlagan mavzuni saqlamoqchimisiz?</p>
            </div>
            <div className="p-6">
              <div className="rounded border p-4">
                <p className="font-medium">{selectedTheme.teacherName}</p>
                <p>{selectedTheme.themeName}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t p-6">
              <button
                onClick={() => setShowModal(false)}
                className="rounded border px-5 py-2"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleConfirm}
                className="rounded bg-blue-600 px-5 py-2 text-white"
              >
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MagistrThemeChooser;
