import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline, MdAdd } from "react-icons/md";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumbs from "views/BackLink/BackButton";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [duties, setDuties] = useState([]);
  useEffect(() => {
    getAdmins();
    getDuty();
  }, []);

  const getAdmins = async () => {
    try {
      const response = await ApiCall(`/api/v1/superadmin/deans`, "GET");
      setAdmins(response.data);
    } catch (error) {
      toast.error("Ma'sullarni yuklab bo'lmadi");
    }
  };

  const getDuty = async () => {
    try {
      const response = await ApiCall(`/api/v1/dean`, "GET");
      setDuties(response.data);
    } catch (error) {
      console.error("Ma'sullarni yuklashda xatolik:", error);
      toast.error("Ma'sullarni yuklab bo'lmadi");
    }
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingAdmin(null);
    setNewAdmin({ name: "", phone: "", password: "" });
    setShowModal(true);
  };

  const handleEditClick = (admin) => {
    setIsAdding(false);
    setEditingAdmin({ ...admin, password: "" });
    setShowModal(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Haqiqatan ham bu Ma'sulni o'chirmoqchimisiz?")) {
      try {
        await ApiCall(`/api/v1/superadmin/dean/${id}`, "DELETE");
        toast.success("Ma'sul muvaffaqiyatli o'chirildi");
        getAdmins();
      } catch (error) {
        console.error("Ma'sulni o'chirishda xatolik:", error);
        toast.error("Ma'sulni o'chirib bo'lmadi");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAdmin) {
        // Ma'sulni yangilash
        await ApiCall(
          `/api/v1/superadmin/dean/${editingAdmin.id}`,
          "PUT",
          editingAdmin
        );
        toast.success("Ma'sul ma'lumotlari muvaffaqiyatli yangilandi");
      } else {
        // Yangi Ma'sul qo'shish
        await ApiCall("/api/v1/superadmin/dean", "POST", newAdmin);
        toast.success("Yangi Ma'sul muvaffaqiyatli qo'shildi");
      }

      setShowModal(false);
      getAdmins();
    } catch (error) {
      console.error("Ma'sulni saqlashda xatolik:", error);
      toast.error(error.response?.data?.message || "Ma'sulni saqlab bo'lmadi");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold"></h1>
        <button
          onClick={handleAddClick}
          className="flex items-center rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
        >
          <MdAdd className="mr-2" /> Ma'sul Qo'shish
        </button>
      </div>

      <div className="my-4 grid h-full grid-cols-1 gap-5 pt-0 pb-0 md:grid-cols-1">
        <Card extra={"w-full h-full mx-auto"}>
          <div className="my-2 overflow-x-auto p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 p-2 text-start">
                  <th className="p-2">№</th>
                  <th className="p-2">Ism Familiya</th>
                  <th className="p-2">Telefon/Login</th>
                  <th className="p-2">Xizmat turlari</th>
                  <th className="p-2">Harakatlar</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin, index) => (
                  <tr
                    key={index}
                    className="border-b-2 text-start hover:bg-gray-50"
                  >
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <p className="font-medium">{admin.name}</p>
                    </td>
                    <td className="p-2">
                      <p className="font-medium">{admin.phone}</p>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-2">
                        {duties
                          .filter((item) => item.dean.id === admin.id)
                          .map((duty, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                            >
                              {duty.department}
                            </span>
                          ))}
                      </div>
                    </td>

                    <td className="flex space-x-2 p-2">
                      <button
                        onClick={() => handleEditClick(admin)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Tahrirlash"
                      >
                        <MdModeEditOutline className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(admin.id)}
                        className="text-red-500 hover:text-red-700"
                        title="O'chirish"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Qo'shish/Tahrirlash Modali */}
      <Rodal
        width={500}
        height={400}
        visible={showModal}
        onClose={() => setShowModal(false)}
        closeOnEsc={true}
      >
        <div className="p-4">
          <h2 className="mb-4 text-lg font-bold">
            {editingAdmin ? "Ma'sulni Tahrirlash" : "Yangi Ma'sul Qo'shish"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-2 block font-medium">Ism Familiya:</label>
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
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block font-medium">Telefon/Login:</label>
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
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="mb-2 block font-medium">
                {editingAdmin
                  ? "Yangi Parol (hozirgisini saqlamoqchi bo'lsangiz bo'sh qoldiring)"
                  : "Parol"}
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
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!editingAdmin}
                minLength={6}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Bekor Qilish
              </button>
              <button
                type="submit"
                className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600"
              >
                {editingAdmin ? "Yangilash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      </Rodal>
    </div>
  );
};

export default Admins;
