import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../config";

const CertificateVerify = () => {
  const { groupId, curriculumSubjectId, studentId } = useParams();
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const res = await axios.get(
        `${baseUrl}/api/v1/mustaqil-talim-certificate/certificate/${groupId}/${curriculumSubjectId}/${studentId}`,
        {
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "image/png" });
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (e) {
      console.error(e);
      setError("Sertifikat topilmadi yoki bekor qilingan");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {error ? (
        <div className="rounded-xl bg-white p-6 text-center shadow">
          <h2 className="text-xl font-bold text-red-600">❌ Xatolik</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      ) : imageUrl ? (
        <div className="rounded-xl bg-white p-4 shadow-xl">
          <img
            src={imageUrl}
            alt="Certificate"
            className="max-w-full rounded-lg"
          />
          <p className="mt-3 text-center text-sm text-gray-500">
            Sertifikat haqiqiy ✔
          </p>
        </div>
      ) : (
        <p className="text-gray-600">Yuklanmoqda...</p>
      )}
    </div>
  );
};

export default CertificateVerify;
