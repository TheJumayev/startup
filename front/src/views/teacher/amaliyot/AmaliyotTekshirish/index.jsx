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

  const fileFields = [
    { key: "kundalik1", label: "Kundalik", icon: "📅" },
    // { key: "kundalik", label: "Kundalik 2-hafta", icon: "📅" },
    // { key: "kundalik2", label: "Kundalik 3-hafta", icon: "📅" },
    // { key: "kundalik3", label: "Kundalik 4-hafta", icon: "📅" },
    { key: "darsTahlili", label: "Dars tahlili", icon: "📊" },
    { key: "darsIshlanmasi", label: "Dars ishlanmasi", icon: "📝" },
    { key: "tarbiyaviy", label: "Tarbiyaviy ish", icon: "👨‍🏫" },
    { key: "sinfRahbar", label: "Sinf rahbarlik", icon: "👩‍🏫" },
    // { key: "pedagogik", label: "Pedagogik amaliyot", icon: "🎓" },
    { key: "tadbir", label: "Tadbir ishlanmasi", icon: "🎯" },
    { key: "photo", label: "Foto", icon: "📷" },
    { key: "hisobot", label: "Hisobot", icon: "📋" },
  ];

  // 🔹 Guruh talabalarini olish
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/groups/students/${groupId}`, "GET");
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
    <div className="mx-auto min-h-screen max-w-7xl p-6">
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center shadow-sm">
          <div className="mb-4 text-6xl text-gray-400">📚</div>
          <h3 className="mb-2 text-xl font-medium text-gray-700">
            Talabalar topilmadi
          </h3>
          <p className="text-gray-500">Guruhda hali talabalar mavjud emas</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="max-h-[550px] overflow-x-auto">
            <table className="min-w-full">
              <thead className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-indigo-50 shadow">
                <tr>
                  {/* № */}
                  <th className="sticky left-0 z-40 w-[70px] min-w-[70px] border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                    №
                  </th>

                  {/* Talaba */}
                  <th className="sticky left-[70px] z-40 w-[260px] min-w-[260px] border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-700 shadow-[6px_0_6px_-6px_rgba(0,0,0,0.15)]">
                    Talaba
                  </th>

                  {fileFields.map((f) => (
                    <th
                      key={f.key}
                      className="border-b border-gray-200 px-3 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-700"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg">{f.icon}</span>
                        <span className="mt-1">{f.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="border-b border-gray-200 px-4 py-4 text-center text-xs font-medium uppercase tracking-wider text-gray-700">
                    Baholash
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
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [gradeInput, setGradeInput] = useState("");

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingField, setPendingField] = useState(null);

  // 🔹 Barcha fayl statuslari 3 (Qabul qilingan) bo‘lganini tekshiradi
  const areAllFilesAccepted = () => {
    return fileFields.every((f) => statuses[f.key]?.status === 3);
  };

  useEffect(() => {
    const loadStatus = async () => {
      const data = await fetchStudentStatus(student.id, monthId);
      if (data) {
        setYuklamaId(data.id);
        const fieldStatuses = {};
        if (data.deadline) {
          const expired = new Date(data.deadline) < new Date();
          setIsDeadlinePassed(expired);
        }
        fileFields.forEach((f) => {
          const currentFile =
            data[`${f.key}File`] && data[`${f.key}File`].id
              ? data[`${f.key}File`]
              : data[`${f.key}FileOld`] || null;

          fieldStatuses[f.key] = {
            status: data[`${f.key}Status`],
            fileId: currentFile?.id || null,
            fileName: currentFile?.originalName || null,
          };
        });

        // ✅ Bahoni ham yuklaymiz
        fieldStatuses.grade = data.grade || null;

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

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/file/getFile/${fileId}`);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName || "document.pdf";
      link.click();
      toast.success("📥 Fayl yuklab olindi");
    } catch (error) {
      toast.error("❌ Yuklab olishda xatolik");
    }
  };

  return (
    <>
      <tr className="group transition-colors duration-150">
        {/* № */}
        <td className="sticky left-0 z-40 w-[70px] min-w-[70px] whitespace-nowrap border-r border-gray-100 bg-white px-4 py-4 text-center text-sm font-medium text-gray-900 group-hover:bg-gray-50">
          {index}
        </td>

        {/* Talaba */}
        <td className="sticky left-[70px] z-40 w-[260px] min-w-[260px] whitespace-nowrap border-r border-gray-100 bg-white px-4 py-4 shadow-[6px_0_6px_-6px_rgba(0,0,0,0.10)] group-hover:bg-gray-50">
          <div className="flex items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
              {student.fullName?.charAt(0) || student.name?.charAt(0) || "T"}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {student.fullName || student.name}
              </div>
            </div>
          </div>
        </td>

        {fileFields.map((f) => (
          <td
            key={f.key}
            className="whitespace-nowrap px-3 py-4 text-center group-hover:bg-gray-50"
          >
            {statuses[f.key]?.status ? (
              <div className="flex flex-col items-center space-y-2">
                <StatusBadge status={statuses[f.key].status} />
                <div className="flex space-x-1">
                  {/* 1) Fayl bo‘lsa - Yuklab olish tugmasi chiqadi */}
                  {statuses[f.key]?.fileId && (
                    <button
                      onClick={() =>
                        handleDownload(
                          statuses[f.key].fileId,
                          statuses[f.key].fileName
                        )
                      }
                      className="rounded-lg bg-blue-100 p-1.5 text-blue-700 hover:bg-blue-200"
                      title="Yuklab olish"
                    >
                      📥
                    </button>
                  )}

                  {/* 2) Faqat status = 2 bo‘lsa tugmalar chiqadi */}
                  {statuses[f.key]?.status === 2 && (
                    <>
                      <button
                        onClick={() => {
                          setPendingField(f.key);
                          setConfirmModalOpen(true);
                        }}
                        className="rounded-lg bg-green-100 p-1.5 text-green-700 hover:bg-green-200"
                        title="Tasdiqlash"
                      >
                        ✅
                      </button>

                      <button
                        onClick={() => {
                          setSelectedField(f.key);
                          setModalOpen(true);
                        }}
                        className="rounded-lg bg-red-100 p-1.5 text-red-700 hover:bg-red-200"
                        title="Rad etish"
                      >
                        ❌
                      </button>
                    </>
                  )}

                  {/* 3) Status = 3 (qabul qilingan) */}
                  {statuses[f.key]?.status === 3 && (
                    <span className="text-xs font-semibold text-green-600">
                      Tasdiqlandi
                    </span>
                  )}

                  {/* 4) Status = 4 (rad etilgan) */}
                  {statuses[f.key]?.status === 4 && (
                    <span className="text-xs font-semibold text-red-600">
                      Rad etilgan
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm italic text-gray-300">—</div>
            )}
          </td>
        ))}

        {/* ✅ Baholash ustuni — faqat barcha fayl statuslari 3 bo'lgandagina faollashadi */}
        <td className="whitespace-nowrap px-4 py-4 text-center">
          <div
            className={`} inline-flex cursor-pointer items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-800 transition-all duration-200
                            hover:bg-blue-200`}
            onClick={() => {
              setGradeInput(statuses?.grade || "");
              setGradeModalOpen(true);
            }}
          >
            {statuses?.grade !== undefined && statuses?.grade !== null ? (
              <>
                <span className="text-lg font-bold">{statuses.grade}</span>
                <span className="ml-1 text-xs">/100</span>
              </>
            ) : (
              <span className="italic">Baholanmagan</span>
            )}
          </div>
        </td>
      </tr>

      {/* 🔹 Baholash modali */}
      <Modal
        isOpen={gradeModalOpen}
        onRequestClose={() => setGradeModalOpen(false)}
        contentLabel="Baholash oynasi"
        className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      >
        <div className="mb-4 flex items-center">
          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
            {student.fullName?.charAt(0) || student.name?.charAt(0) || "T"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Talabani baholash
            </h2>
            <p className="text-sm text-gray-600">
              {student.fullName || student.name}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Baho (1-100 oralig'ida)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={gradeInput}
            onChange={(e) => {
              let val = e.target.value;

              // Faqat raqam kiritsun
              if (!/^\d*$/.test(val)) return;
              // 100 dan katta bo'lsa 100 qilamiz
              if (val > 100) val = 100;
              // 0 yoki manfiy bo'lsa 1 qilamiz
              if (val < 0 && val !== "") val = 0;

              setGradeInput(val);
            }}
            placeholder="0 dan 100 gacha"
            className="w-full rounded-xl border border-gray-300 p-3 text-center text-lg font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setGradeModalOpen(false)}
            className="rounded-xl bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200"
          >
            Bekor qilish
          </button>

          <button
            onClick={async () => {
              const value = Number(gradeInput);
              if (!Number.isFinite(value) || value < 0 || value > 100) {
                toast.error("⚠️ Baho 0 dan 100 gacha bo'lishi kerak!");
                return;
              }
              try {
                await ApiCall(
                  `/api/v1/amaliyot-yuklama/${yuklamaId}/${value}`,
                  "PUT"
                );
                toast.success(`✅ ${student.fullName} uchun baho: ${value}`);
                setStatuses((prev) => ({ ...prev, grade: value }));
                setGradeModalOpen(false);
              } catch (err) {
                toast.error("❌ Bahoni saqlashda xatolik!");
              }
            }}
            className="rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-md transition-all duration-150 hover:from-blue-600 hover:to-indigo-700"
          >
            Saqlash
          </button>
        </div>
      </Modal>

      {/* 🔹 Rad etish modali */}
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
            xmlns="http://www.w3.org/2000/svg"
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
              {fileFields.find((f) => f.key === selectedField)?.label}{" "}
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

      {/* ✅ Tasdiqlashdan oldin ogohlantirish modali */}
      <Modal
        isOpen={confirmModalOpen}
        onRequestClose={() => setConfirmModalOpen(false)}
        contentLabel="Tasdiqlash oynasi"
        className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-2xl outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50"
      >
        <div className="mb-4 flex items-center text-green-600">
          <svg
            className="mr-2 h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold">Tasdiqlash</h2>
        </div>

        <p className="mb-6 text-gray-600">
          Siz haqiqatan ham
          <span className="font-medium">
            {" "}
            {student.fullName || student.name}{" "}
          </span>
          talabasining
          <span className="font-medium text-green-600">
            {" "}
            {fileFields.find((f) => f.key === pendingField)?.label}{" "}
          </span>
          faylini{" "}
          <span className="font-medium text-green-600">
            tasdiqlamoqchimisiz?
          </span>
        </p>
        <p className="mb-6 rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-gray-500">
          Fayl tasdiqlangach, talaba uchun bu hujjat qabul qilingan hisoblanadi
          va boshqa o'zgartirish kiritish mumkin bo'lmaydi.
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setConfirmModalOpen(false)}
            className="rounded-xl bg-gray-100 px-4 py-2.5 font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200"
          >
            Bekor qilish
          </button>
          <button
            onClick={() => {
              if (pendingField) {
                updateStatus(pendingField, 3);
                setConfirmModalOpen(false);
                setPendingField(null);
              }
            }}
            className="rounded-xl bg-gradient-to-r from-green-500 to-teal-600 px-4 py-2.5 font-medium text-white shadow-md transition-all duration-150 hover:from-green-600 hover:to-teal-700"
          >
            Ha, tasdiqlayman
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
