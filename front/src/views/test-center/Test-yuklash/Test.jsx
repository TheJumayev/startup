import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import ApiCall from "../../../config";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

function Test() {
  const { id } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState([]);
  const curriculumSubjectId = useLocation().state?.curriculumSubjectId;
  const [editModal, setEditModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    correctAnswer: "",
    answer1: "",
    answer2: "",
    answer3: ""
  });
  const openEditModal = (test) => {
    setSelectedTest(test);
    setFormData({
      question: test.question,
      correctAnswer: test.answer1, // to'g'ri javob doimo answer1
      answer1: test.answer2,
      answer2: test.answer3,
      answer3: test.answer4
    });
    setEditModal(true);
  };
  const handleEditSave = async () => {
    try {
      await ApiCall(
        `/api/v1/test-curriculum-subject/test-one/${selectedTest.id}`,
        "PUT",
        formData
      );
      toast.success("Test muvaffaqiyatli tahrirlandi!");
      setEditModal(false);
      fetchTests();
    } catch (e) {
      toast.error("Tahrirlashda xatolik!");
    }
  };

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

  // Test qo'shish
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

  // Testni o'chirish
  const deleteTest = async (curriculumSubjectId) => {
    try {
      await ApiCall(
        `/api/v1/test-curriculum-subject/${curriculumSubjectId}`,
        "DELETE"
      );
      toast.success("Test muvaffaqiyatli o'chirildi!");
      fetchTests();
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      toast.error("Testni o'chirishda xatolik!");
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
        items={[
          {
            label: "Test yuklanadigan fanlar",
            to: "/test-center/curriculums-subject",
          },
        ]}
      />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Testlar ro'yxati</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Yangi test qo'shish
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
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded-md bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-700"
                        onClick={() => openEditModal(test)}
                      >
                        Tahrirlash
                      </button>

                      <button
                        onClick={() => deleteTest(test.id)}
                        className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        O'chirish
                      </button>
                    </div>
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
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-lg p-6 relative">
            <button
              onClick={() => setEditModal(false)}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Testni tahrirlash</h2>

            <div className="flex flex-col gap-3">

              {/* Savol */}
              <div>
                <label className="text-sm font-semibold">Savol:</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Savolni kiriting"
                  className="border p-2 rounded w-full mt-1"
                />
              </div>

              {/* A - to'g'ri javob */}
              <div>
                <label className="text-sm font-semibold text-green-700">A) To'g'ri javob:</label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, correctAnswer: e.target.value })
                  }
                  placeholder="To'g'ri javob (A)"
                  className="border p-2 rounded w-full mt-1"
                />
              </div>

              {/* B */}
              <div>
                <label className="text-sm font-semibold">B) Xato javob:</label>
                <input
                  type="text"
                  value={formData.answer1}
                  onChange={(e) => setFormData({ ...formData, answer1: e.target.value })}
                  placeholder="Xato javob (B)"
                  className="border p-2 rounded w-full mt-1"
                />
              </div>

              {/* C */}
              <div>
                <label className="text-sm font-semibold">C) Xato javob:</label>
                <input
                  type="text"
                  value={formData.answer2}
                  onChange={(e) => setFormData({ ...formData, answer2: e.target.value })}
                  placeholder="Xato javob (C)"
                  className="border p-2 rounded w-full mt-1"
                />
              </div>

              {/* D */}
              <div>
                <label className="text-sm font-semibold">D) Xato javob:</label>
                <input
                  type="text"
                  value={formData.answer3}
                  onChange={(e) => setFormData({ ...formData, answer3: e.target.value })}
                  placeholder="Xato javob (D)"
                  className="border p-2 rounded w-full mt-1"
                />
              </div>

            </div>


            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 border rounded"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 rounded text-white"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Test qo'shish modali */}
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
              <h2 className="mb-4 text-xl font-bold">Yangi test qo'shish</h2>
              <p className="mb-2 text-sm text-gray-600">
                Test formati: har bir savol bloki <b>+++++</b> bilan ajratiladi,
                savol va javoblar <b>====</b> bilan ajratiladi, to'g'ri javob
                <b> # </b> belgisi bilan boshlanishi kerak. <br />
                <b>Misol:</b>
              </p>
              <textarea
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
                placeholder={`Savol 1
====
# To'g'ri javob
====
Noto'g'ri javob 1
====
Noto'g'ri javob 2
====
Noto'g'ri javob 3
+++++
Savol 2
==== ...`}
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
