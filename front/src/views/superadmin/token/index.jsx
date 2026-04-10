import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdVpnKey } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { FaClock } from "react-icons/fa";
import Breadcrumbs from "views/BackLink/BackButton";

const Index = () => {
  const [tokens, setTokens] = useState([]);
  const [newToken, setNewToken] = useState({
    id: "",
    name: "",
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    getTokens();
  }, []);

  const addToken = async () => {
    console.log("send message");

    try {
      const response = await ApiCall(
        `/api/v1/token/hemis/${newToken.name}`,
        "POST",
        null
      );
      await getTokens();
      setShow(false);
      setNewToken({ id: "", name: "" });
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  const getTokens = async () => {
    try {
      const response = await ApiCall(`/api/v1/token/hemis`, "GET");
      console.log(response.data);
      setTokens(response.data);
    } catch (error) {
      console.error("Error fetching Tokens:", error);
    }
  };

  const deleteToken = async (id) => {
    try {
      await ApiCall(`/api/v1/token/hemis/${id}`, "DELETE");
      await getTokens();
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Haqiqatan ham bu tokenni o'chirmoqchimisiz?")) {
      deleteToken(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Noma'lum";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("uz-UZ", options);
  };

  return (
    <div className="p-6">
      <Breadcrumbs />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MdVpnKey className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Tokenlar boshqaruvi
          </h1>
        </div>
        <button
          onClick={() => {
            setNewToken({ id: "", name: "" });
            setShow(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          <FiPlus className="text-lg" />
          Yangi token
        </button>
      </div>

      <Card extra={"w-full h-full shadow-sm"}>
        <div className="overflow-x-auto p-4">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200 ">
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  №
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  Token
                </th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gray-500" />
                    <span>Yaratilgan vaqt</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-right font-medium text-gray-600">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody>
              {tokens &&
                tokens?.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-gray-700">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MdVpnKey className="text-blue-500" />
                        <p className="break-all font-medium text-gray-800">
                          {row.name || "Noma'lum"}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-700">{formatDate(row.created)}</p>
                    </td>
                    <td className="flex justify-end gap-4 py-3 px-4">
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
          {tokens.length === 0 && (
            <div className="py-12 text-center">
              <MdVpnKey className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-3 text-gray-500">Hech qanday token topilmadi</p>
            </div>
          )}
        </div>
      </Card>

      <Rodal
        width={500}
        height={300}
        visible={show}
        onClose={() => setShow(false)}
        customStyles={{
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        }}
      >
        <div className="p-4">
          <div className="mb-6 flex items-center gap-3">
            <MdVpnKey className="text-2xl text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Yangi token qo'shish
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addToken();
            }}
          >
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Token
              </label>
              <input
                type="text"
                value={newToken.name}
                onChange={(e) => {
                  setNewToken({ ...newToken, name: e.target.value });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Token matnini kiriting"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                HEMIS tizimi uchun token matnini kiriting
              </p>
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
                Qo'shish
              </button>
            </div>
          </form>
        </div>
      </Rodal>
    </div>
  );
};

export default Index;
