import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import Select from "react-select";

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    id: "",
    name: "",
    phone: "",
    password: "",
  });
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [show, setShow] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);

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
      const response = await ApiCall(`/api/v1/teacher`, "POST", obj);
      await getTeachers();
      setShow(false);
      setNewTeacher({ id: "", name: "", phone: "", password: "" });
    } catch (error) {
      console.error("Error adding Teacher:", error);
    }
  };

  const getTeachers = async () => {
    try {
      const response = await ApiCall(`/api/v1/teacher`, "GET");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching Teachers:", error);
    }
  };

  const updateTeacher = async () => {
    try {
      const updatedTeacher = {
        phone: editingTeacher.phone,
        name: editingTeacher.name,
        password: editingTeacher.password,
        subjects: selectedSubjects.map((s) => s.value) || [], // curriculum.id
      };

      await ApiCall(
        `/api/v1/teacher/${editingTeacher.id}`,
        "PUT",
        updatedTeacher
      );
      await getTeachers();
      setEditingTeacher(null);
      setShow(false);
    } catch (error) {
      console.error("Error updating Teacher:", error);
    }
  };

  const handleEditClick = async (teacher) => {
    try {
      const response = await ApiCall("/api/v1/curriculum/all", "GET");
      const data = response.data;
      console.log(data);

      // 1. Получаем список учебных годов из created_at
      const yearsSet = new Set();

      data.forEach((item) => {
        const createdDate = new Date(item.created_at * 1000); // from timestamp
        const year =
          createdDate.getMonth() >= 7
            ? createdDate.getFullYear()
            : createdDate.getFullYear() - 1;

        yearsSet.add(year);
      });

      const yearOptions = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map((y) => ({
          label: `${y}-${y + 1}`,
          value: y,
        }));

      setAvailableYears(yearOptions);
      setSelectedYear(yearOptions[0]); // по умолчанию — последний год
      setEditingTeacher({ ...teacher, password: "" });
      setShow(true);
      setSubjects(data); // сохраним все, отфильтруем позже
      const preSelected = []; // пока пусто
      setSelectedSubjects(preSelected);
    } catch (error) {
      console.error("Error fetching curriculum subjects:", error);
    }
  };
  const getFilteredSubjectsByYear = (allSubjects, year) => {
    const start = new Date(`${year}-08-01`).getTime() / 1000; // timestamp начала года
    const end = new Date(`${year + 1}-08-01`).getTime() / 1000; // конца
    console.log("stapm:", allSubjects);

    const filtered = allSubjects
      .filter((item) => item.created_at >= start && item.created_at < end)
      .map((item) => ({
        label: `${item.subject.name} (${item.subject.code})`,
        value: item.id,
        code: item.subject.code,
      }));

    console.log("📦 Filtered subjects for year", year, filtered);

    return filtered;
  };

  const deleteTeacher = async (id) => {
    try {
      await ApiCall(`/api/v1/teacher/${id}`, "DELETE");
      await getTeachers();
    } catch (error) {
      console.error("Error deleting Teacher:", error);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this Teacher?")) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">
          O'qituvchilar boshqaruvi
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
          Yangi O'qituvchi
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
              {teachers.map((row, index) => (
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
        height={600}
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
            {editingTeacher
              ? "O'qituvchi tahrirlash"
              : "Yangi o'qituvchi qo'shish"}
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
            {editingTeacher && (
              <>
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    O'quv yili
                  </label>
                  <Select
                    options={availableYears}
                    value={selectedYear}
                    onChange={(year) => {
                      setSelectedYear(year);
                      setSelectedSubjects([]); // сбросить выбранные предметы
                    }}
                    placeholder="O'quv yilini tanlang"
                  />
                </div>

                <div className="mb-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Fanlar (Predmetlar)
                  </label>
                  <Select
                    isMulti
                    options={getFilteredSubjectsByYear(
                      subjects,
                      selectedYear?.value
                    )}
                    value={selectedSubjects}
                    onChange={(selected) => setSelectedSubjects(selected)}
                    placeholder="Fan(lar)ni tanlang"
                    filterOption={(option, input) =>
                      option.label
                        .toLowerCase()
                        .includes(input.toLowerCase()) ||
                      option.data.code
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    noOptionsMessage={() => "Fan topilmadi"}
                  />
                </div>
              </>
            )}

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

export default Teachers;
