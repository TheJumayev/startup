import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import Card from "../../../components/card";
import { MdPerson } from "react-icons/md";
import banner from "../../../assets/img/profile/banner.png";

const ProfileOverview = () => {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [changePassword, setChangePassword] = useState(false);

    useEffect(() => {
        getAdmin();
    }, []);

    const getAdmin = async () => {
        try {
            const response = await ApiCall("/api/v1/auth/decode", "GET", null);
            setAdmin(response.data);
        } catch (error) {
            navigate("/admin/login");
            console.error("Error fetching account data:", error);
        }
    };

    const setPasswordHandler = async () => {
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setPasswordError("Password must be at least 8 characters long.");
            return;
        }

        setChangePassword(true);

        try {
            const response = await ApiCall(`/api/v1/auth/password/${admin.id}`, "PUT", { password });
            console.log(response.data);
            setPassword("");
            setConfirmPassword("");
            setPasswordError("");
            alert("Password updated successfully!");
        } catch (error) {
            console.error("Error updating password:", error);
            setPasswordError("Failed to update password. Please try again.");
        } finally {
            setChangePassword(false);
        }
    };

    return (
        <div className="flex w-full flex-col gap-5">
            <div className="w-ful mt-3 flex h-fit flex-col gap-5 lg:grid lg:grid-cols-12">
                <div className="col-span-4 lg:!mb-0">
                    <Card extra={"items-center w-full h-full p-[16px] bg-cover"}>
                        {/* Background and profile */}
                        <div
                            className="relative mt-1 flex h-32 w-full justify-center rounded-xl bg-cover"
                            style={{ backgroundImage: `url(${banner})` }}
                        >
                            <div className="absolute bottom-12 flex h-[87px] w-[87px] items-center justify-center rounded-full border-[4px] border-white bg-pink-400 dark:!border-navy-700">
                                <MdPerson className={"w-10 h-10"} />
                            </div>
                        </div>

                        {/* Name and position */}
                        <div className="mt-16 flex flex-col items-center">
                            <h4 className="text-xl font-bold text-navy-700 dark:text-white">
                                {admin?.name}
                            </h4>
                            <p className="text-base font-normal text-gray-600">Ma'sul hodim</p>
                        </div>
                    </Card>
                </div>

                <div className="col-span-3 lg:!mb-0">
                    <Card extra={"items-start w-full h-full p-[16px] bg-cover"}>
                        <div>
                            <div className={"m-auto"}>
                                <h2 className={"text-xl"}>Parol o'zgartirish</h2>
                                <div className={"my-2"}>
                                    <input
                                        className={"border-2 rounded"}
                                        disabled={changePassword}
                                        type="password"
                                        placeholder="Yangi parol"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (e.target.value.length < 8) {
                                                setPasswordError("Parol uzunligi kamida 8 ta belgidan iborat bo'lishi kerak.");
                                            } else {
                                                setPasswordError('');
                                            }
                                        }}
                                    />
                                </div>
                                <div className={"my-2"}>
                                    <input
                                        className={"border-2 rounded"}
                                        disabled={changePassword}
                                        type="password"
                                        placeholder="Parolni tasdiqlash"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                {passwordError && (
                                    <div className="text-red-500 text-sm mt-1">{passwordError}</div>
                                )}
                                <button
                                    className="bg-blue-600 rounded-2xl p-2 text-white mt-3"
                                    onClick={setPasswordHandler}
                                    disabled={changePassword}
                                >
                                    Saqlash
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfileOverview;