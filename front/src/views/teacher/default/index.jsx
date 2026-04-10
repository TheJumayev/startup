import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAdmin();
  }, []);

  const getAdmin = async () => {
    try {
      const response = await ApiCall("/api/v1/auth/decode", "GET", null);
      setAdmin(response.data);
      getSubjects(response.data.id);
    } catch (error) {
      navigate("/admin/login");
      console.error("Error fetching account data:", error);
    }
  };

  const getSubjects = async (teacherId) => {
    try {
      const response = await ApiCall(
        `/api/v1/teacher-curriculum-subject/teacher/${teacherId}`,
        "GET",
        null
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // umumiy statistika
  const totalGroups = subjects.length;
  const totalSubjects = subjects.reduce(
    (sum, g) => sum + g.curriculumSubject.length,
    0
  );
  const totalAcload = subjects
    .flatMap((g) => g.curriculumSubject)
    .reduce((sum, subj) => sum + (subj.totalAcload || 0), 0);

  return (
    <div className="p-2">
      <h2 className="mb-6 text-2xl font-bold text-navy-800">
        {admin?.name} — O‘qituvchi Bosh sahifasi
      </h2>

      {/* Statistikalar */}
      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-blue-300 bg-blue-100 p-4 text-center shadow">
          <h3 className="text-lg font-semibold">Guruhlar soni</h3>
          <p className="text-2xl font-bold text-blue-700">{totalGroups}</p>
        </div>
        <div className="rounded-xl border border-green-300 bg-green-100 p-4 text-center shadow">
          <h3 className="text-lg font-semibold">Fanlar soni</h3>
          <p className="text-2xl font-bold text-green-700">{totalSubjects}</p>
        </div>
        <div className="rounded-xl border border-purple-300 bg-purple-100 p-4 text-center shadow">
          <h3 className="text-lg font-semibold">Umumiy yuklama</h3>
          <p className="text-2xl font-bold text-purple-700">
            {totalAcload} soat
          </p>
        </div>
      </div>

      {/* Guruhlar va fanlar */}
      {subjects.map((group, i) => (
        <div
          key={group.id}
          className="mb-6 w-full  rounded-t-2xl border border-gray-200"
        >
          <div className="">
            <div className="flex items-center justify-between rounded-t-2xl border-b bg-gray-50 p-4">
              <div>
                <h3 className="text-lg font-bold text-blue-800">
                  {group.groups.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.groups.specialtyName} — {group.groups.departmentName}
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {group.groups.createAt?.split("T")[0]}
              </span>
            </div>

            <div className="overflow-x-auto ">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-left text-sm text-gray-700">
                    <th className="border p-2">#</th>
                    <th className="border p-2">Fan nomi</th>
                    <th className="border p-2">Kredit</th>
                    <th className="border p-2">Yuklama (soat)</th>
                    <th className="border p-2">Kafedra</th>
                  </tr>
                </thead>
                <tbody>
                  {group.curriculumSubject.map((subj, idx) => (
                    <tr
                      key={subj.id}
                      className="text-sm text-gray-800 hover:bg-gray-50"
                    >
                      <td className="border p-2">{idx + 1}</td>
                      <td className="border p-2">{subj.subject.name}</td>
                      <td className="border p-2 text-center">{subj.credit}</td>
                      <td className="border p-2 text-center">
                        {subj.totalAcload || 0}
                      </td>
                      <td className="border p-2">
                        {subj.department?.name?.replace(/['"]/g, "")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
