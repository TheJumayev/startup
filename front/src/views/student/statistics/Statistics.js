import React, { useEffect, useState } from 'react';
import Card from "../../../components/card";
import { MdArrowDropUp, MdBarChart, MdOutlineCalendarToday } from "react-icons/md";
import LineChart from "../../../components/charts/LineChart";
import ApiCall from "../../../config";

function Statistics(props) {
    const [statistic, setStatistic] = useState(null)
    const [statisticType, setStatisticType] = useState(null)
    const lineChartDataTotalSpent = [

        {
            name: "Umumiy arizalar",
            data: [
                statistic?.january,
                statistic?.february,
                statistic?.march,
                statistic?.april,
                statistic?.may,
                statistic?.june,
                statistic?.july,
                statistic?.august,
                statistic?.september,
                statistic?.october,
                statistic?.november,
                statistic?.december
            ],
            color: "#6AD2FF",
        },
    ];

    const lineChartOptionsTotalSpent = {
        legend: {
            show: true,
        },

        theme: {
            mode: "light",
        },
        chart: {
            type: "line",

            toolbar: {
                show: false,
            },
        },

        dataLabels: {
            enabled: true,
        },
        stroke: {
            curve: "smooth",
        },

        tooltip: {
            style: {
                fontSize: "12px",
                fontFamily: undefined,
                backgroundColor: "#000000"
            },
            theme: 'dark',
            x: {
                format: "dd/MM/yy HH:mm",
            },
        },
        grid: {
            show: true,
        },
        xaxis: {
            axisBorder: {
                show: true,
            },
            axisTicks: {
                show: true,
            },
            labels: {
                style: {
                    colors: "#A3AED0",
                    fontSize: "12px",
                    fontWeight: "400",
                },
            },
            type: "text",
            range: undefined,
            categories: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
        },

        yaxis: {
            show: true,
        },
    };

    // useEffect(() => {
    //     getYearly()
    //     getAppealTypeCount()
    // }, []);
    // const getYearly = async () => {
    //     try {
    //         const response = await ApiCall(`/api/v1/superadmin/statistic/year`, "GET");
    //         setStatistic(response.data)
    //     } catch (error) {
    //         console.error("Error fetching sabab:", error);
    //     }
    // }
    // const getAppealTypeCount = async () => {
    //     try {
    //         const response = await ApiCall(`/api/v1/superadmin/statistic/type`, "GET");
    //         setStatisticType(response.data)
    //     } catch (error) {
    //         console.error("Error fetching sabab:", error);
    //     }
    // }

    return (
        <div className="mt-2 lg:pt-0  pt-0 xl:pb-4 md:p-4  sm:p-2 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card extra="!p-[14px] p-8 text-center">
                <div className="flex justify-between">
                    <button
                        className="linear mt-1 flex items-center justify-center gap-2 rounded-lg  p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
                        <MdOutlineCalendarToday />
                        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                            Yillik statistika
                        </h2>
                    </button>

                    <div className="flex flex-col">
                        <p className="mt-[20px] text-xl font-bold text-navy-700 dark:text-white">
                            {statistic?.january + statistic?.february + statistic?.march + statistic?.april + statistic?.may + statistic?.june + statistic?.july + statistic?.august + statistic?.september + statistic?.october + statistic?.november + statistic?.december}
                        </p>
                        <div className="flex flex-col items-start">
                            <p className="mt-2 text-sm text-gray-600">Umumiy yillik arizalar</p>
                            <div className="flex flex-row items-center justify-center">
                            </div>
                        </div>
                    </div>

                </div>

                <div
                    className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">

                    <div className="h-full w-full ">
                        <LineChart
                            options={lineChartOptionsTotalSpent}
                            series={lineChartDataTotalSpent}
                        />
                    </div>
                </div>
            </Card>
            <Card extra="flex flex-col p-8 bg-white w-full rounded-3xl py-6 px-2 text-center">
                <div className="mb-auto flex items-center justify-between px-6">
                    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                        Umumiy statistika
                    </h2>
                    <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
                        <MdBarChart className="h-6 w-6" />
                    </button>
                </div>

                <div className="md:mt-16 lg:mt-0">
                    <div className="h-[250px] w-full xl:h-[350px]">
                        <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden p-6 pt-0">
                            <table className="w-full">
                                <thead>
                                    <tr className={"p-4 hover:bg-gray-100"}>
                                        <th className="border-b border-gray-200 pr-14 my-4 text-start dark:!border-navy-700">
                                            <div
                                                className="flex w-full p-4 justify-between pr-10 text-xl tracking-wide text-gray-600">
                                                Yangi kelib tushgan arizalar
                                            </div>
                                        </th>
                                        <th className="border-b  text-xl my-2 border-gray-200 pr-14   text-start dark:!border-navy-700">
                                            {statisticType?.inprogress}
                                        </th>

                                    </tr>
                                    <tr className={"p-4 hover:bg-gray-100"}>
                                        <th className="border-b  text-md my-2 border-gray-200 pr-14   text-start dark:!border-navy-700">
                                            <div
                                                className="flex w-full text-xl justify-between pr-10 p-4 tracking-wide text-orange-600">
                                                Tugallanganlar
                                            </div>
                                        </th>
                                        <th className="border-b my-2 border-gray-200 pr-14   text-xl text-start dark:!border-navy-700">
                                            {statisticType?.completed}
                                        </th>

                                    </tr>
                                    <tr className={"p-4 hover:bg-gray-100"}>
                                        <th className="border-b  text-md my-2 border-gray-200 pr-14   text-start dark:!border-navy-700">
                                            <div
                                                className="flex w-full text-xl justify-between pr-10 p-4 tracking-wide text-blue-600">
                                                Ko'rilmoqda
                                            </div>
                                        </th>
                                        <th className="border-b my-2 border-gray-200 pr-14   text-xl text-start dark:!border-navy-700">
                                            {statisticType?.pending}
                                        </th>

                                    </tr>
                                    <tr className={"p-4 hover:bg-gray-100"}>
                                        <th className="border-b  text-md my-2 border-gray-200 pr-14   text-start dark:!border-navy-700">
                                            <div
                                                className="flex w-full text-xl justify-between pr-10 p-4 tracking-wide text-red-600">
                                                Rad etilgan
                                            </div>
                                        </th>
                                        <th className="border-b my-2 border-gray-200 pr-14   text-xl text-start dark:!border-navy-700">
                                            {statisticType?.canceled}
                                        </th>

                                    </tr>

                                    <tr className={"p-4 hover:bg-gray-100"}>
                                        <th className="border-b  text-md my-2 border-gray-200 pr-14   text-start dark:!border-navy-700">
                                            <div
                                                className="flex w-full text-xl justify-between pr-10 p-4 tracking-wide text-amber-600">
                                                Barchasi
                                            </div>
                                        </th>
                                        <th className="border-b my-2 border-gray-200 pr-14  sm:m-0  text-xl text-start dark:!border-navy-700">
                                            {statisticType?.inprogress + statisticType?.pending + statisticType?.completed + statisticType?.canceled}
                                        </th>

                                    </tr>

                                </thead>

                            </table>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export default Statistics;