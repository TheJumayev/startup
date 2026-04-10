import React, {useEffect, useState} from 'react';
import nft1 from "../../../assets/img/nfts/NftBanner1.png";
import ApiCall from "../../../config";
import {Link, useNavigate} from "react-router-dom";
import Card from "../../../components/card";
import {MdArrowBack} from "react-icons/md";

function Debt(props) {
    const navigate = useNavigate()
    const [student, setStudent] = useState();
    const [debt, setDebt] = useState([])
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        console.log(token)
        sendData(token)
    }, []);

    const sendData = async (token) => {
        try {
            const response = await ApiCall('/api/v1/student/account/'+token, "GET");
            setStudent(response.data)
            console.log(response.data)
            await getDebt(token)

        } catch (error) {
            navigate("/student/login")
            console.error('Error fetching student data or posting to server:', error);
        }
    };


    const getDebt = async (token) => {
        try {
            const response = await ApiCall('/api/v1/student/debt/'+token, "GET");
            setDebt(response.data)
            console.log(response.data)
        } catch (error) {

            console.error('Error fetching student data or posting to server:', error);
        }
    };


    return (
        <div>
            <div
                className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px] md:pb-0"
                style={{backgroundImage: `url(${nft1})`}}>
                <div className="w-full pb-0 p-4 pt-0">
                    <div className="flex flex-wrap w-full justify-between">
                        <div id="text" className="w-full md:w-[70%] mb-2 md:mb-0">
                            <h4 className="mb-[14px] max-w-full text-[18px] font-bold text-white md:text-3xl md:leading-[42px] lg:w-[90%] xl:w-[95%] 2xl:w-[95%] 3xl:w-[92%]">
                                {student?.first_name} {student?.second_name}
                            </h4>
                            <p className="mb-[40px] max-w-full text-base font-medium text-[#E3DAFF] md:w-[64%] lg:w-[40%] xl:w-[72%] 2xl:w-[60%] 3xl:w-[45%]">
                                Fanlardan qarzdorlik bo'limi
                            </p>
                        </div>
                    </div>
                </div>
            </div>





            <div className={"p-4 md:p-8"}>
                <div className={"lg:mx-36 "}>
                    <Link to={"/student/default"}
                          className="text-sm flex  items-center font-normal text-navy-700 hover:underline dark:text-white dark:hover:text-white">
                        <MdArrowBack/> <p className={"hover:border-b-2"}>Bosh sahifa</p>
                    </Link>
                </div>
                <div className="bg-[#f0f7fb] p-4 mt-6 rounded-lg">

                    <div className="flex flex-col md:flex-row gap-2 justify-center">
                        <div className="w-full md:w-1/4">
                            <div className="flex justify-center mb-4">
                                <img
                                    src={student?.image}
                                    className="w-24 h-24 rounded-full border-4 border-[#0083CA] md:w-32 md:h-32 lg:w-40 lg:h-40"
                                    alt=""
                                />
                            </div>
                            <ul className="space-y-2 text-center text-[#0083ca] font-bold">
                                <li className="py-2 rounded-lg hover:bg-[#0083ca] hover:text-white ">
                                    <Link to={"/student/user"}><i className="fa fa-user-circle-o"></i> Mening profilim
                                    </Link>
                                </li>
                                <li className="py-2 rounded-lg hover:bg-[#0083ca] hover:text-white">
                                    <Link to={"/student/appeals"} className={"w-100"}><i className="fa fa-user-circle-o"></i> Mening
                                        Arizalarim </Link>
                                </li>
                                <li className="py-2 rounded-lg bg-[#0083ca] text-white ">
                                    <Link to={"/student/debt"}><i className="fa fa-user-circle-o"></i> Fandan qarzdorlik
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="w-full md:w-2/3 bg-white p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <h1 className="text-xl font-semibold text-[#0083ca]">Fanlardan qarz</h1>
                                <i className="fa fa-eye-slash text-[#0083ca]"></i>
                            </div>
                            <div className="overflow-auto my-4">
                                {debt?.length === 0 ?
                                    <div className={"bg-[#EFF9FF] p-4"}>
                                        <p className={"text-sm"}>Siz fanlardan qarzingiz mavjud emas.</p>
                                    </div>
                                    :
                                    <table className="w-full text-sm md:text-base">
                                        <thead>
                                        <tr className="bg-[#EFF9FF]">
                                            <th className="p-2 text-left">№</th>
                                            <th className="p-2 text-left">Fan nomi</th>
                                            <th className="p-2 text-left">Semester</th>
                                            <th className="p-2 text-left">To'plangan bal</th>
                                            <th className="p-2 text-left">Kredit</th>

                                        </tr>
                                        </thead>
                                        <tbody>
                                        {debt?.map((row, index) =>
                                            <tr
                                                key={index}

                                                className={`border-b-2 hover:bg-gray-100 ${index % 2 !== 0 ? 'bg-[#EFF9FF]' : ''}`}
                                            >
                                                <td className="p-2 text-left sm:text-[14px]">
                                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                        {index +1}
                                                    </p>
                                                </td>
                                                <td className="p-2 text-left sm:text-[14px]">
                                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                        {row?.subjectName}
                                                    </p>
                                                </td>
                                                <td className="p-2 text-left sm:text-[14px]">
                                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                        {row?._semester - 10}-semester
                                                    </p>
                                                </td>

                                                <td className="p-2 text-left sm:text-[14px]">
                                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                        {row?.overallScore.label}
                                                    </p>
                                                </td>
                                                <td className="p-2 text-left sm:text-[14px]">
                                                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                        {row?.credit}
                                                    </p>
                                                </td>

                                            </tr>
                                        )}
                                        </tbody>

                                    </table>

                                }
                            </div>


                        </div>
                    </div>
                </div>

            </div>


        </div>

    );
}

export default Debt;