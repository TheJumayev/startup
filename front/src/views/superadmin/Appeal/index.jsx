import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

function Appeal() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  // yangi state — sabablar uchun
  const [reasons, setReasons] = useState([{ id: Date.now(), value: "" }]);

  const [form, setForm] = useState({
    id: null,
    name: "",
    status: true,
    proof: false,
    isText3: false,
    date: 0,
    text1:
      "Buxoro Xalqaro universiteti rektori Barotov Sh. R. ga _guruh_ guruh talabasi _talaba_ism_familya_ tomonidan",
    text2:
      "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman.",
  });

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const response = await ApiCall(`/api/v1/appeal-type`, "GET");
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

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleDateChange = (dateValue) => {
    let text2 = "";

    if (dateValue === 0) {
      text2 = form.isText3
        ? "Menga _sabab_ Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman."
        : "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman.";
    } else if (dateValue === 1) {
      text2 = form.isText3
        ? "Menga _sana1_ _sabab_ javob berishingizni so‘rayman."
        : "Menga _sana1_ javob berishingizni so‘rayman.";
    } else if (dateValue === 2) {
      text2 = form.isText3
        ? "Menga _sana1_ dan _sana2_ gacha _sabab_ javob berishingizni so‘rayman."
        : "Menga _sana1_ dan _sana2_ gacha javob berishingizni so‘rayman.";
    }

    setForm({
      ...form,
      date: dateValue,
      text2,
    });
  };

  // input qiymatini yangilash
  const handleReasonChange = (id, value) => {
    setReasons((prev) => prev.map((r) => (r.id === id ? { ...r, value } : r)));
  };

  // yangi input qo‘shish
  const addReasonInput = () => {
    setReasons([...reasons, { id: Date.now(), value: "" }]);
  };

  // inputni o‘chirish (agar backendga allaqachon saqlangan bo‘lsa → delete API chaqiladi)
  const deleteReasonInput = async (id, backendId = null) => {
    if (backendId) {
      try {
        await ApiCall(`/api/v1/reason/${backendId}`, "DELETE");
      } catch (err) {
        console.error("Delete xato:", err);
      }
    }
    setReasons((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReasonToggle = () => {
    const updatedReason = !form.isText3;
    let text2 = form.text2;

    if (form.date === 0) {
      text2 = updatedReason
        ? "Menga _sabab_ Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman."
        : "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman.";
    } else if (form.date === 1) {
      text2 = updatedReason
        ? "Menga _sana1_ _sabab_ javob berishingizni so‘rayman."
        : "Menga _sana1_ javob berishingizni so‘rayman.";
    } else if (form.date === 2) {
      text2 = updatedReason
        ? "Menga _sana1_ dan _sana2_ gacha _sabab_ javob berishingizni so‘rayman."
        : "Menga _sana1_ dan _sana2_ gacha javob berishingizni so‘rayman.";
    }

    setForm({
      ...form,
      isText3: updatedReason,
      text2,
    });
  };
  const handleSave = async () => {
    try {
      let savedAppeal = null;

      if (form.id) {
        // agar tahrirlash bo‘lsa
        const res = await ApiCall(`/api/v1/appeal-type`, "PUT", form);
        savedAppeal = res.data;
      } else {
        // agar yangi qo‘shish bo‘lsa
        const res = await ApiCall(`/api/v1/appeal-type`, "POST", form);
        savedAppeal = res.data; // 👉 backend qaytarayotgan appeal type obyektini olish
      }
      console.log(savedAppeal);

      // ✅ Endi id ni olib sabablarni yuboramiz
      if (form.isText3 && savedAppeal?.id) {
        for (let r of reasons) {
          if (r.value.trim() !== "") {
            await ApiCall(`/api/v1/reason/${savedAppeal.id}`, "POST", {
              name: r.value,
            });
          }
        }
      }

      // Form reset
      setForm({
        id: null,
        name: "",
        status: true,
        proof: false,
        isText3: false,
        date: 0,
        text1:
          "Buxoro Xalqaro universiteti rektori Barotov Sh. R. ga _guruh_ guruh talabasi _talaba_ism_familya_ tomonidan",
        text2:
          "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman.",
      });
      setReasons([{ id: Date.now(), value: "" }]); // sabab inputlarini ham tozalash
      setOpenModal(false);
      fetchAppeals();
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
    }
  };

  const handleEdit = (appeal) => {
    setForm(appeal);
    setOpenModal(true);
  };

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Murojaatlar Boshqaruvi
        </h1>
        <button
          onClick={() => {
            setForm({
              id: null,
              name: "",
              status: true,
              proof: false,
              isText3: false,
              date: 0,
              text1:
                "Buxoro Xalqaro universiteti rektori Barotov Sh. R. ga _guruh_ guruh talabasi _talaba_ism_familya_ tomonidan",
              text2:
                "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman.",
            });
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none"
        >
          <i className="fas fa-plus"></i>
          Yangi Murojaat
        </button>
      </div>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        center
        classNames={{
          modal: "rounded-lg p-6 max-w-4xl",
        }}
      >
        <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-gray-800">
          {form.id ? "Murojaatni Tahrirlash" : "Yangi Murojaat Qo'shish"}
        </h2>
        <div className="w-full gap-8 md:flex">
          <div className="w-full space-y-4 md:w-1/2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Murojaat nomi
              </label>
              <input
                type="text"
                name="name"
                placeholder="Murojaat nomi"
                value={form.name}
                onChange={handleChange}
                className="focus:border-transparent w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex items-center space-x-2 rounded-md bg-gray-100 p-3">
                <input
                  type="checkbox"
                  name="status"
                  checked={form.status}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Faol</span>
              </label>

              <label className="flex items-center space-x-2 rounded-md bg-gray-100 p-3">
                <input
                  type="checkbox"
                  name="proof"
                  checked={form.proof}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Asos majburiy</span>
              </label>

              <div>
                {" "}
                {/* Sabab qo‘shish checkbox */}
                <div className="mb-3">
                  <label className="flex items-center space-x-2 rounded-md bg-gray-100 p-3">
                    <input
                      type="checkbox"
                      checked={form.isText3}
                      className="h-4 w-4 text-blue-600"
                      onChange={(e) =>
                        setForm({ ...form, isText3: e.target.checked })
                      }
                    />
                    Sabab qo'shish
                  </label>
                </div>
                {/* Sabab inputlari */}
                <div>
                  {form.isText3 && (
                    <div className="space-y-2">
                      {reasons.map((r) => (
                        <div key={r.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={r.value}
                            onChange={(e) =>
                              handleReasonChange(r.id, e.target.value)
                            }
                            placeholder="Sabab kiriting"
                            className="flex-1 rounded-md border p-2"
                          />
                          <button
                            onClick={() => addReasonInput()}
                            className="rounded bg-green-500 px-2 py-1 text-white"
                          >
                            +
                          </button>
                          <button
                            onClick={() => deleteReasonInput(r.id, r.backendId)}
                            className="rounded bg-red-500 px-2 py-1 text-white"
                          >
                            🗑
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sana formati
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100">
                  <input
                    type="radio"
                    name="date"
                    value={0}
                    checked={form.date === 0}
                    onChange={() => handleDateChange(0)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>Sana mavjud emas</span>
                </label>

                <label className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100">
                  <input
                    type="radio"
                    name="date"
                    value={1}
                    checked={form.date === 1}
                    onChange={() => handleDateChange(1)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>1 ta sana</span>
                </label>

                <label className="flex items-center space-x-2 rounded-md p-2 hover:bg-gray-100">
                  <input
                    type="radio"
                    name="date"
                    value={2}
                    checked={form.date === 2}
                    onChange={() => handleDateChange(2)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>2 ta sana</span>
                </label>
              </div>

              <div className="mt-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Murojaat matni
                </label>
                <textarea
                  name="text2"
                  value={form.text2}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Murojaat matnini kiriting"
                  className="w-full resize-none rounded-md border border-gray-300 p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              <i className={`fas ${form.id ? "fa-save" : "fa-plus"}`}></i>
              {form.id ? "Yangilash" : "Qo'shish"}
            </button>
          </div>

          <div className="mt-6 w-full md:mt-0 md:w-1/2">
            <h3 className="mb-4 text-lg font-semibold text-gray-700">
              Murojaat ko'rinishi
            </h3>
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 text-gray-800 shadow-sm">
              <div className="mb-12 flex justify-end">
                <div className="w-40 whitespace-pre-line text-sm text-gray-600">
                  {form.text1}
                </div>
              </div>
              <div className="text-center text-lg font-bold text-blue-800">
                ARIZA
              </div>
              <div className="mt-4 whitespace-pre-line text-sm leading-relaxed">
                {form.text2}
              </div>
              <div className="mt-10 flex justify-between text-sm text-gray-500">
                <span>_bugungi_sana_</span>
                <span>_talaba_ism_familya_</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Jadval */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-600">
                  <th className="py-3 px-4 text-left font-medium">#</th>
                  <th className="py-3 px-4 text-left font-medium">Nomi</th>
                  <th className="py-3 px-4 text-left font-medium">Text</th>

                  <th className="py-3 px-4 text-left font-medium">Holati</th>
                  <th className="py-3 px-4 text-left font-medium">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appeals.map((a, i) => (
                  <tr key={a.id} className="transition-colors hover:bg-gray-50">
                    <td className="py-3 px-4">{i + 1}</td>
                    <td className="py-3 px-4 font-medium">{a.name}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {a.text2 || "-"}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          a.status
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {a.status ? "Faol" : "Nofaol"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(a)}
                        className="rounded-md p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                        title="Tahrirlash"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appeals.length === 0 && !loading && (
            <div className="py-8 text-center text-gray-500">
              <i className="fas fa-inbox mb-2 text-4xl opacity-50"></i>
              <p>Hozircha hech qanday murojaat mavjud emas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Appeal;
