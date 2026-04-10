import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiCall from "../../../../config/index";
import { toast } from "react-toastify";

function TestsView() {
    const { id } = useParams(); // finalExamStudentId
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadTests = async () => {
        try {
            const res = await ApiCall(
                `/api/v1/final-exam-student-test/view/tests/${id}`,
                "GET"
            );
            console.log(res.data);
            setTests(res.data);
        } catch (err) {
            toast.error("Test ma'lumotlari yuklanmadi!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    const correctCount = tests.filter(t => t.isCorrect).length;
    const wrongCount = tests.filter(t => !t.isCorrect).length;


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-3">
                <h1 className="text-3xl font-bold mb-6 text-blue-700">
                    📝 Talabaning test natijalari
                </h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
                >
                    Talabalar ro'yxatiga qaytish
                </button>
            </div>
            <div className="flex gap-6 mb-6">
                <div className="px-6 py-4 bg-green-100 border border-green-300 rounded-xl shadow">
                    <p className="text-xl font-bold text-green-700">{correctCount}</p>
                    <p className="text-green-600 font-medium">To'g'ri javoblar</p>
                </div>
                <div className="px-6 py-4 bg-red-100 border border-red-300 rounded-xl shadow">
                    <p className="text-xl font-bold text-red-700">{wrongCount}</p>
                    <p className="text-red-600 font-medium">Xato javoblar</p>
                </div>
                <div className="px-6 py-4 bg-blue-100 border border-blue-300 rounded-xl shadow">
                    <p className="text-xl font-bold text-blue-700">{tests.length}</p>
                    <p className="text-blue-600 font-medium">Umumiy savollar</p>
                </div>
            </div>
            {tests.length === 0 ? (
                <p className="text-gray-600">Test javoblari topilmadi</p>
            ) : (
                <div className="space-y-6">
                    {tests.map((t, i) => {
                        const letters = ["A", "B", "C", "D"];
                        return (
                            <div
                                key={t.id}
                                className="p-6 bg-white shadow-lg rounded-xl border border-gray-200"
                            >
                                {/* SAVOL */}
                                <h2 className="text-lg font-semibold mb-4">
                                    {i + 1}. {t.question}
                                </h2>

                                {/* VARIANTLAR */}
                                <div className="space-y-3">
                                    {t.answers.map((ans, index) => {
                                        const optionNumber = index + 1;

                                        // holat ranglari
                                        let style = "border-gray-300 text-gray-700";

                                        if (t.selectedAnswer === optionNumber && !t.isCorrect) {
                                            style = "bg-red-100 border-red-400 text-red-700";
                                        }

                                        if (t.correctAnswer === optionNumber) {
                                            style = "bg-green-100 border-green-400 text-green-700";
                                        }

                                        if (t.selectedAnswer === optionNumber && t.isCorrect) {
                                            style = "bg-blue-100 border-blue-400 text-blue-700";
                                        }

                                        return (
                                            <div
                                                key={index}
                                                className={`border p-3 rounded-lg flex items-center gap-3 ${style}`}
                                            >
                                                <span className="font-bold">
                                                    {letters[index]}.
                                                </span>
                                                <span>{ans}</span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* HOLAT */}
                                <div className="mt-4 border-t pt-4 text-sm text-gray-700">
                                    <p>
                                        <b>Tanlangan javob:</b>{" "}
                                        {t.selectedAnswer
                                            ? letters[t.selectedAnswer - 1]
                                            : "Tanlanmagan"}
                                    </p>
                                    <p>
                                        <b>To'g'ri javob:</b>{" "}
                                        <span className="text-green-700 font-semibold">
                                            {letters[t.correctAnswer - 1]}
                                        </span>
                                    </p>
                                    <p>
                                        <b>Holat:</b>{" "}
                                        {t.isCorrect ? (
                                            <span className="text-green-600 font-bold">To'g'ri</span>
                                        ) : (
                                            <span className="text-red-600 font-bold">Xato</span>
                                        )}
                                    </p>

                                    <p className="mt-2 text-gray-500">
                                        <b>Tanlagan vaqt:</b> {t.selectedTime ? t.selectedTime?.replace("T", " ").slice(0, 19) : "Talaba tomonidan javob berilmagan!"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default TestsView;
