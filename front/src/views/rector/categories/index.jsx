import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline } from "react-icons/md";

const Categories = () => {
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const response = await ApiCall(`/api/v1/superadmin/category`, "GET");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };


  const updateCatregory = async () => {
    try {
      const updateCategory = {
        id: editingAdmin.id,
        name: editingAdmin.name,
        created_at: editingAdmin.created_at
      };
      await ApiCall(`/api/v1/superadmin/category`, "PUT", updateCategory);
      await getCategory();
      setEditingAdmin(null);
      setShow(false);
    } catch (error) {
      console.error("Error updating admin:", error);
    }
  };


  const handleEditClick = (category) => {
    setEditingAdmin(category); // Clear the password for edit
    setShow(true);
  };


  return (
      <div>
        <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
          <div className="mt-5 grid h-full grid-cols-4 gap-5 md:grid-cols-3"></div>

        </div>

        <div className="grid w-50 m-auto h-full grid-cols-1 gap-5 md:grid-cols-1  pb-0 pr-32">
          <Card extra={"w-full  h-full "}>
            <div className="p-4  overflow-x-scroll xl:overflow-x-hidden">
              <table className="w-full">
                <thead>
                <tr>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                      №
                    </div>
                  </th>
                  <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                    <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                      Kategoriya
                    </div>
                  </th>


                </tr>
                </thead>
                <tbody>
                {admins.map((row, index) => (
                    <tr className={"border-b-2"} key={index}>
                      <td className={"p-2 "}>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {index + 1}
                        </p>
                      </td>
                      <td>
                        <p className="mr-[10px] text-sm font-semibold text-navy-700 dark:text-white">
                          {row.name}
                        </p>
                      </td>


                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Rodal width={450} height={300} visible={show} onClose={() => setShow(false)}>
          <h2 className="text-lg mt-2 font-bold mb-4">{editingAdmin && 'Kategoriya nomini tahrirlash' }</h2>
          <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingAdmin) {
                  updateCatregory();
                }
              }}
          >
            <div className="mb-4 mt-8">
              <label className="block mb-2">Kategoriya nomi:</label>
              <input
                  type="text"
                  value={editingAdmin && editingAdmin.name }
                  onChange={(e) => {
                    if (editingAdmin) {
                      setEditingAdmin({...editingAdmin, name: e.target.value});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>


            <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {editingAdmin && 'Tahrirlash'}
            </button>
          </form>
        </Rodal>
      </div>
  );
};

export default Categories;
