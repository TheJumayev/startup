import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config/index";

function StudentDetail() {
  const { studentId } = useParams();
  const [student, setStudent] = useState({});
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [examDetails, setExamDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, []);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/byid/${studentId}`,
        "GET",
        null,
        null,
        true
      );
      setStudent(response.data);
      await fetchExam(response.data?.group?.id);
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExam = async (groupId) => {
    try {
      const response = await ApiCall(
        `/api/v1/exam/${groupId}`,
        "GET",
        null,
        null,
        true
      );
      setExams(response.data);
      response.data.forEach((exam) => {
        handleExamSelect(exam.id);
      });
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const handleExamSelect = async (examId) => {
    setSelectedExam(examId === selectedExam ? null : examId);

    if (examId !== selectedExam) {
      try {
        const response = await ApiCall(
          `/api/v1/exam/student-status/${examId}/${studentId}`,
          "GET",
          null,
          null,
          true
        );
        setExamDetails((prevDetails) => ({
          ...prevDetails,
          [examId]: response.data,
        }));
      } catch (error) {
        console.error("Error fetching exam details:", error);
      }
    }
  };

  const uploadImage = async (image, prefix) => {
    const formData = new FormData();
    formData.append("photo", image);
    formData.append("prefix", prefix);

    try {
      const response = await ApiCall(
        "/api/v1/file/upload",
        "POST",
        formData,
        null,
        true
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleChangeStudentImage = async () => {
    if (imageFile) {
      try {
        const prefix = "/" + student.group?.name || "student";
        const mainPhotoUuid = await uploadImage(imageFile, prefix);

        const response = await ApiCall(
          `/api/v1/student/${studentId}/${mainPhotoUuid}`,
          "POST",
          null,
          null,
          true
        );
        setStudent(response.data);
        setImageFile(null);
      } catch (error) {
        console.error("Error updating student image:", error);
      }
    }
  };

  const getStatusColor = (status, isCondition) => {
    if (!status) return "bg-gray-100 text-gray-600";
    return isCondition
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  const getStatusText = (status, isCondition) => {
    if (!status) return "Kutilmoqda";
    return isCondition ? "Qabul qilindi" : "Rad etildi";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Student Profile Section */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6">
            <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
              <div className="relative">
                <img
                  src={
                    student.imageFile
                      ? `${baseUrl}/api/v1/file/getFile/${student.imageFile.id}`
                      : student.image || "/default-avatar.png"
                  }
                  alt={student.fullName}
                  className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-blue-500 p-2 transition-colors hover:bg-blue-600">
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    accept="image/*"
                  />
                  <svg
                    className="h-4 w-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>

              <div className="text-center text-white md:text-left">
                <h1 className="text-2xl font-bold">{student.fullName}</h1>
                <p className="text-blue-100">
                  Talaba ID: {student.studentIdNumber}
                </p>
                <p className="text-blue-100">
                  {student.group?.name} • {student.group?.departmentName}
                </p>
              </div>

              {imageFile && (
                <button
                  onClick={handleChangeStudentImage}
                  className="ml-auto rounded-lg bg-white px-6 py-2 font-semibold text-blue-600 shadow-md transition-colors hover:bg-blue-50"
                >
                  Rasmni yangilash
                </button>
              )}
            </div>
          </div>

          {/* Student Information */}
          <div className="p-6">
            <h2 className="mb-6 border-b pb-2 text-xl font-semibold text-gray-800">
              Talaba ma'lumotlari
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3">
                <InfoItem label="To'liq ismi" value={student.fullName} />
                <InfoItem
                  label="Talaba ID raqami"
                  value={student.studentIdNumber}
                />
                <InfoItem label="Kurs" value={student.level} />
              </div>

              <div className="space-y-3">
                <InfoItem label="Semestr" value={student.semesterName} />
                <InfoItem label="Ta'lim turi" value={student.educationalType} />
                <InfoItem label="Guruh nomi" value={student.group?.name} />
              </div>

              <div className="space-y-3">
                <InfoItem
                  label="Bo'lim nomi"
                  value={student.group?.departmentName}
                />
                <InfoItem
                  label="Mutaxassislik nomi"
                  value={student.group?.specialtyName}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exams Table Section */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Imtihonlar jadvali
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Talabaning barcha imtihonlari va ularning holatlari
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Imtihon nomi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Davomat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kontrakt
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Baholari
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {exams.length > 0 ? (
                  exams.map((exam, index) => (
                    <ExamRow
                      key={exam.id}
                      exam={exam}
                      index={index}
                      examDetails={examDetails}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 14l9-5-9-5-9 5 9 5zm0 0l9-5-9-5-9 5 9 5z"
                          />
                        </svg>
                        <p className="mt-2 text-sm font-medium">
                          Imtihonlar topilmadi
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-base font-semibold text-gray-900">
      {value || "Ma'lumot yo'q"}
    </p>
  </div>
);

const ExamRow = ({ exam, index, examDetails }) => {
  const details = examDetails[exam.id];

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru-RU"),
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const startTime = formatDateTime(exam.startTime);
  const endTime = formatDateTime(exam.endTime);

  const getStatusBadge = (value, isCondition) => {
    if (!value)
      return (
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          Kutilmoqda
        </span>
      );
    return (
      <span
        className={`rounded-full px-2 py-1 text-xs ${
          isCondition
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {value} {isCondition ? "✅" : "❌"}
      </span>
    );
  };

  return (
    <tr className="transition-colors hover:bg-gray-50">
      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
        {index + 1}
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
        {exam.subjectName}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        {getStatusBadge(details?.attendance, details?.isAttendance)}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        {getStatusBadge(details?.contract, details?.isContract)}
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        {getStatusBadge(details?.grade, details?.isGrade)}
      </td>
    </tr>
  );
};

export default StudentDetail;
