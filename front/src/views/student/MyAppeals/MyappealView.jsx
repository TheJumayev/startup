import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
// ❌ default import emas
// import QRCode from "qrcode.react";

// ✅ to‘g‘ri import
import { QRCodeCanvas } from "qrcode.react";

function MyappealView() {
  const { id } = useParams(); // URL dan appealId
  const navigate = useNavigate();
  const [appeal, setAppeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppeal();
  }, []);

  const fetchAppeal = async () => {
    try {
      const res = await ApiCall(`/api/v1/appeal/${id}`, "GET");
      setAppeal(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Appealni olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Yuklanmoqda...</div>;
  if (!appeal) return <div className="p-6">Ariza topilmadi</div>;

  // Hozirgi domen asosida QR link
  const qrUrl = `https://edu.bxu.uz/appeals/${id}`;

  return (
    <div className="min-h-screen px-4 pt-2 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow">
        {/* Sarlavha qismi */}
        <div className="mx-auto mb-8 flex max-w-2xl  justify-between">
          <div
            className={
              appeal.status === 0
                ? "text-xs text-yellow-600 md:text-xl"
                : appeal.status === 1
                ? "text-xs text-green-600 md:text-xl"
                : appeal.status === 2
                ? "text-xs text-red-600 md:text-xl"
                : "text-xs text-gray-600 md:text-xl"
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
          <div className="w-[9rem] text-justify text-xs text-gray-600 md:w-[14rem] md:text-lg">
            <p>{appeal.text1}</p>
          </div>
        </div>

        {/* Asosiy kontent */}
        <div className="mx-auto max-w-lg py-8">
          <div className="mb-2 text-center md:mb-8">
            <h3 className="text-lg font-bold text-blue-800 md:text-2xl">
              A R I Z A
            </h3>
          </div>
          <div className="px-4">
            <p className="text-justify text-sm leading-relaxed text-gray-700 md:text-lg">
              {appeal.text2}
            </p>
          </div>
        </div>

        {/* Imzo va sana */}
        <div className="mt-16 flex items-center justify-between md:mt-24">
          <div className="text-sm text-gray-500">
            Sana: {new Date(appeal.createdAt).toLocaleDateString("uz-UZ")}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {appeal.student?.fullName}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-10 flex justify-end text-center">
          <QRCodeCanvas
            value={`https://edu.bxu.uz/appeals/${appeal.id}`}
            size={150}
          />
        </div>
      </div>
    </div>
  );
}

export default MyappealView;
