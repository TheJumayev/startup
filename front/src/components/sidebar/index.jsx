/* eslint-disable */

import { HiX } from "react-icons/hi";
import Links from "./components/Links";

import routes from "routes.js";
import {Link} from "react-router-dom";
import DashIcon from "../icons/DashIcon";
import React from "react";

const Sidebar = ({ open, onClose }) => {
  return (
      <div
          className={`sm:none duration-175 linear fixed !z-50 flex min-h-full flex-col bg-white pb-10 shadow-2xl shadow-white/5 transition-all dark:!bg-navy-800 dark:text-white md:!z-50 lg:!z-50 xl:!z-0 ${
              open ? "translate-x-0" : "-translate-x-96"
          }`}
      >
      <span
          className="absolute top-4 right-4 block cursor-pointer xl:hidden"
          onClick={onClose}
      >
        <HiX/>
      </span>

        <div className={`mx-[20px] mt-[20px] flex items-center`}>
          <div className="mt-1 ml-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white">
            tem.bmti.uz
          </div>
        </div>
        <div class="mt-[58px] mb-7 h-px bg-gray-300 dark:bg-white/30"/>
        {/* Nav item */}

        <div className="h-screen pb-36">
          <ul className="mb-auto h-full overflow-auto scroll-m-0 overscroll-y-auto  pb-20">
            <Links routes={routes}/>


            <Link to={"/"} className={"mt-20"}>
                  <div className="relative mb-3 flex hover:cursor-pointer">
                      <li
                          className="my-[3px] flex cursor-pointer items-center px-8"

                      >
                <span
                    className={"font-medium text-gray-600"}
                >
                </span>
                          <p
                              className={`leading-1 ml-4 flex font-medium text-gray-600`}
                          >
                              name
                          </p>
                      </li>

                  </div>
              </Link>

          </ul>

        </div>


        {/* Free Horizon Card */}
        <div className="flex justify-center">

        </div>

        {/* Nav item end */}
      </div>
  );
};

export default Sidebar;
