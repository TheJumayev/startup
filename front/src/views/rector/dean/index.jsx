import React, { useEffect, useState } from "react";
import ApiCall from "../../../config";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import Card from "../../../components/card";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import Select from "react-select";
import autoprefixer from "autoprefixer";

const Admins = () => {
    const [admins, setAdmins] = useState([]);
    const [newAdmin, setNewAdmin] = useState({ id: '', name: '', phone: '', password: '' });
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [show, setShow] = useState(false);
    const [duties, setDuties] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [adminDuties, setAdminDuties] = useState([]);

    useEffect(() => {
        getAdmins();
        duty()
    }, []);
    const duty = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/deans/duty`, "GET");
            setDuties(response.data)
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };





    const getAdmins = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/deans`, "GET");
            setAdmins(response.data);
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };



    const updateAdmin = async () => {
        try {
            const updatedAdmin = {
                phone: editingAdmin.phone,
                name: editingAdmin.name,
                password: editingAdmin.password
            };
            await ApiCall(`/api/v1/superadmin/admins/${editingAdmin.id}`, "PUT", updatedAdmin);
            await getAdmins();
            setEditingAdmin(null);
            setShow(false);
            setSelectedSubCategories([]);
        } catch (error) {
            console.error("Error updating admin:", error);
        }
    };

    const handleEditClick = (admin) => {
        setEditingAdmin({ ...admin, password: '' });
        setSelectedSubCategories(adminDuties.filter(duty => duty.admin.id === admin.id).map(duty => ({
            value: duty.subCategory.id,
            label: duty.subCategory.name
        })));
        setShow(true);
    };




    return (
        <div>


            <div className="grid my-4 h-full grid-cols-1 gap-5 md:grid-cols-1 pt-0 pb-0 pr-32">
                <Card extra={"w-full h-full"}>
                    <div className="p-4 my-2 overflow-x-scroll xl:overflow-x-hidden">
                        <table className="w-full">
                            <thead>
                            <tr className={"text-start p-2 border-b-2"}>
                                <th>№</th>
                                <th>Ism</th>
                                <th>Phone/Login</th>
                                <th>Yo'nalishlar</th>
                            </tr>
                            </thead>
                            <tbody>
                            {admins.map((row, index) => (
                                <tr key={index} className={"border-b-2 text-start"}>
                                    <td >{index + 1}</td>
                                    <td><p className={"text-lg bold"}>{row.name}</p></td>
                                    <td><p className={"text-lg bold"}>{row.phone}</p></td>
                                    <td>
                                        <p className="text-lg font-bold">
                                            {duties.filter(item => item.dean.id == row.id)[0]?.department}
                                        </p>

                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <Rodal width={500} height={400} visible={show} onClose={() => setShow(false)}>
                <div className={"mb-8 "}>
                    <h2 className="text-lg font-bold mb-4">{editingAdmin ? 'Dekan tahrirlash' : "Admin qo'shish"}</h2>
                    <form className={""} onSubmit={(e) => {
                        e.preventDefault();
                        if (editingAdmin) {
                            updateAdmin();
                        }
                    }}>
                        <div className="mb-4">
                            <label className="block mb-2">Ism Familya:</label>
                            <input
                                type="text"
                                value={editingAdmin ? editingAdmin.name : newAdmin.name}
                                onChange={(e) => {
                                    if (editingAdmin) {
                                        setEditingAdmin({...editingAdmin, name: e.target.value});
                                    } else {
                                        setNewAdmin({...newAdmin, name: e.target.value});
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Phone/Login:</label>
                            <input
                                type="text"
                                value={editingAdmin ? editingAdmin.phone : newAdmin.phone}
                                onChange={(e) => {
                                    if (editingAdmin) {
                                        setEditingAdmin({...editingAdmin, phone: e.target.value});
                                    } else {
                                        setNewAdmin({...newAdmin, phone: e.target.value});
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-2">Password:</label>
                            <input
                                type="text"
                                value={editingAdmin ? editingAdmin.password : newAdmin.password}
                                onChange={(e) => {
                                    if (editingAdmin) {
                                        setEditingAdmin({...editingAdmin, password: e.target.value});
                                    } else {
                                        setNewAdmin({...newAdmin, password: e.target.value});
                                    }
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>

                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                            {editingAdmin ? 'Yangilash' : 'Qo\'shish'}
                        </button>
                    </form>
                </div>
            </Rodal>
        </div>
    );
};

export default Admins;
