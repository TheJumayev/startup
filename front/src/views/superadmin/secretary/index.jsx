import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdAddTask, MdDelete, MdModeEditOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";
import Breadcrumbs from "views/BackLink/BackButton";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    id: "",
    name: "",
    phone: "",
    password: "",
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [show, setShow] = useState(false);
  const [dutyModal, setDutyModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [duties, setDuties] = useState([]);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [appealTypes, setAppealTypes] = useState([]);
  const [selectedAppealTypes, setSelectedAppealTypes] = useState([]);

  // appeal type olish funksiyasi o‘sha holatda qoladi
  const fetchAppealTypes = async () => {
    try {
      const res = await ApiCall(`/api/v1/appeal-type`, "GET");
      if (!res.error) {
        const opts = res.data.map((item) => ({
          value: item.id,
          label: item.name, // AppealType entity da nom maydoni
        }));
        setAppealTypes(opts);
      } else {
        setAppealTypes([]);
      }
    } catch (err) {
      console.error("AppealType olishda xatolik:", err);
      setAppealTypes([]);
    }
  };

  // AdminDuty yaratish (saqlash tugmasi bosilganda)
  // AdminDuty yaratish yoki yangilash
  const saveAdminDuty = async () => {
    if (!selectedAdmin || selectedAppealTypes.length === 0) return;

    const obj = {
      adminId: selectedAdmin.id,
      dutyIds: selectedAppealTypes.map((d) => d.value),
    };

    try {
      let url = `/api/v1/admin-duty`;
      let method = "POST";

      // 🔹 Agar selectedDuty mavjud bo‘lsa - update (PUT)
      if (selectedDuty) {
        url = `/api/v1/admin-duty/${selectedDuty.id}`;
        method = "PUT";
      }

      const res = await ApiCall(url, method, obj);
      console.log("AdminDuty saqlandi:", res.data);

      setDutyModal(false);
      setSelectedAppealTypes([]);
      setSelectedDuty(null);
      await fetchDutiesByAdmin(); // yangilash
    } catch (error) {
      console.error("AdminDuty saqlashda xatolik:", error);
    }
  };

  const fetchDutiesByAdmin = async () => {
    try {
      const res = await ApiCall(`/api/v1/admin-duty`, "GET");
      console.log(res.data);
      if (!res.error) {
        setDuties(res.data);
      } else {
        setDuties([]);
      }
    } catch (err) {
      console.error("Duty olishda xatolik:", err);
      setDuties([]);
    }
  };

  useEffect(() => {
    getAdmins();
    fetchDutiesByAdmin();
  }, []);

  const addAdmin = async () => {
    const obj = {
      phone: newAdmin.phone,
      password: newAdmin.password,
      name: newAdmin.name,
    };
    try {
      const response = await ApiCall(`/api/v1/secretary`, "POST", obj);
      await getAdmins();
      setShow(false);
      setNewAdmin({ id: "", name: "", phone: "", password: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const getAdmins = async () => {
    try {
      const response = await ApiCall(`/api/v1/secretary`, "GET");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const updateAdmin = async () => {
    try {
      const updatedAdmin = {
        phone: editingAdmin.phone,
        name: editingAdmin.name,
        password: editingAdmin.password,
      };
      await ApiCall(
        `/api/v1/secretary/${editingAdmin.id}`,
        "PUT",
        updatedAdmin
      );
      await getAdmins();
      setEditingAdmin(null);
      setShow(false);
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };

  const handleEditClick = (admin) => {
    setEditingAdmin({ ...admin, password: "" });
    setShow(true);
  };

  const deleteAdmin = async (id) => {
    try {
      await ApiCall(`/api/v1/secretary/${id}`, "DELETE");
      await getAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      deleteAdmin(id);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Sekretarlar boshqaruvi
        </h1>
        <button
          onClick={() => {
            setNewAdmin({ id: "", name: "", phone: "", password: "" });
            setEditingAdmin(null);
            setShow(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <FiPlus className="text-lg" />
          Yangi sekretar
        </button>
      </div>

      <Card extra={"w-full h-full shadow-sm mb-10"}>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  №
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Ism
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Telefon/Login
                </th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">{row.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-700">{row.phone}</p>
                  </td>
                  <td className="flex justify-end gap-4 py-3 px-4">
                    <button
                      className="rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      title="Tahrirlash"
                    >
                      <MdAddTask
                        onClick={() => {
                          setSelectedAdmin(row);
                          setDutyModal(true);
                          fetchAppealTypes(); // 🔹 Modal ochilganda appeal-type larni chaqiramiz
                        }}
                        className="h-5 w-5"
                      />
                    </button>
                    <button
                      onClick={() => handleEditClick(row)}
                      className="rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      title="Tahrirlash"
                    >
                      <MdModeEditOutline className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row.id)}
                      className="rounded-full p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                      title="O'chirish"
                    >
                      <MdDelete className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Hech qanday admin topilmadi
            </div>
          )}
        </div>
      </Card>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Admini Arizaga biriktirish
      </h1>
      <Card extra={"w-full h-full shadow-sm"}>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  №
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Ism
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Telefon/Login
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Appeal turlari
                </th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {duties.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-800">
                      {row.admin.name}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-gray-700">{row.admin.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    {/* AppealType larni vergul bilan chiqaramiz */}
                    <p className="text-gray-700">
                      {row.appealType && row.appealType.length > 0
                        ? row.appealType.map((a) => a.name).join(", ")
                        : "Biriktirilmagan"}
                    </p>
                  </td>
                  <td className="flex justify-end gap-4 py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedAdmin(row.admin);
                        setSelectedDuty(row); // adminDuty obyektini set qilamiz
                        setSelectedAppealTypes(
                          row.appealType
                            ? row.appealType.map((a) => ({
                                value: a.id,
                                label: a.name,
                              }))
                            : []
                        );
                        setDutyModal(true);
                        fetchAppealTypes();
                      }}
                      className="rounded-full p-1 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      title="Vazifa biriktirish"
                    >
                      <MdModeEditOutline className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {admins.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Hech qanday admin topilmadi
            </div>
          )}
        </div>
      </Card>
      <Rodal
        width={500}
        height={220}
        visible={dutyModal}
        onClose={() => {
          setDutyModal(false);
          setSelectedDuty(null); // 🔹 reset
        }}
        customStyles={{
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            Sekretarlarga arizalarni biriktirish
          </h2>

          <Select
            isMulti // ✅ multi select
            isSearchable
            options={appealTypes}
            value={selectedAppealTypes}
            onChange={(val) => setSelectedAppealTypes(val)}
            placeholder="Appeal turlarini tanlang..."
          />

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDutyModal(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={selectedAppealTypes.length === 0}
              onClick={saveAdminDuty}
              className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              Saqlash
            </button>
          </div>
        </div>
      </Rodal>

      <Rodal
        width={500}
        height={430}
        visible={show}
        onClose={() => setShow(false)}
        customStyles={{
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4">
          <h2 className="mb-6 text-xl font-bold text-gray-800">
            {editingAdmin ? "Sekretar tahrirlash" : "Yangi sekretar qo'shish"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingAdmin) {
                updateAdmin();
              } else {
                addAdmin();
              }
            }}
          >
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ism Familya
              </label>
              <input
                type="text"
                value={editingAdmin ? editingAdmin.name : newAdmin.name}
                onChange={(e) => {
                  if (editingAdmin) {
                    setEditingAdmin({ ...editingAdmin, name: e.target.value });
                  } else {
                    setNewAdmin({ ...newAdmin, name: e.target.value });
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ism familya kiriting"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Telefon/Login
              </label>
              <input
                type="text"
                value={editingAdmin ? editingAdmin.phone : newAdmin.phone}
                onChange={(e) => {
                  if (editingAdmin) {
                    setEditingAdmin({ ...editingAdmin, phone: e.target.value });
                  } else {
                    setNewAdmin({ ...newAdmin, phone: e.target.value });
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Telefon raqam kiriting"
                required
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Parol
              </label>
              <input
                type="password"
                value={editingAdmin ? editingAdmin.password : newAdmin.password}
                onChange={(e) => {
                  if (editingAdmin) {
                    setEditingAdmin({
                      ...editingAdmin,
                      password: e.target.value,
                    });
                  } else {
                    setNewAdmin({ ...newAdmin, password: e.target.value });
                  }
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Parol kiriting"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShow(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                {editingAdmin ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      </Rodal>
    </div>
  );
};

export default Admins;
