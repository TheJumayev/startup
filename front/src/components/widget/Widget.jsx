import React, { useEffect, useState } from "react";
import Card from "components/card";

const Widget = ({ icon, title, subtitle }) => {
    const [counter, setCounter] = useState(0);
    const targetValue = subtitle; // Target value for the counter
    const duration = 500; // Duration of the counter animation in milliseconds

    useEffect(() => {
        let start = 0;
        const increment = targetValue / (duration / 100); // Calculate how much to increment each step

        const counterInterval = setInterval(() => {
            start += increment;
            if (start >= targetValue) {
                setCounter(targetValue); // Set the counter to targetValue if it's reached or exceeded
                clearInterval(counterInterval); // Stop the interval when the target value is reached
            } else {
                setCounter(Math.ceil(start)); // Update the counter value
            }
        }, 100); // Update the counter every 100 milliseconds

        return () => clearInterval(counterInterval); // Cleanup on component unmount
    }, [targetValue]);

    return (
        <Card extra="!flex-row flex-grow items-center rounded-[20px]">
            <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
          <span className="flex items-center text-brand-500 dark:text-white">
            {icon}
          </span>
                </div>
            </div>

            <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium text-gray-600">{title}</p>
                {/* Counter with animated value */}
                <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                    {counter}
                </h4>
            </div>
        </Card>
    );
};

export default Widget;
