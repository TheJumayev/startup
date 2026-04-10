import MiniCalendar from "components/calendar/MiniCalendar";
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoMdHome } from "react-icons/io";
import { IoDocuments } from "react-icons/io5";
import {MdBarChart, MdCancel, MdCheckCircle, MdDashboard, MdOutlineError} from "react-icons/md";

import { columnsDataCheck, columnsDataComplex } from "./variables/columnsData";

import Widget from "components/widget/Widget";
import CheckTable from "views/admin/default/components/CheckTable";
import ComplexTable from "views/admin/default/components/ComplexTable";
import DailyTraffic from "views/admin/default/components/DailyTraffic";
import TaskCard from "views/admin/default/components/TaskCard";
import tableDataCheck from "./variables/tableDataCheck.json";
import tableDataComplex from "./variables/tableDataComplex.json";
import ApiCall from "../../../config";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import Card from "../../../components/card";
import CardMenu from "../../../components/card/CardMenu";
import Progress from "../../../components/progress";
import Statistics from "../../student/statistics/Statistics";

const Dashboard = () => {
    const navigate = useNavigate()
    const [statistic, setStatistic] = useState()
    useEffect(() => {
        getStatistc()
    }, []);
    const getStatistc = async () => {
        try {
            const response = await ApiCall("/api/v1/superadmin/statistic", "GET", null);
            console.log(response.data)
            setStatistic(response.data)
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        }
    };
    return (
        <div>
            {/* Card widget */}

            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
                <Widget
                    icon={<MdBarChart className="h-7 w-7"/>}
                    title={"Mavjud xizmat turlarieee"}
                    subtitle={statistic?.subCategory}
                />
                <Widget
                    icon={<IoDocuments className="h-6 w-6"/>}
                    title={"Masul hodimlar"}
                    subtitle={statistic?.admin}
                />
                <Widget
                    icon={<MdBarChart className="h-7 w-7"/>}
                    title={"Mas'ullar"}
                    subtitle={statistic?.dean}
                />
                <Widget
                    icon={<MdBarChart className="h-7 w-7"/>}
                    title={"Tizimdan foydalangan talabalar"}
                    subtitle={statistic?.student}
                />
                <Widget
                    icon={<MdBarChart className="h-7 w-7"/>}
                    title={"Ko'rsatilgan xizmatlar"}
                    subtitle={statistic?.appeal}
                />


            </div>


            <div className={" mt-4"}>
                <Statistics/>

            </div>
            {/* Charts */}

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-1">
                <Card extra={"w-full h-full p-4 sm:overflow-x-auto"}>
                    <div class="relative flex items-center justify-between">
                        <div class="text-xl font-bold text-navy-700 dark:text-white">
                            Xizmat turlari bo'yicha tushgan arizalar
                        </div>

                    </div>

                    <div className="mt-2 h-full overflow-x-scroll xl:overflow-hidden">
                        <div className="overflow-y-auto h-[500px]"> {/* Adjust the height as needed */}
                            <table className="w-full">
                                <thead className="bg-white sticky top-0 z-10"> {/* Fixed header */}
                                <tr>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">№</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Xizmat nomi</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Umumiy murojaatlar</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Jarayonda</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Bajarilgan</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Kutilmoqda</p>
                                    </th>
                                    <th className="border-b border-gray-200  pb-[10px] text-start dark:!border-navy-700">
                                        <p className="text-xs tracking-wide text-gray-600">Rad etilgan</p>
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {statistic?.subCategoryStatistic.map((item, index) => (
                                    <tr key={item.subcategoryName} className={"border-b-2 hover:bg-gray-100"}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                                                {item.subcategoryName}
                                            </p>
                                        </td>
                                        <td>{item.appealCount}</td>
                                        <td>{item.count1}</td>
                                        <td>{item.count2}</td>
                                        <td>{item.count3}</td>
                                        <td>{item.count4}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </Card>
            </div>


            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                {/*<TotalSpent />*/}
                {/*<WeeklyRevenue/>*/}
                {/*<div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">*/}
                {/*    /!*<TaskCard />*!/*/}
                {/*    <div className="grid grid-cols-1 rounded-[20px]">*/}
                {/*        <MiniCalendar/>*/}
                {/*    </div>*/}
                {/*</div>*/}

            </div>


        </div>
    );
};

export default Dashboard;
