import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config/index";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { QRCodeCanvas } from "qrcode.react";
import logo from "../../../assets/img/ebxu_images/logo.jpg";
import { data } from "autoprefixer";
import { toast } from "react-toastify";

function CheckAppeals() {
  const navigate = useNavigate();
  const [appealTypes, setAppealTypes] = useState([]);
  const [selectedAppealType, setSelectedAppealType] = useState("");
  const [appeals, setAppeals] = useState([]);

  // modal
  const [openModal, setOpenModal] = useState(false);
  const [currentAppeal, setCurrentAppeal] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState(null); // 1=tasdiq, 2=rad
  const [responseText, setResponseText] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null = barchasi
  const [contracts, setContracts] = useState({});

  const statusOptions = [
    { id: null, label: "Barchasi" },
    { id: 0, label: "Ko'rib chiqilmoqda" },
    { id: 1, label: "Tasdiqlangan" },
    { id: 2, label: "Rad etilgan" },
  ];

  const getContract = async (studentIdNumber) => {
    try {
      const response = await ApiCall(
        `/api/v1/contract/student/${studentIdNumber}`,
        "GET",
        null
      );

      setContracts((prev) => ({
        ...prev,
        [studentIdNumber]: response.data, // har bir studentIdNumber bo‘yicha saqlash
      }));
    } catch (error) {
      console.error("Kontraktni yuklashda xatolik:", error);
      toast.error("Kontrakt yuklanmadi!");
    }
  };
  // ✅ Filtrlangan natija
  const filteredAppeals = (
    statusFilter === null
      ? appeals
      : appeals.filter((a) => a.status === statusFilter)
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // 🔽 yangi sana yuqorida

  const id = localStorage.getItem("adminId");

  useEffect(() => {
    if (id) {
      getAdminAppeals(id);
    } else {
      navigate("/admin/login");
    }
  }, [id]);

  const getAdminAppeals = async (adminId) => {
    try {
      const response = await ApiCall(
        `/api/v1/admin-duty/by-admin/${adminId}`,
        "GET",
        null
      );
      console.log(response.data);

      // endi response.data obyekt, ichida appealType bor
      const types = response.data.appealType || [];
      setAppealTypes(types);
    } catch (error) {
      navigate("/admin/login");
    }
  };

  const handleSelectChange = async (e) => {
    const appealTypeId = e.target.value;
    setSelectedAppealType(appealTypeId);

    if (appealTypeId) {
      try {
        const response = await ApiCall(
          `/api/v1/appeal/appeal-type/${appealTypeId}`,
          "GET",
          null
        );
        const appealsData = response.data || [];
        setAppeals(appealsData);

        // barcha kontraktlarni parallel yuklash
        const contractPromises = appealsData.map((item) => {
          const sid = item.student?.studentIdNumber;
          return sid ? ApiCall(`/api/v1/contract/student/${sid}`, "GET") : null;
        });

        const contractResults = await Promise.all(contractPromises);

        const newContracts = {};
        contractResults.forEach((res, idx) => {
          const sid = appealsData[idx].student?.studentIdNumber;
          if (res && sid) newContracts[sid] = res.data;
        });

        setContracts(newContracts);
      } catch (error) {
        console.error("AppealType fetch error:", error);
      }
    } else {
      setAppeals([]);
      setContracts({});
    }
  };

  const openRespondModal = (appeal, status) => {
    setCurrentAppeal(appeal);
    setDecisionStatus(status);
    setResponseText("");
    setOpenModal(true);
  };

  const handleRespond = async () => {
    if (!currentAppeal) return;
    try {
      await ApiCall(
        `/api/v1/appeal/respond/${
          currentAppeal.id
        }?responseText=${encodeURIComponent(
          responseText
        )}&status=${decisionStatus}`,
        "PUT",
        null
      );

      // UI ni yangilash
      setAppeals((prev) =>
        prev.map((a) =>
          a.id === currentAppeal.id
            ? { ...a, status: decisionStatus, responseText }
            : a
        )
      );

      setOpenModal(false);
    } catch (error) {
      console.error("Respond error:", error);
    }
  };
  const qrUrl = `https://edu.bxu.uz/appeals/${id}`;

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="mb-6 border-b-2 border-blue-500 pb-3 text-2xl font-bold text-gray-800">
        Arizalarni Tekshirish
      </h1>

      <div className="mb-6 rounded-lg bg-white p-5 shadow-md">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* ✅ Select */}
          <div className="w-full md:w-1/2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ariza turini tanlang
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              value={selectedAppealType}
              onChange={handleSelectChange}
            >
              <option value="" disabled hidden>
                Ariza turini tanlang
              </option>
              {appealTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/2">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Holat bo'yicha filtrlash
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s.id ?? "all"}
                  onClick={() => setStatusFilter(s.id)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${
                    statusFilter === s.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid cursor-default select-none grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredAppeals.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-lg text-gray-500">
                Hozircha arizalar mavjud emas
              </p>
            </div>
          ) : (
            filteredAppeals.map((a) => (
              <div
                key={a.id}
                className="overflow-hidden rounded-xl border-l-4 border-blue-500 bg-white shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 p-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
    ${
      a.dekanStatus === false
        ? "bg-red-100 text-red-800"
        : a.status === 0
        ? "bg-yellow-100 text-yellow-800"
        : a.status === 1
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
    }`}
                  >
                    {a.dekanStatus === false
                      ? "Rad etilgan"
                      : a.status === 0
                      ? "Ko'rib chiqilmoqda"
                      : a.status === 1
                      ? "Tasdiqlangan"
                      : "Rad etilgan"}
                  </span>

                  <div className="mt-2 w-40 text-sm text-gray-500 md:mt-0">
                    {a.text1}
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5 text-center">
                    <h2 className="text-xl font-bold text-blue-700">
                      A R I Z A
                    </h2>
                  </div>

                  <div className="mt-4 whitespace-pre-line  p-4 text-gray-700">
                    {a.text2}
                  </div>

                  <div className="mt-24 flex flex-col items-start justify-between gap-2 text-sm text-gray-600 sm:flex-row sm:items-center">
                    <p>
                      Sana: {new Date(a.createdAt).toLocaleDateString("uz-UZ")}
                    </p>
                    <span
                      onClick={() =>
                        navigate(`/student/history/${a.student?.id}`)
                      }
                      className="cursor-pointer font-medium text-blue-600 hover:underline"
                    >
                      {a.student?.fullName}
                    </span>
                  </div>

                  <div className="mt-4 flex w-full justify-between">
                    <div className="w-3/4">
                      {a.responseText && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                          <h3 className="mb-2 font-semibold text-blue-800">
                            Admin javobi:
                          </h3>
                          <p className="text-blue-700">{a.responseText}</p>
                        </div>
                      )}
                    </div>

                    <div className="relative inline-block">
                      {/* QR Code */}
                      <QRCodeCanvas
                        value={`https://edu.bxu.uz/appeals/${a.id}`}
                        size={180} // kattaroq qildik
                        level="H" // ✅ yuqori correction level
                        includeMargin={true}
                      />

                      {/* Logo (overlay markazda oq fon bilan) */}
                      {/* <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ">
                      <img
                        src={logo}
                        alt="Logo"
                        className="h-14 w-14 rounded-full object-contain"
                      />
                    </div> */}
                    </div>
                  </div>
                  <div className="mt-2 p-6">
                    {(() => {
                      // Har bir talaba uchun o‘z kontrakti olinadi
                      const studentId = a.student?.studentIdNumber;
                      const contract = contracts[studentId];

                      if (!contract) {
                        return (
                          <p className="font-medium text-red-600">
                            Sizga kontrakt topilmadi. Registrator ofisga
                            murojaat qiling.
                          </p>
                        );
                      }

                      return (
                        <div className="items-center justify-between md:flex">
                          <div>
                            <p className="text-sm text-gray-500">
                              To'lanishi kerak summa
                            </p>
                            <p className="text-lg font-semibold">
                              {contract.amount?.toLocaleString()} so'm
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">To'lov</p>
                            <p className="text-lg font-semibold text-yellow-500">
                              {(contract.payment || 0).toLocaleString()} so'm
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Qarzdorlik</p>
                            <p className="text-lg font-semibold text-red-600">
                              {(contract.debt || 0).toLocaleString()} so'm
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    {a.dekan?.name &&
                      a.dekanStatus === true &&
                      a.status === 0 && (
                        <div className="mt-5 flex w-full justify-end gap-3">
                          <button
                            onClick={() => openRespondModal(a, 1)}
                            className="w-full rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                          >
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => openRespondModal(a, 2)}
                            className="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
                          >
                            Rad etish
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        center
        classNames={{
          overlay: "customOverlay",
          modal: "customModal rounded-xl",
        }}
        styles={{
          modal: {
            padding: "0",
            borderRadius: "12px",
            maxWidth: "500px",
            width: "90%",
          },
        }}
      >
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Arizaga javob berish
          </h2>
          <p className="mb-4 text-gray-600">
            Talaba: {currentAppeal?.student?.fullName}
          </p>

          <label className="mb-2 block text-sm font-medium text-gray-700">
            Izoh (ixtiyoriy)
          </label>
          <textarea
            className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Javob matnini kiriting..."
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setOpenModal(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleRespond}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Yuborish
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CheckAppeals;
