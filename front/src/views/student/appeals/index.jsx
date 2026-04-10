import CheckTable from "./components/CheckTable";

import {
  columnsDataDevelopment,
  columnsDataCheck,
  columnsDataColumns,
  columnsDataComplex,
} from "./variables/columnsData";
import tableDataDevelopment from "./variables/tableDataDevelopment.json";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataColumns from "./variables/tableDataColumns.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import DevelopmentTable from "./components/DevelopmentTable";
import ColumnsTable from "./components/ColumnsTable";
import ComplexTable from "./components/ComplexTable";
import ApiCall from "../../../config";
import React, {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import Card from "../../../components/card";
import CardMenu from "../../../components/card/CardMenu";
import {MdArrowBack, MdCancel, MdCheckCircle, MdOutlineError} from "react-icons/md";
import Progress from "../../../components/progress";
import {useGlobalFilter, usePagination, useSortBy, useTable} from "react-table";
import nft1 from "../../../assets/img/nfts/NftBanner1.png";


const Tables = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [appeals, setAppeals] = useState([])
  useEffect(() => {
    fetchData()
  }, []);
  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    try {
      const response = await ApiCall('/api/v1/student/account/'+token, "GET");
      setUser(response.data)
      await getAppeals(response.data.id)
    } catch (error) {
      navigate("/student/login")
      console.error('Error fetching student data or posting to server:', error);
    }
  };
  const getAppeals = async (userId) => {
    try {
      const response = await ApiCall("/api/v1/student/appeal/"+userId, "GET", null);
      setAppeals(response.data);

      if(!response.data){
        navigate("/student/login")
      }
    } catch (error) {
      navigate("/student/login");
      console.error("Error fetching account data:", error);
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
                  {user?.first_name} {user?.second_name}
                </h4>
                <p className="mb-[40px] max-w-full text-base font-medium text-[#E3DAFF] md:w-[64%] lg:w-[40%] xl:w-[72%] 2xl:w-[60%] 3xl:w-[45%]">
                  Mening arizalarim
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
                      src={user?.image}
                      className="w-24 h-24 rounded-full border-4 border-[#0083CA] md:w-32 md:h-32 lg:w-40 lg:h-40"
                      alt=""
                  />
                </div>
                <ul className="space-y-2 text-center text-[#0083ca] font-bold">
                  <li className="py-2 rounded-lg ">
                    <Link to={"/student/user"}><i className="fa fa-user-circle-o"></i> Mening profilim
                    </Link>
                  </li>
                  <li className="py-2 rounded-lg bg-[#0083ca] text-white">
                    <Link to={"/student/appeals"}><i className="fa fa-user-circle-o"></i> Mening
                      Arizalarim </Link>
                  </li>
                  <li className="py-2 rounded-lg hover:bg-[#0083ca] hover:text-white">
                    <Link to={"/student/debt"}><i className="fa fa-user-circle-o"></i> Fandan qarzdorlik </Link>
                  </li>
                </ul>
              </div>

              <div className="w-full md:w-2/3 bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-[#0083ca]">Mening arizalarim</h1>
                  <i className="fa fa-eye-slash text-[#0083ca]"></i>
                </div>
                <div className="overflow-auto my-4">
                  {appeals?.length === 0 ?
                      <div className={"bg-[#EFF9FF] p-4"}>
                            <p className={"text-sm"}>Siz hali tizimdan ariza topshirmagansiz.</p>
                      </div>
                      :
                      <table className="w-full text-sm md:text-base">
                        <thead>
                        <tr className="bg-[#EFF9FF]">
                          <th className="p-2 text-left">Ariza Raqami</th>
                          <th className="p-2 text-left">Xizmat nomi</th>
                          <th className="p-2 text-left">Berilgan sana</th>
                          <th className="p-2 text-left">Ariza holati</th>

                        </tr>
                        </thead>
                        <tbody>
                        {appeals?.map((row, index) =>
                            <tr
                                key={index}
                                onClick={() => navigate("/student/appeal/" + row.id, {state: {row}})}
                                className={`border-b-2 hover:bg-gray-100 ${index % 2 !== 0 ? 'bg-[#EFF9FF]' : ''}`}
                            >
                              <td className="p-2 text-left sm:text-[14px]">
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {row.id + 1000}
                                </p>
                              </td>
                              <td className="p-2 text-left sm:text-[14px]">
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {row?.subCategory?.name}
                                </p>
                              </td>
                              <td className="p-2 text-left sm:text-[14px]">
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {row?.created_at.substring(0, 10)}
                                </p>
                              </td>
                              <td className="p-2 text-left sm:text-[14px]">
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {row?.appealType.name == "INPROGRESS" && "Ko'rib chiqilmoqda"}
                                  {row?.appealType.name == "COMPLETED" && "Bajarildi"}
                                  {row?.appealType.name == "PENDING" && "Jarayonda"}
                                  {row?.appealType.name == "CANCELED" && "Rad etildi"}
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
};

export default Tables;
