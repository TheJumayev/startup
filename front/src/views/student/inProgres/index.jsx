import Banner from "./components/Banner";
import General from "./components/General";
import Notification from "./components/Notification";
import Project from "./components/Project";
import Storage from "./components/Storage";
import Upload from "./components/Upload";
import Card from "../../../components/card";
import Checkbox from "../../../components/checkbox";
import React from "react";

const ProfileOverview = () => {
  return (
      <div className="flex w-full flex-col gap-5">
        <div className="mt-5 pt-5 p-2 grid grid-cols-1 gap-5  md:p-10 lg:p-20 lg:pt-10">
          <Card extra="pb-7 p-[20px] w-full">
            {/* task header */}
            <h4 className="ml-4 text-xl font-bold text-navy-700 dark:text-white">
              Bu sahifa hozirchalik mavjud emas! </h4>

            {/* task content */}


          </Card>
        </div>

      </div>
  );
};

export default ProfileOverview;
