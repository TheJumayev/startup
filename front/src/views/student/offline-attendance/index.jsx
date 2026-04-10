import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  ChevronRight,
  Loader2,
  AlertCircle,
  Users,
  Calendar as CalendarIcon,
  GraduationCap,
  Building,
  RefreshCw,
  Home,
  HelpCircle,
} from "lucide-react";

const TestPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState(null);
  const [scheduleList, setScheduleList] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/student/login");
      return;
    }
    // Avval talaba ma’lumotini olib kelamiz
    fetchStudentAccount(token);
  }, [navigate]);

  const fetchStudentAccount = async (token) => {
    try {
      const res = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      if (res.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
    } catch (err) {
      console.error("Talaba ma’lumotini olishda xato:", err);
      navigate("/student/login");
    }
  };
  /* ===============================
     INITIAL SETUP
  =============================== */
  useEffect(() => {
    // Bugungi sana
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setTodayDate(today.toLocaleDateString("uz-UZ", options));

    // Vaqtni yangilash
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    if (!token) {
      navigate("/student/login");
      return;
    }

    fetchStudentData(token);

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []);

  /* ===============================
     STUDENT MA'LUMOTLARI
  =============================== */
  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );

      const studentData = response?.data;
      if (!studentData) throw new Error("Talaba topilmadi");

      setStudent(studentData);

      if (studentData?.group?.id) {
        await fetchSchedule(studentData.group.id);
      }
    } catch (error) {
      console.error(error);
      toast.error("Avtorizatsiya xatoligi");
      navigate("/student/login");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     DARS JADVALI
  =============================== */
  const fetchSchedule = async (groupId) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/schedule-list-controller/group/${groupId}`,
        "GET"
      );
      setScheduleList(response?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Dars jadvalini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     VAQTNI FORMATLASH
  =============================== */
  const formatTime = (time) => {
    if (!time) return "-";
    return time.length === 5 ? time : time.slice(0, 5);
  };

  /* ===============================
     DARS TURI RANGI
  =============================== */
  const getLessonTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower.includes("lab") || typeLower.includes("laboratoriya"))
      return "bg-purple-100 text-purple-700 border-purple-200";
    if (typeLower.includes("lecture") || typeLower.includes("ma'ruza"))
      return "bg-blue-100 text-blue-700 border-blue-200";
    if (typeLower.includes("practice") || typeLower.includes("amaliy"))
      return "bg-green-100 text-green-700 border-green-200";
    if (typeLower.includes("seminar"))
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  /* ===============================
     DARS TARI UZBEKCHA
  =============================== */
  const getLessonTypeUzbek = (type) => {
    const typeLower = type?.toLowerCase() || "";
    if (typeLower.includes("lab") || typeLower.includes("laboratoriya"))
      return "Laboratoriya";
    if (typeLower.includes("lecture") || typeLower.includes("ma'ruza"))
      return "Ma'ruza";
    if (typeLower.includes("practice") || typeLower.includes("amaliy"))
      return "Amaliy mashg'ulot";
    if (typeLower.includes("seminar")) return "Seminar";
    return type || "Noma'lum";
  };

  /* ===============================
     YUKLANMOQDA UI
  =============================== */
  if (loading) {
    return (
      <div className="from-slate-50 flex min-h-screen items-center justify-center bg-gradient-to-br to-blue-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-800">
            Ma'lumotlar yuklanmoqda
          </h3>
          <p className="text-gray-500">
            Iltimos, dars jadvali yuklanishini kuting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="from-slate-50 min-h-screen bg-gradient-to-br via-white to-blue-50 p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sarlavha */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-xl">
        <div className="flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 flex items-center text-2xl font-bold md:text-3xl">
              <Calendar className="mr-3 h-8 w-8" />
              Bugungi dars jadvali
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{todayDate}</span>
              </div>
              {student?.group && (
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Guruh: {student.group.name}</span>
                </div>
              )}
            </div>
          </div>

          {student && (
            <div className="mt-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:mt-0">
              <div className="flex items-center">
                <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{student.fullName}</h3>
                  <p className="text-sm text-blue-100">
                    Talaba ID: {student.studentIdNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistikalar */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-5 shadow-lg transition-transform hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="mr-4 rounded-lg bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Jami darslar</p>
              <p className="text-2xl font-bold text-gray-800">
                {scheduleList.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-lg transition-transform hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="mr-4 rounded-lg bg-green-100 p-3">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hozirgi vaqt</p>
              <p className="text-2xl font-bold text-gray-800">{currentTime}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-lg transition-transform hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="mr-4 rounded-lg bg-amber-100 p-3">
              <MapPin className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Auditoriyalar</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  [
                    ...new Set(scheduleList.map((item) => item.auditoriumName)),
                  ].filter(Boolean).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-lg transition-transform hover:scale-[1.02]">
          <div className="flex items-center">
            <div className="mr-4 rounded-lg bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">O'qituvchilar</p>
              <p className="text-2xl font-bold text-gray-800">
                {
                  [
                    ...new Set(scheduleList.map((item) => item.employeeName)),
                  ].filter(Boolean).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asosiy kontent */}
      <div className="rounded-2xl bg-white shadow-xl">
        <div className="border-b border-gray-100 p-6">
          <div className="flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h2 className="mb-2 flex items-center text-xl font-bold text-gray-800">
                <Clock className="mr-3 h-6 w-6 text-blue-600" />
                Bugungi darslar
              </h2>
              <p className="text-gray-500">
                Har qanday fanga bosib davomatni ko'ring
              </p>
            </div>
            <button
              onClick={() => {
                if (student?.group?.id) fetchSchedule(student.group.id);
              }}
              className="mt-4 flex items-center justify-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 md:mt-0"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yangilash
            </button>
          </div>
        </div>

        <div className="p-6">
          {scheduleList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <AlertCircle className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                Bugun darslar yo'q
              </h3>
              <p className="text-gray-500">
                Dam olish kuningizdan bahramand bo'ling! 📭
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scheduleList.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-lg"
                >
                  {/* Dars vaqti */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <span className="font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center font-mono">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <span className="font-bold text-blue-600">
                            {formatTime(item.start_time)}
                          </span>
                          <span className="mx-2 text-gray-300">–</span>
                          <span className="font-medium text-gray-700">
                            {formatTime(item.end_time)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.lessonPairName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fan nomi */}
                  <div className="mb-4">
                    <Link
                      to={"/student/group-offline-davomat/" + item.id}
                      className="group-hover:text-blue-600"
                    >
                      <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors">
                        {item.subject?.name || "Fan nomi ko'rsatilmagan"}
                        <ChevronRight className="ml-1 inline h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </h3>
                    </Link>
                    {item.subject?.code && (
                      <p className="text-sm text-gray-500">
                        Fan kodi: {item.subject.code}
                      </p>
                    )}
                  </div>

                  {/* O'qituvchi va auditoriya */}
                  <div className="mb-4 space-y-3">
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.employeeName || "O'qituvchi ko'rsatilmagan"}
                        </p>
                        {item.employeeId && (
                          <p className="text-xs text-gray-500">
                            ID: {item.employeeId}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                        <Building className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.auditoriumName || "Auditoriya ko'rsatilmagan"}
                        </p>
                        {item.auditoriumCode && (
                          <p className="text-xs text-gray-500">
                            Kodi: {item.auditoriumCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dars turi va harakatlar */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getLessonTypeColor(
                        item.trainingTypeName
                      )}`}
                    >
                      {getLessonTypeUzbek(item.trainingTypeName)}
                    </span>

                    <Link
                      to={"/student/group-offline-davomat/" + item.id}
                      className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
                    >
                      Davomatni ko'rish
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Qo'shimcha ma'lumotlar */}
      <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <h4 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
              <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
              Dars turlari
            </h4>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="mr-3 h-3 w-3 rounded-full bg-blue-500"></div>
                <div>
                  <span className="font-medium text-gray-700">Ma'ruza</span>
                  <p className="text-sm text-gray-500">
                    Asosiy nazariy bilimlar
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-3 w-3 rounded-full bg-green-500"></div>
                <div>
                  <span className="font-medium text-gray-700">
                    Amaliy mashg'ulot
                  </span>
                  <p className="text-sm text-gray-500">
                    Amaliy ko'nikmalarni rivojlantirish
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 h-3 w-3 rounded-full bg-purple-500"></div>
                <div>
                  <span className="font-medium text-gray-700">
                    Laboratoriya
                  </span>
                  <p className="text-sm text-gray-500">
                    Tajriba va eksperimentlar
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
              <Clock className="mr-2 h-5 w-5 text-blue-600" />
              Tezkor harakatlar
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="flex w-full items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <RefreshCw className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Dars jadvalini yangilash
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </button>

              <Link
                to="/student/dashboard"
                className="flex w-full items-center justify-between rounded-lg bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Home className="mr-3 h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-700">
                    Bosh sahifaga qaytish
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 flex items-center text-lg font-semibold text-gray-800">
              <HelpCircle className="mr-2 h-5 w-5 text-blue-600" />
              Yordam kerakmi?
            </h4>
            <p className="mb-3 text-gray-600">
              Dars jadvali yoki davomat bilan bog'liq savollaringiz bo'lsa,
              guruh mas'ulingizga yoki ma'muriyatga murojaat qiling.
            </p>
            <div className="rounded-lg bg-white/50 p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Telefon:</span> +998 (XX)
                XXX-XX-XX
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> info@university.uz
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Universitet Dars Jadvali Tizimi. Barcha
        huquqlar himoyalangan.
      </div>
    </div>
  );
};

export default TestPage;
