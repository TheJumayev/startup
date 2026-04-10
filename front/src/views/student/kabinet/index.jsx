import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { useNavigate } from "react-router-dom";

function Index() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await ApiCall(
          `/api/v1/student/account/all/me/${token}`,
          "GET"
        );
        if (res.error === true) {
          localStorage.clear();
          navigate("/student/login");
          return;
        }
        setStudent(res.data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="text-center">
          <div className="border-r-transparent inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600"></div>
          <p className="mt-4 font-medium text-gray-600">
            Ma'lumotlar yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="rounded-2xl bg-white/80 p-10 text-center shadow-2xl backdrop-blur-lg">
          <div className="mb-4 text-6xl">😕</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Ma'lumot topilmadi
          </h2>
          <p className="text-gray-600">Talaba ma'lumotlari mavjud emas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-indigo-100">
          {/* HEADER */}
          <div className="relative bg-gradient-to-r from-indigo-700 to-blue-600 px-8 py-8 text-white">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative">
                <img
                  src={student.image || "/default-avatar.png"}
                  alt={student.fullName}
                  className="h-28 w-28 rounded-full border-4 border-white/40 object-cover shadow-lg"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{student.fullName}</h1>
                <p className="text-lg text-blue-100">{student.specialtyName}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow backdrop-blur-sm">
                    {student.groupName}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow backdrop-blur-sm">
                    {student.educationForm} ta'lim
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm text-white shadow backdrop-blur-sm">
                    {student.paymentForm}
                  </span>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="min-w-24 rounded-xl bg-white/20 p-4 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-2xl font-bold">{student.avgGpa}</div>
                  <div className="text-sm opacity-90">GPA</div>
                </div>
                <div className="min-w-24 rounded-xl bg-white/20 p-4 text-center shadow-sm backdrop-blur-sm">
                  <div className="text-2xl font-bold">
                    {student.totalCredit}
                  </div>
                  <div className="text-sm opacity-90">Kredit</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="p-8">
            {/* 🪪 PASSPORT */}
            <h2 className="mb-5 border-l-4 border-blue-500 pl-3 text-xl font-semibold text-gray-800">
              🪪 Passport ma'lumotlari
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Fuqarolik</p>
                <p className="text-lg font-semibold">{student.citizenship}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Jins</p>
                <p className="text-lg font-semibold">{student.gender}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Tug‘ilgan sana</p>
                <p className="text-lg font-semibold">
                  {new Date(student.birthDate * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Talaba holati</p>
                <p className="text-lg font-semibold">{student.studentStatus}</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Ijtimoiy toifa</p>
                <p className="text-lg font-semibold">
                  {student.socialCategory}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Talaba toifasi</p>
                <p className="text-lg font-semibold">{student.studentType}</p>
              </div>
            </div>

            {/* 🏠 MANZIL */}
            <h2 className="mt-10 mb-5 border-l-4 border-green-500 pl-3 text-xl font-semibold text-gray-800">
              🏠 Manzil ma'lumotlari
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Viloyat</p>
                <p className="text-lg font-semibold">{student.province}</p>
              </div>
              <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Tuman</p>
                <p className="text-lg font-semibold">{student.district}</p>
              </div>
              <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Mahalla</p>
                <p className="text-lg font-semibold">{student.terrain}</p>
              </div>
              {student.currentProvince !== student.province && (
                <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                  <p className="mb-1 text-sm text-gray-500">Joriy viloyat</p>
                  <p className="text-lg font-semibold">
                    {student.currentProvince}
                  </p>
                </div>
              )}
              {student.currentDistrict !== student.district && (
                <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                  <p className="mb-1 text-sm text-gray-500">Joriy tuman</p>
                  <p className="text-lg font-semibold">
                    {student.currentDistrict}
                  </p>
                </div>
              )}
              {student.currentTerrain !== student.terrain && (
                <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                  <p className="mb-1 text-sm text-gray-500">Joriy mahalla</p>
                  <p className="text-lg font-semibold">
                    {student.currentTerrain}
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-green-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Yashash joyi</p>
                <p className="text-lg font-semibold">{student.accommodation}</p>
              </div>
            </div>

            {/* 🎓 TA'LIM */}
            <h2 className="mt-10 mb-5 border-l-4 border-purple-500 pl-3 text-xl font-semibold text-gray-800">
              🎓 Ta'lim ma'lumotlari
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Fakultet</p>
                <p className="text-lg font-semibold">
                  {student.departmentName}
                </p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Mutaxassislik</p>
                <p className="text-lg font-semibold">{student.specialtyName}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Ta'lim turi</p>
                <p className="text-lg font-semibold">{student.educationType}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Ta'lim shakli</p>
                <p className="text-lg font-semibold">{student.educationForm}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">To‘lov shakli</p>
                <p className="text-lg font-semibold">{student.paymentForm}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Kurs</p>
                <p className="text-lg font-semibold">{student.level}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Semestr</p>
                <p className="text-lg font-semibold">{student.semesterName}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">O‘quv yili</p>
                <p className="text-lg font-semibold">{student.educationYear}</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Guruh</p>
                <p className="text-lg font-semibold">{student.groupName}</p>
              </div>
            </div>

            {/* 📊 QO‘SHIMCHA */}
            <h2 className="mt-10 mb-5 border-l-4 border-orange-500 pl-3 text-xl font-semibold text-gray-800">
              📊 Qo‘shimcha ma'lumotlar
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-orange-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Kirish yili</p>
                <p className="text-lg font-semibold">{student.yearOfEnter}</p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-white/70 p-4 shadow-sm hover:shadow-md">
                <p className="mb-1 text-sm text-gray-500">Boshqa ma'lumot</p>
                <p className="text-lg font-semibold">{student.other || "—"}</p>
              </div>
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 transition hover:shadow-md">
                <p className="mb-2 font-semibold text-indigo-700">
                  Hemis sahifasi
                </p>
                <a
                  href={student.validateUrl}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Sahifani ko‘rish</span> →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;
