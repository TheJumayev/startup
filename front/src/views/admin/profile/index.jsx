import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import Card from "../../../components/card";
import { MdPerson, MdLock, MdVisibility, MdVisibilityOff } from "react-icons/md";
import banner from "../../../assets/img/profile/banner.png";
import Breadcrumbs from "views/BackLink/BackButton";

const ProfileOverview = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getAdmin();
  }, []);

  const getAdmin = async () => {
    try {
      const response = await ApiCall("/api/v1/auth/decode", "GET", null);
      setAdmin(response.data);
    } catch (error) {
      navigate("/admin/login");
      console.error("Error fetching account data:", error);
    }
  };

  const setPasswordHandler = async () => {
    if (password !== confirmPassword) {
      setPasswordError("Parollar mos kelmadi.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setChangePassword(true);

    try {
      const response = await ApiCall(
          `/api/v1/auth/password/${admin.id}`,
          "PUT",
          { password }
      );
      console.log(response.data);
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");
      alert("Parol muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Parolni yangilashda xatolik. Iltimos, qayta urinib ko'ring.");
    } finally {
      setChangePassword(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-6">
        <div className="mb-6">
          <Breadcrumbs />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profile Card */}
            <div className="lg:col-span-8">
              <Card extra="w-full h-full overflow-hidden border-0 shadow-xl">
                <div
                    className="relative h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${banner})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="relative px-6 pb-6">
                  <div className="absolute -top-16 left-6 flex h-32 w-32 items-center justify-center rounded-full border-8 border-white bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg">
                    <MdPerson className="h-16 w-16 text-white" />
                  </div>

                  <div className="pt-20">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {admin?.name || "Ma'sul Hodim"}
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                      Ma'sul hodim
                    </p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium">ID Raqam</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          {admin?.id || "Noma'lum"}
                        </p>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <p className="text-sm text-green-600 font-medium">Holati</p>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          Faol
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Password Change Card */}
            <div className="lg:col-span-4">
              <Card extra="w-full h-full border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 text-blue-600 mr-3">
                      <MdLock className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Parol o'zgartirish
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yangi parol
                      </label>
                      <div className="relative">
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pr-12"
                            disabled={changePassword}
                            type={showPassword ? "text" : "password"}
                            placeholder="Yangi parol kiriting"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              if (e.target.value.length < 8) {
                                setPasswordError(
                                    "Parol uzunligi kamida 8 ta belgidan iborat bo'lishi kerak."
                                );
                              } else {
                                setPasswordError("");
                              }
                            }}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parolni tasdiqlash
                      </label>
                      <div className="relative">
                        <input
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pr-12"
                            disabled={changePassword}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Parolni qayta kiriting"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <MdVisibilityOff className="h-5 w-5" /> : <MdVisibility className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    {passwordError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                          <p className="text-sm text-red-600 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            {passwordError}
                          </p>
                        </div>
                    )}

                    <button
                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center"
                        onClick={setPasswordHandler}
                        disabled={changePassword}
                    >
                      {changePassword ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Yangilanmoqda...
                          </>
                      ) : (
                          "Parolni yangilash"
                      )}
                    </button>

                    <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
                      <p className="text-xs text-yellow-700">
                        <strong>Eslatma:</strong> Parol kamida 8 ta belgidan iborat bo'lishi va katta-kichik harflar, raqamlar va maxsus belgilardan tashkil topgan bo'lishi tavsiya etiladi.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ProfileOverview;