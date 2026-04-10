import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";

const Duty = () => {
  const { id } = useParams();

  let groupId = id;
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [requireFile, setRequireFile] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [action, setAction] = useState("online"); // NEW: "online" | "offline"
  const [confirming, setConfirming] = useState(false); // NEW: modal button state

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklash mumkin ❌");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Fayl hajmi 5 MB dan katta bo‘lmasligi kerak ❌");
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
      if (response && Array.isArray(response.data)) {
        setStudents(response.data);
        setFilteredStudents(response.data);
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

  const updateStudent = async () => {
    setUpdating(true);
    try {
      await getStudentFromHemis();
      await fetchStudents();
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setUpdating(false);
    }
  };

  const getStudentFromHemis = async () => {
    try {
      const response = await ApiCall(
        `/api/v1/groups/update-students/${groupId}`,
        "GET"
      );
      console.log("update", response);
      if (response?.error) {
        toast.error("Avtorizatsiya xatosi: Token topilmadi yoki noto‘g‘ri.");
        console.log(response.data);
      } else {
        toast.success("Muvaffaqiyatli yangilandi");
      }
    } catch (error) {
      console.error("Xatolik (yangilash):", error);
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
      <div>
        <Breadcrumbs
          items={[{ label: "Guruhlar", to: "/test-center/groups" }]}
        />
      </div>

      {/* Sarlavha va yangilash tugmasi */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-blue-600 sm:text-3xl">
          {students[0]?.groupName} Guruh talabalari ro'yxati
        </h1>
        <button
          onClick={updateStudent}
          disabled={loading || updating}
          className={`rounded-md px-4 py-2 font-medium text-white transition-colors ${
            loading || updating
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading || updating ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Yuklanmoqda...
            </span>
          ) : (
            "Talabalarni yangilash"
          )}
        </button>
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
                    Talaba ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Semestr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    GPA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rasm
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id || index}
                    className="cursor-pointer hover:bg-gray-50" // 🔑 hover va cursor
                  >
                    <td
                      className="whitespace-nowrap px-6 py-4 text-sm text-gray-500"
                      onClick={() =>
                        navigate(`/test-center/groups/group/${student.id}`, {
                          state: { studentId: student.id }, // agar kerak bo‘lsa student ma’lumotini state bilan jo‘natamiz
                        })
                      }
                    >
                      {index + 1}
                    </td>
                    <td
                      className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                      onClick={() =>
                        navigate(`/test-center/groups/group/${student.id}`, {
                          state: { studentId: student.id }, // agar kerak bo‘lsa student ma’lumotini state bilan jo‘natamiz
                        })
                      }
                    >
                      {student?.fullName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student?.studentIdNumber || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student?.semesterName || "-"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student?.avgGpa || "0"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
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
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.isOnline ? (
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setAction("offline"); // <<< set action
                            setOpenModal(true);
                          }}
                          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                        >
                          Offline qilish
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setAction("online"); // <<< set action
                            setOpenModal(true);
                          }}
                          className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                        >
                          Online qilish
                        </button>
                      )}
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
