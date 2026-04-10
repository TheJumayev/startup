import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ApiCall, { baseUrl } from "../../config";
import { toast } from "react-toastify";

function WriteAppeal() {
  const navigate = useNavigate();
  const { id } = useParams(); // appealId
  const location = useLocation();
  const { student, appeal } = location.state || {};

  const [form, setForm] = useState({
    text3: "",
    sana1: "",
    sana2: "",
    file: null,
  });

  if (!student || !appeal) {
    return (
      <div className="p-6 text-center text-red-600">
        ❌ Talaba yoki ariza ma’lumoti topilmadi!
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async () => {
    try {
      let uploadedFileId = null;
      if (form.file) {
        const formData = new FormData();
        formData.append("photo", form.file);
        formData.append("prefix", "appeal");
        const uploadResponse = await axios.post(
          `${baseUrl}/api/v1/file/upload`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedFileId = uploadResponse.data;
      }

      const text1 = appeal.text1
        .replace("_talaba_ism_familya_", student.fullName)
        .replace("_guruh_", student.groupName);

      const text2 = appeal.text2
        .replace("_sana1_", form.sana1 || "_sana1_")
        .replace("_sana2_", form.sana2 || "_sana2_")
        .replace("_sabab_", form.text3 || "_sabab_")
        .replace("_talaba_ism_familya_", student.fullName)
        .replace("_guruh_", student.groupName);

      const appealDTO = {
        appealId: appeal.id,
        studentId: student.id,
        text1,
        text2,
        date: appeal.date,
        fileId: uploadedFileId || null,
      };

      await ApiCall("/api/v1/appeal", "POST", appealDTO);
      toast.success("✅ Ariza yuborildi!");
      navigate("/open");
    } catch (error) {
      console.error("❌ Ariza yuborishda xatolik:", error);
      toast.error("Ariza yuborishda xatolik!");
    }
  };

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        {appeal.name} — Ariza to‘ldirish
      </h1>

      {appeal.isText3 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Sabab
          </label>
          <textarea
            name="text3"
            value={form.text3}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>
      )}

      {appeal.date === 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Sana
          </label>
          <input
            type="date"
            name="sana1"
            value={form.sana1}
            onChange={handleChange}
            className="w-full rounded-lg border p-3"
          />
        </div>
      )}

      {appeal.date === 2 && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Boshlanish sanasi
            </label>
            <input
              type="date"
              name="sana1"
              value={form.sana1}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tugash sanasi
            </label>
            <input
              type="date"
              name="sana2"
              value={form.sana2}
              onChange={handleChange}
              className="w-full rounded-lg border p-3"
            />
          </div>
        </div>
      )}

      {appeal.proof && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Fayl yuklash
          </label>
          <input
            type="file"
            name="file"
            accept=".pdf"
            onChange={handleChange}
            className="w-full"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
      >
        Yuborish
      </button>
    </div>
  );
}

export default WriteAppeal;
