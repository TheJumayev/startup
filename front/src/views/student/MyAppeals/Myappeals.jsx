import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaDownload, FaSpinner, FaExclamationCircle } from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

function Myappeal() {
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const token = localStorage.getItem("authToken");
  // status label va ranglarni map qilib oldindan belgilab olamiz
  const statusMap = {
    0: { label: "Jarayonda!", color: "text-yellow-600" },
    1: { label: "Qabul qilindi!", color: "text-green-600" },
    2: { label: "Rad etildi!", color: "text-red-600" },
    default: { label: "Noma'lum", color: "text-gray-600" },
  };

  useEffect(() => {
    if (!token) {
      navigate("/student/login");
      return;
    }
    fetchStudentData(token);
  }, [navigate, token]);

  const fetchStudentData = async (token) => {
    try {
      setLoading(true);
      const response = await ApiCall(
        `/api/v1/student/account/all/me/${token}`,
        "GET"
      );
      if (response.error === true) {
        localStorage.clear();
        navigate("/student/login");
        return;
      }
      fetchAppeals(response.data?.id);
    } catch (error) {
      console.error("Error fetching student data:", error);
      navigate("/student/login");
    }
  };

  const fetchAppeals = async (id) => {
    try {
      const response = await ApiCall(`/api/v1/appeal/student/${id}`, "GET");
      console.log(response.data);

      if (response && Array.isArray(response.data)) {
        setAppeals(response.data);
      } else {
        setAppeals([]);
      }
    } catch (err) {
      console.error("Xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (appealId) => {
    setDownloading(appealId);
    try {
      const element = document.getElementById(`appeal-${appealId}`);
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ariza_${appealId}.pdf`);
    } catch (error) {
      console.error("PDF yuklab olishda xatolik:", error);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Mening arizalarim
          </h1>
          <p className="mt-2 text-gray-600">
            Barcha yuborilgan arizalaringiz ro'yxati
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FaSpinner className="mx-auto h-12 w-12 animate-spin text-blue-600" />
              <p className="mt-4 text-gray-600">Arizalar yuklanmoqda...</p>
            </div>
          </div>
        ) : appeals.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <FaExclamationCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Arizalar topilmadi
            </h3>
            <p className="mt-2 text-gray-600">
              Hozircha hech qanday ariza topshirmagansiz
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {appeals.map((appeal) => {
              const qrUrl = `https://edu.bxu.uz/appeals/${appeal.id}`;
              return (
                <div
                  key={appeal.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="p-6" id={`appeal-${appeal.id}`}>
                    {/* Sarlavha qismi */}
                    <div className="mb-8 flex items-start justify-between">
                      <div
                        className={
                          appeal.status === 0
                            ? "text-yellow-600"
                            : appeal.status === 1
                              ? "text-green-600"
                              : appeal.status === 2
                                ? "text-red-600"
                                : "text-gray-600"
                        }
                      >
                        {appeal.status === 0
                          ? "Jarayonda!"
                          : appeal.status === 1
                            ? "Qabul qilindi!"
                            : appeal.status === 2
                              ? "Rad etildi!"
                              : "Noma'lum"}
                      </div>

                      <div className="w-40 text-justify text-sm text-gray-600">
                        <p>{appeal.text1}</p>
                      </div>
                    </div>

                    {/* Asosiy kontent */}
                    <div className="py-8">
                      <div className="mb-8 text-center">
                        <h3 className="text-2xl font-bold text-blue-800">
                          A R I Z A
                        </h3>
                      </div>
                      <div className="px-4">
                        <p className="text-justify text-lg leading-relaxed text-gray-700">
                          {appeal.text2}
                        </p>
                      </div>
                    </div>

                    {/* Imzo va sana */}
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Sana:{" "}
                        {new Date(appeal.createdAt).toLocaleDateString("uz-UZ")}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-700">
                          {appeal.student?.fullName}
                        </p>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="mt-10 flex justify-end text-center">
                      <QRCodeCanvas value={qrUrl} size={120} />
                    </div>
                  </div>

                  {/* Tugmalar */}
                  <div className="flex justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                      onClick={() => navigate(`/appeals/${appeal.id}`)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Ko‘rish
                    </button>

                    <button
                      onClick={() => downloadPDF(appeal.id)}
                      disabled={downloading === appeal.id}
                      className="border-transparent inline-flex items-center rounded-md border bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75"
                    >
                      {downloading === appeal.id ? (
                        <>
                          <FaSpinner className="-ml-1 mr-2 h-4 w-4 animate-spin" />
                          Yuklanmoqda...
                        </>
                      ) : (
                        <>
                          <FaDownload className="-ml-1 mr-2 h-4 w-4" />
                          PDF yuklab olish
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Myappeal;
