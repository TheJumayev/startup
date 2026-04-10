import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../../config";
import { useParams, useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

function Index() {
  const { id } = useParams(); // monthId
  const { state } = useLocation();
  const groupId = state?.groupId;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const deadlineFieldMap = {
    kundalik: "kundalikEndTime",
    kundalik1: "kundalikEndTime1",
    kundalik2: "kundalikEndTime2",
    kundalik3: "kundalikEndTime3",
  };

  const fileFields = [
    { key: "kundalik1", label: "Kundalik ", icon: "📅" },
    // { key: "kundalik1", label: "Kundalik 2-haftalik", icon: "📅" },
    // { key: "kundalik2", label: "Kundalik 3-haftalik", icon: "📅" },
    // { key: "kundalik3", label: "Kundalik 4-haftalik", icon: "📅" },
    { key: "darsTahlili", label: "Dars tahlili", icon: "📊" },
    { key: "darsIshlanmasi", label: "Dars ishlanmasi", icon: "📝" },
    { key: "tarbiyaviy", label: "Tarbiyaviy ish", icon: "👨‍🏫" },
    { key: "sinfRahbar", label: "Sinf rahbarlik", icon: "👩‍🏫" },
    { key: "pedagogik", label: "Pedagogik amaliyot", icon: "🎓" },
    { key: "tadbir", label: "Tadbir ishlanmasi", icon: "🎯" },
    { key: "photo", label: "Foto", icon: "📷" },
    { key: "hisobot", label: "Hisobot", icon: "📋" },
  ];

  // 🔥 Deadline state faqat Index componentda bo‘ladi
  const [deadlineModalOpen, setDeadlineModalOpen] = useState(false);
  const [deadlineValue, setDeadlineValue] = useState("");
  const [selectedDeadlineField, setSelectedDeadlineField] = useState(null);

  const updateDeadline = async () => {
    console.log(selectedDeadlineField);
    console.log(deadlineValue);

    try {
      await ApiCall(
        `/api/v1/amaliyot-group/update-endtime/group/${groupId}`,
        "PUT",
        {
          [selectedDeadlineField]: deadlineValue, // 🔥 MUHIM
        }
      );

      toast.success("Deadline barcha talabalar uchun yangilandi!");
      setDeadlineModalOpen(false);
    } catch (err) {
      toast.error("Deadline yangilanmadi!");
    }
  };

  // 🔹 Guruh talabalarini olish
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/groups/students/${groupId}`, "GET");
      console.log(res.data);

      setStudents(res.data || []);
    } catch (err) {
      console.error("❌ Talabalarni olishda xatolik:", err);
      toast.error("Talabalarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Talabaning yuklamalarini olish
  const fetchStudentStatus = async (studentId, monthId) => {
    try {
      const res = await ApiCall(
        `/api/v1/amaliyot-yuklama/${studentId}/${monthId}`,
        "GET"
      );
      console.log(res.data);

      return res.data;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [groupId]);

  return (
    <div className="min-h-screen p-6">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Header Section */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800">
              Guruh talabalarining amaliyot yuklamalari
            </h1>
            <p className="text-gray-600">
              Oylik amaliyot topshiriqlarini ko'rib chiqish va baholash
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Jami talabalar: {students.length}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-600">Talabalar yuklanmoqda...</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
          <div className="mb-4 text-6xl text-gray-400">👨‍🎓</div>
          <h3 className="mb-2 text-xl font-medium text-gray-700">
            Talabalar topilmadi
          </h3>
          <p className="text-gray-500">Guruhda hali talabalar mavjud emas</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="max-h-[600px] overflow-x-auto overflow-y-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-20 bg-gradient-to-r from-blue-50 to-indigo-50 shadow">
                <tr>
                  <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    №
                  </th>
                  <th className="border-b border-gray-200 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                    Talaba
                  </th>
                  {fileFields.map((f) => (
                    <th
                      key={f.key}
                      onClick={() => {
                        if (
                          [
                            "kundalik",
                            "kundalik1",
                            "kundalik2",
                            "kundalik3",
                          ].includes(f.key)
                        ) {
                          setSelectedDeadlineField(f.key + "EndTime");

                          const oldValue =
                            students[0]?.[f.key + "EndTime"] || "";
                          setDeadlineValue(oldValue); // 🔥 ESKI DEADLINE NI YOZISH SHART

                          setDeadlineModalOpen(true);
                        }
                      }}
                      className="cursor-pointer border-b border-gray-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-700 hover:bg-blue-100"
                    >
                      <div className="flex flex-col items-center">
                        <span className="mb-1 text-lg">{f.icon}</span>
                        <span className="text-xs">{f.label}</span>

                        {/* Faqat kundaliklar uchunDeadline tugmasi */}
                        {[
                          "kundalik1",
                        //   "kundalik1",
                        //   "kundalik2",
                        //   "kundalik3",
                        ].includes(f.key) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              const backendField = deadlineFieldMap[f.key];
                              setSelectedDeadlineField(backendField);

                              const oldValue =
                                students[0]?.[backendField] || "";
                              setDeadlineValue(oldValue);

                              setDeadlineModalOpen(true);
                            }}
                            className="mt-1 rounded-lg bg-purple-100 p-1 text-xs text-purple-700 hover:bg-purple-200"
                          >
                            Deadline
                          </button>
                        )}
                      </div>
                    </th>
                  ))}

                  <th className="border-b border-gray-200 px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-700">
                    <button
                      onClick={() => {
                        setSelectedDeadlineField("deadline"); // DTO ichidagi umumiy deadline maydoni
                        setDeadlineValue(""); // boshlang‘ich qiymat
                        setDeadlineModalOpen(true); // modal ochiladi
                      }}
                      className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs text-white shadow-sm hover:bg-purple-700"
                    >
                      Umumiy Deadline
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.map((student, index) => (
                  <StudentRow
                    key={student.id}
                    index={index + 1}
                    student={student}
                    fileFields={fileFields}
                    monthId={id}
                    fetchStudentStatus={fetchStudentStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Modal
            isOpen={deadlineModalOpen}
            onRequestClose={() => setDeadlineModalOpen(false)}
            className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
          >
            <h2 className="mb-4 text-xl font-bold">Deadline o‘zgartirish</h2>

            <input
              type="datetime-local"
              value={deadlineValue}
              onChange={(e) => setDeadlineValue(e.target.value)}
              className="mb-4 w-full rounded-xl border p-3"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeadlineModalOpen(false)}
                className="rounded-xl bg-gray-100 px-4 py-2"
              >
                Bekor qilish
              </button>

              <button
                onClick={updateDeadline}
                className="rounded-xl bg-blue-600 px-4 py-2 text-white"
              >
                Saqlash
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
}

// 🔹 Har bir talaba uchun qator
const StudentRow = ({
  student,
  index,
  fileFields,
  monthId,
  fetchStudentStatus,
}) => {
  const [statuses, setStatuses] = useState({});
  const [yuklamaId, setYuklamaId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [description, setDescription] = useState("");
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeInput, setGradeInput] = useState("");

  useEffect(() => {
    const loadStatus = async () => {
      const data = await fetchStudentStatus(student.id, monthId);
      if (data) {
        setYuklamaId(data.id);
        const fieldStatuses = {};
        fileFields.forEach((f) => {
          fieldStatuses[f.key] = {
            status: data[`${f.key}Status`],
            fileId: data[`${f.key}File`]?.id || null,
            fileName: data[`${f.key}File`]?.originalName || null,
          };
        });
        setStatuses(fieldStatuses);
      }
    };
    loadStatus();
  }, [student.id, monthId]);

  // 🔹 Statusni yangilash
  const updateStatus = async (fieldKey, newStatus, reason = "") => {
    if (!yuklamaId) return toast.error("Yuklama topilmadi!");

    try {
      await ApiCall(`/api/v1/amaliyot-yuklama/${yuklamaId}`, "PUT", {
        [`${fieldKey}Status`]: newStatus,
        [`${fieldKey}Description`]: reason || null,
      });

      toast.success(
        newStatus === 3 ? "✅ Fayl tasdiqlandi" : "❌ Fayl rad etildi"
      );

      setStatuses((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], status: newStatus },
      }));

      setModalOpen(false);
      setDescription("");
    } catch (err) {
      toast.error("Statusni o'zgartirishda xatolik!");
    }
  };

  // 🔹 Faylni yuklab olish
  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      if (!response.ok) throw new Error("File not found");

      const blob = await response.blob();
      const fileURL = window.URL.createObjectURL(blob);

      // Faylni ochish
      const newWindow = window.open(fileURL, "_blank");
      if (!newWindow) {
        toast.warn(
          "Fayl ochilmadi. Brauzer pop-up'ni bloklagan bo'lishi mumkin."
        );
      }

      // Faylni yuklab olish
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("📥 Fayl yuklab olindi va ochildi");
    } catch (error) {
      console.error("❌ Yuklab olishda xatolik:", error);
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  return (
    <>
      <tr className="transition-colors duration-150 hover:bg-gray-50">
        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium text-gray-900">
          {index}
        </td>
        <td className="whitespace-nowrap px-6 py-4">
          <div className="flex items-center">
            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
              {student.fullName?.charAt(0) || student.name?.charAt(0) || "T"}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {student.fullName || student.name}
              </div>
              <div className="text-xs text-gray-500">ID: {student.id}</div>
            </div>
          </div>
        </td>

        {fileFields.map((f) => (
          <td key={f.key} className="whitespace-nowrap px-4 py-4 text-center">
            {statuses[f.key]?.status ? (
              <div className="flex flex-col items-center space-y-2">
                <StatusBadge status={statuses[f.key].status} />
                <div className="flex space-x-1">
                  <button
                    onClick={() => updateStatus(f.key, 3)}
                    className="rounded-lg bg-green-100 p-1.5 text-green-700 transition-colors duration-150 hover:bg-green-200"
                    title="Tasdiqlash"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedField(f.key);
                      setModalOpen(true);
                    }}
                    className="rounded-lg bg-red-100 p-1.5 text-red-700 transition-colors duration-150 hover:bg-red-200"
                    title="Rad etish"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  {statuses[f.key]?.fileId && (
                    <button
                      onClick={() =>
                        handleDownload(
                          statuses[f.key].fileId,
                          statuses[f.key].fileName
                        )
                      }
                      className="rounded-lg bg-blue-100 p-1.5 text-blue-700 transition-colors duration-150 hover:bg-blue-200"
                      title="Yuklab olish"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm italic text-gray-300">—</div>
            )}
          </td>
        ))}

        {/* Baho ustuni */}
        <td className="whitespace-nowrap px-4 py-4 text-center">
          <div
            onClick={() => {
              setGradeInput(statuses?.grade || "");
              setGradeModalOpen(true);
            }}
            className={`inline-flex cursor-pointer items-center rounded-xl bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 transition hover:bg-blue-200`}
          >
            {statuses?.grade ? (
              <>
                <span className="font-bold">{statuses.grade}</span>
                <span className="ml-1 text-xs">/100</span>
              </>
            ) : (
              <span className="italic">Baholanmagan</span>
            )}
          </div>
        </td>
      </tr>

      <Modal
        isOpen={gradeModalOpen}
        onRequestClose={() => setGradeModalOpen(false)}
        className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      >
        <h2 className="mb-4 text-xl font-bold">Talabani baholash</h2>

        <label className="mb-2 block text-sm font-medium text-gray-700">
          Baho (1-100)
        </label>
        <input
          type="number"
          value={gradeInput}
          onChange={(e) => setGradeInput(e.target.value)}
          className="mb-4 w-full rounded-xl border p-3"
          min="1"
          max="100"
          placeholder="Baho kiriting"
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setGradeModalOpen(false)}
            className="rounded-xl bg-gray-100 px-4 py-2"
          >
            Bekor qilish
          </button>

          <button
            onClick={async () => {
              try {
                const val = parseInt(gradeInput, 10);
                if (isNaN(val) || val < 1 || val > 100) {
                  return toast.error("Baho 1-100 oralig‘ida bo‘lishi kerak!");
                }

                await ApiCall(
                  `/api/v1/amaliyot-yuklama/${yuklamaId}/${val}`,
                  "PUT"
                );

                toast.success("Baho saqlandi!");

                setStatuses((prev) => ({
                  ...prev,
                  grade: val,
                }));

                setGradeModalOpen(false);
              } catch (err) {
                toast.error("Baho saqlanmadi!");
              }
            }}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white"
          >
            Saqlash
          </button>
        </div>
      </Modal>

      {/* 🔹 Modal oynasi */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Rad etish sababi"
        className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      >
        <div className="mb-4 flex items-center text-red-600">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-xl font-bold">Rad etish sababi</h2>
        </div>

        <div className="mb-6">
          <p className="mb-3 text-gray-600">
            <span className="font-medium">
              {student.fullName || student.name}
            </span>{" "}
            talabasining
            <span className="font-medium">
              {" "}
              {
                fileFields.find((field) => field.key === selectedField)?.label
              }{" "}
            </span>
            faylini rad etish sababini kiriting:
          </p>
          <textarea
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rad etish sababini batafsil yozing..."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setModalOpen(false)}
            className="rounded-xl bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => updateStatus(selectedField, 4, description)}
            className="rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2.5 font-medium text-white shadow-md transition-all duration-150 hover:from-red-600 hover:to-pink-700"
          >
            Rad etish
          </button>
        </div>
      </Modal>
    </>
  );
};

// 🔹 Status Badge
const StatusBadge = ({ status }) => {
  switch (status) {
    case 1:
      return (
        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
          Yangi
        </span>
      );
    case 2:
      return (
        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
          Ko'rib chiqilmoqda
        </span>
      );
    case 3:
      return (
        <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
          Qabul qilingan
        </span>
      );
    case 4:
      return (
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-500"></span>
          Rad etilgan
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
          —
        </span>
      );
  }
};

export default Index;