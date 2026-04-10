import React, { useEffect, useState } from "react";
import ApiCall, {baseUrl} from "../../../config";
import { useNavigate } from "react-router-dom";
import Card from "../../../components/card";
import {
    MdCancel,
    MdCheckCircleOutline, MdDownload,
    MdFileUpload, MdPendingActions,

} from "react-icons/md";
import Rodal from "rodal";
import Select from "react-select";
import Modal from "react-responsive-modal";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Duty = () => {
    const [admin, setAdmin] = useState(null);
    const [duty, setDuty] = useState([]);
    const navigate = useNavigate();
    const [appealType, setAppealType] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(0);
    const [selectedAppealType, setSelectedAppealType] = useState(0);
    const [filteredAppeals, setFilteredAppeals] = useState([]);

    const [show, setShow] = useState(false);
    const [decision, setDecision] = useState(null);
    const [reason, setReason] = useState("");
    useEffect(() => {
        getAdmin();
        getAppealType()
    }, []);

    const getAppeal = async (id) => {
        try {
            const response = await ApiCall(`/api/v1/dean/appeal/` + id, "GET");
            setAppeals(response.data);
            console.log(response.data)
            setFilteredAppeals(response.data); // initialize filtered state
        } catch (error) {
            navigate("/404");
            console.error("Error fetching appeals data:", error);
        }
    };

    const getAdmin = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET", null);
            setAdmin(response.data);
            await getDuty(response?.data?.id);
            await getAppeal(response?.data?.id)
        } catch (error) {
            navigate("/404");
            console.error("Error fetching account data:", error);
        }
    };

    const getDuty = async (deanId) => {
        try {
            const response = await ApiCall("/api/v1/dean/my-duty/"+deanId, "GET", null);
            setDuty(response.data);
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        }

    };



    const getAppealType = async () => {
        try {
            const response = await ApiCall(`/api/v1/appealtype`, "GET", null);
            setAppealType(response.data);
        } catch (error) {
            console.error("Error fetching appeal type data:", error);
        }
    };

    const handleSearchClick = () => {
        let filtered = [...appeals];

        if (selectedSubcategory !== 0) {
            filtered = filtered.filter(a => a.subCategory?.id === selectedSubcategory);
        }

        if (selectedAppealType !== 0) {
            filtered = filtered.filter(a => a.appealType?.id === selectedAppealType);
        }

        setFilteredAppeals(filtered);
    };

    const [answer, setAnswer] = useState(null);
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
    const isOverdue = (appeal) => {
        if (!appeal?.responseDay) return false;
        const responseDate = new Date(appeal.responseDay);
        const today = new Date();
        return responseDate < today;
    };






    const handleSendAnswer = async () => {
        try {
            if (!decision) {
                alert("Iltimos, qaror tanlang!");
                return;
            }

            if (!reason.trim()) {
                alert("Iltimos, sababini yozing!");
                return;
            }

            const obj = {
                step: decision === "accept" ? 2 : 1,
                stepText: reason
            };
            const response = await ApiCall(
                `/api/v1/student/appeal/dean/${answer?.id}`,
                "PUT",
                obj
            );

            if (!response.error) {
                alert("Javob muvaffaqiyatli yuborildi!");
                setShow(false);
                // Refresh the appeals list
                getAppeal(admin?.id);
            } else {
                alert("Javob yuborishda xatolik yuz berdi!");
            }
        } catch (error) {
            console.error("Error sending answer:", error);
            alert("Javob yuborishda xatolik yuz berdi!");
        }
    };
    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {/* Subcategory Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat turi</label>
                        <Select
                            className="react-select-container"
                            classNamePrefix="react-select"
                            options={[
                                { value: 0, label: 'Barcha xizmatlar' },
                                ...duty.map(item => ({
                                    value: item.subCategory.id,
                                    label: item.subCategory.name
                                }))
                            ]}
                            value={
                                [
                                    { value: 0, label: 'Barcha xizmatlar' },
                                    ...duty.map(item => ({
                                        value: item.subCategory.id,
                                        label: item.subCategory.name
                                    }))
                                ].find(option => option.value === selectedSubcategory)
                            }
                            onChange={(option) => setSelectedSubcategory(option.value)}
                            isSearchable
                            placeholder="Qidirish..."
                            noOptionsMessage={() => "Natija topilmadi"}
                        />
                    </div>


                    {/* Appeal Type Select */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Xizmat holati</label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        options={[
                            { value: 0, label: 'Barcha holatlar', originalName: '' },
                            ...appealType.map(item => ({
                                value: item.id,
                                label: "",
                                originalName: item.name
                            }))
                        ]}
                        value={
                            [
                                { value: 0, label: 'Barcha holatlar', originalName: '' },
                                ...appealType.map(item => ({
                                    value: item.id,
                                    label: "",
                                    originalName: item.name
                                }))
                            ].find(option => option.value === selectedAppealType)
                        }
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
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ism</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xizmat turi</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Murojaat vaqti</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holati</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Masul hodim</th>
                            <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harakatlar</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAppeals?.map((row, index) => {
                            const overdue = isOverdue(row);
                            return (
                                <tr
                                    key={index}
                                    className={`hover:bg-gray-50 transition-colors ${
                                        overdue ? 'bg-red-100 text-red-900 hover:bg-red-200' : ''
                                    }`}
                                >
                                    <td className={`px-2 py-4 whitespace-nowrap text-sm ${overdue ? 'font-semibold' : 'text-gray-500'}`}>
                                        {index + 1}
                                    </td>
                                    <td className={`px-2 py-4 whitespace-nowrap text-sm font-medium ${overdue ? 'text-red-800' : 'text-gray-900'}`}>
                                        {row?.student?.second_name} {row?.student?.first_name}
                                    </td>
                                    <td className={`px-2 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {row?.subCategory?.name}
                                    </td>
                                    <td className={`px-2 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {new Date(row?.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(row?.appealType?.name)}
                                    </td>
                                    <td className={`px-2 py-4 whitespace-nowrap text-sm ${overdue ? 'text-red-800' : 'text-gray-500'}`}>
                                        {row?.admin?.name || "-"}
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium">
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

            </div>

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

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-2">Fayllar</p>
                            <div className="flex gap-3">
                                {answer?.appealFile!==null && (
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        <MdDownload className="h-4 w-4" />
                                        Asos faylini yuklash
                                    </button>
                                )}
                                {answer?.subCategory.ariza && (
                                    <button
                                        onClick={handleDownloadAriza}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        <MdDownload className="h-4 w-4" />
                                        Ariza faylini yuklash
                                    </button>
                                )}
                            </div>
                        </div>

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

                        <div className="mt-6 border-t pt-4">

                            {answer?.step ? (
                                <div>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div className="flex items-start">
                                            {answer?.step === 2 ? (
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                        <MdCheckCircleOutline className="h-6 w-6 text-green-600" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                        <MdCancel className="h-6 w-6 text-red-600" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="ml-3">
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {answer?.step === 1 ? "Rad etilgan " : "Qabul qilingan "}
                                                </h3>
                                                {answer?.stepText && (
                                                    <div className="mt-2 text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200">
                                                        <p className="font-medium">Sabab:</p>
                                                        <p className="mt-1">{answer.stepText}</p>
                                                    </div>
                                                )}
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {new Date(answer?.updated_at || answer?.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                   <div className={"flex justify-end"}>
                                       <button
                                           onClick={() => setShow(false)}
                                           className="px-5 my-2 py-2.5 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                                       >
                                           Yopish
                                       </button>
                                   </div>
                                </div>

                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Arizaga javob berish</h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Qaror</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <label className="relative flex cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none hover:border-blue-500 transition-colors">
                                                    <input
                                                        type="radio"
                                                        className="sr-only"
                                                        name="decision"
                                                        value="accept"
                                                        checked={decision === "accept"}
                                                        onChange={() => setDecision("accept")}
                                                    />
                                                    <div className="flex items-center">
                                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${decision === "accept" ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>
                                                            {decision === "accept" && <div className="h-3 w-3 rounded-full bg-blue-600"></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Qabul qilish</p>
                                                        </div>
                                                    </div>
                                                </label>

                                                <label className="relative flex cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none hover:border-blue-500 transition-colors">
                                                    <input
                                                        type="radio"
                                                        className="sr-only"
                                                        name="decision"
                                                        value="reject"
                                                        checked={decision === "reject"}
                                                        onChange={() => setDecision("reject")}
                                                    />
                                                    <div className="flex items-center">
                                                        <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${decision === "reject" ? 'border-blue-500 bg-blue-100' : 'border-gray-300'}`}>
                                                            {decision === "reject" && <div className="h-3 w-3 rounded-full bg-blue-600"></div>}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Rad etish</p>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {decision === "accept" ? "Qabul qilingan sabab" : "Rad etilgan sabab"}
                                            </label>
                                            <textarea
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                rows={4}
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder="Sababini batafsil yozing..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!answer?.step && (
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        onClick={() => setShow(false)}
                                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleSendAnswer}
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
                                    >
                                        Yuborish
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Duty;
