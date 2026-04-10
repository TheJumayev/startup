import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../../config";
import axios from "axios";
import { toast } from "react-toastify";

function CreateAppeal() {
  const { id } = useParams(); // URL dan appealId
  const navigate = useNavigate();
  const [appeal, setAppeal] = useState(null);
  const [form, setForm] = useState({
    text3: "",
    sana1: "",
    sana2: "",
    file: null,
  });
  const [student, setStudent] = useState(null);

  useEffect(() => {
    fetchAppeal();
    fetchStudent();
  }, []);

  const fetchAppeal = async () => {
    try {
      const res = await ApiCall(`/api/v1/appeal-type/${id}`, "GET");
      setAppeal(res.data);
    } catch (err) {
      console.error("Appealni olishda xatolik:", err);
    }
  };

  const fetchStudent = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await ApiCall(`/api/v1/student/account/all/me/${token}`, "GET");
      setStudent(res.data);
    } catch (err) {
      console.error("Student ma'lumotlarini olishda xatolik:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async () => {
    try {
      let uploadedFileId = null;
      if (form.file) {
        const formData = new FormData();
        formData.append("photo", form.file);
        formData.append("prefix", "appeal");

        const uploadRes = await axios.post(
          `${baseUrl}/api/v1/file/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        uploadedFileId = uploadRes.data;
      }

      const text1 = appeal.text1
        .replace("_talaba_ism_familya_", student?.fullName || "")
        .replace("_guruh_", student?.groupName || "");

      const text2 = appeal.text2
        .replace("_sana1_", form.sana1 || "_sana1_")
        .replace("_sana2_", form.sana2 || "_sana2_")
        .replace("_sabab_", form.text3 || "_sabab_")
        .replace("_talaba_ism_familya_", student?.fullName || "")
        .replace("_guruh_", student?.groupName || "");

      const appealDTO = {
        appealId: appeal.id,
        studentId: student?.id,
        text1,
        text2,
        date: appeal.date,
        fileId: uploadedFileId,
      };

      await ApiCall("/api/v1/appeal", "POST", appealDTO);
      toast.success("✅ Ariza yuborildi!");
      navigate("/student/appeals"); // yuborilgandan keyin listga qaytish
    } catch (err) {
      console.error("Ariza yuborishda xatolik:", err);
      toast.error("❌ Xatolik yuz berdi!");
    }
  };

  if (!appeal) return <div className="p-6">Yuklanmoqda...</div>;

  // 🔹 preview tayyorlash
  const previewText1 = appeal.text1
    ?.replace(
      "_talaba_ism_familya_",
      student?.fullName || "_talaba_ism_familya_"
    )
    .replace("_guruh_", student?.groupName || "_guruh_");

  const previewText2 = appeal.text2
    ?.replace("_sana1_", form.sana1 || "_sana1_")
    .replace("_sana2_", form.sana2 || "_sana2_")
    .replace("_sabab_", form.text3 || "_sabab_")
    .replace(
      "_talaba_ism_familya_",
      student?.fullName || "_talaba_ism_familya_"
    )
    .replace("_guruh_", student?.groupName || "_guruh_");

  return (
    <div className="mx-auto max-w-6xl gap-8 rounded-xl bg-white p-6 shadow md:flex">
      {/* Chap tomonda form */}
      <div className="w-full space-y-4 md:w-1/2">
        <h1 className="text-2xl font-bold">{appeal.name}</h1>
        <p className="mb-4 text-gray-600">{appeal.description}</p>

        {appeal.isText3 && (
          <textarea
            name="text3"
            value={form.text3}
            onChange={handleChange}
            placeholder="Sababni yozing..."
            rows="3"
            className="w-full rounded border p-3"
          />
        )}

        {appeal.date === 1 && (
          <input
            type="date"
            name="sana1"
            value={form.sana1}
            onChange={handleChange}
            className="w-full rounded border p-3"
          />
        )}

        {appeal.date === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              name="sana1"
              value={form.sana1}
              onChange={handleChange}
              className="rounded border p-3"
            />
            <input
              type="date"
              name="sana2"
              value={form.sana2}
              onChange={handleChange}
              className="rounded border p-3"
            />
          </div>
        )}

        {appeal.proof && (
          <input
            type="file"
            name="file"
            accept=".pdf"
            onChange={handleChange}
            className="w-full rounded border p-2"
          />
        )}

        <button
          onClick={handleSubmit}
          className="mt-4 w-full rounded bg-green-600 py-3 text-white hover:bg-green-700"
        >
          Ariza yuborish
        </button>
      </div>

      {/* O‘ng tomonda preview */}
      <div className="mt-8 w-full md:mt-0 md:w-1/2">
        <div className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <h3 className="text-lg font-semibold">Ariza ko‘rinishi</h3>
        </div>
        <div className="space-y-6 rounded-b-lg border border-gray-200 bg-white p-6 text-gray-800 shadow-sm">
          <div className="mb-8 flex justify-end">
            <div className="w-40 whitespace-pre-line text-right text-sm text-gray-600">
              {previewText1}
            </div>
          </div>
          <div className="border-b border-gray-200 pb-3 text-center text-xl font-bold text-blue-800">
            A R I Z A
          </div>
          <div className="mt-4 whitespace-pre-line text-justify text-sm leading-relaxed">
            {previewText2}
          </div>
          <div className="mt-10 flex justify-between border-t border-gray-200 pt-4 text-sm text-gray-500">
            <div>Sana: {new Date().toLocaleDateString("uz-UZ")}</div>
            <div className="font-medium">{student?.fullName || "________"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAppeal;
