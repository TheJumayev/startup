import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline, MdOutlinePlaylistAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const SubCategories = () => {
  const [admins, setAdmins] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getCategory();
    getSubCategory(); // Load all by default
  }, []);

  // Fetch categories
  const getCategory = async () => {
    try {
      const response = await ApiCall(`/api/v1/superadmin/category`, "GET");
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch subcategories (if category_id provided, filter; else get all)
  const getSubCategory = async (category_id = "") => {
    try {
      const url = category_id
          ? `/api/v1/superadmin/subcategory/category/${category_id}`
          : `/api/v1/superadmin/subcategory`; // all
      const response = await ApiCall(url, "GET");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    getSubCategory(categoryId);
  };

  const handleEditClick = (row) => {
    navigate(`/superadmin/subcategories/edit/${row.id}`);
  };

  return (
      <div>
        <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="w-75 my-2 mb-4 px-3 py-2 border rounded"
            >
              <option value="">Barchasi</option>
              {category.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
              ))}
            </select>
          </div>

        </div>

        <div className="grid w-50 m-auto h-full grid-cols-1 gap-5 md:grid-cols-1 pb-0 pr-32">
          <Card extra={"w-full h-full "}>
            <div className="p-4 overflow-x-scroll xl:overflow-x-hidden">
              <table className="w-full">
                <thead>
                <tr>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">№</div>
                  </th>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">Xizmat turi</div>
                  </th>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">Xizmat muddati</div>
                  </th>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">Holati</div>
                  </th>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">Asos</div>
                  </th>

                </tr>
                </thead>
                <tbody>
                {admins?.map((row, index) => (
                    <tr className="border-b-2" key={index}>
                      <td className="p-2">
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {index + 1}
                        </p>
                      </td>
                      <td>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {row.name}
                        </p>
                      </td>
                      <td>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {row.service_day === 0 ? "O'z vaqtida" : `${row.service_day} kunda`}
                        </p>
                      </td>
                      <td>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {row.status
                              ? <span className="text-amber-300">Faol</span>
                              : <span className="text-red-300">Faol emas</span>}
                        </p>
                      </td>
                      <td>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {row.asos ? "Majburiy" : "Shart emas"}
                        </p>
                      </td>

                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
  );
};

export default SubCategories;
