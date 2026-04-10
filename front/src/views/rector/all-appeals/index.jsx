import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/card";
import Select from 'react-select';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
    MdCancel,
    MdCheckCircleOutline,
    MdDownload,
    MdFileUpload,
    MdOutlineFlaky,
    MdPendingActions,
} from "react-icons/md";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import html2pdf from "html2pdf.js";

const Duty = () => {
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(15);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [admin, setAdmin] = useState(null);
    const [duty, setDuty] = useState([]);
    const [appealType, setAppealType] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(0);
    const [selectedAppealType, setSelectedAppealType] = useState(0);
    const [show, setShow] = useState(false);
    const [appealText, setAppealText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [answer, setAnswer] = useState(null);
    const [subCategories, setSubCategories] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        getAppealType();
        getAppeal();
        getSubCategory();
    }, []);

    const getSubCategory = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/subcategory`, "GET");
            const formattedOptions = response.data
                .filter(sub => !sub.strange)
                .map(sub => ({
                    service_day: sub.service_day,
                    value: sub.id,
                    label: sub.name
                }));
            setSubCategories(formattedOptions);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };

    const getAppeal = async (subcategoryId = 0, appealTypeId = 0, page = 0, size = 15) => {
        const obj = {
            subcategoryId: subcategoryId || 0,
            appealTypeId: appealTypeId || 0,
        };

        try {
            const response = await ApiCall(`/api/v1/superadmin/appeal?page=${page}&size=${size}`, "POST", obj);
            setAppeals(response.data);
            setTotalPages(response.data.totalPages);
            setCurrentPage(page);
        } catch (error) {
            console.error("Error fetching appeals:", error);
            navigate("/404");
        }
    };

    const handleSearchClick = () => {
        setCurrentPage(0);
        getAppeal(selectedSubcategory, selectedAppealType, 0, rows);
    };

    const handlePageChange = (pageIndex) => {
        setFirst(pageIndex * rows);
        getAppeal(selectedSubcategory, selectedAppealType, pageIndex, rows);
    };

    const renderPagination = () => {
        if (!totalPages || totalPages <= 1) return null;

        const pages = [];
        for (let i = 0; i < totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`mx-1 rounded-lg px-4 py-2 transition-all ${
                        currentPage === i
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handlePageChange(i)}
                >
                    {i + 1}
                </button>
            );
        }

        return <div className="flex justify-center mt-6 mb-2 space-x-2">{pages}</div>;
    };

    const getAppealType = async () => {
        try {
            const response = await ApiCall(`/api/v1/appealtype`, "GET", null);
            setAppealType(response.data);
        } catch (error) {
            console.error("Error fetching appeal type data:", error);
        }
    };

    const handleAnswer = (appeal) => {
        setAnswer(appeal);
        setShow(true);
    };

    const handleDownload = () => {
        const url = answer?.appealFile ? `${baseUrl}/api/v1/file/getFile/${answer?.appealFile.id}` : "";
        if (url) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = "file.pdf";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                })
                .catch(error => console.error("Download failed:", error));
        }
    };

    const handleDownloadAriza = () => {
        const container = document.createElement("div");

        const fullName = `${answer?.student?.second_name} ${answer?.student?.first_name}`;
        const groupName = answer?.student?.group_name || "";
        const appealText = (() => {
            try {
                return JSON.parse(answer.appealText).text;
            } catch (e) {
                return "Mavjud emas";
            }
        })();
        const createdDate = new Date(answer?.created_at).toLocaleDateString("uz-UZ");

        container.innerHTML = `
        <div style="font-family: 'Times New Roman', serif; font-size: 16px; color: #000; padding: 40px; width: 100%; max-width: 700px; margin: auto;">
            <div style="text-align: right; margin-bottom: 40px;">
                <p style="margin: 0;">Buxoro davlat texnika universiteti</p>
                <p style="margin: 0;">Rektori v.b. S.B.Saidovga</p>
                <p style="margin: 0;">${groupName} guruh talabasi</p>
                <p style="margin: 0;">${fullName} tomonidan</p>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <strong style="font-size: 18px; text-transform: uppercase;">Ariza</strong>
            </div>

            <div style="text-align: justify; line-height: 1.7; margin-bottom: 40px;">
                ${appealText}
            </div>

            <div style="display: flex; justify-content: space-between;">
                <span>${createdDate}</span>
                <span>${fullName}</span>
            </div>
        </div>
    `;

        html2pdf()
            .from(container)
            .set({
                margin: 0.5,
                filename: 'ariza.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            })
            .save();
    };

    const isOverdue = (appeal) => {
        if (!appeal?.responseDay) return false;
        const responseDate = new Date(appeal.responseDay);
        const today = new Date();
        return responseDate < today;
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            COMPLETED: { color: "bg-green-100 text-green-800", icon: <MdCheckCircleOutline className="h-5 w-5" /> },
            INPROGRESS: { color: "bg-blue-100 text-blue-800", icon: <MdPendingActions className="h-5 w-5" /> },
            CANCELED: { color: "bg-red-100 text-red-800", icon: <MdCancel className="h-5 w-5" /> },
            PENDING: { color: "bg-yellow-100 text-yellow-800", icon: <MdPendingActions className="h-5 w-5" /> }
        };

        const statusText = {
            COMPLETED: "Bajarildi",
            INPROGRESS: "Jarayonda",
            CANCELED: "Rad etildi",
            PENDING: "Kutilmoqda"
        };

        const current = statusMap[status] || { color: "bg-gray-100 text-gray-800", icon: null };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${current.color}`}>
                {current.icon && <span className="mr-1">{current.icon}</span>}
                {statusText[status] || status}
            </span>
        );
    };

    const handleDownloadExcel = async () => {
        const obj = {
            subcategoryId: selectedSubcategory || 0,
            appealTypeId: selectedAppealType || 0,
        };

        try {
            const response = await ApiCall(`/api/v1/superadmin/all/appeal`, "POST", obj);
            const allAppeals = response.data;

            const data = allAppeals.map((item, index) => ({
                "№": index + 1,
                "Talaba": `${item.student?.second_name || ""} ${item.student?.first_name || ""}`,
                "Telefon": item.student?.phone || "",
                "Guruh": item.student?.group_name || "",
                "Xizmat turi": item.subCategory?.name || "",
                "Holati": item.appealType?.name || "",
                "Yuborilgan sana": item.created_at
                    ? new Date(item.created_at).toLocaleDateString("uz-UZ")
                    : "",
                "Mas'ul hodim": item.admin?.name || "-",
            }));

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Appeals");

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            const fileData = new Blob([excelBuffer], { type: "application/octet-stream" });
            saveAs(fileData, "murojaatlar.xlsx");
        } catch (error) {
            console.error("Excel faylni yuklashda xatolik:", error);
        }
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Murojaatlar</h1>
                <p className="text-gray-600">Talabalar murojaatlari ro'yxati</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat turi</label>
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            options={[{ value: 0, label: 'Barcha xizmatlar' }, ...subCategories.map(item => ({
                                value: item.value,
                                label: item.label
                            }))]}
                            value={subCategories.find(option => option.value === selectedSubcategory) || { value: 0, label: 'Barcha xizmatlar' }}
                            onChange={(option) => setSelectedSubcategory(option.value)}
                            isSearchable
                            placeholder="Qidirish..."
                            noOptionsMessage={() => "Natija topilmadi"}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat holati</label>
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            options={[
                                { value: 0, label: 'Barcha holatlar', originalName: '' },
                                ...appealType.map(item => ({
                                    value: item.id,
                                    label: item.name,
                                    originalName: item.name
                                }))
                            ]}
                            value={appealType.find(option => option.id === selectedAppealType) || { value: 0, label: 'Barcha holatlar', originalName: '' }}
                            onChange={(option) => setSelectedAppealType(option.value)}
                            isSearchable
                            placeholder="Qidirish..."
                            noOptionsMessage={() => "Natija topilmadi"}
                            formatOptionLabel={({ label, originalName }) => (
                                <div className="flex items-center">
                                    {originalName && getStatusBadge(originalName)}
                                    <span className="ml-2">{label}</span>
                                </div>
                            )}
                        />
                    </div>

                    <div className="md:col-span-2 flex items-end justify-end">
                        <button
                            onClick={handleDownloadExcel}
                            className="ml-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 4v16m8-8H4"/>
                            </svg>
                            Excelga yuklash
                        </button>

                        <button
                            onClick={handleSearchClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Qidirish
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xizmat turi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Murojaat vaqti</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holati</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masul hodim</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harakatlar</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {appeals?.content?.map((row, index) => {
                            const overdue = isOverdue(row);
                            return (
                                <tr
                                    key={index}
                                    className={`hover:bg-gray-50 transition-colors ${
                                        overdue ? 'bg-red-100 text-red-900 hover:bg-red-200' : ''
                                    }`}
                                >
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'font-semibold' : 'text-gray-500'}`}>
                                        {index + 1}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${overdue ? 'text-red-800' : 'text-gray-900'}`}>
                                        {row?.student?.second_name} {row?.student?.first_name}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {row?.subCategory?.name}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {new Date(row?.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(row?.appealType?.name)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {row?.admin?.name || "-"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleAnswer(row)}
                                            className={`${
                                                overdue
                                                    ? 'text-white bg-red-600 hover:bg-red-700'
                                                    : 'text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100'
                                            } px-3 py-1 rounded-md transition-colors`}
                                        >
                                            Ko'rish
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
                {renderPagination()}
            </div>

            {/* Modal */}
            <Modal
                open={show}
                onClose={() => setShow(false)}
                center
                classNames={{
                    modal: "rounded-lg max-w-3xl",
                    overlay: "bg-black bg-opacity-50"
                }}
            >
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Arizaga javob</h2>
                    <div className="space-y-4 overflow-y-auto max-h-[70vh] px-2">
                        <div className="flex items-center gap-4 border-b pb-4">
                            <img
                                width={60}
                                height={60}
                                className="rounded-full object-cover border-2 border-gray-200"
                                src={answer?.student?.image || "https://via.placeholder.com/60"}
                                alt="Student"
                            />
                            <div>
                                <h1 className="text-lg font-semibold text-gray-800">
                                    {answer?.student?.first_name} {answer?.student?.second_name}
                                </h1>
                                <p className="text-gray-600">{answer?.student?.group_name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Telefon</p>
                                <p className="font-medium">{answer?.student?.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Xizmat turi</p>
                                <p className="font-medium">{answer?.subCategory?.name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Yuborilgan sana</p>
                                <p className="font-medium">
                                    {answer?.created_at ? new Date(answer?.created_at).toLocaleString() : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Holati</p>
                                <div className="mt-1">
                                    {answer?.appealType?.name && getStatusBadge(answer?.appealType?.name)}
                                </div>
                            </div>
                        </div>

                        {answer?.appealFile && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Fayllar</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        <MdDownload className="h-4 w-4" />
                                        Asos faylini yuklash
                                    </button>
                                    <button
                                        onClick={handleDownloadAriza}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        <MdDownload className="h-4 w-4" />
                                        Ariza faylini yuklash
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Ariza matni</p>
                            <div className="border border-gray-200 py-4 px-8 rounded-lg bg-gray-50 shadow-inner">
                                <div className="items-end w-full flex justify-end">
                                    <p className="w-2/3 text-sm text-gray-700 pt-2 text-end">
                                        Buxoro davlat texnika universiteti<br/>
                                        rektori v.b. S.B.Saidovga<br/>
                                        {answer?.student?.group_name} guruh talabasi<br/>
                                        {answer?.student?.second_name} {answer?.student?.first_name} tomonidan
                                    </p>
                                </div>

                                <p className="text-lg font-medium text-gray-800 mt-6 text-center">Ariza</p>

                                <p className="text-gray-700 mt-3 whitespace-pre-line">
                                    {(() => {
                                        try {
                                            return JSON.parse(answer.appealText).text;
                                        } catch (e) {
                                            return "Mavjud emas";
                                        }
                                    })()}
                                </p>

                                <div className="mt-8 mb-4 flex justify-between text-sm font-medium text-gray-600 px-4">
                                    <span>{answer?.created_at ? new Date(answer?.created_at).toISOString().split('T')[0] : "-"}</span>
                                    <span>{answer?.student?.second_name} {answer?.student?.first_name}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => setShow(false)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Duty;