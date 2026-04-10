import React from "react";
import logo from "./logo2.jpg";
import imzo from "./imzo.png"
export default function ContractTemplate() {
    const baseText = {
        letterSpacing: "1px",   // kengroq oraliq
        wordSpacing: "1px",       // so'zlar orasini ham ochish
        marginTop: "6px",
        lineHeight: "1.60"        // ideal o'qilish uchun
    };


    const heading = {
        fontWeight: "bold",
        marginTop: "14px",
        letterSpacing: "1px",     // sarlavhalar kengroq bo‘lsin
        wordSpacing: "1.3px"
    };


    return (
        <div
            id="contract-pdf"
            style={{
                width: "794px",
                minHeight: "1123px",
                padding: "30px 40px",
                backgroundColor: "#ffffff",
                color: "#000",
                fontFamily: "Times New Roman",
                fontSize: "15px",
                lineHeight: "1.60",        // yaxshilangan
                letterSpacing: "0.7px",    // umumiy matn keng
                wordSpacing: "1px"
            }}
        >
            {/* LOGO */}
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <img src={logo} alt="BXU" className="mx-auto" style={{ width: "115px" }} />
            </div>

            <div className="flex justify-between">
                {/* Sana + BK */}
                <div>
                    <b><span id="c-date"></span> y</b>
                </div>
                <p style={{ ...baseText, textAlign: "left", fontWeight: "bold" }}>
                    <span id="c-bk-number" style={{ marginLeft: "8px" }}></span>
                    -raqamli shartnomaga
                </p>
                <div>
                    <b>Buxoro shahar</b>
                </div>
            </div>

            {/* TITLE */}
            <h2
                style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginTop: "5px",
                    marginBottom: "10px",
                    letterSpacing: "0.6px",
                }}
            >
                QO'SHIMCHA KELISHUV
            </h2>

            {/* Paragraph 1 */}
            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bir tomondan <b>Buxoro xalqaro universiteti</b> rektori
                <b> Sh.R.Barotov</b>, ikkinchi tomondan <br />
                <span id="c-group" style={{ fontWeight: "bold", marginLeft: "5px" }}></span>
                - guruh talabasi &nbsp;&nbsp;
                <span id="c-name" style={{ fontWeight: "bold" }}></span>
                &nbsp;&nbsp;
                o'rtasida ixtiyoriy ravishda quyidagi shartlar asosida shartnoma tuzildi.
            </p>

            <p style={baseText}>
                <b>Mazkur shartnomaning amal qilish muddati:</b> 2025-2026 o'quv yili uchun
            </p>

            {/* 1. SHARTNOMA MAQSADI */}
            <h3 style={heading}
                className="text-center"

            >1. SHARTNOMA MAQSADI</h3>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Buxoro xalqaro universitetida tahsil olayotgan ijtimoiy himoyaga muhtoj
                oilalarning farzandlariga o'quv yillari uchun kontrakt to'lovlarini qisman kamaytirish maqsadida&nbsp;
                <span id="c-bk-number-2" style={{ fontWeight: "bold" }}></span>
                -raqamli shartnomaning 2.2 bandidagi to'lov miqdori &nbsp;&nbsp;
                <span id="c-new-amount" style={{ fontWeight: "bold" }}></span>&nbsp;&nbsp;
                so'mga o'zgartiriladi.
            </p>

            {/* 2. INSTITUT MAJBURIYATLARI */}
            <h3 style={heading}

                className="text-center"

            >2. INSTITUTNING MAJBURIYATLARI</h3>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tahsil olayotgan talabaning ijtimoiy himoyaga muhtoj oilaning farzandi
                ekanligi inobatga olinib kontrakt shartnomasi&nbsp;
                <span id="c-discount-amount" style={{ fontWeight: "bold" }}></span>&nbsp;&nbsp;
                so'mga kamaytiriladi hamda asosiy shartnomaning 2.2 bandidagi to'lov miqdori&nbsp;&nbsp;
                <span id="c-new-amount-2" style={{ fontWeight: "bold" }}></span>&nbsp;&nbsp;
                so'mga o'zgartiriladi.
            </p>

            {/* 3. TALABA MAJBURIYATLARI */}
            <h3 style={heading}

                className="text-center"

            >3. TALABA (TALABGOR) MAJBURIYATLARI</h3>

            <p style={baseText}>3.1 O'quv jarayonlarida faol ishtirok etish.</p>
            <p style={baseText}>3.2 Ma'naviy-ma'rifiy tadbirlarda doimiy ishtirok etib borish.</p>
            <p style={baseText}>3.3 Dars mashg'ulotlarini asossiz qoldirmaslik.</p>
            <p style={baseText}>3.4 Har yili kontrakt to'lovlarining kamida 50% miqdorini 1-oktabrga qadar to'lash.</p>

            {/* 4. ALOHIDA SHARTLAR */}
            <h3 style={heading}

                className="text-center"

            >4. ALOHIDA SHARTLAR</h3>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Talaba o'qishini boshqa oliy ta'lim muassasasiga ko'chirmoqchi bo'lgan taqdirda ushbu
                qo'shimcha shartnomani bekor qilish uchun universitet ma'muriyatiga kamida 1 oy oldin
                yozma ravishda murojaat qilishi va qo'shimcha shartnoma asosida kamaytirilgan kontrakt
                to'lovlarini universitet hisob raqamiga to'liq qaytarishi shart.
            </p>

            <p style={baseText}>
                Talaba tomonidan kamaytirilgan summa qaytarilgandan so'ng unga akademik ma'lumotnoma
                (transkript) taqdim qilinadi.
            </p>

            {/* 5. JAVOBGARLIK */}
            <h3 style={heading}

                className="text-center"

            >5. SHARTNOMANI BAJARMASLIK UCHUN JAVOBGARLIK</h3>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Ushbu shartnomada ko'rsatilgan shartlarning bajarilishi qonunchilik asosida ko'rib chiqiladi.
            </p>

            {/* 6. MANZILLAR */}
            <h3 style={heading}

                className="text-center"

            >6. TOMONLARNING MANZILLARI</h3>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Mazkur qo'shimcha kelishuv
                <span id="c-bk-number-3" style={{ marginLeft: "8px" }}></span>
                -raqamli shartnomaning ajralmas qismi hisoblanadi va unda ko'rsatilgan shartlar
                taraflar ijrosi uchun majburiydir.
            </p>




            {/* 6. MANZILLAR */}
            <h3 style={heading}

                className="text-center"

            >7. TOMONLARNING MANZILLARI</h3>
            <table
                style={{
                    width: "100%",
                    marginTop: "10px",
                    letterSpacing: "0.3px",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                }}
            >
                <tbody>
                    <tr>
                        <td
                            style={{
                                position: "relative",        // 🔥 Yangi qo‘shildi
                                textAlign: "center",
                                fontWeight: "bold",
                                marginTop: "30px",
                                letterSpacing: "0.6px",
                                textDecoration: "underline",
                                padding: "10px",
                            }}
                        >
                            {/* IMZO – yozuvlar ustida (z-index bilan) */}
                            <img
                                src={imzo}
                                alt="imzo"
                                style={{
                                    position: "absolute",
                                    top: "60px",          // 🔥 Imzo qayerda turishini shu bilan boshqarasiz
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 10,           // 🔥 Yozuvlardan baland
                                    width: "160px",       // xohlagancha o‘lcham
                                }}
                            />
                            <b>Buxoro xalqaro universiteti</b><br />
                            Manzil: Buxoro shahar, Sitorai Moxi-xossa MFY,<br />
                            G'ijduvon ko'chasi, 250-uy<br />
                            Tel: +998 55 305 55 55 <br />
                            <b>Rektor ________________ Sh.Barotov</b>
                        </td>


                        <td
                            style={{
                                textAlign: "left",
                                verticalAlign: "top",
                                border: "1px solid #000",
                                padding: "8px",
                            }}
                        >
                            <span id="c-group-2" style={{ fontWeight: "bold" }}></span> - guruh talabasi<br />
                            <span style={{ fontWeight: "bold" }}>Manzili _______________________</span><br />
                            <span id="c-name-2" style={{ fontWeight: "bold" }}></span>
                        </td>
                    </tr>
                </tbody>
            </table>


            {/* TILXAT */}
            <h2
                id="tilxat-start"

                style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginTop: "30px",
                    letterSpacing: "0.6px",
                    textDecoration: "underline",
                }}
                className="text-center"

            >
                T I L X A T
            </h2>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Men <span id="c-group-3" style={{ fontWeight: "bold" }}></span> - guruh talabasi&nbsp;&nbsp;&nbsp;
                <span id="c-name-3" style={{ fontWeight: "bold" }}></span>, kontrakt to'lovlari uchun
                menga universitet tomonidan qo'shimcha shartnoma asosida kamaytirilgan, shuningdek o'qishimni
                boshqa oliy ta'lim muassasasiga ko'chirmoqchi yoki <b>talabalik safidan chetlashtirish uchun ariza
                    bergan</b> taqdirimda qo'shimcha shartnoma asosida kamaytirilgan kontrakt to'lovlarini institut
                hisob raqamiga qaytarishga kafolat beraman.
            </p>

            <p style={baseText}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Men bilan tuzilgan ushbu qo'shimcha shartnoma shartlari bilan tanishdim va ularga to'liq amal
                qilaman. <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Mazkur qo'shimcha shartnomaning bir nusxasini oldim.
            </p>

            <p style={{ ...baseText, marginTop: "20px" }}>
                Tel: _______________________
            </p>
        </div>
    );
}
