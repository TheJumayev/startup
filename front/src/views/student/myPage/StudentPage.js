import React, { useEffect, useState } from 'react';
import nft1 from "../../../assets/img/nfts/NftBanner1.png";
import { Link, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { MdArrowBack } from "react-icons/md";

function StudentPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await ApiCall('/api/v1/student/account/all/me/' + token, "GET");
            setUser(response.data);
            console.log(response.data);
        } catch (error) {
            navigate("/student/login");
            console.error('Error fetching student data or posting to server:', error);
        }
    };

    // helper: epoch(seconds) -> dd/mm/yyyy (en-GB)
    const fmtDate = (sec) => {
        if (!sec && sec !== 0) return "-";
        try { return new Date(Number(sec) * 1000).toLocaleDateString('en-GB'); } catch { return "-"; }
    };

    return (
        <div className="">
            <div className={"p-4"}>
                <div className="bg-[#f0f7fb] p-4 mt-2 rounded-lg">
                    <div className="flex flex-col md:flex-row gap-2 justify-center">
                        <div className="w-full md:w-1/4">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={user?.image}
                                    className="w-24 h-24 rounded-full border-4 border-[#0083CA] md:w-32 md:h-32 lg:w-40 lg:h-40"
                                    alt=""
                                />
                            </div>
                            <ul className="space-y-2 text-center text-[#0083ca] font-bold">
                                <li className="py-2 rounded-lg bg-[#0083ca] text-white">
                                    <Link to={"/student/user"}><i className="fa fa-user-circle-o"></i> Mening profilim</Link>
                                </li>
                                <li className="py-2 rounded-lg hover:bg-[#0083ca] hover:text-white">
                                    <Link to={"/student/default"}><i className="fa fa-user-circle-o"></i> Fandan qarzdorlik </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="w-full md:w-2/3 bg-white p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-semibold text-[#0083ca]">Umumiy ma'lumot</h1>
                                <i className="fa fa-eye-slash text-[#0083ca]"></i>
                            </div>

                            {/* Pasport ma'lumotlari */}
                            <h2 className="text-lg font-semibold text-[#0083ca] my-4">Pasport ma'lumotlari</h2>
                            <div className="overflow-auto">
                                <table className="w-full text-sm md:text-base">
                                    <tbody className="text-[#585858] font-bold">
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">F.I.O.</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.fullName}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">Tug'ilgan sana</th>
                                            <td className="p-2 text-left">
                                                <span>{fmtDate(user?.birthDate)}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Pasport seriyasi</th>
                                            <td className="p-2 text-left">
                                                <span>-</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">JSHR</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.studentIdNumber || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Telefon raqami</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.phone || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="">
                                            <th className="p-2 text-left">Email</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.email || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Jinsi</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.gender || "-"}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Ta'lim ma'lumoti */}
                            <h2 className="text-lg font-semibold text-[#0083ca] my-4 text-center">
                                Talim malumoti
                            </h2>
                            <div className="overflow-auto">
                                <table className="w-full text-sm md:text-base">
                                    <tbody className="text-[#585858] font-bold">
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Talim shakli</th>
                                            <td className="p-2 text-left">{user?.educationForm || "-"}</td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">Talim tili</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.groupLang || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Fakultet</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.departmentName || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">Guruh</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.group?.name || user?.groupName || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">O'quv kursi</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.level || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">O'quv semester</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.semesterName || user?.semester || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className={"bg-[#EFF9FF]"}>
                                            <th className="p-2 text-left">Qabul turi</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.paymentForm || "-"}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Doimiy manzil */}
                            <h2 className="text-lg font-semibold text-[#0083ca] my-4 text-center">
                                Doimiy ro‘yxatdan o‘tgan manzili
                            </h2>
                            <div className="overflow-auto">
                                <table className="w-full text-sm md:text-base">
                                    <tbody className="text-[#585858] font-bold">
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Mamlakat</th>
                                            <td className="p-2 text-left">{user?.country ? `${user.country}` : "-"}</td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">Hudud</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.province || "-"}</span>
                                            </td>
                                        </tr>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">Tuman</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.district || "-"}</span>
                                                <span>{user?.terrain ? `, ${user.terrain}` : ""}</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th className="p-2 text-left">Manzil</th>
                                            <td className="p-2 text-left">
                                                <span>{user?.terrain || "-"}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default StudentPage;
