import React, { useState, useEffect } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import Breadcrumbs from "views/BackLink/BackButton";

function TestUpload() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [testContent, setTestContent] = useState("");
  const [subjectTests, setSubjectTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const navigate = useNavigate();

  // Fanlarni olish
  const fetchSubjects = async () => {
    try {
      const response = await ApiCall("/api/v1/student-subject/subjects", "GET");
      console.log(response.data);

      if (response.data) {
        const subjectsArray = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setSubjects(subjectsArray);
        setFilteredSubjects(subjectsArray);
      }
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Fanlarni olishda xatolik!");
    }
  };

  const updateSubjects = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        "/api/v1/student-subject/create-subject",
        "GET"
      );
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Fanlarni olishda xatolik!");
    } finally {
      setLoading(false);
      fetchSubjects();
    }
  };

  // Qidiruvni boshqarish
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredSubjects(subjects);
    } else {
      const filtered = subjects.filter((subject) =>
        subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubjects(filtered);
    }
  }, [searchTerm, subjects]);

  // Ma’lum bir fan testlarini olish
  const fetchSubjectTests = async (subjectId) => {
    try {
      const response = await ApiCall(
        `/api/v1/test-temporary-subject/${subjectId}`,
        "GET"
      );
    } catch (error) {
      console.error("Testlarni olishda xatolik:", error);
    }
  };

  // Modalni ochish
  const openTestModal = (subject) => {
    navigate(`/superadmin/test-upload/${subject.id}`);
  };

  // Modalni yopish
  const closeTestModal = () => {
    setShowModal(false);
    setSelectedSubject(null);
    setTestContent("");
  };

  const handleSubmitTest = async () => {
    if (!testContent.trim()) {
      toast.error("Test matnini kiriting!");
      return;
    }

    setButtonLoading(true);
    try {
      // ✅ Body orqali yuboriladi
      await ApiCall(
        `/api/v1/test-temporary-subject/test-form/${selectedSubject.id}`,
        "POST",
        testContent, // body sifatida yuboramiz
        { headers: { "Content-Type": "text/plain" } } // string yuborilyapti
      );

      toast.success("Test muvaffaqiyatli yuklandi!");
      closeTestModal();
      fetchSubjectTests(selectedSubject.id);
    } catch (error) {
      console.error("Test yuklashda xatolik:", error);
      toast.error("Test yuklanmadi!");
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="p-6">
      <ToastContainer />
      {loading && <LoadingOverlay />}
      <Breadcrumbs />
      <h1 className="mb-6 text-2xl font-bold">Test yuklash sahifasi</h1>

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            onClick={updateSubjects}
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Fanlarni yangilash
          </button>
          <span className="flex items-center text-gray-600">
            Jami {filteredSubjects.length} ta fan
          </span>
        </div>

        {/* Qidiruv inputi */}
        <div className="relative w-full md:w-64">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Fan nomi bo'yicha qidirish..."
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <svg
                className="h-4 w-4 text-gray-500 hover:text-gray-700"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Fanlar jadvali */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b py-3 px-4 text-left">№</th>
              <th className="border-b py-3 px-4 text-left">Fan nomi</th>
              <th className="border-b py-3 px-4 text-left">Yaratilgan sana</th>
              <th className="border-b py-3 px-4 text-left">Soni</th>
              <th className="border-b py-3 px-4 text-left">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject, index) => (
                <tr
                  key={subject.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    navigate(`/superadmin/test-upload/${subject.id}`)
                  }
                >
                  <td className="border-b py-3 px-4">{index + 1}</td>
                  <td className="border-b py-3 px-4">{subject.subjectName}</td>
                  <td className="border-b py-3 px-4">
                    {new Date(subject.created).toLocaleDateString()}
                  </td>
                  <td className="border-b py-3 px-4">
                    {subject.testCount || 0} ta
                  </td>
                  <td className="border-b py-3 px-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTestModal(subject);
                      }}
                      className={`rounded-md px-3 py-1 text-white transition-colors 
    ${
      subject.testCount === 0
        ? "bg-red-600 hover:bg-red-700" // agar testCount = 0 bo‘lsa
        : "bg-green-600 hover:bg-green-700" // aks holda
    }`}
                    >
                      Test yuklash
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                  {searchTerm
                    ? "Hech qanday fan topilmadi"
                    : "Fanlar mavjud emas"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Test yuklash modali */}
      {showModal && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            {/* X tugmasi */}
            <button
              onClick={closeTestModal}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold">
                Test yuklash: {selectedSubject.subjectName}
              </h2>

              <div className="mb-4">
                <p className="mb-2 text-sm text-gray-600">
                  Test formati: har bir savol bloki <b>+++++</b> bilan
                  ajratiladi, savol va javoblar <b>====</b> bilan ajratiladi,
                  to'g'ri javob
                  <b> # </b> belgisi bilan boshlanishi kerak.
                </p>
                <textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder={`Misol:
+++++
Savol 1
====
# To'g'ri javob
Noto'g'ri javob 1
Noto'g'ri javob 2
Noto'g'ri javob 3`}
                  className="h-64 w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeTestModal}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={buttonLoading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {buttonLoading ? "Yuklanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestUpload;
