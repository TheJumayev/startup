import React, { useEffect, useState } from "react";
import ApiCall from "../../../config/index"; // sizda ApiCall shu joyda bo'lsa

function Index() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔹 Component ochilganda GET chaqiramiz
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await ApiCall("/api/v1/student/all", "GET");

            console.log("Students:", res.data);
            setStudents(res.data || []);
        } catch (err) {
            console.error("Studentlarni olishda xatolik:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Yuklanmoqda...</div>;

    return (
        <div>
            <h2>Barcha talabalar</h2>

            {students.length === 0 ? (
                <p>Talabalar topilmadi</p>
            ) : (
                <ul>
                    {students.map((s) => (
                        <li key={s.id}>
                            {s.firstName} {s.lastName} — {s.studentIdNumber}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Index;
