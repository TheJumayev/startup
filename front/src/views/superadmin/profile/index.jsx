import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { MdPerson, MdLock, MdSave } from "react-icons/md";
import Card from "components/card";

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

  const validatePassword = (pass) => {
    if (pass.length < 8) {
      return "Parol kamida 8 ta belgidan iborat bo'lishi kerak";
    }
    if (!/[A-Z]/.test(pass)) {
      return "Parolda kamida 1 ta katta harf bo'lishi kerak";
    }
    if (!/[0-9]/.test(pass)) {
      return "Parolda kamida 1 ta raqam bo'lishi kerak";
    }
    return "";
  };

  const setPasswordHandler = async () => {
    const validationError = validatePassword(password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Parollar mos kelmadi");
      return;
    }

    setChangePassword(true);

    try {
      const response = await ApiCall(
        `/api/v1/auth/password/${admin.id}`,
        "PUT",
        { password }
      );
      setPassword("");
      setConfirmPassword("");
      setPasswordError("");

      // Muvaffaqiyatli bildirishnoma
      alert("Parol muvaffaqiyatli yangilandi!");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Parolni yangilashda xatolik yuz berdi");
    } finally {
      setChangePassword(false);
    }
  };

  return (
    <div className="px-4 py-8 mx-auto max-w-8xl">
  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
    
    {/* Profile Card - 3D va animatsiyalar bilan */}
    <div className="lg:col-span-4 animate-fade-in-left">
      <Card extra="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50 p-6 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] border border-blue-100">
        {/* Decorative background */}
        <div className="absolute w-40 h-40 rounded-full -top-20 -right-20 bg-gradient-to-br from-blue-100 to-blue-200 blur-2xl" />
        <div className="absolute w-40 h-40 rounded-full -bottom-20 -left-20 bg-gradient-to-tr from-blue-50 to-indigo-100 blur-2xl" />
        
        {/* Top decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Avatar with 3D hover effect */}
          <div className="relative mb-5 group">
            <div className="absolute inset-0 transition-all duration-500 rounded-full opacity-0 bg-gradient-to-r from-blue-400 to-blue-600 blur-xl group-hover:opacity-60" />
            <div className="relative flex items-center justify-center transition-all duration-500 rounded-full shadow-md h-28 w-28 bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3">
              <MdPerson className="text-blue-600 transition-all duration-500 h-14 w-14 group-hover:scale-110" />
            </div>
            {/* Online status */}
            <div className="absolute bottom-2 right-2 h-4.5 w-4.5 rounded-full border-3 border-white bg-gradient-to-r from-green-400 to-emerald-500 shadow-sm animate-pulse">
              <div className="absolute inset-0 bg-green-400 rounded-full opacity-75 animate-ping" />
            </div>
          </div>

          {/* User Info */}
          <h2 className="mb-1 text-2xl font-bold text-gray-800 transition-all duration-300 hover:text-blue-600">
            {admin?.name || "Foydalanuvchi"}
          </h2>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <p className="text-sm text-gray-500">Bo'lim boshlig'i</p>
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          </div>

          {/* Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Super Admin
            </span>
          </div>

          {/* Stats */}
          <div className="w-full pt-4 space-y-3 border-t border-blue-100">
            <div className="flex items-center justify-between p-2 transition-all duration-300 rounded-lg hover:bg-blue-50">
              <span className="text-sm text-gray-500">ID:</span>
              <span className="font-mono text-sm font-semibold text-gray-800">
                {admin?.id || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 transition-all duration-300 rounded-lg hover:bg-blue-50">
              <span className="text-sm text-gray-500">Email:</span>
              <span className="text-sm text-gray-700">
                {admin?.email || "admin@edu.uz"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 transition-all duration-300 rounded-lg hover:bg-blue-50">
              <span className="text-sm text-gray-500">Ro'yxatdan:</span>
              <span className="text-sm text-gray-700">
                {admin?.createdAt || "2024-01-15"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Password Change - 3D va animatsiyalar bilan */}
    <div className="lg:col-span-8 animate-fade-in-right">
      <Card extra="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 p-6 shadow-xl transition-all duration-500 hover:shadow-2xl border border-blue-100">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br from-blue-100/40 to-blue-200/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-blue-50/30 to-indigo-100/20 blur-2xl" />

        {/* Header */}
        <div className="relative flex items-center gap-4 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 transition-all duration-500 opacity-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur-md group-hover:opacity-60" />
            <div className="relative p-3 transition-all duration-300 shadow-md rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:scale-110 group-hover:rotate-6">
              <MdLock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Parolni yangilash
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Xavfsizlikni oshirish uchun muntazam yangilab turing
            </p>
          </div>
        </div>

        <div className="relative max-w-md space-y-6">
          {/* New Password */}
          <div className="group">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Yangi parol
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError("");
                }}
                disabled={changePassword}
                className="w-full px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 transition-all duration-300 border-2 border-gray-200 rounded-xl bg-white/50 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-300 hover:shadow-md"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute text-gray-400 transition-all duration-300 -translate-y-1/2 right-3 top-1/2 hover:text-blue-500 hover:scale-110"
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            <p className="flex items-center gap-1 mt-2 text-xs text-gray-400">
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              Kamida 8 belgi, 1 ta katta harf va 1 ta raqam
            </p>
          </div>

          {/* Confirm Password */}
          <div className="group">
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Parolni tasdiqlash
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                disabled={changePassword}
                className="w-full px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 transition-all duration-300 border-2 border-gray-200 rounded-xl bg-white/50 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-300 hover:shadow-md"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute text-gray-400 transition-all duration-300 -translate-y-1/2 right-3 top-1/2 hover:text-blue-500 hover:scale-110"
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                      password.length >= level * 2
                        ? level <= 2
                          ? "bg-gradient-to-r from-blue-400 to-blue-500"
                          : level === 3
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Parol kuchi:{" "}
                {password.length >= 8
                  ? password.match(/[A-Z]/) && password.match(/[0-9]/)
                    ? "Kuchli"
                    : "O'rtacha"
                  : "Kuchsiz"}
              </p>
            </div>
          )}

          {/* Error Message */}
          {passwordError && (
            <div className="rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100 p-3.5 animate-shake">
              <p className="flex items-center gap-2 text-sm text-rose-600">
                <span className="text-lg">⚠️</span>
                {passwordError}
              </p>
            </div>
          )}

          {/* Submit Button - Ko'k rangda */}
          <div className="pt-2">
            <button
              onClick={setPasswordHandler}
              disabled={changePassword || !password || !confirmPassword}
              className="relative flex items-center justify-center w-full gap-2 px-6 py-3 overflow-hidden text-sm font-semibold text-white transition-all duration-500 group rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none sm:w-auto"
            >
              <div className="absolute inset-0 transition-transform duration-700 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full" />
              <MdSave className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
              {changePassword ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saqlanmoqda...
                </span>
              ) : (
                "Saqlash"
              )}
            </button>
          </div>
        </div>
      </Card>
    </div>
  </div>
</div>
  );
};

export default ProfileOverview;
