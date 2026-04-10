import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import Card from "../../../components/card";
import { MdArrowBack, MdDownload } from "react-icons/md";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Expired(props) {
    const navigate = useNavigate();
    const [statistic, setStatistic] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getStatistic();
    }, []);

    const getStatistic = async () => {
        setLoading(true);
        try {
            const response = await ApiCall("/api/v1/student/appeal/expired", "GET", null);
            setStatistic(response.data);
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        if (!statistic || statistic.length === 0) return;

        const worksheetData = statistic.map((item, index) => ({
            "№": index + 1,
            "Xizmat nomi": item?.subCategory?.name || "N/A",
            "Ariza Berilgan sana": item?.created_at?.substring(0, 10) || "N/A",
            "Holati": getStatusText(item?.appealType?.name),
            "Mas'ul": item?.admin?.name || "N/A",
            "Talaba": `${item?.student?.second_name || ""} ${item?.student?.first_name || ""}`.trim() || "N/A",
            "Guruh": item?.student?.group_name || "N/A"
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Muddati O'tgan Arizalar");

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(data, `Muddati_otgan_arizalar_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const getStatusText = (status) => {
        switch (status) {
            case "INPROGRESS": return "Ko'rib chiqilmoqda";
            case "COMPLETED": return "Bajarildi";
            case "PENDING": return "Jarayonda";
            case "CANCELED": return "Rad etildi";
            default: return "Noma'lum";
        }
    };

    const getStatusBadge = (status) => {
        let bgColor, textColor, text;
        switch (status) {
            case "INPROGRESS":
                bgColor = "bg-blue-100";
                textColor = "text-blue-800";
                text = "Ko'rib chiqilmoqda";
                break;
            case "COMPLETED":
                bgColor = "bg-green-100";
                textColor = "text-green-800";
                text = "Bajarildi";
                break;
            case "PENDING":
                bgColor = "bg-yellow-100";
                textColor = "text-yellow-800";
                text = "Jarayonda";
                break;
            case "CANCELED":
                bgColor = "bg-red-100";
                textColor = "text-red-800";
                text = "Rad etildi";
                break;
            default:
                bgColor = "bg-gray-100";
                textColor = "text-gray-800";
                text = "Noma'lum";
        }

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                {text}
            </span>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Muddati O'tgan Arizalar</h1>
                {statistic?.length > 0 && (
                    <button
                        onClick={downloadExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <MdDownload className="h-5 w-5" />
                        Excelga yuklash
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : statistic?.length === 0 ? (
                <Card extra="w-full p-6">
                    <div className="text-center py-8">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Javob berish muddati o'tgan arizalar mavjud emas
                        </h3>
                        <p className="text-gray-500">
                            Hozircha muddati o'tgan arizalar topilmadi
                        </p>
                    </div>
                </Card>
            ) : (
                <Card extra="w-full p-4 sm:overflow-x-auto">
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    №
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Xizmat nomi
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Talaba
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ariza Berilgan sana
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Holati
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Mas'ul
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {statistic?.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row?.subCategory?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row?.student?.second_name} {row?.student?.first_name}
                                        {row?.student?.group_name && (
                                            <span className="block text-xs text-gray-400">
                                                    {row.student.group_name}
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row?.created_at?.substring(0, 10)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(row?.appealType?.name)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {row?.admin?.name || "Belgilanmagan"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default Expired;