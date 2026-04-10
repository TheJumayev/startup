import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  EyeOff,
  X,
  Check,
  FileText,
  BookOpen,
  ChevronRight,
  ListOrdered,
  Save,
  Filter,
} from "lucide-react";
import ApiCall, { baseUrl } from "../../../config";

const emptyTest = {
  question: "",
  correct: "",
  w1: "",
  w2: "",
  w3: "",
};

function Lessons() {
  const { id } = useParams();
  const [teacherId, setTeacherId] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(false);
  const [mustaqil, setMustaqil] = useState([]);
  const [pdf, setPdf] = useState(null);
  const [editId, setEditId] = useState(null);
  const isEdit = Boolean(editId);
  const [errors, setErrors] = useState({});
  const [testActive, setTestActive] = useState(false);
  const [testEditOpen, setTestEditOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [position, setPosition] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTests, setEditingTests] = useState([]);
  const [isAmaliy, setIsAmaliy] = useState(false); // ✅ YANGI
  const [sortConfig, setSortConfig] = useState({
    key: "position",
    direction: "asc",
  });
  const openAllTestsEdit = (tests) => {
    setEditingTests(
      tests.map((t) => ({
        id: t.id,
        question: t.question,
        answer: t.answer1,
        wrongAnswer1: t.answer2,
        wrongAnswer2: t.answer3,
        wrongAnswer3: t.answer4,
      }))
    );
    setTestEditOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await ApiCall(`/api/v1/mustaqil-talim-create/${id}`, "DELETE");
      toast.success("✅ Mavzu o‘chirildi");
      fetchMustaqil(); // jadvalni yangilash
    } catch (err) {
      console.error(err);
      toast.error("❌ Mavzuni o‘chirishda xatolik");
    }
  };

  useEffect(() => {
    if (isAmaliy) {
      setTestActive(false);
      setTests(Array.from({ length: 5 }, () => ({ ...emptyTest })));
    }
  }, [isAmaliy]);

  // Fayl yuklab olish funksiyasi
  const downloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Server faylni qaytarmadi");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);
      alert("❌ Faylni yuklab bo'lmadi");
    }
  };

  // Test tahrirlashni ochish
  const openTestEdit = (test) => {
    setEditingTest({
      id: test.id,
      question: test.question,
      answer: test.answer1,
      wrongAnswer1: test.answer2,
      wrongAnswer2: test.answer3,
      wrongAnswer3: test.answer4,
    });
    setTestEditOpen(true);
  };

  // Test tahrirlashni yuborish
  const handleAllTestsSave = async () => {
    try {
      for (const test of editingTests) {
        await ApiCall(
          `/api/v1/mustaqil-talim-create/test-edit/${test.id}`,
          "PUT",
          {
            question: test.question,
            answer: test.answer,
            wrongAnswer1: test.wrongAnswer1,
            wrongAnswer2: test.wrongAnswer2,
            wrongAnswer3: test.wrongAnswer3,
          }
        );
      }

      setTestEditOpen(false);
      setEditingTests([]);
      fetchMustaqil();
    } catch (err) {
      console.error(err);
      alert("❌ Testlarni saqlashda xatolik");
    }
  };

  // Form validatsiyasi
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Mavzu nomi majburiy";
    if (!isEdit && !pdf) {
      newErrors.pdf = "PDF fayl majburiy";
    }
    if (!isEdit && !isAmaliy) {
      tests.forEach((t, index) => {
        if (
          !t.question.trim() ||
          !t.correct.trim() ||
          !t.w1.trim() ||
          !t.w2.trim() ||
          !t.w3.trim()
        ) {
          newErrors[`test-${index}`] = `Test ${
            index + 1
          } to'liq to'ldirilmagan`;
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Testlar holati
  const [tests, setTests] = useState(
    Array.from({ length: 5 }, () => ({ ...emptyTest }))
  );

  // Backend testlarini input formatiga o'girish
  const mapBackendTestsToInputs = (backendTests) => {
    if (!backendTests || backendTests.length === 0) {
      return Array.from({ length: 5 }, () => ({ ...emptyTest }));
    }

    const mapped = backendTests.map((t) => ({
      question: t.question || "",
      correct: t.answer1 || "",
      w1: t.answer2 || "",
      w2: t.answer3 || "",
      w3: t.answer4 || "",
    }));

    while (mapped.length < 5) {
      mapped.push({ ...emptyTest });
    }
    return mapped;
  };

  // Teacher ID olish
  const fetchTeacherId = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await ApiCall("/api/v1/auth/decode", "GET", null, {
        Authorization: `Bearer ${token}`,
      });

      setTeacherId(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Mustaqil ta'lim ma'lumotlarini olish
  const fetchMustaqil = async () => {
    try {
      const res = await ApiCall(`/api/v1/mustaqil-talim-create/${id}`, "GET");
      console.log(res.data);

      setMustaqil(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTeacherId();
    fetchMustaqil();
  }, []);

  // Test maydonlarini o'zgartirish
  const handleTestChange = (index, field, value) => {
    const copy = [...tests];
    copy[index][field] = value;
    setTests(copy);
  };

  // Test stringini yaratish
  const buildTestString = () =>
    tests
      .filter((t) => t.question && t.correct)
      .map((t) =>
        `
${t.question}
====
#${t.correct}
====
${t.w1}
====
${t.w2}
====
${t.w3}
`.trim()
      )
      .join("\n+++++\n");

  // Formani yuborish
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      let attachmentId = null;

      if (pdf) {
        const fd = new FormData();
        fd.append("photo", pdf);
        fd.append("prefix", "mustaqil-talim");

        const res = await ApiCall("/api/v1/file/upload", "POST", fd, {
          "Content-Type": "multipart/form-data",
        });
        attachmentId = res.data;
      }
      const testString = buildTestString();

      const payload = {
        name,
        position,
        description,
        status,
        isAmaliy,
        testActive: isAmaliy ? false : testActive,
        teacherId,
        curriculumSubjectId: id,
        attachmentId,
        // 🔥 TEST HAR DOIM SAQLANADI (agar mavjud bo‘lsa)
        test: isAmaliy || !testString ? null : testString,
      };

      if (isEdit) {
        await ApiCall(
          `/api/v1/mustaqil-talim-create/${editId}`,
          "PUT",
          payload
        );
      } else {
        await ApiCall("/api/v1/mustaqil-talim-create", "POST", payload);
      }

      setOpen(false);
      setName("");
      setDescription("");
      setStatus(true);
      setIsAmaliy(false);
      setPdf(null);
      setEditId(null);
      setTests(Array.from({ length: 5 }, () => ({ ...emptyTest })));
      fetchMustaqil();
    } catch (err) {
      console.error(err);
      alert("❌ Xatolik yuz berdi");
    }
  };

  // Saralash funksiyasi
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filtrlangan va saralangan ma'lumotlar
  const sortedAndFilteredData = [...mustaqil]
    .filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key === "position") {
        return sortConfig.direction === "asc"
          ? (a.position ?? 0) - (b.position ?? 0)
          : (b.position ?? 0) - (a.position ?? 0);
      }
      if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name?.localeCompare(b.name)
          : b.name?.localeCompare(a.name);
      }
      return 0;
    });

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Sarlavha bo'limi */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2 text-gray-600">
          <BookOpen className="h-5 w-5" />
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium">Mustaqil Ta'lim</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          Mavzular Boshqaruvi
        </h1>
        <p className="mt-2 text-gray-600">
          Mustaqil ta'lim mavzularini qo'shing, tahrirlang va boshqaring
        </p>
      </div>

      {/* Asosiy kontent */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        {/* Panel boshqaruv elementlari */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setOpen(true);
                  setPosition(0);
                  setEditId(null);
                  setName("");
                  setDescription("");
                  setStatus(false);
                  setPdf(null);
                  setTests(Array.from({ length: 5 }, () => ({ ...emptyTest })));
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                <span>Yangi Mavzu</span>
              </button>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Mavzu nomi yoki izoh bo'yicha qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="focus:border-transparent w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 md:w-64"
                />
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white/50 px-4 py-2 text-sm text-gray-600 backdrop-blur-sm">
              <span className="font-medium">{mustaqil.length}</span> ta mavzu
              mavjud
            </div>
          </div>
        </div>

        {/* Jadval qismi */}
        <div className="overflow-x-auto">
          {sortedAndFilteredData.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-700">
                Mavzular topilmadi
              </h3>
              <p className="mb-4 text-gray-500">
                Hozircha mustaqil ta'lim mavzulari mavjud emas
              </p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Birinchi mavzuni qo'shing
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th
                    className="cursor-pointer py-4 px-6 text-left transition-colors hover:bg-gray-100"
                    onClick={() => handleSort("position")}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <ListOrdered className="h-4 w-4" />
                      <span>Tartib</span>
                      {sortConfig.key === "position" && (
                        <span className="text-xs">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="cursor-pointer py-4 px-6 text-left transition-colors hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <FileText className="h-4 w-4" />
                      <span>Mavzu Nomi</span>
                      {sortConfig.key === "name" && (
                        <span className="text-xs">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Materiallar
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Testlar
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left font-semibold text-gray-700">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition-colors duration-150 hover:bg-blue-50/30"
                  >
                    <td className="py-5 px-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                        <span className="font-bold text-blue-700">
                          {item.position || index + 1}
                        </span>
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div>
                        <h3 className="mb-1 font-semibold text-gray-800">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="line-clamp-2 text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      {item.attachment ? (
                        <button
                          onClick={() =>
                            downloadFile(item.attachment.id, `${item.name}.pdf`)
                          }
                          className="group flex items-center gap-2 rounded-lg px-3 py-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4 group-hover:animate-bounce" />
                          <span className="font-medium">PDF yuklash</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-2 text-sm text-gray-400">
                          <FileText className="h-4 w-4" />
                          Mavjud emas
                        </span>
                      )}
                    </td>

                    <td className="py-5 px-6">
                      <div className="space-y-2">
                        {item.testMustaqilTalim?.length ? (
                          <>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  item.testActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <span className="text-sm font-medium">
                                {item.testMustaqilTalim.length} ta test
                              </span>
                            </div>
                            <button
                              onClick={() =>
                                openAllTestsEdit(item.testMustaqilTalim)
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              Testlarni ko'rish
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Testlar mavjud emas
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
                        {item.status ? (
                          <>
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-700">
                              Faol
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                            <span className="text-sm font-medium text-gray-700">
                              Nofaol
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        {/* ✏️ EDIT */}
                        <button
                          onClick={() => {
                            setOpen(true);
                            setEditId(item.id);
                            setName(item.name);
                            setPosition(item.position ?? 1);
                            setDescription(item.description || "");
                            setStatus(item.status ?? false);
                            setTestActive(item.testActive ?? false);
                            setIsAmaliy(item.isAmaliy ?? false);
                            setTests(
                              mapBackendTestsToInputs(item.testMustaqilTalim)
                            );
                          }}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500
                 to-orange-500 px-4
                 py-2 font-medium text-white transition-all hover:from-amber-600 hover:to-orange-600"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Tahrirlash</span>
                        </button>

                        {/* 🗑️ DELETE */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-500
                 to-pink-500 px-4
                 py-2 font-medium text-white transition-all hover:from-red-600 hover:to-pink-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>O‘chirish</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Test tahrirlash modal */}
      {testEditOpen && editingTests.length > 0 && (
        <div className="bg-black/50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* BODY */}
            <div className="space-y-6 p-6">
              {editingTests.map((test, index) => (
                <div key={test.id} className="rounded-xl border bg-gray-50 p-5">
                  <h3 className="mb-4 font-semibold">Test {index + 1}</h3>
                  {[
                    { label: "Savol", key: "question" },
                    { label: "To'g'ri javob", key: "answer" },
                    { label: "Xato javob 1", key: "wrongAnswer1" },
                    { label: "Xato javob 2", key: "wrongAnswer2" },
                    { label: "Xato javob 3", key: "wrongAnswer3" },
                  ].map((field) => (
                    <div key={field.key} className="mb-3">
                      <label className="text-sm font-medium">
                        {field.label}
                      </label>
                      <input
                        className="w-full rounded-lg border px-4 py-2"
                        value={test[field.key]}
                        onChange={(e) => {
                          const copy = [...editingTests];
                          copy[index][field.key] = e.target.value;
                          setEditingTests(copy);
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 border-t p-6">
              <button
                onClick={() => setTestEditOpen(false)}
                className="rounded-xl border px-5 py-2"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleAllTestsSave}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2 text-white"
              >
                <Save className="h-4 w-4" />
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Mavzu yaratish/tahrirlash modal */}
      {open && (
        <div className="bg-black/50 animate-fadeIn fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-2">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEdit ? "Mavzuni Tahrirlash" : "Yangi Mavzu Yaratish"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      {isEdit
                        ? "Mavzu ma'lumotlarini yangilang"
                        : "Yangi mustaqil ta'lim mavzusini qo'shing"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Asosiy ma'lumotlar */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Mavzu nomi *
                      </label>
                      <input
                        className={`focus:border-transparent w-full rounded-xl border px-4 py-3 transition-all focus:ring-2 focus:ring-blue-500 ${
                          errors.name
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-gray-300"
                        }`}
                        placeholder="Mavzu nomini kiriting"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      {errors.name && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                          ⚠️ {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Tartib raqami
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="focus:border-transparent w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        placeholder="Mavzular tartibi"
                        value={position}
                        onChange={(e) => setPosition(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        PDF fayl {!isEdit && "*"}
                      </label>
                      <div
                        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                          errors.pdf
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        <FileText
                          className={`mx-auto mb-3 h-12 w-12 ${
                            errors.pdf ? "text-red-400" : "text-gray-400"
                          }`}
                        />
                        <p className="mb-2 text-sm text-gray-600">
                          {pdf ? pdf.name : "PDF faylni yuklang"}
                        </p>
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-2 text-white transition-colors hover:from-blue-600 hover:to-indigo-600">
                            <Download className="h-4 w-4" />
                            Fayl tanlash
                          </span>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setPdf(e.target.files[0])}
                            className="hidden"
                          />
                        </label>
                        {errors.pdf && (
                          <p className="mt-2 text-sm text-red-600">
                            ⚠️ {errors.pdf}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Izoh
                      </label>
                      <textarea
                        className="focus:border-transparent h-32 w-full resize-none rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500"
                        placeholder="Mavzu haqida qo'shimcha izoh..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              isAmaliy ? "bg-purple-100" : "bg-gray-100"
                            }`}
                          >
                            <BookOpen className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              Amaliy mustaqil ta’lim
                            </p>
                            <p className="text-sm text-gray-500">
                              {isAmaliy
                                ? "Amaliy (test yo‘q)"
                                : "Nazariy (test bo‘lishi mumkin)"}
                            </p>
                          </div>
                        </div>

                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={isAmaliy}
                            onChange={(e) => setIsAmaliy(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`h-6 w-12 rounded-full transition-colors ${
                              isAmaliy ? "bg-purple-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                isAmaliy ? "left-7" : "left-1"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              status ? "bg-green-100" : "bg-gray-100"
                            }`}
                          >
                            {status ? (
                              <Eye className="h-5 w-5 text-green-600" />
                            ) : (
                              <EyeOff className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">Status</p>
                            <p className="text-sm text-gray-500">
                              {status ? "Mavzu faol" : "Mavzu nofaol"}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={status}
                            onChange={(e) => setStatus(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`h-6 w-12 rounded-full transition-colors ${
                              status ? "bg-green-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                status ? "left-7" : "left-1"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-lg p-2 ${
                              testActive ? "bg-blue-100" : "bg-gray-100"
                            }`}
                          >
                            <Check className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Testlar</p>
                            <p className="text-sm text-gray-500">
                              {testActive
                                ? "Testlar yoqilgan"
                                : "Testlar o'chirilgan"}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={testActive}
                            onChange={(e) => setTestActive(e.target.checked)}
                            className="sr-only"
                          />
                          <div
                            className={`h-6 w-12 rounded-full transition-colors ${
                              testActive ? "bg-blue-500" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                                testActive ? "left-7" : "left-1"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testlar (faqat yangi yaratishda) */}
                {!isEdit && !isAmaliy && (
                  <div className="border-t pt-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Testlar (5 ta)
                      </h3>
                      <span className="text-sm text-gray-500">
                        Barcha maydonlar to'ldirilishi shart
                      </span>
                    </div>

                    <div className="grid gap-4">
                      {tests.map((t, i) => (
                        <div
                          key={i}
                          className={`rounded-xl border p-5 transition-all ${
                            errors[`test-${i}`]
                              ? "animate-pulse border-red-300 bg-red-50"
                              : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-white">
                              {i + 1}
                            </div>
                            <h4 className="font-medium text-gray-800">
                              Test {i + 1}
                            </h4>
                            {errors[`test-${i}`] && (
                              <span className="ml-auto text-sm text-red-600">
                                ⚠️ To'liq to'ldirilmagan
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            <input
                              className={`focus:border-transparent w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 ${
                                errors[`test-${i}`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="Savolni kiriting"
                              value={t.question}
                              onChange={(e) =>
                                handleTestChange(i, "question", e.target.value)
                              }
                            />

                            <div className="grid gap-3 md:grid-cols-2">
                              <input
                                className="focus:border-transparent w-full rounded-lg border border-green-300 bg-green-50 px-4 py-2.5 focus:ring-2 focus:ring-green-500"
                                placeholder="To'g'ri javob"
                                value={t.correct}
                                onChange={(e) =>
                                  handleTestChange(i, "correct", e.target.value)
                                }
                              />

                              {[
                                ["w1", "Xato javob 1"],
                                ["w2", "Xato javob 2"],
                                ["w3", "Xato javob 3"],
                              ].map(([field, label]) => (
                                <input
                                  key={field}
                                  className="focus:border-transparent w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                                  placeholder={label}
                                  value={t[field]}
                                  onChange={(e) =>
                                    handleTestChange(i, field, e.target.value)
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
                >
                  Bekor qilish
                </button>
                <div className="flex items-center gap-3">
                  {isEdit && (
                    <button
                      type="button"
                      className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      onClick={() => {
                        setOpen(false);
                        setTimeout(() => fetchMustaqil(), 300);
                      }}
                    >
                      Yopish
                    </button>
                  )}
                  <button
                    type="submit"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2.5 font-medium text-white shadow-md transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                  >
                    <Save className="h-5 w-5" />
                    {isEdit ? "Yangilash" : "Mavzuni Saqlash"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animatsiyalari */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default Lessons;
