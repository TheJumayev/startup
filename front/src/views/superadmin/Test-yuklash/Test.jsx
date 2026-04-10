import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

function Test() {
  const { id } = useParams();
  console.log(id);

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState([]);
  const curriculumSubjectId = useLocation().state?.curriculumSubjectId;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [testContent, setTestContent] = useState("");

  // Testlarni olish
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/test-curriculum-subject/test/${curriculumSubjectId ? curriculumSubjectId : id}`,
        "GET"
      );
      console.log(response);

      setTests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Testlarni olishda xatolik:", error);
      toast.error("Testlarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Test qo‘shish
  const handleSubmitTest = async () => {
    if (!testContent.trim()) {
      toast.error("Test matnini kiriting!");
      return;
    }
    setLoading(true);
    try {
      await ApiCall(
        `/api/v1/test-curriculum-subject/test-form/${curriculumSubjectId ? curriculumSubjectId : id}`,
        "POST",
        { test: testContent }, // JSON object
        null
      );

      toast.success("Test muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      setTestContent("");
      fetchTests();
    } catch (error) {
      console.error("Test yuklashda xatolik:", error);
      toast.error("Test yuklanmadi!");
    } finally {
      setLoading(false);
    }
  };

  // Testni o‘chirish
  const deleteTest = async (curriculumSubjectId) => {
    try {
      await ApiCall(`/api/v1/test-curriculum-subject/${curriculumSubjectId ? curriculumSubjectId : id}`, "DELETE");
      toast.success("Test muvaffaqiyatli o‘chirildi!");
      fetchTests();
    } catch (error) {
      console.error("O‘chirishda xatolik:", error);
      toast.error("Testni o‘chirishda xatolik!");
    }
  };

  useEffect(() => {
    fetchTests();
  }, [curriculumSubjectId]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumbs
        items={[{ label: "Test yuklanadigan fanlar", to: "/superadmin/tests" }]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testlar ro‘yxati</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Yangi test qo‘shish
        </button>
      </div>

      {/* Testlar jadvali */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full border border-gray-200 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b py-3 px-4 text-left">№</th>
              <th className="border-b py-3 px-4 text-left">Savol</th>
              <th className="border-b py-3 px-4 text-left">A)</th>
              <th className="border-b py-3 px-4 text-left">B)</th>
              <th className="border-b py-3 px-4 text-left">C)</th>
              <th className="border-b py-3 px-4 text-left">D)</th>
              <th className="border-b py-3 px-4 text-left">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {tests.length > 0 ? (
              tests.map((test, index) => (
                <tr key={test.id} className="hover:bg-gray-50">
                  <td className="border-b py-3 px-4">{index + 1}</td>
                  <td className="border-b py-3 px-4">{test.question}</td>
                  <td className="border-b py-3 px-4 text-green-600">
                    {test.answer1}
                  </td>
                  <td className="border-b py-3 px-4">{test.answer2}</td>
                  <td className="border-b py-3 px-4">{test.answer3}</td>
                  <td className="border-b py-3 px-4">{test.answer4}</td>
                  <td className="border-b py-3 px-4">
                    <button
                      onClick={() => deleteTest(test.id)}
                      className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  Testlar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Test qo‘shish modali */}
      {showModal && (
        <div className="bg-black fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <div className="p-6">
              <h2 className="mb-4 text-xl font-bold">Yangi test qo‘shish</h2>
              <p className="mb-2 text-sm text-gray-600">
                Test formati: har bir savol bloki <b>+++++</b> bilan ajratiladi,
                savol va javoblar <b>====</b> bilan ajratiladi, to‘g‘ri javob
                <b> # </b> belgisi bilan boshlanishi kerak.
              </p>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder={`Misol:
+++++
Savol 1
====
# To‘g‘ri javob
Noto‘g‘ri javob 1
Noto‘g‘ri javob 2
Noto‘g‘ri javob 3`}
                className="h-64 w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleSubmitTest}
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Yuklanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Test;
