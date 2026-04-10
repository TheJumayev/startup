import React, {useEffect, useState} from "react";
import avatar from "assets/img/avatars/avatar11.png";
import banner from "assets/img/profile/banner.png";
import Card from "components/card";
import ApiCall from "../../../../config";
import {useNavigate} from "react-router-dom";
import {MdPerson} from "react-icons/md";

const Banner = () => {
    const  navigate = useNavigate()

    const [admin, setAdmin] = useState(null);
    const [duty, setDuty] = useState([]);

    useEffect(() => {
        getAdmin()
    }, []);
    const getAdmin = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET", null);
            setAdmin(response.data);
            await getDuty(response?.data?.id);
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        }
    };

    const getDuty = async (adminId) => {
        try {
            const response = await ApiCall(`/api/v1/admin/duty/${adminId}`, "GET", null);
            setDuty(response.data);
        } catch (error) {
            navigate("/404");
            console.error("Error fetching duty data:", error);
        }
    };

    return (
    <Card extra={"items-center w-full h-full p-[16px] bg-cover"}>
      {/* Background and profile */}
      <div
        className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
        style={{ backgroundImage: `url(${banner})` }}
      >
        <div className="absolute -bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
            <MdPerson className={"w-10 h-10"}/>
        </div>
      </div>

      {/* Name and position */}
      <div className="mt-16 flex flex-col items-center">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {admin?.name}
        </h4>
        <p className="text-base font-normal text-gray-600">Ofisregistrator admini</p>
      </div>


    </Card>
  );
};

export default Banner;
