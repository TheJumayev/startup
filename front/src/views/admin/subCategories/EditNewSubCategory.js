import React, {lazy, Suspense, useEffect, useState} from "react";
import ApiCall from "../../../config";
import { useNavigate, useParams, Link } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import Select from 'react-select';
const MdDelete = lazy(() => import("react-icons/md").then(module => ({ default: module.MdDelete })));
const MdOutlinePlaylistAdd = lazy(() => import("react-icons/md").then(module => ({ default: module.MdOutlinePlaylistAdd })));

const EditNewSubCategory = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [name, setName] = useState("");
    const [serviceDay, setServiceDay] = useState("");
    const [dean, setDean] = useState(false);
    const [ariza, setAriza] = useState(false);
    const [arizaSana, setArizaSana] = useState(false);
    const [icon, setIcon] = useState("");
    const [strange, setStrange] = useState(false);
    const [url, setUrl] = useState("");
    const [arizaText, setArizaText] = useState("");
    const [asos, setAsos] = useState(false);
    const [status, setStatus] = useState(true);
    const [sabab, setSabab] = useState([{ title: "" }]);
    const [sababHelper, setSababHelper] = useState(false);
    const [deans, setDeans] = useState([])
    const [selectedDeanId, setSelectedDeanId] = useState(null)
    const navigate = useNavigate();
    const { id } = useParams();
    const deanOptions = deans.map(dean => ({
        value: dean.id,
        label: dean.name
    }));

    useEffect(() => {
        fetchCategories();
        fetchSubCategoryDetails();
        fetchDeans()
        fetchSubcategoryDean()
    }, []);

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/category`, "GET");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // fetch all deans
    const fetchDeans = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/deans`, "GET");
            setDeans(response.data)
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching admins:", error);
        }

    };
    // fetch subcategory deans
    const fetchSubcategoryDean = async () => {
        try {
            const response = await ApiCall(`/api/v1/dean/subcategory/${id}`, "GET");
            if (!response.error){
                setSelectedDeanId(response.data.dean.id)
            }
        } catch (error) {
            console.error("Error fetching admins:", error);
        }

    };

    // Fetch subcategory details by ID
    const fetchSubCategoryDetails = async () => {
        try {
            const response = await ApiCall(`/api/v1/superadmin/subcategory/${id}`, "GET");
            const data = response.data;
            console.log(response.data)
            setName(data.name);
            setServiceDay(data.service_day);
            setDean(data.dean);
            setAriza(data.ariza);
            setArizaSana(data.arizaSana);
            setIcon(data.icon);
            setStrange(data.strange);
            setUrl(data.url);
            setArizaText(data.ariza_text);
            setAsos(data.asos);
            setStatus(data.status);

            setSelectedCategoryId(data.categories.id);
            setSabab(data.reasons || [{ title: "" }]);
            setSababHelper(data.sabab)

            if (data.sabab) {
                setSabab([])
                try {
                    const response = await ApiCall(`/api/v1/superadmin/subcategory/reason/${id}`, "GET");
                    console.log(response.data);

                    if (response?.data?.length > 0) {
                        response.data.forEach(item => {
                            setSabab(prevSabab => [...prevSabab, { title: item.title }]);
                        });
                    }
                } catch (error) {
                    console.error("Error fetching sabab:", error);
                }
            }

        } catch (error) {
            console.error("Error fetching subcategory details:", error);
        }
    };

    // Handle form submission for saving updates
    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedSubCategory = {
            name,
            service_day: serviceDay,
            dean,
            ariza,
            ariza_sana: arizaSana,
            icon,
            strange,
            url,
            ariza_text: arizaText,
            asos,
            status,
            category_id: selectedCategoryId,
            reasons: sabab.map((s) => s.title), // Array of strings for reasons
            sabab: sababHelper
        };
        // If no valid reasons exist, send an empty array
        if (sabab.length === 1 && sabab[0].title === "") {
            updatedSubCategory.reasons = [];
        }

        if (dean){
            try {
                await ApiCall(`/api/v1/dean/duty/${selectedDeanId}/${id}`, "POST");
            } catch (error) {
                console.error("Error updating subcategory:", error);
            }
        }else {
            try {
                await ApiCall(`/api/v1/dean/duty/remove/${id}`, "DELETE");
            } catch (error) {
                console.error("Error updating subcategory:", error);
            }
        }
        try {
            const res= await ApiCall(`/api/v1/superadmin/subcategory/${id}`, "PUT", updatedSubCategory);
            navigate("/superadmin/subcategories");
        } catch (error) {
            console.error("Error updating subcategory:", error);
        }
    };

    // Add a new sabab
    const handleAddSabab = () => {
        setSabab([...sabab, { title: "" }]);
    };

    // Delete a sabab by index
    const handleDeleteSabab = (index) => {
        setSabab(sabab.filter((_, i) => i !== index));
    };
    const text1 = "Menga Shaxsiy ta'lim trayektoriyasini shakllantirishga ruxsat berishingizni so'rayman."
    const text2 = `Menga <b>_sabab_</b> tufayli Diplom (ilova, dublikat) olishimga ruxsat berishingizni so'rayman.`
    const text3 =`Menga <b>_sabab_</b> tufayli <b>_sana1_</b> dan <b>_sana2_</b> gacha Akademik ta'til berishingizni so'rayman.`
    const text4 =`Menga  <b>_sana1_</b> dan <b>_sana2_</b> gacha Javob berishingizni  berishingizni so'rayman.`

    return (
        <div className="container mx-auto pt-6 p-32">
            <div className="flex justify-between items-baseline">
                <h2 className="text-xl font-bold mb-4">Xizmat turini Tahrirlash</h2>
                <Link
                    to={"/superadmin/subcategories"}
                    className="text-xl flex gap-1 items-center font-bold text-white mb-4 bg-red-500 p-1 rounded-xl"
                >
                    <MdArrowBack/> Bekor qilish
                </Link>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="mb-4 bg-white p-6 rounded-xl">
                    <label className="block mb-2 text-xl">Kategoriyani tanlang:</label>
                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3 py-2 border rounded w-1/2"
                        required
                    >
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4 bg-white p-6 rounded-xl">
                    <label className="block mb-2 text-xl">Xizmat turi nomi:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                    />
                </div>

                <div className="mb-4 bg-white p-6 rounded-xl">
                    <div className="flex gap-2 items-baseline">
                        <label className="text-xl">Xizmat turiga belgilangan rasm:</label>
                        <a href="/icons" target="_blank" rel="noopener noreferrer" className="block mb-2 text-blue-400">
                            Rasmlarni ko'rish
                        </a>
                    </div>
                    <input
                        type="text"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                    />


                </div>

                <div className="mb-4 bg-white p-6 rounded-xl">
                    <label className="block mb-2 text-xl">Xizmat ko'rsatish kuni:</label>
                    <input
                        type="number"
                        value={serviceDay}
                        onChange={(e) => setServiceDay(e.target.value)}
                        className="w-full px-3 py-2 border rounded w-1/2"
                        required
                    />

                </div>



                {/*xizmat turi bosqichi*/}
                <div className="mb-4 flex items-baseline gap-2 bg-white p-6 rounded-xl">
                    <input
                        type="checkbox"
                        checked={dean}
                        onChange={(e) => setDean(e.target.checked)}
                    />
                    <label className="block mb-2">Xizmat turi ikki bosqichli:</label>
                    <div className={dean ? "ml-4 w-1/2" : "hidden"}>
                        <Select
                            options={deanOptions}
                            value={deanOptions.find(option => option.value === selectedDeanId)}
                            onChange={(selectedOption) => setSelectedDeanId(selectedOption?.value)}
                            placeholder="Dekanni qidirish..."
                            isSearchable={true}
                            isClearable={true}
                            required={dean}
                            noOptionsMessage={() => "Dekan topilmadi"}
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                    </div>
                </div>


                {/*ariza*/}
                <div className="mb-4  bg-white p-6 rounded-xl">
                    <div className={"flex items-baseline gap-2"}>
                        <input type="checkbox" checked={ariza} onChange={(e) => setAriza(e.target.checked)}/>
                        <label className="block mb-2">Ariza generatsiya qilish:</label>

                    </div>

                    {ariza ?
                        <div>
                            <hr/>
                            <div className="mb-2 mt-2  flex items-baseline gap-2">
                                <input type="checkbox" checked={sababHelper}
                                       onChange={(e) => setSababHelper(e.target.checked)}/>
                                <label className="block mb-2">Arizaga Sabab qo'shish:</label>
                            </div>
                            <hr/>
                            <div className="mb-2 mt-2  flex items-baseline gap-2">
                                <input type="checkbox" checked={arizaSana}
                                       onChange={(e) => setArizaSana(e.target.checked)}/>
                                <label className="block mb-2">Arizada sana oralig'i tanlash:</label>
                            </div>
                            <hr/>
                            <div className={"my-2 pt-0 p-6"}>
                                <label className="block mb-2">Ariza mazmuni:</label>
                                <div className={"flex justify-center gap-2 p-6 pt-0 pb-0"}>

                                        <textarea
                                            value={arizaText}
                                            onChange={(e) => setArizaText(e.target.value)}
                                            className="w-full  border rounded mt-4 mb-4 w-2/3"
                                        />

                                    <div>
                                        <div className="flex flex-col items-center lg:px-6 md:px-4 py-5   ">

                                            <div className={"w-full border-2   pb-4  shadow-cyan-700"}>
                                                <div className={"items-end w-full flex justify-end "}>

                                                    <p className="w-2/3 lg:w-1/2  sm:w-2/3 md:w-2/3 text-sm text-gray-700 pt-2  ">
                                                        Buxoro davlat texnika universiteti rektori
                                                        S.G‘. Siddiqovaga <b>_guruh_</b> guruh
                                                        talabasi <b>_talaba_ism_familya_</b> tomonidan
                                                    </p>
                                                </div>
                                                <p className="text-center text-sm text-gray-700 lg:mt-6 mt-4">
                                                    Ariza
                                                </p>

                                                <p className="text-start text-sm text-gray-700 mt-2 p-2 border-2 border-[#6a53ff]">
                                                    &nbsp; &nbsp;{arizaSana && sababHelper &&
                                                    <span dangerouslySetInnerHTML={{__html: text3}}/>}
                                                    {(sababHelper === false && arizaSana === false) && text1}
                                                    {sababHelper && arizaSana === false &&
                                                        <span dangerouslySetInnerHTML={{__html: text2}}/>}
                                                    {arizaSana && sababHelper === false &&
                                                        <span dangerouslySetInnerHTML={{__html: text4}}/>}
                                                </p>

                                                <div
                                                    className={"flex lg:mt-10 lg:mb-32 mb-10 mt-12 justify-evenly gap-10"}>
                                                    <p className="text-start text-sm text-gray-700">
                                                        <b>_bugungi_sana_</b>
                                                    </p>
                                                    <p className="text-start text-sm text-gray-700 ">
                                                        <b> _talaba_ism_familya_</b>
                                                    </p>
                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                </div>
                            </div>

                            <hr/>
                            {sababHelper ?
                                <div className="my-2 w-1/2 pt-0 p-4">
                                    <label className="block mb-2 font-bold text-xl">Sabablar</label>
                                    {sabab.map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <label className=" mb-2 flex items-baseline">Sabab {index + 1}</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => {
                                                    const updatedSababs = sabab.map((s, i) =>
                                                        i === index ? {...s, title: e.target.value} : s
                                                    );
                                                    setSabab(updatedSababs);
                                                }}
                                                className="w-full px-3 py-2 border rounded"
                                            />
                                            <Suspense fallback={<div>Loading...</div>}>
                                                <button type="button" onClick={() => handleDeleteSabab(index)}
                                                        className="text-red-500">
                                                    <MdDelete/>
                                                </button>
                                            </Suspense>
                                        </div>
                                    ))}
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <button
                                            type="button"
                                            onClick={handleAddSabab}
                                            className="flex items-center gap-2 mt-2 text-green-500"
                                        >
                                            <MdOutlinePlaylistAdd/> Yangi sabab qo'shish
                                        </button>
                                    </Suspense>
                                </div>
                                : <p></p>}

                        </div>
                        :
                        ""
                    }
                </div>

                {/*asos*/}
                <div className="mb-4 flex items-baseline gap-2  bg-white p-6 rounded-xl">
                    <input type="checkbox" checked={asos} onChange={(e) => setAsos(e.target.checked)}/>
                    <label className="block mb-2">Asos majburiy:</label>
                </div>
                {/* strange */}
                <div className="mb-4  bg-white p-6 rounded-xl">
                    <div className={"flex items-baseline gap-2"}>
                        <input type="checkbox" checked={strange} onChange={(e) => setStrange(e.target.checked)}/>
                        <label className="block mb-2">Boshqa tashkilot yoki tizimga yonaltirish:</label>

                    </div>
                    {strange &&
                        <div className="mb-4">
                            <label className="block mb-2">Boshqa tashkilot yoki tizim havolasi:</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>
                    }
                </div>


                <div className="mb-4 flex items-baseline gap-2 bg-white p-6 rounded-xl">
                    <input type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)}/>
                    <label className="block mb-2">Xizmat turi xolati:</label>
                </div>


                <div className="pt-6">
                    <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
                        Saqlash
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditNewSubCategory;
