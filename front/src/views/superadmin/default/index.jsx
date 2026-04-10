import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { baseUrl } from "../../../config";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [loadingTotalAgent, setLoadingTotalAgent] = useState(false);

  // 📘 1. Guruhlar bo‘yicha hisobot yuklab olish
  const downloadGroupHisobot = async () => {
    try {
      setLoadingGroup(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/hisobot/excel`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) throw new Error("Faylni yuklab bo‘lmadi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const today = new Date().toISOString().split("T")[0];
      const fileName = `Hisobot_Guruhlar_${today}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Xatolik:", error);
      navigate("/admin/login");
    } finally {
      setLoadingGroup(false);
    }
  };

  // 👥 2. Agentlar bo‘yicha hisobot yuklab olish
  const downloadAgentHisobot = async () => {
    try {
      setLoadingAgent(true);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${baseUrl}/api/v1/hisobot/agent-statistic`, {
        method: "GET",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) throw new Error("Faylni yuklab bo‘lmadi");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const today = new Date().toISOString().split("T")[0];
      const fileName = `Hisobot_Agentlar_${today}.xlsx`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Xatolik:", error);
      navigate("/admin/login");
    } finally {
      setLoadingAgent(false);
    }
  };

  // 🧾 3. Umumiy agent statistikasi hisobot yuklab olish
  // const downloadTotalAgentHisobot = async () => {
  //   try {
  //     setLoadingTotalAgent(true);
  //     const token = localStorage.getItem("authToken");
  //     const response = await fetch(`${baseUrl}/api/v1/hisobot/total-agent-statistic`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: token ? `Bearer ${token}` : "",
  //       },
  //     });
  //
  //     if (!response.ok) throw new Error("Faylni yuklab bo‘lmadi");
  //
  //     const blob = await response.blob();
  //     const url = window.URL.createObjectURL(blob);
  //     const today = new Date().toISOString().split("T")[0];
  //     const fileName = `Hisobot_Umumiy_Agent_Statistikasi_${today}.xlsx`;
  //
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.download = fileName;
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Xatolik:", error);
  //     navigate("/admin/login");
  //   } finally {
  //     setLoadingTotalAgent(false);
  //   }
  // };

  return (
      <div className="p-8 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          📊 Hisobotlar bo‘limi
        </h1>

        <div className="space-y-4">
          {/* Guruhlar hisobot */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <b>Guruhlar bo‘yicha hisobot:</b> ushbu tugma orqali har bir guruh uchun
              alohida varaqlarga ega bo‘lgan Excel faylni yuklab olasiz.
            </p>
            <button
                onClick={downloadGroupHisobot}
                disabled={loadingGroup}
                className={`w-full py-2 rounded text-white ${
                    loadingGroup
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                }`}
            >
              {loadingGroup ? "Yuklanmoqda..." : "📘 Guruhlar bo‘yicha hisobot olish"}
            </button>
          </div>

          {/* Agentlar hisobot */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-700 mb-2">
              <b>Agentlar bo‘yicha hisobot:</b> ushbu tugma orqali har bir agent nomiga
              mos alohida varaqlar (sheetlar) hosil qilinadi. Har bir agentga tegishli
              abituriyentlar ma’lumotlari Excel faylga yoziladi.
            </p>
            <button
                onClick={downloadAgentHisobot}
                disabled={loadingAgent}
                className={`w-full py-2 rounded text-white ${
                    loadingAgent
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {loadingAgent ? "Yuklanmoqda..." : "👥 Agentlar bo‘yicha hisobot olish"}
            </button>
          </div>

          {/*/!* Umumiy agent statistikasi hisobot *!/*/}
          {/*<div className="border rounded-lg p-4">*/}
          {/*  <p className="text-gray-700 mb-2">*/}
          {/*    <b>Umumiy agent statistikasi:</b> bu hisobot har bir agent uchun jami*/}
          {/*    abituriyentlar soni, to‘lov qilganlar va qilmaganlar soni hamda agentga*/}
          {/*    tegishli umumiy mukofot miqdorini ko‘rsatadi.*/}
          {/*  </p>*/}
          {/*  <button*/}
          {/*      onClick={downloadTotalAgentHisobot}*/}
          {/*      disabled={loadingTotalAgent}*/}
          {/*      className={`w-full py-2 rounded text-white ${*/}
          {/*          loadingTotalAgent*/}
          {/*              ? "bg-gray-400 cursor-not-allowed"*/}
          {/*              : "bg-purple-600 hover:bg-purple-700"*/}
          {/*      }`}*/}
          {/*  >*/}
          {/*    {loadingTotalAgent*/}
          {/*        ? "Yuklanmoqda..."*/}
          {/*        : "🧾 Umumiy agent statistikasi hisobotini olish"}*/}
          {/*  </button>*/}
          {/*</div>*/}
        </div>
      </div>
  );
};

export default Dashboard;
