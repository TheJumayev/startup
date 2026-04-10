import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import Breadcrumbs from "views/BackLink/BackButton";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  UserGroupIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

export default function TelegramUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState(() => {
    const saved = localStorage.getItem("telegramUsersStatusFilter");
    return saved || "all";
  });

  // New filter states for student
  const [studentFilter, setStudentFilter] = useState("all"); // "all", "hasStudent", "noStudent"
  const [groupFilter, setGroupFilter] = useState("all");
  const [availableGroups, setAvailableGroups] = useState([]);

  // NEW: filter for isParent
  const [parentFilter, setParentFilter] = useState("all"); // "all", "parent", "notParent"

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    phoneNumber: "",
    passportNumber: "",
    hemisId: "",
    password: "",
    status: false,
    isParent: false, // NEW field
  });

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("telegramUsersStatusFilter", statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Extract unique groups from users
  useEffect(() => {
    if (users.length > 0) {
      const groups = users
        .filter((user) => user.student?.groupName)
        .map((user) => user.student.groupName)
        .filter((value, index, self) => self.indexOf(value) === index)
        .sort();
      setAvailableGroups(groups);
    }
  }, [users]);

  // Filter and search users
  useEffect(() => {
    let result = [...users];

    // Apply status filter
    if (statusFilter !== "all") {
      const filterValue = statusFilter === "active" ? true : false;
      result = result.filter((user) => user.isActive === filterValue);
    }

    // Apply student filter
    if (studentFilter === "hasStudent") {
      result = result.filter((user) => user.student !== null);
    } else if (studentFilter === "noStudent") {
      result = result.filter((user) => user.student === null);
    }

    // Apply group filter
    if (groupFilter !== "all") {
      result = result.filter((user) => user.student?.groupName === groupFilter);
    }

    // NEW: Apply parent filter
    if (parentFilter === "parent") {
      result = result.filter((user) => user.isParent === true);
    } else if (parentFilter === "notParent") {
      result = result.filter((user) => user.isParent === false);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term) ||
          user.phoneNumber?.toLowerCase().includes(term) ||
          user.passportNumber?.toLowerCase().includes(term) ||
          user.hemisId?.toLowerCase().includes(term) ||
          user.student?.fullName?.toLowerCase().includes(term) ||
          user.student?.groupName?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [
    users,
    statusFilter,
    studentFilter,
    groupFilter,
    parentFilter,
    searchTerm,
  ]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/telegram-users", "GET");
      setUsers(res.data || []);
      toast.success("Foydalanuvchilar yuklandi!");
    } catch (err) {
      toast.error("Foydalanuvchilarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, fullName) => {
    if (!window.confirm(`Haqiqatan "${fullName}" ni o‘chirmoqchimisiz?`))
      return;

    try {
      await ApiCall(`/api/v1/telegram-users/${id}`, "DELETE");
      toast.success("Muvaffaqiyatli o‘chirildi!");
      fetchUsers();
    } catch (err) {
      toast.error("O‘chirishda xatolik!");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || "",
      username: user.username || "",
      phoneNumber: user.phoneNumber || "",
      passportNumber: user.passportNumber || "",
      hemisId: user.hemisId || "",
      password: user.password || "",
      status: user.isActive || false,
      isParent: user.isParent || false, // NEW
    });
    setOpenModal(true);
  };

  const handleUpdate = async () => {
    try {
      await ApiCall(
        `/api/v1/telegram-users/${selectedUser.id}`,
        "PUT",
        formData
      );
      toast.success("Foydalanuvchi yangilandi!");
      setOpenModal(false);
      fetchUsers();
    } catch (err) {
      toast.error("Yangilashda xatolik!");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStudentFilter("all");
    setGroupFilter("all");
    setParentFilter("all"); // NEW
  };

  const getStatusStats = () => {
    const active = users.filter((u) => u.isActive === true).length;
    const inactive = users.filter((u) => u.isActive === false).length;
    const withStudent = users.filter((u) => u.student !== null).length;
    const withoutStudent = users.filter((u) => u.student === null).length;
    const parent = users.filter((u) => u.isParent === true).length; // NEW
    const notParent = users.filter((u) => u.isParent === false).length; // NEW
    return {
      active,
      inactive,
      total: users.length,
      withStudent,
      withoutStudent,
      parent,
      notParent,
    };
  };

  const stats = getStatusStats();

  // Check if any filter is active
  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    studentFilter !== "all" ||
    groupFilter !== "all" ||
    parentFilter !== "all"; // NEW

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-6">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <Breadcrumbs />

      {/* Stats Cards - Added parent stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jami</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faol</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faol emas</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ota-ona</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.parent}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <UserIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ota-ona emas</p>
              <p className="text-3xl font-bold text-gray-600">
                {stats.notParent}
              </p>
            </div>
            <div className="rounded-full bg-gray-100 p-3">
              <UserIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Student biriktirilgan
              </p>
              <p className="text-3xl font-bold text-indigo-600">
                {stats.withStudent}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3">
              <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Student biriktirilmagan
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.withoutStudent}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <UserIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 rounded-xl bg-white p-4 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Ism, username, telefon, passport, student nomi yoki guruh bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                hasActiveFilters
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filtr
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-white px-2 py-0.5 text-xs text-blue-600">
                  {filteredUsers.length}
                </span>
              )}
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-red-700 transition-colors hover:bg-red-200"
              >
                <XMarkIcon className="h-5 w-5" />
                Tozalash
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel - Added parent filter */}
        {showFilters && (
          <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {/* Status Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Holat bo'yicha filtr
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Barchasi ({stats.total})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "active"
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Faol ({stats.active})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    statusFilter === "inactive"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Faol emas ({stats.inactive})
                </button>
              </div>
            </div>

            {/* Parent Filter - NEW */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ota-ona holati
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setParentFilter("all")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    parentFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setParentFilter("parent")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    parentFilter === "parent"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Ota-ona ({stats.parent})
                </button>
                <button
                  onClick={() => setParentFilter("notParent")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    parentFilter === "notParent"
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Ota-ona emas ({stats.notParent})
                </button>
              </div>
            </div>

            {/* Student Filter */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Student holati
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStudentFilter("all")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    studentFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setStudentFilter("hasStudent")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    studentFilter === "hasStudent"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Student bor ({stats.withStudent})
                </button>
                <button
                  onClick={() => setStudentFilter("noStudent")}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    studentFilter === "noStudent"
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Student yo'q ({stats.withoutStudent})
                </button>
              </div>
            </div>

            {/* Group Filter */}
            {availableGroups.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Guruh bo'yicha filtr
                </label>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="all">Barcha guruhlar</option>
                  {availableGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Results Summary */}
            <div className="rounded-lg bg-blue-50 p-3 text-center text-blue-800">
              <p className="text-sm font-medium">
                Topilgan natijalar: {filteredUsers.length} ta foydalanuvchi
              </p>
              {searchTerm && (
                <p className="mt-1 text-xs text-blue-600">
                  Qidiruv: "{searchTerm}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Users Table - Added Parent column */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Foydalanuvchi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Telefon
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Passport
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Student & Guruh
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Ota-ona
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Holat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            @{user.username || "username yo'q"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        {user.phoneNumber?.startsWith("+")
                          ? user.phoneNumber
                          : user.phoneNumber
                          ? "+" + user.phoneNumber
                          : "—"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <IdentificationIcon className="h-4 w-4 text-gray-400" />
                        {user.passportNumber || "—"}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {user.student ? (
                        <div>
                          <p className="text-sm font-medium text-gray-400">
                            <AcademicCapIcon className="mr-1 inline h-4 w-4" />
                            {user.student.fullName}
                          </p>
                          {user.student.groupName && (
                            <p className="mt-1 text-xs text-gray-500">
                              Guruh: {user.student.groupName}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {user.isParent ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                          <UserIcon className="h-3 w-3" />
                          Ota-ona
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          <UserIcon className="h-3 w-3" />
                          Yo'q
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          <CheckCircleIcon className="h-3 w-3" />
                          Talaba Faol
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                          <XCircleIcon className="h-3 w-3" />
                         Talaba  Faol emas
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                        >
                          <PencilIcon className="h-4 w-4" />
                          Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.fullName)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                          O'chirish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <UserGroupIcon className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        Foydalanuvchi topilmadi
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {hasActiveFilters
                          ? "Qidiruv bo'yicha hech qanday foydalanuvchi topilmadi."
                          : "Hali hech qanday foydalanuvchi qo'shilmagan."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Filtrlarni tozalash
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL - Added isParent checkbox */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        center
        classNames={{
          modal: "rounded-2xl w-full max-w-md",
        }}
      >
        <div className="p-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Foydalanuvchini tahrirlash
          </h2>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                To'liq ism
              </label>
              <input
                disabled={true}
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                disabled={true}
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefon raqam
              </label>
              <input
                disabled={true}
                type="text"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Passport raqam
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.passportNumber}
                onChange={(e) =>
                  setFormData({ ...formData, passportNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                HEMIS ID
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={formData.hemisId}
                onChange={(e) =>
                  setFormData({ ...formData, hemisId: e.target.value })
                }
              />
            </div>

            {/* NEW: isParent checkbox */}
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
              <input
                type="checkbox"
                id="isParent"
                checked={formData.isParent}
                onChange={(e) =>
                  setFormData({ ...formData, isParent: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label
                htmlFor="isParent"
                className="text-sm font-medium text-gray-700"
              >
                Ota-ona
              </label>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="status"
                className="text-sm font-medium text-gray-700"
              >
                Talaba
              </label>
            </div>

            {selectedUser?.student && (
              <div className="rounded-lg bg-indigo-50 p-3">
                <p className="text-sm font-medium text-indigo-800">
                  <AcademicCapIcon className="mr-1 inline h-4 w-4" />
                  Student: {selectedUser.student.fullName}
                </p>
                {selectedUser.student.groupName && (
                  <p className="mt-1 text-xs text-indigo-600">
                    Guruh: {selectedUser.student.groupName}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpdate}
                className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Saqlash
              </button>
              <button
                onClick={() => setOpenModal(false)}
                className="flex-1 rounded-lg bg-gray-200 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
