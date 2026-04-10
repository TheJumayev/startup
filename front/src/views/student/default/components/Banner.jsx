import React, { useEffect, useState } from "react";
import nft1 from "assets/img/nfts/NftBanner1.png";
import { MdAllInbox, MdArrowForward } from "react-icons/md";
import * as MdIcons from "react-icons/md";
import Card from "../../../../components/card";
import ApiCall from "../../../../config";
import { Link, useNavigate } from "react-router-dom";

const Banner1 = (props) => {
  const navigate = useNavigate();

  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);

  useEffect(() => {
    getCategory();
  }, []);
  const getCategory = async () => {
    try {
      const response = await ApiCall(`/api/v1/superadmin/category`, "GET");
      setCategory(response.data);
      setActiveCategory(response?.data[0]);
      getSubCategory(1);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const getSubCategory = async (category_id) => {
    try {
      const response = await ApiCall(
        `/api/v1/superadmin/subcategory/status/category/${category_id}`,
        "GET"
      );
      setSubCategory(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };
  const [activeCategory, setActiveCategory] = useState();
  const [student, setStudent] = useState();
  const [debt, setDebt] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    sendData(token);
  }, []);

  const sendData = async (token) => {
    try {
      const response = await ApiCall("/api/v1/student/account/" + token, "GET");
      setStudent(response.data);
      console.log(response.data);
      await getDebt(token);
    } catch (error) {
      navigate("/student/login");
      console.error("Error fetching student data or posting to server:", error);
    }
  };

  const getDebt = async (token) => {
    try {
      const response = await ApiCall("/api/v1/student/debt/" + token, "GET");
      setDebt(response.data);
    } catch (error) {
      console.error("Error fetching student data or posting to server:", error);
    }
  };

  return (
    <>
      <div
        className="flex w-full flex-col rounded-[20px] bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px] md:pb-0 "
        style={{ backgroundImage: `url(${nft1})` }}
      >
        <div className="w-full p-4 pb-0 pt-0">
          <div className="flex w-full flex-wrap justify-between">
            <div id="text" className="mb-2 w-full md:mb-0 md:w-[70%]">
              <h4 className="mb-[14px] max-w-full text-xl font-bold text-white md:text-3xl md:leading-[42px] lg:w-[46%] xl:w-[85%] 2xl:w-[75%] 3xl:w-[52%]">
                {props.name}
              </h4>
              <p className="mb-[40px] max-w-full text-base font-medium text-[#E3DAFF] md:w-[64%] lg:w-[40%] xl:w-[72%] 2xl:w-[60%] 3xl:w-[45%]">
                <Link
                  to={"/student/debt"}
                  className={"rounded-xl bg-red-500 p-2 text-[20px]"}
                >
                  Sizning {debt?.length} ta fan(lar)dan qarzingiz bor
                </Link>
              </p>
            </div>
            <div id="showmore" className="w-full md:w-[30%]">
              <button className="text-black linear mt-2 flex rounded-xl bg-white px-4 py-2 text-center text-base font-medium transition duration-200 hover:!bg-white/80 active:!bg-white/70">
                Barcha xizmatlar &nbsp;
                <MdArrowForward className="h-5 w-5 pt-1" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div>
            <ul className="my-2 mb-4 flex flex-wrap border-b">
              {category?.map((item, index) => (
                <li
                  key={index}
                  className={`mr-1 ${
                    activeCategory.name === item.name
                      ? "rounded-t border-l border-t border-r bg-white"
                      : "text-white"
                  }`}
                >
                  <button
                    onClick={() => {
                      getSubCategory(item.id);
                      setActiveCategory(item);
                    }}
                    className={`inline-block w-full py-2 px-4 font-semibold sm:w-auto ${
                      activeCategory.name === item.name
                        ? "text-blue-400"
                        : "text-white hover:text-blue-900"
                    } ${
                      index !== 0 ? "mt-2 sm:mt-0" : ""
                    } md:text-md text-xs sm:text-sm lg:text-lg xl:text-xl`}
                    // Adjusting text sizes for different screen sizes
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>

            {/* Subcategories of the active category */}
          </div>
        </div>
      </div>

      <div className="!z-5 relative flex flex-col rounded-[20px] bg-white bg-clip-border p-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none">
        <ul className="mx-auto flex flex-wrap justify-start gap-4 p-2">
          {subCategory.map((subcategory, index) => {
            // Dynamically retrieve the icon component
            const IconComponent = MdIcons[subcategory.icon];
            return (
              <Link
                to={"/student/service/" + subcategory.id}
                key={index}
                id={subcategory?.id}
                className="mx-auto w-[260px]"
              >
                <Card extra={"w-full h-full p-2 hover:!bg-blue-100"}>
                  <div className="mb-auto flex flex-col items-center justify-start">
                    <div className="mt-2 flex items-center justify-center rounded-full bg-lightPrimary p-[12px] text-5xl font-bold text-brand-500 dark:!bg-navy-700 dark:text-white">
                      {/* Render the icon dynamically */}
                      {IconComponent ? <IconComponent /> : <span>?</span>}
                    </div>
                    <p className="px-5 text-center text-base font-normal text-gray-800 dark:text-white md:!px-0 xl:!px-8">
                      {subcategory?.name}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </ul>
      </div>
    </>
  );
};

export default Banner1;
