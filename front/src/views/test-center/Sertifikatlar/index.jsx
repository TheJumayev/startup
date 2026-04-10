import React, { useEffect, useState, useMemo } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import * as XLSX from "xlsx"; // ⬅⬅ qo'shildi
import Breadcrumbs from "views/BackLink/BackButton";

function CertificateList() {
  const [isExporting, setIsExporting] = useState(false); // Yangi state export holati uchun
  const [loader, setLoader] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isBallModalOpen, setIsBallModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [newBall, setNewBall] = useState("");

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res = await ApiCall("/api/v1/certificate", "GET");
        console.log(res);

        if (res.data && Array.isArray(res.data)) {
          setCertificates(res.data);
          setFilteredCertificates(res.data);
          toast.success("Sertifikatlar muvaffaqiyatli yuklandi!");
        } else {
          setCertificates([]);
          setFilteredCertificates([]);
          toast.info("Sertifikatlar mavjud emas");
        }
      } catch (err) {
        console.error("Error fetching certificates:", err);
        setError("Ma'lumotlarni olib bo'lmadi");
        toast.error("Sertifikatlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);
  const exportToExcel = () => {
    if (!filteredCertificates || filteredCertificates.length === 0) {
      toast.info("Eksport qilish uchun ma'lumot topilmadi");
      return;
    }

    setIsExporting(true); // Yuklash holatini yoqish

    // Jadval satrlarini tayyorlash
    const rows = filteredCertificates.map((cert, idx) => {
      const fio = cert?.student?.fullName || "";
      const group = cert?.student?.groupName || "";
      const semesterName = cert?.studentSubject?.semesterName || "";

      // Ballni to'g'ridan-to'g'ri olamiz
      const ball = cert?.student?.ball || cert?.ball || "";

      const subject = cert?.studentSubject?.name || "";
      const dateStr = cert?.created
        ? new Date(cert.created).toLocaleDateString("uz-UZ")
        : "";
      const code = cert?.number ?? cert?.code ?? cert?.id;

      return {
        "№": idx + 1,
        "Ism familiya": fio,
        Guruhi: group,
        Semester: semesterName,
        "Sertifikat olgan fani nomi": subject,
        Ball: ball,
        "Topshirgan sanasi": dateStr,
        "Sertifikat kodi": code,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 }, // №
      { wch: 40 }, // Ism familiya
      { wch: 10 }, // Guruhi
      { wch: 9 }, // semetr
      { wch: 70 }, // Fani nomi
      { wch: 4 }, // Ball
      { wch: 15 }, // Sana
      { wch: 12 }, // Sertifikat kodi
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sertifikatlar");

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const filename = `sertifikatlar_${yyyy}-${mm}-${dd}.xlsx`;

    // setTimeout ichiga o'rab qo'yamiz, DOM yangilanishi uchun vaqt berish uchun
    setTimeout(() => {
      XLSX.writeFile(wb, filename);
      setIsExporting(false); // Yuklash holatini o'chirish
      toast.success("Excel fayl yuklab olindi!");
    }, 100);
  };

  // Search functionality
  useEffect(() => {
    const results = certificates.filter(
      (cert) =>
        cert.student.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cert.studentSubject.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cert.number.toString().includes(searchTerm)
    );
    setFilteredCertificates(results);
  }, [searchTerm, certificates]);

  const handleDownload = async (certId, number) => {
    setLoader(true);
    try {
      const res = await fetch(baseUrl + `/api/v1/certificate/file/${certId}`, {
        method: "GET",
      });
      console.log(res);

      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${number || certId}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Sertifikat yuklab olindi!");
    } catch (e) {
      console.error(e);
      toast.error("Yuklab olishda xatolik yuz berdi");
    } finally {
      setLoader(false);
    }
  };

  const openBallModal = (certificate) => {
    setSelectedCertificate(certificate);
    setNewBall(certificate.ball);
    setIsBallModalOpen(true);
  };

  const closeBallModal = () => {
    setIsBallModalOpen(false);
    setSelectedCertificate(null);
    setNewBall("");
  };

  const handleBallUpdate = async () => {
    if (!selectedCertificate || newBall === "") {
      toast.error("Iltimos, ball kiriting!");
      return;
    }

    try {
      const studentId = selectedCertificate.student.id;
      const subjectId = selectedCertificate.studentSubject.id;
      const finalScore = parseFloat(newBall);

      // 🔹 API chaqiruvi (sizning backend endpointingizga moslab yozdim)
      const response = await ApiCall(
        `/api/v1/certificate/${studentId}/${subjectId}/${finalScore}`,
        "POST"
      );

      if (!response.error) {
        toast.success("Ball muvaffaqiyatli yangilandi!");

        // Jadvalni yangilash (frontend tarafda)
        const updatedCertificates = certificates.map((cert) =>
          cert.id === selectedCertificate.id
            ? { ...cert, ball: finalScore }
            : cert
        );

        setCertificates(updatedCertificates);
        closeBallModal();
      } else {
        toast.error("Ball yangilashda xatolik!");
      }
    } catch (err) {
      console.error("Xatolik:", err);
      toast.error("Ballni yangilash jarayonida xatolik yuz berdi!");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Yuklanmoqda...</span>
      </div>
    );

  if (error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          {error}
        </div>
      </div>
    );

  return (
    <div className="min-h-screen  p-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {loader && <LoadingOverlay />}
      <Breadcrumbs />

      <div className="max-w-8xl mx-auto">
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg">
          <div className="flex flex-col justify-between md:flex-row md:items-center">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-800">
                Sertifikatlar Ro'yxati
              </h1>
              <p className="text-gray-600">Barcha olingan sertifikatlaringiz</p>
            </div>
            <div className="mt-4 flex items-center space-x-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Sertifikat yoki fanni qidirish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:w-64"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <div className="rounded-lg bg-blue-100 px-4 py-2 text-blue-800">
                Jami: {filteredCertificates.length} ta sertifikat
              </div>
              <button
                onClick={exportToExcel}
                disabled={!filteredCertificates.length || isExporting}
                className={`
              relative inline-flex items-center justify-center gap-2 
              rounded-lg px-4 py-2 transition-all duration-300
              ${
                !filteredCertificates.length || isExporting
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow hover:shadow-md"
              }
              h-[42px] min-w-[120px]
            `}
                title="Sahifadagi barcha sertifikatlarni Excel'ga yuklash"
              >
                {isExporting ? (
                  <>
                    <div className="border-t-transparent h-5 w-5 animate-spin rounded-full border-2 border-white"></div>
                    <span>Yuklanmoqda...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M4 8h16"
                      ></path>
                    </svg>
                    <span>Excel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {filteredCertificates.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              {searchTerm
                ? "Hech narsa topilmadi"
                : "Sertifikatlar mavjud emas"}
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? "Boshqa kalit so'zlar bilan qayta urinib ko'ring"
                : "Hali hech qanday sertifikat olishmagan ko'rinasiz"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Sertifikat</h3>
                      <p className="mt-1 text-sm text-blue-100">
                        {cert.studentSubject.name}
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => handleDownload(cert.id, cert.number)}
                        className="flex items-center rounded-lg bg-white px-3 py-1.5 text-blue-600 transition-colors duration-200 hover:bg-blue-50"
                      >
                        <svg
                          className="mr-1.5 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>
                        Yuklab olish
                      </button>
                      <h4>{cert.studentSubject.semesterName}</h4>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 rounded-lg bg-blue-100 p-2">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {cert.student.fullName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {cert.student.groupName}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Ball</p>
                      <p className="text-lg font-bold text-blue-600">
                        {cert.ball}/100
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500">Sana</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(cert.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-xs text-green-600">Fan nomi</p>
                    <p className="text-sm font-medium text-green-800">
                      {cert.studentSubject.name}
                    </p>
                  </div> */}
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Sertifikat raqami</span>
                    <span className="font-mono font-semibold text-gray-700">
                      #{cert.number}
                    </span>
                  </div>

                  {/* Ball kiritish tugmasi */}
                  {/* <div className="mt-3">
                    <button
                      onClick={() => openBallModal(cert)}
                      className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700"
                    >
                      Ballni tahrirlash
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ball kiritish modali */}
      {isBallModalOpen && (
        <div className="bg-black fixed inset-0 flex items-center justify-center bg-opacity-40">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Ballni tahrirlash</h2>
            <p className="mb-2">
              Talaba: {selectedCertificate?.student.fullName}
            </p>
            <p className="mb-2">
              Fan: {selectedCertificate?.studentSubject.name}
            </p>
            <p className="mb-4">Joriy ball: {selectedCertificate?.ball}/100</p>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yangi ball
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0-100 oralig'ida ball kiriting"
                value={newBall}
                onChange={(e) => setNewBall(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeBallModal}
                className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleBallUpdate}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CertificateList;
