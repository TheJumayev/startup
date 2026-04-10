import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";
import Select from "react-select";

export default function TelegramGroup() {
  const [groups, setGroups] = useState([]);
  const [telegramGroups, setTelegramGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [tgGroupId, setTgGroupId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [editId, setEditId] = useState(null);

  // Fetch all Telegram groups
  const fetchTelegramGroups = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/telegram_group", "GET");
      setTelegramGroups(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Telegram guruhlarini olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all academic groups
  const fetchGroups = async () => {
    try {
      const res = await ApiCall("/api/v1/groups", "GET");
      setGroups(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Akademik guruhlarni olishda xatolik!");
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchTelegramGroups();
  }, []);

  // Add new Telegram group
  const handleAddGroup = async () => {
    if (!selectedGroup || !tgGroupId) {
      toast.warning("Iltimos, guruh va Telegram ID ni kiriting!");
      return;
    }
    try {
      setLoading(true);
      const res = await ApiCall(
          `/api/v1/telegram_group/${selectedGroup}/${tgGroupId}`,
          "POST"
      );
      if (res.status === 201 || res.status === 200) {
        toast.success("Telegram guruh muvaffaqiyatli qo‘shildi!");
        setOpenModal(false);
        fetchTelegramGroups();
        setSelectedGroup(null);
        setTgGroupId("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Yangi guruhni qo‘shishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Update Telegram group
  const handleUpdate = async () => {
    try {
      setLoading(true);
      const body = {
        groupTelegramId: tgGroupId,
        isActive,
      };
      const res = await ApiCall(
          `/api/v1/telegram_group/${editId}`,
          "PUT",
          body
      );
      if (res.status === 200) {
        toast.success("Guruh ma’lumotlari yangilandi!");
        setOpenEditModal(false);
        fetchTelegramGroups();
      }
    } catch (err) {
      console.error(err);
      toast.error("Yangilashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  // Delete Telegram group
  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu guruhni o‘chirmoqchimisiz?")) return;
    try {
      await ApiCall(`/api/v1/telegram_group/${id}`, "DELETE");
      toast.success("Guruh o‘chirildi!");
      fetchTelegramGroups();
    } catch (err) {
      console.error(err);
      toast.error("Guruhni o‘chirishda xatolik!");
    }
  };

  // Filtered list
  const filteredList = telegramGroups.filter((item) => {
    const name =
        item.group?.name?.toLowerCase() ||
        item.group?.groupName?.toLowerCase() ||
        "";
    return name.includes(searchTerm.toLowerCase());
  });

  return (
      <div className="min-h-screen p-6">
        <ToastContainer position="top-right" autoClose={2500} />
        <Breadcrumbs />

        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Telegram Guruhlar
              </h1>
              <p className="text-gray-600">
                Akademik guruhlar bilan bog‘langan Telegram chatlar
              </p>
            </div>
            <button
                onClick={() => setOpenModal(true)}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700"
            >
              + Yangi qo‘shish
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <input
              type="text"
              value={searchTerm}
              placeholder="Guruh nomi bo‘yicha qidirish..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-500"></div>
              </div>
          ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Hech qanday Telegram guruh topilmadi.
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      №
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Guruh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Telegram ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Holati
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amal
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredList.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.group?.name || item.group?.groupName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {item.groupTelegramId}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.isActive ? (
                              <span className="rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          Faol
                        </span>
                          ) : (
                              <span className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                          Nofaol
                        </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm flex space-x-2">
                          <button
                              onClick={() => {
                                setEditId(item.id);
                                setTgGroupId(item.groupTelegramId);
                                setIsActive(item.isActive);
                                setOpenEditModal(true);
                              }}
                              className="rounded-md bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 hover:bg-yellow-200"
                          >
                            Tahrirlash
                          </button>
                          <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-md bg-red-100 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-200"
                          >
                            O‘chirish
                          </button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}
        </div>

        {/* ✅ Add Modal */}
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            center
            classNames={{ modal: "rounded-lg p-6 md:max-w-md" }}
        >
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Yangi Telegram Guruh
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akademik guruh
          </label>
          <Select
              options={groups.map((g) => ({
                value: g.id,
                label: g.name || g.groupName,
              }))}
              value={
                selectedGroup
                    ? {
                      value: selectedGroup,
                      label:
                          groups.find((g) => g.id === selectedGroup)?.name ||
                          groups.find((g) => g.id === selectedGroup)?.groupName ||
                          "Tanlangan",
                    }
                    : null
              }
              onChange={(option) => setSelectedGroup(option ? option.value : null)}
              placeholder="Guruhni tanlang..."
              isSearchable
              className="mb-4 text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.5rem",
                  padding: "2px",
                }),
              }}
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telegram Guruh ID
          </label>
          <input
              type="text"
              value={tgGroupId}
              onChange={(e) => setTgGroupId(e.target.value)}
              placeholder="Masalan: -1001987654321"
              className="w-full mb-4 rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900"
          />

          <div className="flex justify-end gap-3">
            <button
                onClick={() => setOpenModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
            >
              Bekor qilish
            </button>
            <button
                onClick={handleAddGroup}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Saqlash
            </button>
          </div>
        </Modal>


        {/* ✏️ Edit Modal   ... */}
        {/*wq*/}
        <Modal
            open={openEditModal}
            onClose={() => setOpenEditModal(false)}
            center
            classNames={{ modal: "rounded-lg p-6 md:max-w-md" }}
        >
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            Telegram Guruhni Tahrirlash
          </h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telegram Guruh ID
          </label>
          <input
              type="text"
              value={tgGroupId}
              onChange={(e) => setTgGroupId(e.target.value)}
              className="w-full mb-4 rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Holati
          </label>
          <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value === "true")}
              className="w-full mb-4 rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900"
          >
            <option value="true">Faol</option>
            <option value="false">Nofaol</option>
          </select>

          <div className="flex justify-end gap-3">
            <button
                onClick={() => setOpenEditModal(false)}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300"
            >
              Bekor qilish
            </button>
            <button
                onClick={handleUpdate}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Yangilash
            </button>
          </div>
        </Modal>
      </div>
  );
}
