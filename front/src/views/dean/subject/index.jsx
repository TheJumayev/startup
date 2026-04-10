import ColumnsTable from "../tables/components/ColumnsTable";
import { columnsDataColumns } from "../tables/variables/columnsData";
import tableDataColumns from "../tables/variables/tableDataColumns.json";
import ApiCall from "../../../config";
import React, { useEffect, useState } from "react";
import Card from "../../../components/card";
import CardMenu from "../../../components/card/CardMenu";
import {useNavigate} from "react-router-dom";

const Marketplace = () => {
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate()
    useEffect(() => {
        getGroup();
    }, []);

    async function getGroup() {
        try {
            const response = await ApiCall(`/api/v1/admin/bygroup`, "Get");
            setGroups(response.data);
            console.log(response.data);
        } catch (error) {
            navigate("/404")
            console.error("Error fetching group data:", error);
        }
    }

    const calculatePercentage = (statusCount, totalVotes) => {
        return totalVotes > 0 ? ((statusCount / totalVotes) * 100).toFixed(2) : 0;
    };

    return (
        <>
            <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
                    <div className="mb-4 mt-5 flex flex-col justify-between px-4 md:flex-row md:items-center">
                        <h4 className="ml-1 text-2xl font-bold text-navy-700 dark:text-white">
                            Tanlov fanlari statistikasi
                        </h4>
                    </div>
                </div>
            </div>
            <div className="mt-5 grid h-full grid-cols-1 gap-5 md:grid-cols-2">
                {
                    groups.map((group) => {
                        const totalVotes = group.voteSubjects.length;
                        const status1Count = group.voteSubjects.filter(item => item.status === 1).length;
                        const status2Count = group.voteSubjects.filter(item => item.status === 2).length;

                        return (
                            <Card key={group.groupName} extra={"w-full pb-10 p-4 h-full"}>
                                <header className="relative flex items-center justify-between">
                                    <div className="text-xl font-bold text-navy-700 dark:text-white">
                                        {group.groupName}
                                    </div>
                                    <CardMenu />
                                </header>

                                <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
                                    <table className="w-full">
                                        <thead>
                                        <tr>
                                            <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                                                <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                                                    Tanlov fani
                                                </div>
                                            </th>
                                            <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                                                <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                                                    Foiz(%)
                                                </div>
                                            </th>
                                            <th className="border-b border-gray-200 pr-14 pb-[10px] text-start dark:!border-navy-700">
                                                <div className="flex w-full justify-between pr-10 text-xs tracking-wide text-gray-600">
                                                    Son
                                                </div>
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {group.voteSubjects[0]?.subject.subject1}
                                            </td>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {calculatePercentage(status1Count, totalVotes)}%
                                            </td>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {status1Count}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {group.voteSubjects[0]?.subject.subject2}
                                            </td>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {calculatePercentage(status2Count, totalVotes)}%
                                            </td>
                                            <td className="border-b border-gray-200 text-start p-4">
                                                {status2Count}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        );
                    })
                }
            </div>
        </>
    );
};

export default Marketplace;
