import ColumnsTable from "../tables/components/ColumnsTable";
import { columnsDataColumns } from "../tables/variables/columnsData";
import tableDataColumns from "../tables/variables/tableDataColumns.json";
import ApiCall from "../../../config";
import React, { useEffect, useState } from "react";
import Card from "../../../components/card";
import Rodal from "rodal";
import "rodal/lib/rodal.css"; // Include Rodal CSS for styling

const Marketplace = () => {
    const [groups, setGroups] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(""); // State for selected department
    const [show, setShow] = useState(false);
    const [token, setToken] = useState(""); // State to store token input

    useEffect(() => {
        getDepartments(); // Fetch departments on component mount
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            getGroupsByDepartment(); // Fetch groups based on selected department
        } else {
            setGroups([]); // Clear groups if no department is selected
        }
    }, [selectedDepartment]);

    async function getDepartments() {
        try {
            const response = await ApiCall(`/api/v1/groups/departments`, "GET");
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching department data:", error);
        }
    }

    async function getGroupsByDepartment() {
        try {
            const response = await ApiCall(`/api/v1/groups/department/${selectedDepartment}`, "GET");
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching group data:", error);
        }
    }

    async function saveGroup() {
        setShow(false); // Close modal after saving
        await getDepartments();

        try {
            const response = await ApiCall(`/api/v1/groups/${token}`, "POST");
            console.log("Group saved successfully:", response.data);
           // Fetch updated groups after saving
            setShow(false); // Close modal after saving
        } catch (error) {
            setGroups([])
            console.error("Error saving group:", error);
        }
    }

    return (
        <>
            <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
                    <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="mt-5 grid h-full grid-cols-4 gap-5 md:grid-cols-3">
                            {/* Dropdown for selecting department */}
                            <div className="mb-4">
                                <label className="block mb-2">Yo'nalishlar:</label>
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-4 pt-2 pb-2"
                                >
                                    <option value="">Barchasi</option>
                                    {departments?.map(department => (
                                        <option key={department} value={department}>
                                            {department}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="text-end">
                            <button
                                onClick={() => setShow(true)}
                                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Guruhlar ro'yxatini yangilash
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
                {groups?.map((group) => (
                    <Card key={group.id} extra={"w-full pb-10 p-4 h-full"}>
                        <div>
                            <h3 className="font-bold">{group.name}</h3>
                            <p>Dekanat: {group.department.name}</p>
                            <p>Yo'nalish: {group.specialty.name}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modal for entering the token */}
            <Rodal width={400} height={300} visible={show} onClose={() => setShow(false)}>
                <h2 className="text-lg font-bold mb-4">Please enter the token</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        saveGroup();
                    }}
                >
                    <div className="mb-4">
                        <label className="block mb-2">Token:</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Add
                    </button>
                </form>
            </Rodal>
        </>
    );
};

export default Marketplace;
