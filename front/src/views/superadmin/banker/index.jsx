import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";
import Breadcrumbs from "views/BackLink/BackButton";

const Teacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    id: "",
    name: "",
    phone: "",
    password: "",
  });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    getTeachers();
  }, []);

  const addTeacher = async () => {
    const obj = {
      phone: newTeacher.phone,
      password: newTeacher.password,
      name: newTeacher.name,
    };
    try {
      const response = await ApiCall(`/api/v1/banker`, "POST", obj);
      console.log(response.data);

      await getTeachers();
      setShow(false);
      setNewTeacher({ id: "", name: "", phone: "", password: "" });
    } catch (error) {
      console.error("Error adding teacher:", error);
    }
  };

  const getTeachers = async () => {
    try {
      const response = await ApiCall(`/api/v1/banker`, "GET", null);
      console.log(response.data);
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };

  const updateTeacher = async () => {
    try {
      const updatedTeacher = {
        phone: editingTeacher.phone,
        name: editingTeacher.name,
        password: editingTeacher.password,
      };
      await ApiCall(
        `/api/v1/banker/${editingTeacher.id}`,
        "PUT",
        updatedTeacher
      );
      await getTeachers();
      setEditingTeacher(null);
      setShow(false);
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  const handleEditClick = (teacher) => {
    setEditingTeacher({ ...teacher, password: "" });
    setShow(true);
  };

  const deleteTeacher = async (id) => {
    try {
      await ApiCall(`/api/v1/banker/${id}`, "DELETE");
      await getTeachers();
    } catch (error) {
      console.error("Error deleting teacher:", error);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Ishonchiz komilmi")) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          Bugalter boshqaruvi
        </h1>
        <button
          onClick={() => {
            setNewTeacher({ id: "", name: "", phone: "", password: "" });
            setEditingTeacher(null);
            setShow(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <FiPlus className="text-lg" />
          Yangi Bugalter
        </button>
      </div>

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
                <th className="py-3 px-4 text-right font-medium text-gray-600">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers &&
                teachers.map((row, index) => (
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
          {teachers.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Hech qanday o'qituvchi topilmadi
            </div>
          )}
        </div>
      </Card>

      <Rodal
        width={500}
        height={420}
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
            {editingTeacher ? "Bugalter tahrirlash" : "Yangi bugalter qo'shish"}
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingTeacher) {
                updateTeacher();
              } else {
                addTeacher();
              }
            }}
          >
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Ism Familya
              </label>
              <input
                type="text"
                value={editingTeacher ? editingTeacher.name : newTeacher.name}
                onChange={(e) => {
                  if (editingTeacher) {
                    setEditingTeacher({
                      ...editingTeacher,
                      name: e.target.value,
                    });
                  } else {
                    setNewTeacher({ ...newTeacher, name: e.target.value });
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
                value={editingTeacher ? editingTeacher.phone : newTeacher.phone}
                onChange={(e) => {
                  if (editingTeacher) {
                    setEditingTeacher({
                      ...editingTeacher,
                      phone: e.target.value,
                    });
                  } else {
                    setNewTeacher({ ...newTeacher, phone: e.target.value });
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
                value={
                  editingTeacher ? editingTeacher.password : newTeacher.password
                }
                onChange={(e) => {
                  if (editingTeacher) {
                    setEditingTeacher({
                      ...editingTeacher,
                      password: e.target.value,
                    });
                  } else {
                    setNewTeacher({ ...newTeacher, password: e.target.value });
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
                {editingTeacher ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </div>
      </Rodal>
    </div>
  );
};

export default Teacher;
