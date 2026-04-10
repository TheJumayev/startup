import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";

const Duty = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [requireFile, setRequireFile] = useState(false);
  const [openResetModal, setOpenResetModal] = useState(false);
  const [studentToReset, setStudentToReset] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [editingPhones, setEditingPhones] = useState({});
  const [savingId, setSavingId] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [action, setAction] = useState("online"); // NEW: "online" | "offline"
  const [confirming, setConfirming] = useState(false); // NEW: modal button state

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileId, setFileId] = useState(null);

  const handlePhoneChange = (studentId, field, value) => {
    setEditingPhones((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveParentPhones = async (student) => {
    try {
      setSavingId(student.id);

      const phones = editingPhones[student.id] || {};

      await ApiCall(`/api/v1/student/parents-phone/${student.id}`, "PUT", {
        fatherPhone: phones.fatherPhone ?? student.fatherPhone,
        motherPhone: phones.motherPhone ?? student.motherPhone,
      });

      toast.success("Telefon raqamlar saqlandi ✅");

      await fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error("Saqlashda xatolik ❌");
    } finally {
      setSavingId(null);
    }
  };

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
      setGroupId(res.data.group.id);
    } catch (err) {
      console.error("Talaba ma’lumotini olishda xato:", err);
      navigate("/student/login");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin ❌");
      return;
    }

    setSelectedFile(file);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(
        `/api/v1/groups/students/${groupId}`,
        "GET"
      );
      console.log(response.data);

      if (response && Array.isArray(response.data)) {
        setStudents(response.data);
        setFilteredStudents(response.data);
        setEditingPhones({});
      } else {
        setStudents([]);
        setFilteredStudents([]);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // Qidiruv funksiyasi
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredStudents(students);
      return;
    }

    const searchLower = term.toLowerCase();
    const filtered = students.filter((student) => {
      return (
        student?.fullName?.toLowerCase().includes(searchLower) ||
        student?.studentIdNumber?.toLowerCase().includes(searchLower) ||
        student?.groupName?.toLowerCase().includes(searchLower) ||
        student.firstName?.toLowerCase().includes(searchLower) ||
        student.lastName?.toLowerCase().includes(searchLower) ||
        student.middleName?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredStudents(filtered);
  };

  useEffect(() => {
    if (groupId) {
      fetchStudents();
    }
  }, [groupId]);

  const confirmAction = async () => {
    if (!selectedStudent) return;
    setConfirming(true);

    try {
      let res;
      if (action === "online") {
        let finalFileId = fileId;

        // Fayl yuklanmagan bo‘lsa va tanlangan bo‘lsa, yuklaymiz
        if (!finalFileId && selectedFile) {
          const formData = new FormData();
          formData.append("photo", selectedFile);
          formData.append("prefix", "student_online");

          const uploadRes = await ApiCall(
            "/api/v1/file/upload",
            "POST",
            formData,
            {
              "Content-Type": "multipart/form-data",
            }
          );

          if (uploadRes?.data) {
            finalFileId = uploadRes.data;
            setFileId(finalFileId);
          } else {
            toast.error("Fayl yuklashda xatolik ❌");
            setConfirming(false);
            return;
          }
        }

        // ✅ endi null emas, real fileId bor
        res = await ApiCall(
          `/api/v1/online-student/online/${selectedStudent.id}/${finalFileId}`,
          "POST"
        );
      } else {
        res = await ApiCall(
          `/api/v1/online-student/remove/${selectedStudent.id}`,
          "PUT"
        );
      }

      if (res) {
        toast.success(
          action === "online"
            ? "Student online qilindi ✅"
            : "Student offline qilindi ✅"
        );
        await fetchStudents();
        setOpenModal(false);
        setSelectedFile(null);
        setFileId(null);
      } else {
        toast.error("Xatolik yuz berdi ❌");
      }
    } catch (e) {
      console.error(e);
      toast.error("Server bilan xatolik ❌");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <ToastContainer />

      {/* Sarlavha va yangilash tugmasi */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-600 sm:text-3xl">
          {students[0]?.groupName} Guruh talabalari ro'yxati
        </h1>
        <div className={"flex gap-2"}></div>
      </div>
      <div></div>
      {/* Qidiruv inputi */}
      <div className="mb-6">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Talaba ismi, familiyasi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-3 pl-10 pr-12 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Natijalar soni */}
      {searchTerm && (
        <div className="mb-4 text-center">
          <p className="text-lg text-gray-700">
            Topilgan talabalar:{" "}
            <span className="text-2xl font-bold text-blue-600">
              {filteredStudents.length} ta
            </span>
          </p>
        </div>
      )}

      {(loading || updating) && <LoadingOverlay text="Yuklanmoqda..." />}

      {!loading && filteredStudents.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">
            {searchTerm
              ? "Qidiruv boʻyicha talabalar topilmadi"
              : "Talabalar ro'yxati bo'sh. Yangilash tugmasini bosing."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    №
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    FISH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Shaxsiy Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Hemis ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Otasinging Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Onasinging Telefon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amallar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id || index}
                    className="cursor-pointer hover:bg-gray-50" // 🔑 hover va cursor
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="flex items-center gap-3 whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student?.image ? (
                        <img
                          src={student.image}
                          alt={student.fullName || "Talaba"}
                          className="h-10 w-10 rounded-full border-2 border-blue-700 object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/40";
                          }}
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-500">
                          Rasm yo'q
                        </div>
                      )}
                      {student?.fullName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      {student?.phone || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                      {student?.studentIdNumber || "-"}
                    </td>
                    <td className="text-black whitespace-nowrap px-4 py-4 text-sm">
                      <input
                        type="text"
                        value={
                          editingPhones[student.id]?.fatherPhone !== undefined
                            ? editingPhones[student.id].fatherPhone
                            : student?.fatherPhone || ""
                        }
                        onChange={(e) =>
                          handlePhoneChange(
                            student.id,
                            "fatherPhone",
                            e.target.value
                          )
                        }
                        className="w-36 rounded border px-2 py-1 text-sm"
                      />
                    </td>

                    <td className="text-black whitespace-nowrap px-4 py-4 text-sm">
                      <input
                        type="text"
                        value={
                          editingPhones[student.id]?.motherPhone ??
                          student?.motherPhone ??
                          ""
                        }
                        onChange={(e) =>
                          handlePhoneChange(
                            student.id,
                            "motherPhone",
                            e.target.value
                          )
                        }
                        className="w-36 rounded border px-2 py-1 text-sm"
                      />
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                      <button
                        onClick={() => saveParentPhones(student)}
                        disabled={savingId === student.id}
                        className={`rounded px-4 py-2 text-white ${
                          savingId === student.id
                            ? "bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        {savingId === student.id ? "Saqlanmoqda..." : "Saqlash"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal open={openModal} onClose={() => setOpenModal(false)} center>
            <h2 className="mb-4 text-lg font-bold">Tasdiqlash</h2>
            <p className="mb-2">
              Siz{" "}
              <span className="font-semibold text-blue-600">
                {selectedStudent?.fullName}
              </span>{" "}
              ni{" "}
              <span
                className={`font-semibold ${
                  action === "online" ? "text-green-600" : "text-red-600"
                }`}
              >
                {action === "online" ? "online" : "offline"}
              </span>{" "}
              sifatida belgilamoqchimisiz?
            </p>
            {/* ✅ Fayl nomini ko‘rsatish */}
            {action === "online" && selectedFile && (
              <div className="mb-4 rounded border bg-gray-50 p-2 text-sm text-gray-700">
                Yuklangan fayl:{" "}
                <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}

            {/* Fayl inputi yashirin */}
            <input
              type="file"
              accept="application/pdf"
              ref={(el) => (window.fileInputRef = el)}
              onChange={(e) => handleFileUpload(e)}
              style={{ display: "none" }}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenModal(false);
                  setSelectedFile(null);
                  setFileId(null);
                }}
                className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
                disabled={confirming}
              >
                Bekor qilish
              </button>

              {action === "online" ? (
                <button
                  onClick={async () => {
                    if (!selectedFile) {
                      // Agar fayl tanlanmagan bo‘lsa inputni ochamiz
                      window.fileInputRef && window.fileInputRef.click();
                    } else {
                      // Fayl tanlangan bo‘lsa confirmAction ishlaydi
                      await confirmAction();
                    }
                  }}
                  disabled={confirming}
                  className={`rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? "Yuborilmoqda..." : "Ha, tasdiqlayman"}
                </button>
              ) : (
                <button
                  onClick={confirmAction}
                  disabled={confirming}
                  className={`rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 ${
                    confirming ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {confirming ? "Yuborilmoqda..." : "Ha, tasdiqlayman"}
                </button>
              )}
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default Duty;
