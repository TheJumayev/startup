import React, { useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "../../../components/loading/LoadingOverlay";
import Breadcrumbs from "views/BackLink/BackButton";

function StudentTable() {
  const [loading, setLoading] = useState(false);

  const handleUpdateStudents = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/groups/update-students/all", "GET");
      toast.success("Talabalar muvaffaqiyatli yangilandi!");
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Talabalarni yangilashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDavomat = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/score-sheet/nb/update-all", "GET");
      toast.success("Davomatlarni muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Davomatlarni yangilashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContracts = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/discount-student/update", "GET");
      toast.success("Kontraktlar muvaffaqiyatli yangilandi!");
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Kontraktlarni yangilashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCertificates = async () => {
    setLoading(true);
    try {
      const res = await ApiCall("/api/v1/student/update-certificate", "GET");
      toast.success("Sertifikatlar muvaffaqiyatli yangilandi!");
      console.log("Response:", res.data);
    } catch (error) {
      console.error("Xatolik:", error);
      toast.error("Sertifikatlarni yangilashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative p-6">
      {/* 🔹 Loading overlay */}
      <ToastContainer />
      {loading && <LoadingOverlay />}
      <Breadcrumbs />
      <div className="flex gap-4">
        <button
          onClick={handleUpdateStudents}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-white transition ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Yuklanmoqda..." : "Talabalarni yangilash"}
        </button>
        <button
          // onClick={handleUpdateContracts}
          onClick={() => alert("UCHQUN TOG'O UCHUN BUTTON EDI!")}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-white transition ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Yuklanmoqda..." : "Kontraktni yangilash"}
        </button>
        <button
          onClick={handleUpdateDavomat}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-white transition ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Yuklanmoqda..." : "Davomatni yangilash"}
        </button>
        {/* New Button for updating student certificates */}
        <button
          onClick={handleUpdateCertificates}
          disabled={loading}
          className={`rounded-md px-4 py-2 text-white transition ${
            loading
              ? "cursor-not-allowed bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Yuklanmoqda..." : "Sertifikatlarni yangilash"}
        </button>
      </div>
    </div>
  );
}

export default StudentTable;
