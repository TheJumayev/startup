import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Select from "react-select";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

function Appeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const adminId = localStorage.getItem("adminId");
  const navigate = useNavigate();

  const statusOptions = [
    { value: "all", label: "Barchasi" },
    { value: "0", label: "Ko'rib chiqilmoqda" },
    { value: "1", label: "Tasdiqlangan" },
    { value: "2", label: "Rad etilgan" },
  ];

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const groupRes = await ApiCall(
        `/api/v1/dekan/connect-group/${adminId}`,
        "GET"
      );
      const groupList = groupRes.data.group || [];
      const options = groupList.map((g) => ({
        value: g.id,
        label: g.name,
      }));
      setGroups(options);

      if (options.length > 0) {
        setSelectedGroup(options[0]);
        setStatusFilter(statusOptions[0]);
        fetchAppeals(options[0].value, statusOptions[0].value);
      }
    } catch (err) {
      console.error("❌ Guruhlarni olishda xatolik:", err);
    }
  };

  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption);
    if (statusFilter) {
      fetchAppeals(selectedOption.value, statusFilter.value);
    }
  };

  const handleStatusChange = (selectedOption) => {
    setStatusFilter(selectedOption);
    if (selectedGroup) {
      fetchAppeals(selectedGroup.value, selectedOption.value);
    }
  };

  // ✅ API chaqirish
  const handleRespond = async () => {
    if (!selectedAppeal || !selectedStatus) return;
    try {
      const response = await ApiCall(
        `/api/v1/appeal/dekan/${selectedAppeal.id}/${adminId}/${selectedStatus}`,
        "PUT"
      );
      console.log(response.data);

      // 🔑 UI'da status va dekanStatusni o'zingiz yangilaysiz
      setAppeals((prev) =>
        prev.map((a) =>
          a.id === selectedAppeal.id
            ? { ...a, dekanStatus: selectedStatus === 1 ? true : false }
            : a
        )
      );
    } catch (err) {
      console.error("❌ Javob yuborishda xatolik:", err);
    } finally {
      setConfirmModal(false);
      setSelectedAppeal(null);
      setSelectedStatus(null);
    }
  };

  // ✅ Filtrlash
  const fetchAppeals = async (groupId, status = "all") => {
    try {
      setLoading(true);
      const appealRes = await ApiCall(
        `/api/v1/appeal/by-group/${groupId}`,
        "GET"
      );
      let data = appealRes.data;
      console.log(data);

      if (status !== "all") {
        if (status === "0") {
          data = data.filter((a) => a.dekanStatus === null && a.status === 0);
        } else if (status === "1") {
          data = data.filter((a) => a.dekanStatus === true || a.status === 1);
        } else if (status === "2") {
          data = data.filter((a) => a.dekanStatus === false || a.status === 2);
        }
      }
      setAppeals(data);
    } catch (err) {
      console.error("❌ Appeals olishda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  // Status badge text
  const renderStatus = (appeal) => {
    if (appeal.dekanStatus === true) return "Tasdiqlangan";
    if (appeal.dekanStatus === false) return "Rad etilgan";
    return "Ko'rib chiqilmoqda"; // null bo'lsa
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold md:text-3xl">
            Arizalar Boshqaruvi
          </h2>
          <p className="mt-2 text-sm opacity-90 md:text-base">
            Guruhlarning arizalarini ko'rib chiqish va boshqarish
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-md md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Guruhni tanlang
              </label>
              <Select
                value={selectedGroup}
                onChange={handleGroupChange}
                options={groups}
                placeholder="Guruh tanlang..."
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status bo'yicha filtrlash
              </label>
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                options={statusOptions}
                placeholder="Status tanlang..."
                isSearchable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="mt-2 flex items-center md:mt-0">
              <span className="mr-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                {appeals.length} ta ariza
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-xl bg-white shadow-md">
            <div className="text-center">
              <div className="border-r-transparent inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600"></div>
              <p className="mt-3 text-gray-600">Ma'lumotlar yuklanmoqda...</p>
            </div>
          </div>
        ) : appeals.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl bg-white shadow-md">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-gray-600">Hozircha ariza yo'q</p>
              <p className="text-sm text-gray-500">
                Boshqa guruh yoki statusni tanlab ko'ring
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {appeals.map((a) => (
              <div
                key={a.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition-all duration-200 hover:shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between border-b border-gray-100 p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                    ${
                      a.dekanStatus === true
                        ? " text-green-600"
                        : a.dekanStatus === false
                        ? " text-red-600"
                        : " text-yellow-600"
                    }`}
                  >
                    {renderStatus(a)}
                  </span>

                  <div className="mt-2 max-w-[160px] text-justify text-xs text-gray-500 md:mt-0 md:text-sm">
                    {a.text1}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-bold text-blue-700 md:text-xl">
                      A R I Z A
                    </h2>
                  </div>

                  <div className="mb-10 mt-3 max-h-40 overflow-y-auto whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                    {a.text2}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-gray-600 md:flex-row md:text-sm">
                    <p>
                      Sana: {new Date(a.createdAt).toLocaleDateString("uz-UZ")}
                    </p>
                    <span className="font-medium text-blue-600">
                      {a.student?.fullName}
                    </span>
                  </div>

                  {/* Response + QR */}
                  <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row">
                    <div className="flex-1">
                      {a.responseText && (
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                          <h3 className="mb-1 text-sm font-semibold text-blue-800 md:text-base">
                            Admin javobi:
                          </h3>
                          <p className="text-xs text-blue-700 md:text-sm">
                            {a.responseText}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end md:block">
                      <QRCodeCanvas
                        value={`https://edu.bxu.uz/appeals/${a.id}`}
                        size={120}
                        level="H"
                        includeMargin={true}
                        className="self-end"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  {a.dekanStatus === null && (
                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setSelectedAppeal(a);
                          setSelectedStatus(1);
                          setConfirmModal(true);
                        }}
                        className="rounded-lg bg-green-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-600 md:px-4 md:py-2 md:text-sm"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAppeal(a);
                          setSelectedStatus(2);
                          setConfirmModal(true);
                        }}
                        className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600 md:px-4 md:py-2 md:text-sm"
                      >
                        Rad etish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Confirm Modal */}
        <Modal
          open={confirmModal}
          onClose={() => setConfirmModal(false)}
          center
          classNames={{
            modal: "rounded-xl p-6 md:p-8 max-w-md",
          }}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-16 w-16 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="my-4 text-xl font-semibold text-gray-800">
              Ishonchingiz komilmi?
            </h2>
            <p className="mb-6 text-gray-600">
              Ushbu arizaga javob berishni xohlaysizmi?
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setConfirmModal(false)}
              className="rounded-lg bg-gray-300 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-400"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleRespond}
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ha, tasdiqlayman
            </button>
          </div>
        </Modal>
      </div>

      {/* Add custom styles for react-select */}
      <style jsx>{`
        :global(.react-select-container) {
          font-size: 0.875rem;
        }
        :global(.react-select__control) {
          border-radius: 0.5rem;
          border-color: #d1d5db;
          min-height: 42px;
        }
        :global(.react-select__control:hover) {
          border-color: #9ca3af;
        }
        :global(.react-select__value-container) {
          padding: 0 12px;
        }
        :global(.react-select__input) {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
}

export default Appeals;
